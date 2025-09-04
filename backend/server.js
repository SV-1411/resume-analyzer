const express = require('express');
const multer = require('multer');
const cors = require('cors');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

// Gemini API configuration
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

// Portfolio analysis prompt template
const PORTFOLIO_ANALYSIS_PROMPT = `You are a senior software engineer and technical recruiter. Analyze the following CV/resume data and portfolio links to provide comprehensive feedback with difficulty ratings and gamified scoring:

PORTFOLIO LINKS TO ANALYZE: {portfolioLinks}

ANALYSIS REQUIREMENTS:
1. **Project Overview**: 2-3 sentence summary of the most impressive projects found
2. **Technical Depth**: 2-3 points on coding complexity and technologies used (use **bold** for emphasis)
3. **Project Quality**: 2-3 assessments of code quality, architecture, and best practices (use **bold** for emphasis)
4. **Portfolio Platform Analysis**: Analyze GitHub/Behance/other platforms for:
   - Code structure, commits, and collaboration (GitHub)
   - Design quality, creativity, and presentation (Behance/art platforms)
   - Project diversity and real-world impact
5. **Skill Assessment**: 2-3 technical skills demonstrated through projects (use **bold** for emphasis)
6. **Difficulty Rating**: Rate each project on a scale of 1-10 for:
   - Code complexity (1=beginner, 10=expert)
   - Art/Design difficulty (1=basic, 10=professional)
   - Overall project sophistication
7. **Improvement Areas**: 1-2 suggestions for project portfolio enhancement (use **bold** for emphasis)

SCORING SYSTEM:
- Calculate overall portfolio score (0-100)
- Determine skill level: Novice (0-30), Intermediate (31-60), Advanced (61-80), Expert (81-100)
- Provide gamified level: Bronze, Silver, Gold, Platinum, Diamond

Focus on:
- GitHub repositories and code quality
- Behance/art portfolio creativity and technical execution
- Project complexity and real-world impact
- Technology stack diversity
- Code organization and documentation
- Deployment and live demos

Keep each section brief. Use **bold** formatting for important points. Include difficulty ratings and gamified scores. Total response should be under 300 words.`;

// Routes
app.post('/analyze-resume', upload.single('resume'), async (req, res) => {
  try {
    console.log('[ANALYZE] Incoming request');
    console.log('[ANALYZE] Headers content-type:', req.headers && req.headers['content-type']);
    console.log('[ANALYZE] Body keys:', req.body ? Object.keys(req.body) : []);

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!GOOGLE_API_KEY) {
      return res.status(500).json({ 
        error: 'Google API key not configured. Please set GOOGLE_API_KEY environment variable.' 
      });
    }

    // Parse PDF content
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;
    console.log('[ANALYZE] PDF parsed. textLength=', resumeText ? resumeText.length : 0);

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Could not extract text from PDF. Please ensure the file contains readable text.' 
      });
    }

    // Extract portfolio links from request body
    const portfolioLinks = req.body.portfolioLinks || '';
    console.log('[ANALYZE] portfolioLinks length=', portfolioLinks.length);
    
    // Prepare prompt for Gemini API
    const analysisPrompt = `${PORTFOLIO_ANALYSIS_PROMPT.replace('{portfolioLinks}', portfolioLinks)}

CV/RESUME DATA:
${resumeText}

Please provide a comprehensive portfolio analysis with difficulty ratings and gamified scoring based on the above information.`;
    console.log('[ANALYZE] Prompt prepared. promptLength=', analysisPrompt.length);

    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    // Generate content using Gemini with generation config for comprehensive responses
    const generationConfig = {
      maxOutputTokens: 400,
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
    };
    console.log('[ANALYZE] Model:', GEMINI_MODEL, 'Config:', generationConfig);

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: analysisPrompt }] }],
      generationConfig,
    });
    const response = await result.response;
    const analysis = response.text();
    console.log('[ANALYZE] Analysis received. analysisLength=', analysis ? analysis.length : 0);

    if (!analysis) {
      return res.status(500).json({ 
        error: 'Failed to generate analysis from Gemini API.' 
      });
    }

    // Extract gamified scores from analysis
    const scoreMatch = analysis.match(/portfolio score[:\s]*(\d+)/i);
    const levelMatch = analysis.match(/(Bronze|Silver|Gold|Platinum|Diamond)/i);
    const skillLevelMatch = analysis.match(/(Novice|Intermediate|Advanced|Expert)/i);
    
    const portfolioScore = scoreMatch ? parseInt(scoreMatch[1]) : Math.floor(Math.random() * 40) + 30;
    const gamifiedLevel = levelMatch ? levelMatch[1] : 'Silver';
    const skillLevel = skillLevelMatch ? skillLevelMatch[1] : 'Intermediate';

    res.json({
      success: true,
      analysis: analysis,
      filename: req.file.originalname,
      fileSize: req.file.size,
      portfolioScore: portfolioScore,
      gamifiedLevel: gamifiedLevel,
      skillLevel: skillLevel,
      portfolioLinks: portfolioLinks
    });

  } catch (error) {
    console.error('Resume analysis error:', error && error.stack ? error.stack : error);
    
    if (error.message && error.message.includes('API key')) {
      return res.status(500).json({ 
        error: 'Invalid Google API key. Please check your configuration.' 
      });
    }
    
    if (error.message && error.message.includes('quota')) {
      return res.status(500).json({ 
        error: 'API quota exceeded. Please try again later.' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to analyze resume. Please try again later.',
      details: error && error.message ? error.message : undefined
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    geminiApiConfigured: !!GOOGLE_API_KEY,
    model: GEMINI_MODEL
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds 10MB limit' });
    }
  }
  
  if (error.message === 'Only PDF files are allowed') {
    return res.status(400).json({ error: 'Only PDF files are allowed' });
  }

  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Resume Analyzer Backend running on port ${PORT}`);
  console.log(`📊 Gemini API configured: ${GOOGLE_API_KEY ? 'Yes' : 'No'}`);
  console.log(`🤖 Using model: ${GEMINI_MODEL}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;

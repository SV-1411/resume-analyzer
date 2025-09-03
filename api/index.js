const express = require('express');
const multer = require('multer');
const cors = require('cors');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

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

// Project analysis prompt template
const PROJECT_ANALYSIS_PROMPT = `You are a senior software engineer and technical recruiter. Analyze the following CV/resume data and provide BRIEF, CONCISE feedback focusing on PROJECTS and TECHNICAL SKILLS:

1. **Project Overview**: 2-3 sentence summary of the most impressive projects found
2. **Technical Depth**: 2-3 points on coding complexity and technologies used (use **bold** for emphasis)
3. **Project Quality**: 2-3 assessments of code quality, architecture, and best practices (use **bold** for emphasis)
4. **GitHub Analysis**: 2-3 observations about code structure, commits, and collaboration (use **bold** for emphasis)
5. **Skill Assessment**: 2-3 technical skills demonstrated through projects (use **bold** for emphasis)
6. **Improvement Areas**: 1-2 suggestions for project portfolio enhancement (use **bold** for emphasis)

Focus on:
- GitHub repositories and code quality
- Project complexity and real-world impact
- Technology stack diversity
- Code organization and documentation
- Deployment and live demos

Keep each section brief. Use **bold** formatting for important points. Total response should be under 250 words.`;

// Routes
app.post('/analyze', upload.single('file'), async (req, res) => {
  try {
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

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Could not extract text from PDF. Please ensure the file contains readable text.' 
      });
    }

    // Prepare prompt for Gemini API
    const analysisPrompt = `${PROJECT_ANALYSIS_PROMPT}

CV/RESUME DATA:
${resumeText}

Please provide a concise project analysis based on the above information.`;

    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    // Generate content using Gemini with generation config for shorter responses
    const generationConfig = {
      maxOutputTokens: 300,
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: analysisPrompt }] }],
      generationConfig,
    });
    const response = await result.response;
    const analysis = response.text();

    if (!analysis) {
      return res.status(500).json({ 
        error: 'Failed to generate analysis from Gemini API.' 
      });
    }

    res.json({
      success: true,
      analysis: analysis,
      filename: req.file.originalname,
      fileSize: req.file.size
    });

  } catch (error) {
    console.error('Project analysis error:', error);
    
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
      error: 'Failed to analyze projects. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
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

// Export for Vercel
module.exports = app;

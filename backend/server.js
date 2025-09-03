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

// Resume analysis prompt template
const RESUME_ANALYSIS_PROMPT = `You are a professional HR recruiter and career advisor. Analyze the provided freelancing resume data and any linked GitHub or portfolio projects. Provide a short, focused analysis covering:

Key Gaps: Missing skills, certifications, or experience areas relevant to freelancing.

Missing Sections: Important resume sections that should be added or expanded (for example, summary, technical skills, achievements, freelancing platforms experience, client feedback).

Project and Portfolio Review: Evaluate GitHub or portfolio links for quality, relevance, documentation, and completeness.

Quick Fix Recommendations:

Missing keywords for ATS and freelancing platforms

Content or formatting improvements

Quantifiable achievements

Career Fit: Suggest 2 to 3 suitable freelance roles or niches based on current experience.

Keep responses concise and actionable. If GitHub or portfolio links are provided, analyze them for code quality, documentation, and relevance to the target roles.`;

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
    const analysisPrompt = `${RESUME_ANALYSIS_PROMPT}

RESUME DATA:
${resumeText}

Please provide a comprehensive analysis based on the above resume information.`;

    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    // Generate content using Gemini
    const result = await model.generateContent(analysisPrompt);
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
    console.error('Resume analysis error:', error);
    
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Resume Analyzer Backend running on port ${PORT}`);
  console.log(`📊 Gemini API configured: ${GOOGLE_API_KEY ? 'Yes' : 'No'}`);
  console.log(`🤖 Using model: ${GEMINI_MODEL}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;

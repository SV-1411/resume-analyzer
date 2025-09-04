const express = require('express');
const serverless = require('serverless-http');
const multer = require('multer');
const cors = require('cors');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Configuration for the Generative AI model
const model = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
});

const generationConfig = {
  maxOutputTokens: parseInt(process.env.MAX_TOKENS || '2000'),
  temperature: parseFloat(process.env.TEMPERATURE || '0.3'),
  topP: 1,
  topK: 1,
};

async function extractTextFromPdf(buffer) {
  const data = await pdf(buffer);
  return data.text;
}

// Main analysis endpoint
app.post('/analyze-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded.' });
    }

    const resumeText = await extractTextFromPdf(req.file.buffer);

    const prompt = `You are an AI assistant specialized in career guidance and resume analysis. Analyze the following resume text and provide a comprehensive report including:

1.  **Summary:** A brief overview of the candidate's profile.
2.  **Strengths:** Key areas where the candidate excels.
3.  **Areas for Improvement:** Sections that could be enhanced.
4.  **Keywords:** Important keywords relevant to the candidate's skills and experience.
5.  **Job Role Suggestions:** Recommend suitable job roles based on the resume.
6.  **Actionable Advice:** Specific steps the candidate can take to improve their resume and career prospects.

Resume Text:
"""
${resumeText}
"""

Please format the output in Markdown for readability.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ analysis: text });
  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ error: 'Failed to analyze resume.' });
  }
});

// Handle root path for Netlify Functions
app.get('/', (req, res) => {
  res.send('Resume Analyzer API is running.');
});

// Wrap the Express app with serverless-http for Netlify Functions
module.exports.handler = serverless(app);

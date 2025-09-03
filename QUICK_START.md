# Quick Start Guide

## 🚀 Your Resume Analyzer is Ready!

Both servers are now running successfully:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 📋 Next Steps

### 1. Get Your Google API Key
- Visit [Google AI Studio](https://makersuite.google.com/app/apikey) to sign up
- Get your API key from the dashboard
- Copy the key

### 2. Configure Environment
```bash
# Copy the example file
cp env.example .env

# Edit .env and add your API key
GOOGLE_API_KEY=your_actual_api_key_here
```

### 3. Restart Backend
After adding your API key, restart the backend:
```bash
# Stop current backend (Ctrl+C)
# Then restart:
npm start
```

### 4. Test the Application
- Open http://localhost:3000 in your browser
- Upload a portfolio PDF
- Click "Analyze Portfolio"
- Get AI-powered insights!

## 🎯 What You Can Do Now

✅ **Frontend**: Fully functional with drag & drop PDF upload
✅ **Backend**: Running and ready for API integration
✅ **PDF Processing**: Ready to extract text from resume documents
✅ **UI**: Beautiful, responsive interface with Tailwind CSS

## 🔧 Troubleshooting

- **Backend not responding**: Check if it's running on port 5000
- **Frontend not loading**: Check if it's running on port 3000
- **API errors**: Ensure your Google API key is valid
- **File upload issues**: Check file size (max 10MB) and format (PDF only)

## 🚀 Ready to Go!

Your resume analyzer is fully set up and ready to provide AI-powered career insights!

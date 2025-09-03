# Gigzs Resume Analyzer

An AI-powered resume analysis tool that uses the Google Gemini API to provide comprehensive career insights and recommendations.

## Features

- 📊 **PDF Resume Upload**: Drag & drop or browse to upload resume PDFs
- 🤖 **AI-Powered Analysis**: Uses Google Gemini API for intelligent resume insights
- 🎯 **Comprehensive Recommendations**: Skills assessment, experience analysis, and improvement suggestions
- 💡 **Actionable Insights**: Practical advice for resume enhancement
- 🔒 **Secure Processing**: Local PDF processing with no data storage

## Tech Stack

### Frontend
- **React 18** with modern hooks
- **Vite** for fast development and building
- **Tailwind CSS** for responsive design
- **File upload** with drag & drop support

### Backend
- **Node.js** with Express
- **PDF parsing** with pdf-parse
- **Google Gemini API integration** for AI analysis
- **File upload handling** with Multer
- **CORS support** for cross-origin requests

## Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Google API key** from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gigzs-portfolio-analyzier
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your Google API key:
   ```env
   GOOGLE_API_KEY=your_actual_google_api_key_here
   ```

4. **Start the backend server**
   ```bash
   npm start
   ```
   
   The backend will run on `http://localhost:5000`

5. **Start the frontend development server**
   ```bash
   npm run dev
   ```
   
   The frontend will run on `http://localhost:3000`

## Usage

1. **Upload Resume**: Drag & drop a PDF file or click to browse
2. **Analyze**: Click "Analyze Resume" to process your document
3. **Review Results**: Get comprehensive analysis including:
   - Resume overview and background
   - Skills assessment and evaluation
   - Experience analysis and progression
   - Strengths and weaknesses identification
   - Specific recommendations
   - Missing information identification
   - Career guidance suggestions

## API Endpoints

### POST `/analyze`
Upload and analyze a resume PDF.

**Request**: Form data with PDF file
**Response**: JSON with analysis results

### GET `/health`
Health check endpoint to verify server status.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_API_KEY` | Your Google API key (required) | - |
| `GEMINI_MODEL` | Gemini model to use | `gemini-1.5-flash` |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |

## Development

### Available Scripts

- `npm run dev` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build
- `npm start` - Start backend server

### Project Structure

```
gigzs-portfolio-analyzier/
├── src/
│   ├── App.jsx          # Main React component
│   ├── main.jsx         # React entry point
│   └── index.css        # Tailwind CSS imports
├── backend/
│   └── server.js        # Express backend server
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
├── index.html           # HTML entry point
├── env.example          # Environment variables template
└── README.md            # This file
```

## Google Gemini API Integration

The backend integrates with the Google Gemini API to provide intelligent resume analysis:

- **Model**: Uses `gemini-1.5-flash` for analysis (configurable)
- **Prompt Engineering**: Structured prompts for consistent analysis
- **Error Handling**: Graceful handling of API errors and rate limits
- **Security**: API keys stored in environment variables

## Security Features

- **File Validation**: Only PDF files accepted
- **Size Limits**: 10MB maximum file size
- **No Storage**: Files processed in memory, not stored
- **CORS Protection**: Configurable cross-origin settings
- **Input Sanitization**: PDF content validation

## Troubleshooting

### Common Issues

1. **"Google API key not configured"**
   - Ensure `.env` file exists with valid `GOOGLE_API_KEY`
   - Restart backend server after adding environment variables

2. **"File size exceeds 10MB limit"**
   - Compress PDF or split into smaller files
   - Check file size before upload

3. **"Could not extract text from PDF"**
   - Ensure PDF contains selectable text (not scanned images)
   - Try with a different PDF file

4. **CORS errors**
   - Verify backend is running on correct port
   - Check CORS configuration in backend

### Debug Mode

Set `NODE_ENV=development` in `.env` for detailed error messages.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section
- Review environment configuration
- Ensure all dependencies are installed
- Verify Google API key validity

---

**Built with ❤️ by gigzs.com**

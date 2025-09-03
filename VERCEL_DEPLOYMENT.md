# 🚀 Vercel Deployment Guide

This guide explains how to deploy both the **Backend API** and **Frontend** to Vercel from the command line.

## 📋 **Prerequisites**

1. **Vercel CLI installed**: `npm install -g vercel`
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Git Repository**: Your project should be in a git repo
4. **Environment Variables**: Google API key configured

## 🔧 **Backend Deployment (API)**

### **Step 1: Configure Backend for Vercel**

The backend is configured to run as serverless functions in the `api/` directory.

### **Step 2: Deploy Backend**

```bash
# Deploy backend API
vercel --prod

# Set environment variables
vercel env add GOOGLE_API_KEY
vercel env add GEMINI_MODEL

# Redeploy to apply environment variables
vercel --prod
```

### **Step 3: Backend URLs**

- **Production**: `https://gigz-resume-analyzer-nz3kjsewx-snapdragon2611s-projects.vercel.app`
- **API Endpoint**: `/api/analyze` for resume analysis
- **Health Check**: `/api/health`

## 🎨 **Frontend Deployment**

### **Step 1: Build Frontend**

```bash
npm run build
```

### **Step 2: Deploy Frontend**

```bash
# Create frontend deployment directory
mkdir frontend-deploy

# Copy built files
Copy-Item -Path "dist\*" -Destination "frontend-deploy\" -Recurse

# Copy Vercel config
Copy-Item -Path "vercel-frontend.json" -Destination "frontend-deploy\vercel.json"

# Deploy from frontend directory
cd frontend-deploy
vercel --prod
```

### **Step 3: Frontend URLs**

- **Production**: `https://frontend-analyzer-7tpu7b9ks-snapdragon2611s-projects.vercel.app`

## 🔗 **Connect Frontend to Backend**

After deployment, update the frontend API endpoint to point to your deployed backend:

```javascript
// In your frontend code, update the API URL
const API_URL = 'https://gigz-resume-analyzer-nz3kjsewx-snapdragon2611s-projects.vercel.app/api';
```

## 📁 **Project Structure for Vercel**

```
gigzs-portfolio-analyzier/
├── api/
│   └── index.js          # Backend API for Vercel
├── backend/
│   └── server.js         # Local development server
├── src/                  # Frontend source code
├── dist/                 # Built frontend files
├── vercel.json           # Backend Vercel config
├── vercel-frontend.json  # Frontend Vercel config
└── package.json
```

## 🚀 **Quick Deploy Commands**

### **Backend (API)**
```bash
vercel --prod
```

### **Frontend**
```bash
npm run build
mkdir frontend-deploy
Copy-Item -Path "dist\*" -Destination "frontend-deploy\" -Recurse
Copy-Item -Path "vercel-frontend.json" -Destination "frontend-deploy\vercel.json"
cd frontend-deploy
vercel --prod
```

## 🔧 **Environment Variables**

Set these in Vercel:

| Variable | Value | Description |
|----------|-------|-------------|
| `GOOGLE_API_KEY` | Your API key | Google Gemini API key |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Gemini model to use |

## 📊 **Deployment Status**

### ✅ **Backend (API)**
- **Status**: Deployed ✅
- **URL**: `https://gigz-resume-analyzer-nz3kjsewx-snapdragon2611s-projects.vercel.app`
- **Environment Variables**: Configured ✅

### ✅ **Frontend**
- **Status**: Deployed ✅
- **URL**: `https://frontend-analyzer-7tpu7b9ks-snapdragon2611s-projects.vercel.app`
- **Build**: Successful ✅

## 🧪 **Testing Deployed Services**

### **Test Backend Health**
```bash
curl https://gigz-resume-analyzer-nz3kjsewx-snapdragon2611s-projects.vercel.app/api/health
```

### **Test Frontend**
Open: `https://frontend-analyzer-7tpu7b9ks-snapdragon2611s-projects.vercel.app`

## 🔄 **Redeployment**

### **Backend Changes**
```bash
vercel --prod
```

### **Frontend Changes**
```bash
npm run build
# Copy new dist files to frontend-deploy
vercel --prod
```

## 📝 **Notes**

- **Backend**: Runs as serverless functions in Vercel
- **Frontend**: Static files served from Vercel CDN
- **Environment Variables**: Must be set in Vercel dashboard
- **API Routes**: All backend routes are prefixed with `/api/`

## 🆘 **Troubleshooting**

1. **Environment Variables**: Ensure they're set in Vercel
2. **Build Errors**: Check Vercel build logs
3. **API Errors**: Verify backend deployment and environment variables
4. **CORS Issues**: Backend CORS is configured for production

---

**Your Resume Analyzer is now deployed on Vercel! 🎉**

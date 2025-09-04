# Deployment Instructions

This document outlines the steps to deploy the Resume Analyzer application on platforms like Vercel or Netlify, including setting up environment variables and understanding the build process.

## 1. Environment Variables

For deployment on platforms like Vercel or Netlify, you should set your environment variables directly in their respective dashboards. Do **NOT** commit a `.env` file to your repository for production environments.

Here are the environment variables required:

-   `GOOGLE_API_KEY`: Your API key for accessing the Google Gemini API.
-   `PORT`: The port on which the backend server will listen (default is 5000).
-   `NODE_ENV`: Set to `production` for deployment.
-   `GEMINI_MODEL`: (Optional) Specify the Gemini model to use.
-   `MAX_TOKENS`: (Optional) Maximum number of tokens for the API response.
-   `TEMPERATURE`: (Optional) Controls the randomness of the API response.

### Vercel Specifics

Vercel automatically detects the `vercel.json` file in the root directory. This file configures the build process and routes.

You will need to add `GOOGLE_API_KEY` as an environment variable in your Vercel project settings. The other `env` variables like `PORT`, `NODE_ENV`, `GEMINI_MODEL`, `MAX_TOKENS`, and `TEMPERATURE` are configured in `vercel.json` but can also be overridden in the Vercel dashboard if needed.

### Netlify Specifics

For Netlify, in addition to setting `GOOGLE_API_KEY` in your Netlify UI, you should also set an environment variable `CI` to `false`. This prevents Netlify's build process from treating warnings as errors, which can cause builds to fail.

To do this:
1. Go to your site's **Settings** in Netlify.
2. Navigate to **Build & Deploy** -> **Environment**.
3. Add a new variable: **Key:** `CI`, **Value:** `false`.

## 2. Build Process

The project is configured to use `npm run build` as its build command.

### Vercel Specifics

Vercel will automatically run `npm install` to install dependencies and then `npm run build` to build the frontend. The `outputDirectory` is set to `dist` in `vercel.json`, which is where Vite outputs the build artifacts.

## 3. Starting the Application

### Vercel Specifics

Vercel handles starting the application automatically based on the `builds` and `routes` defined in `vercel.json`. The backend API (`api/index.js`) will be deployed as a serverless function, and the frontend static assets will be served.

## 4. Local Deployment (for development/testing)

For local development and testing, you can still follow the steps outlined in the previous version of this `DEPLOY.md` file:

1.  **Create a `.env` file:** Create a `.env` file in the root directory based on `env.example`.
2.  **Install Dependencies:** `npm install`
3.  **Build Frontend:** `npm run build`
4.  **Start Backend:** `npm run start`

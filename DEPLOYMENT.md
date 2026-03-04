# Deployment Guide for Railway (Backend Only)

This project is set up for deploying the **Backend API** on Railway (or any Docker-based platform). The frontend should be deployed separately (e.g., on Vercel).

## Prerequisites

You need the following services set up:
1.  **MongoDB Atlas**: A MongoDB database URL.
2.  **Clerk**: For authentication (Secret Key and Publishable Key).
3.  **Gemini AI**: API Key for Google Generative AI.

## Environment Variables

When deploying to Railway, you must set the following environment variables in your project settings:

### Runtime Variables (Backend)
- `MONGO_URI`: Your MongoDB connection string.
- `CLERK_SECRET_KEY`: Your Clerk Secret Key (starts with `sk_...`).
- `CLERK_PUBLISHABLE_KEY`: Your Clerk Publishable Key (starts with `pk_...`).
- `GEMINI_API_KEY`: Your Google Gemini API Key.
- `PORT`: (Optional) Railway sets this automatically (defaults to 8000).

## Deployment Steps

1.  Push this code to a GitHub repository.
2.  Log in to [Railway](https://railway.app/).
3.  Click "New Project" -> "Deploy from GitHub repo".
4.  Select your repository.
5.  Add the Environment Variables listed above.
6.  Railway will automatically detect the `Dockerfile` and deploy your backend.

## Frontend Configuration (Vercel)

Since the frontend is deployed separately, ensure you update your Frontend environment variables to point to this new backend URL:

- `VITE_API_URL`: `https://<your-railway-app-url>/api` (Note: Ensure the `/api` suffix is not duplicated if your frontend code adds it automatically. In this codebase, the `api.js` client appends `/api` via the base URL or manually, so check `frontend/src/services/api.js`). 
  *   *Correction*: The current `api.js` defines base URL. The backend routes are now prefixed with `/api`. So set `VITE_API_URL` to `https://<your-railway-app-url>`. The client will call `https://<your-railway-app-url>/api/expenses`, etc.

## Local Docker Testing

To run locally with Docker:

1.  Create a `.env` file with all the variables above.
2.  Build the image:
    ```bash
    docker build -t financial-assistant-backend .
    ```
3.  Run the container:
    ```bash
    docker run -p 8000:8000 --env-file .env financial-assistant-backend
    ```
4.  Open `http://localhost:8000` to verify the API is running.

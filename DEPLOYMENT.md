# Deployment Guide for Railway

This project is set up for easy deployment on Railway (or any Docker-based platform).

## Prerequisites

You need the following services set up:
1.  **MongoDB Atlas**: A MongoDB database URL.
2.  **Clerk**: For authentication (Publishable Key and Secret Key).
3.  **Gemini AI**: API Key for Google Generative AI.

## Environment Variables

When deploying to Railway, you must set the following environment variables in your project settings:

### Build Time Variables (Frontend)
These are needed during the build process because the frontend is built inside the Docker container.
- `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk Publishable Key (starts with `pk_...`).
- `VITE_API_URL`: (Optional) Leave empty to use the same domain (recommended for production), or set if backend is on a different domain.

### Runtime Variables (Backend)
These are needed for the backend to run.
- `MONGO_URI`: Your MongoDB connection string.
- `CLERK_SECRET_KEY`: Your Clerk Secret Key (starts with `sk_...`).
- `CLERK_PUBLISHABLE_KEY`: Same as above (backend also uses it for verification).
- `GEMINI_API_KEY`: Your Google Gemini API Key.
- `PORT`: (Optional) Railway sets this automatically (defaults to 8000).

## Deployment Steps

1.  Push this code to a GitHub repository.
2.  Log in to [Railway](https://railway.app/).
3.  Click "New Project" -> "Deploy from GitHub repo".
4.  Select your repository.
5.  Add the Environment Variables listed above.
6.  Railway will automatically detect the `Dockerfile` and deploy your application.

## Local Docker Testing

To run locally with Docker:

1.  Create a `.env` file with all the variables above.
2.  Build the image:
    ```bash
    docker build -t financial-assistant . --build-arg VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
    ```
3.  Run the container:
    ```bash
    docker run -p 8000:8000 --env-file .env financial-assistant
    ```
4.  Open `http://localhost:8000` in your browser.

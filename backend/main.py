import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import ping_server
from routes import expenses, decision, chat, profile

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ping the database
    print("Starting up FastAPI server...")
    await ping_server()
    yield
    # Shutdown logic (if any)
    print("Shutting down FastAPI server...")

# Initialize FastAPI application
app = FastAPI(
    title="AI-Powered Financial Safety & Decision Assistant",
    description="Backend API for tracking expenses and evaluating financial decisions.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins. For production, restrict this to your frontend URL.
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)

# API Routes
app.include_router(expenses.router, prefix="/api/expenses", tags=["Expenses"])
app.include_router(decision.router, prefix="/api/decisions", tags=["Decisions"])
app.include_router(chat.router, prefix="/api/chat", tags=["AI Chat"])
app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])

# Import receipt router
from routes import receipt
app.include_router(receipt.router, prefix="/api/receipt", tags=["Receipts"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to the Financial Assistant API.",
        "status": "Server is running successfully."
    }
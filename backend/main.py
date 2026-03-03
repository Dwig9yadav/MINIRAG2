"""
EduRag Backend - FastAPI with Supabase
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Import routers
from routers import auth, users, feedback, rag, analytics

# Create FastAPI app
app = FastAPI(
    title="EduRag API",
    description="Backend API for EduRag - Educational RAG Platform",
    version="1.0.0"
)

# CORS configuration - Allow all origins for Codespaces compatibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["Feedback"])
app.include_router(rag.router, prefix="/api/rag", tags=["RAG Search"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/")
async def root():
    return {"message": "EduRag API is running", "version": "1.0.0"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

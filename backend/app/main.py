from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

from app.core.db import engine, Base
from app.models.models import User, Profile, Roadmap, Interview
from app.api.endpoints import router as api_router
from app.api.auth import router as auth_router

try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Database tables not created: {e}")

app = FastAPI(
    title="InterviewPilot AI API",
    description="Backend for the AI Interview Guide Agent platform",
    version="1.0.0",
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to InterviewPilot AI API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

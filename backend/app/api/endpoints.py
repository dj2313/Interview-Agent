from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.schemas.schemas import ProfileBase, RoadmapResponse, InterviewCreate, InterviewResponse
from app.services.roadmap_service import RoadmapService
from typing import List

from app.services.interview_service import InterviewService

router = APIRouter()
roadmap_service = RoadmapService()
interview_service = InterviewService()

@router.post("/roadmaps", response_model=RoadmapResponse)
async def create_roadmap(
    profile: ProfileBase,
    db: Session = Depends(get_db),
):
    user_id = 1
    roadmap = await roadmap_service.create_roadmap(
        db, user_id, profile.target_role, profile.tech_stack
    )
    return roadmap

@router.get("/roadmaps", response_model=List[RoadmapResponse])
async def get_roadmaps(
    db: Session = Depends(get_db),
):
    user_id = 1
    return roadmap_service.get_user_roadmaps(db, user_id)

@router.post("/interviews", response_model=InterviewResponse)
async def start_interview(
    data: InterviewCreate,
    db: Session = Depends(get_db),
):
    user_id = 1
    # Mocking role and stack for now
    role = "Senior Frontend Developer"
    stack = ["React", "Tailwind"]
    db_interview, _ = await interview_service.start_interview(
        db, user_id, data.type, role, stack
    )
    return db_interview

@router.get("/interviews", response_model=List[InterviewResponse])
async def get_interviews(
    db: Session = Depends(get_db),
):
    user_id = 1
    # Implement get_user_interviews in service
    return [] 

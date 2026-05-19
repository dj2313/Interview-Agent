from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.security import get_current_user
from app.models.models import User, Profile
from app.schemas.schemas import ProfileBase, ProfileResponse, RoadmapCreate, RoadmapResponse, InterviewCreate, InterviewRespond, InterviewResponse
from app.services.roadmap_service import RoadmapService
from app.services.interview_service import InterviewService
from typing import List

router = APIRouter()

def get_roadmap_service() -> RoadmapService:
    return RoadmapService()

def get_interview_service() -> InterviewService:
    return InterviewService()

# --- Profile ---

@router.get("/profile", response_model=ProfileResponse)
def get_profile(user: User = Depends(get_current_user)):
    if not user.profile:
        raise HTTPException(status_code=404, detail="Complete onboarding first")
    return user.profile

@router.put("/profile", response_model=ProfileResponse)
def upsert_profile(data: ProfileBase, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if profile:
        for key, val in data.model_dump().items():
            setattr(profile, key, val)
    else:
        profile = Profile(user_id=user.id, **data.model_dump())
        db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

# --- Roadmaps ---

@router.post("/roadmaps", response_model=RoadmapResponse)
async def create_roadmap(data: RoadmapCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    svc = get_roadmap_service()
    roadmap = await svc.create_roadmap(db, user.id, data.target_role, data.tech_stack)
    return roadmap

@router.get("/roadmaps", response_model=List[RoadmapResponse])
def get_roadmaps(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    svc = get_roadmap_service()
    return svc.get_user_roadmaps(db, user.id)

# --- Interviews ---

@router.post("/interviews", response_model=InterviewResponse)
async def start_interview(data: InterviewCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    svc = get_interview_service()
    db_interview, _ = await svc.start_interview(db, user.id, data.type, data.role, data.tech_stack, data.company)
    return db_interview

@router.post("/interviews/{interview_id}/respond")
async def respond_interview(interview_id: int, data: InterviewRespond, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    svc = get_interview_service()
    msg = await svc.continue_interview(db, interview_id, data.message)
    return {"message": msg}

@router.post("/interviews/{interview_id}/stream")
async def stream_interview(interview_id: int, data: InterviewRespond, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    svc = get_interview_service()
    msg = await svc.continue_interview(db, interview_id, data.message)
    async def event_stream():
        for chunk in [msg[i:i+50] for i in range(0, len(msg), 50)]:
            yield f"data: {chunk}\n\n"
    return StreamingResponse(event_stream(), media_type="text/event-stream")

@router.post("/interviews/{interview_id}/end", response_model=InterviewResponse)
async def end_interview(interview_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    svc = get_interview_service()
    return await svc.end_interview(db, interview_id)

@router.get("/interviews", response_model=List[InterviewResponse])
def get_interviews(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    svc = get_interview_service()
    return svc.get_user_interviews(db, user.id)

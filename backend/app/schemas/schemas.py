from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from datetime import datetime

# Auth
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Profile / Onboarding
class ProfileBase(BaseModel):
    tech_stack: List[str]
    experience_level: str
    target_role: str
    target_companies: Optional[List[str]] = []

class ProfileResponse(ProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Roadmap
class RoadmapResponse(BaseModel):
    id: int
    title: str
    items: Any
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class RoadmapCreate(BaseModel):
    target_role: str
    tech_stack: List[str]

# Interview
class InterviewCreate(BaseModel):
    type: str = "technical"
    role: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    company: Optional[str] = None

class InterviewRespond(BaseModel):
    message: str

class InterviewResponse(BaseModel):
    id: int
    type: str
    status: str
    score: Optional[int] = None
    feedback: Optional[Any] = None
    created_at: datetime

    class Config:
        from_attributes = True

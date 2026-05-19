from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

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

class RoadmapResponse(BaseModel):
    id: int
    title: str
    items: Any
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class InterviewCreate(BaseModel):
    type: str

class InterviewResponse(BaseModel):
    id: int
    type: str
    status: str
    score: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

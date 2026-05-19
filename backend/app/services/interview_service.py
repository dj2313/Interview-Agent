from app.agents.interviewer import MockInterviewer
from app.models.models import Interview, Profile
from sqlalchemy.orm import Session

class InterviewService:
    def __init__(self):
        pass

    def _get_user_profile(self, db: Session, user_id: int):
        profile = db.query(Profile).filter(Profile.user_id == user_id).first()
        role = profile.target_role if profile else "Software Engineer"
        stack = profile.tech_stack if profile else []
        return role, stack

    async def start_interview(self, db: Session, user_id: int, interview_type: str, role: str = None, tech_stack: list = None, company: str = None):
        if not role or not tech_stack:
            role, tech_stack = self._get_user_profile(db, user_id)
        interviewer = MockInterviewer(role, tech_stack, interview_type, company=company)
        first_msg = await interviewer.get_response(history=[])
        db_interview = Interview(user_id=user_id, type=interview_type, status="active", transcript=[{"role": "assistant", "content": first_msg}], score=0)
        db.add(db_interview)
        db.commit()
        db.refresh(db_interview)
        return db_interview, first_msg

    async def continue_interview(self, db: Session, interview_id: int, user_input: str):
        db_interview = db.query(Interview).filter(Interview.id == interview_id).first()
        if not db_interview:
            raise Exception("Interview not found")
        role, stack = self._get_user_profile(db, db_interview.user_id)
        interviewer = MockInterviewer(role, stack, db_interview.type)
        transcript = db_interview.transcript or []
        transcript.append({"role": "user", "content": user_input})
        ai_response = await interviewer.get_response(history=transcript)
        transcript.append({"role": "assistant", "content": ai_response})
        db_interview.transcript = transcript
        db.commit()
        return ai_response

    async def end_interview(self, db: Session, interview_id: int):
        db_interview = db.query(Interview).filter(Interview.id == interview_id).first()
        if not db_interview:
            raise Exception("Interview not found")
        role, _ = self._get_user_profile(db, db_interview.user_id)
        interviewer = MockInterviewer(role, [], db_interview.type)
        feedback = await interviewer.generate_feedback(db_interview.transcript or [])
        db_interview.status = "completed"
        db_interview.feedback = feedback
        db_interview.score = feedback.get("score", 0) if isinstance(feedback, dict) else 0
        db.commit()
        return db_interview

    def get_user_interviews(self, db: Session, user_id: int):
        return db.query(Interview).filter(Interview.user_id == user_id).order_by(Interview.created_at.desc()).all()

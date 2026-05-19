from app.agents.interviewer import MockInterviewer
from app.models.models import Interview
from sqlalchemy.orm import Session

class InterviewService:
    def __init__(self):
        pass

    async def start_interview(self, db: Session, user_id: int, type: str, role: str, tech_stack: list):
        interviewer = MockInterviewer(role, tech_stack, type)
        first_msg = await interviewer.get_response(history=[])
        
        db_interview = Interview(
            user_id=user_id,
            type=type,
            status="active",
            transcript=[{"role": "assistant", "content": first_msg}],
            score=0
        )
        db.add(db_interview)
        db.commit()
        db.refresh(db_interview)
        
        return db_interview, first_msg

    async def continue_interview(self, db: Session, interview_id: int, user_input: str):
        db_interview = db.query(Interview).filter(Interview.id == interview_id).first()
        if not db_interview:
            raise Exception("Interview not found")

        # Get role and tech stack from user profile (simplification for now)
        # In a real app, you'd fetch this from the user's profile
        role = "Senior Frontend Developer"
        tech_stack = ["React", "Next.js", "TypeScript"]
        
        interviewer = MockInterviewer(role, tech_stack, db_interview.type)
        
        # Update transcript with user input
        transcript = db_interview.transcript
        transcript.append({"role": "user", "content": user_input})
        
        # Get AI response
        ai_response = await interviewer.get_response(history=transcript)
        
        # Update transcript with AI response
        transcript.append({"role": "assistant", "content": ai_response})
        db_interview.transcript = transcript
        db.commit()
        
        return ai_response

    async def end_interview(self, db: Session, interview_id: int):
        db_interview = db.query(Interview).filter(Interview.id == interview_id).first()
        if not db_interview:
            raise Exception("Interview not found")

        role = "Senior Frontend Developer"
        interviewer = MockInterviewer(role, [], db_interview.type)
        
        feedback = await interviewer.generate_feedback(db_interview.transcript)
        
        db_interview.status = "completed"
        db_interview.feedback = feedback
        # Extract score from feedback (simple logic for now)
        db_interview.score = 75 # Placeholder
        
        db.commit()
        return feedback

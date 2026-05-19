from app.agents.researcher import ResearchAgent
from app.agents.roadmap_generator import RoadmapGenerator
from app.models.models import Roadmap
from sqlalchemy.orm import Session

class RoadmapService:
    def __init__(self):
        self.researcher = ResearchAgent()
        self.generator = RoadmapGenerator()

    async def create_roadmap(self, db: Session, user_id: int, role: str, tech_stack: list):
        # 1. Research latest trends
        search_results = await self.researcher.search_interview_trends(role, tech_stack)
        research_summary = await self.researcher.summarize_research(role, tech_stack, search_results)
        
        # 2. Generate structured roadmap
        roadmap_data = await self.generator.generate_roadmap(role, tech_stack, research_summary)
        
        # 3. Save to database
        db_roadmap = Roadmap(
            user_id=user_id,
            title=roadmap_data.get("title", f"{role} Preparation Roadmap"),
            items=roadmap_data.get("items", []),
            status="active"
        )
        db.add(db_roadmap)
        db.commit()
        db.refresh(db_roadmap)
        
        return db_roadmap

    def get_user_roadmaps(self, db: Session, user_id: int):
        return db.query(Roadmap).filter(Roadmap.user_id == user_id).all()

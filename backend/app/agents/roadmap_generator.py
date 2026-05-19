from langchain_openai import ChatOpenAI
from app.core.config import settings
import json

class RoadmapGenerator:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4o", api_key=settings.OPENAI_API_KEY)

    async def generate_roadmap(self, role: str, tech_stack: list, research_summary: str):
        prompt = f"Generate a 2-week preparation roadmap for a {role} with stack {tech_stack}. Research: {research_summary}. Return JSON: {{title: str, items: [{{day: int, title: str, description: str, priority: str}}]}}"
        
        response = await self.llm.ainvoke(prompt)
        
        try:
            return json.loads(response.content)
        except:
            return {"title": "Error generating roadmap", "items": []}

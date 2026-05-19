from langchain_openai import ChatOpenAI
from langchain_community.tools.tavily_search import TavilySearchResults
from app.core.config import settings

class ResearchAgent:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4o", api_key=settings.OPENAI_API_KEY)
        self.search_tool = TavilySearchResults(api_key=settings.TAVILY_API_KEY)

    async def search_interview_trends(self, role: str, tech_stack: list):
        query = f"latest interview questions and trends for {role} role with stack {', '.join(tech_stack)} in 2024 2025"
        results = await self.search_tool.ainvoke(query)
        return results

    async def summarize_research(self, role: str, tech_stack: list, search_results: list):
        prompt = f"""
        You are a senior recruiter and technical architect. 
        Analyze the following research results for the role: {role} with stack: {', '.join(tech_stack)}.
        
        Research Results:
        {search_results}
        
        Provide a structured summary of:
        1. Core technical skills being tested right now.
        2. Trending topics or frameworks.
        3. Common behavioral or system design patterns for this role.
        """
        response = await self.llm.ainvoke(prompt)
        return response.content

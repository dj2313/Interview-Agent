from datetime import date
from langchain_openai import ChatOpenAI
from langchain_community.tools.tavily_search import TavilySearchResults
from app.core.config import settings

class ResearchAgent:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4o", api_key=settings.OPENAI_API_KEY)
        self.search_tool = TavilySearchResults(api_key=settings.TAVILY_API_KEY)
        self.year = date.today().year

    async def search_interview_trends(self, role: str, tech_stack: list):
        query = f"latest interview questions and trends for {role} {', '.join(tech_stack)} {self.year}"
        results = await self.search_tool.ainvoke(query)
        return results

    async def search_company_patterns(self, company: str, role: str):
        query = f"{company} interview questions process {role} {self.year}"
        return await self.search_tool.ainvoke(query)

    async def summarize_research(self, role: str, tech_stack: list, search_results: list):
        prompt = f"Analyze these interview research results for {role} ({', '.join(tech_stack)}).\nResults: {search_results}\nSummarize: 1) Core skills tested 2) Trending topics 3) Common patterns."
        return (await self.llm.ainvoke(prompt)).content

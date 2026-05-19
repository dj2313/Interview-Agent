from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from app.core.config import settings

MODE_PROMPTS = {
    "technical": "You are a senior technical interviewer. Ask deep, hands-on technical questions about {stack}. Focus on real-world scenarios, tradeoffs, and problem-solving.",
    "behavioral": "You are an HR manager assessing cultural fit and soft skills. Use the STAR method. Ask about conflict resolution, leadership, failures, and teamwork.",
    "hr": "You are a recruiter. Ask about career goals, salary expectations, availability, why they want the role, and their understanding of the company.",
    "system-design": "You are a staff engineer. Ask system design questions. Evaluate scalability, tradeoffs, database choices, API design, and fault tolerance.",
}

DIFFICULTY_INSTRUCTIONS = {
    "foundation": "Ask beginner-level foundational questions. Focus on core concepts and basic usage.",
    "intermediate": "Ask mid-level questions. Include some depth and practical scenarios.",
    "advanced": "Ask senior-level questions. Probe depth, tradeoffs, and edge cases.",
}

class MockInterviewer:
    def __init__(self, role: str, tech_stack: list, type: str = "technical", company: str = None, difficulty: str = "intermediate"):
        self.llm = ChatOpenAI(model="gpt-4o", api_key=settings.OPENAI_API_KEY)
        self.role = role
        self.tech_stack = tech_stack
        self.type = type
        self.company = company
        self.difficulty = difficulty

    def _build_system_prompt(self):
        mode_prompt = MODE_PROMPTS.get(self.type, MODE_PROMPTS["technical"])
        difficulty_instruction = DIFFICULTY_INSTRUCTIONS.get(self.difficulty, "")
        parts = [
            mode_prompt.format(stack=", ".join(self.tech_stack)),
            f"\nRole: {self.role}.",
            f"\nDifficulty: {difficulty_instruction}",
        ]
        if self.company:
            parts.append(f"\nThis interview is for {self.company}. Adapt questions to their known interview style and expectations.")
        parts.append("\nDo NOT provide feedback during the interview. Save it for the end. Start by introducing yourself and asking the first question.")
        return "\n".join(parts)

    async def get_response(self, history: list, user_input: str = None):
        messages = [SystemMessage(content=self._build_system_prompt())]
        for msg in history:
            messages.append(HumanMessage(content=msg["content"]) if msg["role"] == "user" else AIMessage(content=msg["content"]))
        if user_input:
            messages.append(HumanMessage(content=user_input))
        return (await self.llm.ainvoke(messages)).content

    async def generate_feedback(self, transcript: list):
        prompt = f"""Analyze this {self.type} interview transcript for a {self.role} role.
Transcript: {transcript}
Return valid JSON only: {{"score": int (0-100), "technical": int, "communication": int, "problem_solving": int, "strengths": [str], "weaknesses": [str], "summary": str}}"""
        response = await self.llm.ainvoke([SystemMessage(content=prompt)])
        import json
        try:
            return json.loads(response.content)
        except:
            return {"score": 0, "technical": 0, "communication": 0, "problem_solving": 0, "strengths": [], "weaknesses": [], "summary": response.content}

from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage, AIMessage
from app.core.config import settings

class MockInterviewer:
    def __init__(self, role: str, tech_stack: list, type: str = "technical"):
        self.llm = ChatOpenAI(model="gpt-4o", api_key=settings.OPENAI_API_KEY)
        self.role = role
        self.tech_stack = tech_stack
        self.type = type
        self.system_prompt = self._generate_system_prompt()

    def _generate_system_prompt(self):
        return f"""
        You are a senior interviewer at a top tech company. 
        You are conducting a {self.type} interview for a {self.role} position.
        The candidate's tech stack is: {', '.join(self.tech_stack)}.
        
        Your goal is to:
        1. Ask challenging but fair questions.
        2. Follow up on the candidate's answers to test depth.
        3. Maintain a professional, slightly formal but encouraging tone.
        4. Do NOT provide feedback during the interview. Save it for the end.
        
        Start the interview by introducing yourself briefly and asking the first question.
        """

    async def get_response(self, history: list, user_input: str = None):
        messages = [SystemMessage(content=self.system_prompt)]
        
        for msg in history:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            else:
                messages.append(AIMessage(content=msg["content"]))
        
        if user_input:
            messages.append(HumanMessage(content=user_input))
            
        response = await self.llm.ainvoke(messages)
        return response.content

    async def generate_feedback(self, transcript: list):
        prompt = f"""
        Analyze the following interview transcript and provide constructive feedback.
        Role: {self.role}
        Type: {self.type}
        
        Transcript:
        {transcript}
        
        Provide feedback on:
        1. Technical accuracy.
        2. Communication style.
        3. Areas for improvement.
        4. Overall score (0-100).
        """
        response = await self.llm.ainvoke(prompt)
        return response.content

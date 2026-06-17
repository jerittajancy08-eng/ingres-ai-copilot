from typing import TypedDict

from langgraph.graph import END, StateGraph

from app.rag.retriever import RetrievedDocument
from app.services.groq_service import GroqService


class CopilotState(TypedDict):
    message: str
    language: str
    context: list[RetrievedDocument]
    answer: str


class CopilotGraph:

    def __init__(self, llm: GroqService) -> None:
        self.llm = llm

        workflow = StateGraph(CopilotState)
        workflow.add_node("generate_answer", self.generate_answer)
        workflow.set_entry_point("generate_answer")
        workflow.add_edge("generate_answer", END)
        self.graph = workflow.compile()

    async def generate_answer(self, state: CopilotState) -> CopilotState:
        answer = await self.llm.generate_groundwater_answer(
            message=state["message"],
            language=state["language"],
            context=state["context"],
        )
        return {**state, "answer": answer}

    async def answer(self, message: str, language: str, context: list[RetrievedDocument]) -> str:
        result = await self.graph.ainvoke({"message": message, "language": language, "context": context, "answer": ""})
        return str(result["answer"])

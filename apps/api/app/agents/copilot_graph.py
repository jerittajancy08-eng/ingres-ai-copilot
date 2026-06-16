from typing import TypedDict

from langgraph.graph import END, StateGraph

from app.rag.retriever import RetrievedDocument
from app.services.gemini_service import GeminiService


class CopilotState(TypedDict):
    message: str
    language: str
    context: list[RetrievedDocument]
    answer: str


class CopilotGraph:
    """LangGraph orchestration for retrieval-grounded answer generation."""

    def __init__(self, gemini: GeminiService) -> None:
        self.gemini = gemini
        workflow = StateGraph(CopilotState)
        workflow.add_node("generate_answer", self._generate_answer)
        workflow.set_entry_point("generate_answer")
        workflow.add_edge("generate_answer", END)
        self.graph = workflow.compile()

    async def _generate_answer(self, state: CopilotState) -> CopilotState:
        answer = await self.gemini.generate_groundwater_answer(
            message=state["message"],
            language=state["language"],
            context=state["context"],
        )
        return {**state, "answer": answer}

    async def answer(self, message: str, language: str, context: list[RetrievedDocument]) -> str:
        result = await self.graph.ainvoke({"message": message, "language": language, "context": context, "answer": ""})
        return str(result["answer"])

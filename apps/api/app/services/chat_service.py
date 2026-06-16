from datetime import datetime

from sqlalchemy.orm import Session

from app.agents.copilot_graph import CopilotGraph
from app.models.entities import Conversation, Message, User
from app.rag.retriever import GroundwaterRetriever
from app.schemas.chat import ChatResponse, Citation
from app.services.gemini_service import GeminiService


class ChatService:
    def __init__(self) -> None:
        self.retriever = GroundwaterRetriever()
        self.graph = CopilotGraph(GeminiService())

    async def chat(
        self,
        db: Session,
        message: str,
        language: str,
        conversation_id: str | None,
        user: User | None = None,
        top_k: int = 4,
    ) -> ChatResponse:
        conversation = db.get(Conversation, conversation_id) if conversation_id else None
        if conversation is None:
            conversation = Conversation(title=message[:60], user_id=user.id if user else None)
            db.add(conversation)
            db.flush()

        retrieved = self.retriever.retrieve(message, top_k)
        answer = await self.graph.answer(message=message, language=language, context=retrieved)
        conversation.updated_at = datetime.utcnow()
        db.add(Message(conversation_id=conversation.id, role="user", content=message, language=language))
        db.add(Message(conversation_id=conversation.id, role="assistant", content=answer, language=language))
        db.commit()

        return ChatResponse(
            conversation_id=conversation.id,
            answer=answer,
            language=language,
            citations=[
                Citation(
                    title=doc.title,
                    source=doc.source,
                    excerpt=doc.excerpt,
                    chunk_index=doc.chunk_index,
                    score=doc.score,
                )
                for doc in retrieved
            ],
        )

    async def query(self, message: str, language: str, top_k: int = 4) -> ChatResponse:
        retrieved = self.retriever.retrieve(message, top_k)
        answer = await self.graph.answer(message=message, language=language, context=retrieved)
        return ChatResponse(
            answer=answer,
            language=language,
            citations=[
                Citation(
                    title=doc.title,
                    source=doc.source,
                    excerpt=doc.excerpt,
                    chunk_index=doc.chunk_index,
                    score=doc.score,
                )
                for doc in retrieved
            ],
        )

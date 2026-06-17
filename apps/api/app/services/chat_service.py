from datetime import datetime
import logging
import re

from sqlalchemy.orm import Session

from app.api.deps import ROLE_LEVELS
from app.agents.copilot_graph import CopilotGraph
from app.models.entities import Conversation, Message, User
from app.rag.retriever import GroundwaterRetriever
from app.rag.retriever import RetrievedDocument
from app.schemas.chat import ChatResponse, Citation
from app.services.groq_service import GroqService

logger = logging.getLogger(__name__)

CITATION_PATTERN = re.compile(r"\[(\d+)\]")


class ChatService:
    def __init__(self) -> None:
        self.retriever = GroundwaterRetriever()
        self.graph = CopilotGraph(GroqService())

    async def chat(
        self,
        db: Session,
        message: str,
        language: str,
        conversation_id: str | None,
        user: User | None = None,
        top_k: int = 4,
    ) -> ChatResponse:
        try:
            logger.info(f"📨 Chat request: {message[:100]}... (language={language}, top_k={top_k})")
            
            conversation = db.get(Conversation, conversation_id) if conversation_id else None
            if conversation is None:
                conversation = Conversation(title=message[:60], user_id=user.id if user else None)
                db.add(conversation)
                db.flush()
                logger.info(f"📝 Created new conversation: {conversation.id}")

            logger.info(f"🔍 Retrieving {top_k} documents...")
            retrieved = self.retriever.retrieve(message, top_k)
            logger.info(f"✓ Retrieved {len(retrieved)} documents")
            
            retrieved = self._allowed_documents(retrieved, user.role if user else "viewer")
            logger.info(f"✓ Filtered to {len(retrieved)} allowed documents")
            
            logger.info("🤖 Generating answer from Groq...")
            answer = await self.graph.answer(message=message, language=language, context=retrieved)
            logger.info(f"✓ Answer generated: {len(answer)} characters")
            
            citations = self._citations_for_answer(answer, retrieved)
            logger.info(f"✓ Found {len(citations)} citations")
            
            conversation.updated_at = datetime.utcnow()
            db.add(Message(conversation_id=conversation.id, role="user", content=message, language=language))
            db.add(Message(conversation_id=conversation.id, role="assistant", content=answer, language=language))
            db.commit()
            logger.info(f"✓ Messages saved to conversation {conversation.id}")

            return ChatResponse(
                conversation_id=conversation.id,
                answer=answer,
                language=language,
                citations=citations,
            )
        except Exception as e:
            logger.error(f"❌ Chat error: {type(e).__name__}: {str(e)}")
            raise

    async def query(self, message: str, language: str, user: User, top_k: int = 4) -> ChatResponse:
        try:
            logger.info(f"📋 Query request: {message[:100]}... (language={language})")
            
            logger.info(f"🔍 Retrieving {top_k} documents...")
            retrieved = self.retriever.retrieve(message, top_k)
            logger.info(f"✓ Retrieved {len(retrieved)} documents")
            
            retrieved = self._allowed_documents(retrieved, user.role)
            logger.info(f"✓ Filtered to {len(retrieved)} allowed documents")
            
            logger.info("🤖 Generating answer from Groq...")
            answer = await self.graph.answer(message=message, language=language, context=retrieved)
            logger.info(f"✓ Answer generated: {len(answer)} characters")
            
            citations = self._citations_for_answer(answer, retrieved)
            logger.info(f"✓ Found {len(citations)} citations")
            
            return ChatResponse(
                answer=answer,
                language=language,
                citations=citations,
            )
        except Exception as e:
            logger.error(f"❌ Query error: {type(e).__name__}: {str(e)}")
            raise

    def _citations_for_answer(self, answer: str, retrieved: list[RetrievedDocument]) -> list[Citation]:
        referenced = {
            int(match.group(1))
            for match in CITATION_PATTERN.finditer(answer)
            if int(match.group(1)) > 0
        }
        return [
            Citation(
                title=doc.title,
                source=doc.source,
                excerpt=doc.excerpt,
                chunk_index=doc.chunk_index,
                score=doc.score,
            )
            for index, doc in enumerate(retrieved, start=1)
            if index in referenced
        ]

    def _allowed_documents(self, retrieved: list[RetrievedDocument], role: str) -> list[RetrievedDocument]:
        user_level = ROLE_LEVELS.get(role, 0)
        return [
            doc
            for doc in retrieved
            if any(user_level >= ROLE_LEVELS.get(access_role, 0) for access_role in (doc.access_roles or ["viewer"]))
        ]

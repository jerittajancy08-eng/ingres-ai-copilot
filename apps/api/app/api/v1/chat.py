from typing import Annotated
import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import audit_log, get_current_user, require_min_role
from app.db.session import get_db
from app.models.entities import Conversation, User, UserRole
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ConversationDetailResponse,
    ConversationResponse,
    MessageResponse,
    QueryRequest,
)
from app.services.chat_service import ChatService

logger = logging.getLogger(__name__)

router = APIRouter()
service = ChatService()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_min_role(UserRole.viewer))],
) -> ChatResponse:
    try:
        response = await service.chat(
            db,
            payload.message,
            payload.language,
            payload.conversation_id,
            user,
            payload.top_k,
        )
        audit_log(db, user, "CHAT_QUERY", payload.message[:120], request.client.host if request.client else None)
        db.commit()
        return response
    except Exception as e:
        logger.error(f"❌ Chat endpoint error: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat failed: {str(e)}"
        )


@router.post("/chat/query", response_model=ChatResponse)
async def query(
    payload: QueryRequest,
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_min_role(UserRole.viewer))],
) -> ChatResponse:
    try:
        response = await service.query(payload.query, payload.language, user, payload.top_k)
        audit_log(db, user, "CHAT_QUERY", payload.query[:120], request.client.host if request.client else None)
        db.commit()
        return response
    except Exception as e:
        logger.error(f"❌ Query endpoint error: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Query failed: {str(e)}"
        )


@router.get("/conversations", response_model=list[ConversationResponse])
def conversations(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User | None, Depends(get_current_user)],
) -> list[ConversationResponse]:
    query = select(Conversation).order_by(Conversation.updated_at.desc()).limit(50)
    if user:
        query = select(Conversation).where(Conversation.user_id == user.id).order_by(Conversation.updated_at.desc()).limit(50)
    rows = db.scalars(query).all()
    return [
        ConversationResponse(id=row.id, title=row.title, updated_at=row.updated_at.isoformat())
        for row in rows
    ]


@router.get("/conversations/{conversation_id}", response_model=ConversationDetailResponse)
def conversation_detail(
    conversation_id: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User | None, Depends(get_current_user)],
) -> ConversationDetailResponse:
    conversation = db.get(Conversation, conversation_id)
    if conversation is None or (user and conversation.user_id != user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return ConversationDetailResponse(
        id=conversation.id,
        title=conversation.title,
        updated_at=conversation.updated_at.isoformat(),
        messages=[
            MessageResponse(
                id=message.id,
                role=message.role,
                content=message.content,
                language=message.language,
                created_at=message.created_at.isoformat(),
            )
            for message in conversation.messages
        ],
    )

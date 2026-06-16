from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.entities import Conversation, User
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ConversationDetailResponse,
    ConversationResponse,
    MessageResponse,
    QueryRequest,
)
from app.services.chat_service import ChatService

router = APIRouter()
service = ChatService()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User | None, Depends(get_current_user)],
) -> ChatResponse:
    return await service.chat(
        db,
        payload.message,
        payload.language,
        payload.conversation_id,
        user,
        payload.top_k,
    )


@router.post("/chat/query", response_model=ChatResponse)
async def query(payload: QueryRequest) -> ChatResponse:
    return await service.query(payload.query, payload.language, payload.top_k)


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

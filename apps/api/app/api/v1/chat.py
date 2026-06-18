from typing import Annotated
import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import audit_log, get_current_user, require_authenticated_user, require_min_role
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
    user: Annotated[User, Depends(require_min_role(UserRole.user))],
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
    user: Annotated[User, Depends(require_min_role(UserRole.user))],
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
    user: Annotated[User, Depends(require_authenticated_user)],
) -> list[ConversationResponse]:
    """Get conversations accessible to the current user.
    
    - Regular users: only their own conversations
    - Admins: all conversations
    """
    # Admins can see all conversations
    if user.role == UserRole.admin.value:
        query = select(Conversation).order_by(Conversation.updated_at.desc()).limit(50)
    else:
        # Regular users only see their own conversations
        query = select(Conversation).where(
            Conversation.user_id == user.id
        ).order_by(Conversation.updated_at.desc()).limit(50)
    
    rows = db.scalars(query).all()
    return [
        ConversationResponse(id=row.id, title=row.title, updated_at=row.updated_at.isoformat())
        for row in rows
    ]


@router.get("/conversations/{conversation_id}", response_model=ConversationDetailResponse)
def conversation_detail(
    conversation_id: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_authenticated_user)],
) -> ConversationDetailResponse:
    """Get conversation details with ownership verification.
    
    Returns 401 if not authenticated.
    Returns 403 if user lacks permission to access this conversation.
    Returns 404 if conversation not found.
    """
    conversation = db.get(Conversation, conversation_id)
    if conversation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    
    # Check ownership: regular users can only access their own conversations
    # Admins can access any conversation
    is_admin = user.role == UserRole.admin.value
    owns_conversation = conversation.user_id == user.id
    
    if not (is_admin or owns_conversation):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to access this conversation"
        )
    
    audit_log(db, user, "VIEW_CONVERSATION", conversation_id, None)
    db.commit()
    
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

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_min_role, get_db
from app.models.entities import User, UserRole, Conversation, Document

router = APIRouter()


@router.get("/analytics")
def analytics(
    user: Annotated[User, Depends(require_min_role(UserRole.admin))],
    db: Annotated[Session, Depends(get_db)],
) -> dict[str, object]:
    # Count total users
    total_users = db.query(User).count()
    
    # Count users by role
    admin_count = db.query(User).filter(User.role == UserRole.admin.value).count()
    regular_user_count = db.query(User).filter(User.role == UserRole.user.value).count()
    
    # Count total conversations
    total_conversations = db.query(Conversation).count()
    
    # Count total documents
    total_documents = db.query(Document).count()
    
    return {
        "total_users": total_users,
        "admin_count": admin_count,
        "regular_user_count": regular_user_count,
        "total_conversations": total_conversations,
        "total_documents": total_documents,
    }

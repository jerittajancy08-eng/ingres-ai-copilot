from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import require_min_role
from app.models.entities import User, UserRole

router = APIRouter()


@router.get("/analytics")
def analytics(user: Annotated[User, Depends(require_min_role(UserRole.admin))]) -> dict[str, object]:
    return {
        "active_users": 1240,
        "conversations": 8950,
        "documents_indexed": 312,
        "top_languages": [
            {"language": "Kannada", "count": 4300},
            {"language": "English", "count": 2700},
            {"language": "Hindi", "count": 1200},
        ],
    }

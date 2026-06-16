from fastapi import APIRouter

router = APIRouter()


@router.get("/analytics")
def analytics() -> dict[str, object]:
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

from fastapi import APIRouter

from app.api.v1 import admin, auth, chat, documents, groundwater, map_assets

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(chat.router, tags=["chat"])
api_router.include_router(groundwater.router, prefix="/groundwater", tags=["groundwater"])
api_router.include_router(map_assets.router, prefix="/map", tags=["map"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])

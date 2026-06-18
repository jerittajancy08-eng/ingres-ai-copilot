from pydantic import BaseModel, EmailStr
from datetime import datetime

from app.models.entities import UserRole


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    # Role is automatically assigned (admin if first user, user otherwise)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    role: str
    created_at: datetime | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

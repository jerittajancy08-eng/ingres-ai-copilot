from pydantic import BaseModel, EmailStr

from app.models.entities import UserRole


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: UserRole = UserRole.viewer


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    role: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

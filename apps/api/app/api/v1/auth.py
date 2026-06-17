from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.api.deps import audit_log, get_db, get_current_user
from app.models.entities import User, UserRole
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse

router = APIRouter()


@router.post("/register", response_model=UserResponse)
def register(payload: RegisterRequest, request: Request, db: Session = Depends(get_db)) -> UserResponse:
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    has_users = db.scalar(select(User.id).limit(1)) is not None
    role = payload.role.value
    if has_users and role != UserRole.viewer.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only super admins can assign elevated roles")
    user = User(email=payload.email, password_hash=hash_password(payload.password), role=role)
    db.add(user)
    audit_log(db, user, "USER_CREATED", user.email, request.client.host if request.client else None)
    db.commit()
    db.refresh(user)
    return UserResponse(id=user.id, email=user.email, role=user.role)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    audit_log(db, user, "LOGIN", user.email, request.client.host if request.client else None)
    db.commit()
    return TokenResponse(
        access_token=create_access_token(user.id, user.role),
        user=UserResponse(id=user.id, email=user.email, role=user.role),
    )


@router.post("/logout")
def logout(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User | None, Depends(get_current_user)],
) -> dict[str, str]:
    if user:
        audit_log(db, user, "LOGOUT", user.email, request.client.host if request.client else None)
        db.commit()
    return {"status": "ok"}


@router.get("/me", response_model=UserResponse)
def me(user: Annotated[User | None, Depends(get_current_user)]) -> UserResponse:
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return UserResponse(id=user.id, email=user.email, role=user.role)
from app.api.deps import get_current_user

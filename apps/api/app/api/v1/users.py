from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import audit_log, get_db, require_role
from app.core.security import hash_password
from app.models.entities import User, UserRole
from app.schemas.auth import UserResponse

router = APIRouter()


class UserCreateRequest(BaseModel):
    email: EmailStr
    password: str
    role: UserRole = UserRole.viewer


class RoleChangeRequest(BaseModel):
    role: UserRole


@router.get("", response_model=list[UserResponse])
def list_users(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_role(UserRole.super_admin))],
) -> list[UserResponse]:
    rows = db.scalars(select(User).order_by(User.created_at.desc())).all()
    return [UserResponse(id=row.id, email=row.email, role=row.role) for row in rows]


@router.post("", response_model=UserResponse)
def create_user(
    payload: UserCreateRequest,
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_role(UserRole.super_admin))],
) -> UserResponse:
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    created = User(email=payload.email, password_hash=hash_password(payload.password), role=payload.role.value)
    db.add(created)
    audit_log(db, user, "USER_CREATED", created.email, request.client.host if request.client else None)
    db.commit()
    db.refresh(created)
    return UserResponse(id=created.id, email=created.email, role=created.role)


@router.patch("/{user_id}/role", response_model=UserResponse)
def change_role(
    user_id: str,
    payload: RoleChangeRequest,
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_role(UserRole.super_admin))],
) -> UserResponse:
    target = db.get(User, user_id)
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    target.role = payload.role.value
    audit_log(db, user, "ROLE_CHANGED", target.email, request.client.host if request.client else None)
    db.commit()
    db.refresh(target)
    return UserResponse(id=target.id, email=target.email, role=target.role)


@router.delete("/{user_id}")
def delete_user(
    user_id: str,
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_role(UserRole.super_admin))],
) -> dict[str, str]:
    target = db.get(User, user_id)
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    resource = target.email
    db.delete(target)
    audit_log(db, user, "USER_DELETED", resource, request.client.host if request.client else None)
    db.commit()
    return {"status": "deleted"}

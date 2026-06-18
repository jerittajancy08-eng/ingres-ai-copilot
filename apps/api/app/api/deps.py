from typing import Annotated, Callable

from fastapi import Depends, Header, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.entities import AuditLog, User, UserRole

ROLE_LEVELS = {
    UserRole.user.value: 1,
    UserRole.admin.value: 2,
}


def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    authorization: Annotated[str | None, Header()] = None,
) -> User | None:
    if not authorization:
        return None
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization header")
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")
    return db.get(User, user_id)


def require_role(*roles: UserRole | str) -> Callable[[User | None], User]:
    allowed = {role.value if isinstance(role, UserRole) else role for role in roles}

    def dependency(user: Annotated[User | None, Depends(get_current_user)]) -> User:
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
        if user.role not in allowed:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user

    return dependency


def require_authenticated_user(user: Annotated[User | None, Depends(get_current_user)]) -> User:
    """Require user to be authenticated. Returns 401 if not authenticated."""
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return user


def require_min_role(role: UserRole | str) -> Callable[[User | None], User]:
    required = ROLE_LEVELS[role.value if isinstance(role, UserRole) else role]

    def dependency(user: Annotated[User | None, Depends(get_current_user)]) -> User:
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
        if ROLE_LEVELS.get(user.role, 0) < required:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user

    return dependency


def audit_log(
    db: Session,
    user: User | None,
    action: str,
    resource: str | None = None,
    ip: str | None = None,
) -> None:
    db.add(
        AuditLog(
            user_id=user.id if user else None,
            email=user.email if user else None,
            role=user.role if user else None,
            action=action,
            resource=resource,
            ip=ip,
        )
    )

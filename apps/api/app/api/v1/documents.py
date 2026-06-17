from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import ROLE_LEVELS, audit_log, get_current_user, require_min_role
from app.db.session import get_db
from app.models.entities import Document, User, UserRole
from app.rag.extractors import UnsupportedDocumentType, extract_text
from app.rag.ingestion import ingest_document
from app.schemas.documents import DocumentResponse

router = APIRouter()


class IngestRequest(BaseModel):
    title: str
    source: str
    text: str
    access_roles: list[UserRole] = [UserRole.viewer]


def serialize_roles(value: str | list[str] | list[UserRole]) -> str:
    if isinstance(value, str):
        return value
    return ",".join(role.value if isinstance(role, UserRole) else role for role in value)


def parse_roles(value: str | None) -> list[str]:
    return [role for role in (value or UserRole.viewer.value).split(",") if role]


def can_access_document(user: User, document: Document) -> bool:
    user_level = ROLE_LEVELS.get(user.role, 0)
    return any(user_level >= ROLE_LEVELS.get(role, 0) for role in parse_roles(document.access_roles))


@router.post("/ingest")
def ingest(
    payload: IngestRequest,
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_min_role(UserRole.editor))],
) -> DocumentResponse:
    access_roles = [role.value for role in payload.access_roles]
    result = ingest_document(payload.title, payload.source, payload.text, access_roles)
    document = Document(
        title=payload.title,
        source=payload.source,
        content_type="text/plain",
        chunk_count=int(result["chunks"]),
        access_roles=serialize_roles(access_roles),
        uploaded_by_id=user.id,
    )
    db.add(document)
    audit_log(db, user, "UPLOAD_DOCUMENT", payload.source, request.client.host if request.client else None)
    db.commit()
    db.refresh(document)
    return DocumentResponse(
        id=document.id,
        title=document.title,
        source=document.source,
        content_type=document.content_type,
        chunk_count=document.chunk_count,
        access_roles=parse_roles(document.access_roles),
        created_at=document.created_at.isoformat(),
    )


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_min_role(UserRole.editor))],
    file: UploadFile = File(...),
) -> DocumentResponse:
    raw = await file.read()
    filename = file.filename or "uploaded-document.txt"
    try:
        text = extract_text(filename, raw)
    except UnsupportedDocumentType as exc:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not extract text from document") from exc
    if not text.strip():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Document does not contain extractable text")

    source = f"upload://{uuid4()}-{filename}"
    access_roles = [UserRole.viewer.value]
    result = ingest_document(filename, source, text, access_roles)
    document = Document(
        title=filename,
        source=source,
        content_type=file.content_type or "application/octet-stream",
        chunk_count=int(result["chunks"]),
        access_roles=serialize_roles(access_roles),
        uploaded_by_id=user.id,
    )
    db.add(document)
    audit_log(db, user, "UPLOAD_DOCUMENT", source, request.client.host if request.client else None)
    db.commit()
    db.refresh(document)
    return DocumentResponse(
        id=document.id,
        title=document.title,
        source=document.source,
        content_type=document.content_type,
        chunk_count=document.chunk_count,
        access_roles=parse_roles(document.access_roles),
        created_at=document.created_at.isoformat(),
    )


def get_document_list(db: Session, user: User) -> list[DocumentResponse]:
    rows = db.scalars(select(Document).order_by(Document.created_at.desc()).limit(100)).all()
    return [
        DocumentResponse(
            id=row.id,
            title=row.title,
            source=row.source,
            content_type=row.content_type,
            chunk_count=row.chunk_count,
            access_roles=parse_roles(row.access_roles),
            created_at=row.created_at.isoformat(),
        )
        for row in rows
        if can_access_document(user, row)
    ]


@router.get("", response_model=list[DocumentResponse])
def list_documents(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_min_role(UserRole.viewer))],
) -> list[DocumentResponse]:
    return get_document_list(db, user)


@router.get("/list", response_model=list[DocumentResponse])
def list_documents_alias(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_min_role(UserRole.viewer))],
) -> list[DocumentResponse]:
    return get_document_list(db, user)


@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_min_role(UserRole.admin))],
) -> dict[str, str]:
    document = db.get(Document, document_id)
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    db.delete(document)
    audit_log(db, user, "DELETE_DOCUMENT", document.source, request.client.host if request.client else None)
    db.commit()
    return {"status": "deleted"}


@router.post("/{document_id}/reindex")
def reindex_document(
    document_id: str,
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_min_role(UserRole.admin))],
) -> dict[str, str]:
    document = db.get(Document, document_id)
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    audit_log(db, user, "REINDEX_DOCUMENT", document.source, request.client.host if request.client else None)
    db.commit()
    return {"status": "queued"}

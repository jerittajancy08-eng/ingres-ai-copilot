from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.entities import Document, User
from app.rag.extractors import UnsupportedDocumentType, extract_text
from app.rag.ingestion import ingest_document
from app.schemas.documents import DocumentResponse

router = APIRouter()


class IngestRequest(BaseModel):
    title: str
    source: str
    text: str


@router.post("/ingest")
def ingest(
    payload: IngestRequest,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User | None, Depends(get_current_user)],
) -> DocumentResponse:
    result = ingest_document(payload.title, payload.source, payload.text)
    document = Document(
        title=payload.title,
        source=payload.source,
        content_type="text/plain",
        chunk_count=int(result["chunks"]),
        uploaded_by_id=user.id if user else None,
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return DocumentResponse(
        id=document.id,
        title=document.title,
        source=document.source,
        content_type=document.content_type,
        chunk_count=document.chunk_count,
        created_at=document.created_at.isoformat(),
    )


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User | None, Depends(get_current_user)],
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
    result = ingest_document(filename, source, text)
    document = Document(
        title=filename,
        source=source,
        content_type=file.content_type or "application/octet-stream",
        chunk_count=int(result["chunks"]),
        uploaded_by_id=user.id if user else None,
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return DocumentResponse(
        id=document.id,
        title=document.title,
        source=document.source,
        content_type=document.content_type,
        chunk_count=document.chunk_count,
        created_at=document.created_at.isoformat(),
    )


def get_document_list(db: Session) -> list[DocumentResponse]:
    rows = db.scalars(select(Document).order_by(Document.created_at.desc()).limit(100)).all()
    return [
        DocumentResponse(
            id=row.id,
            title=row.title,
            source=row.source,
            content_type=row.content_type,
            chunk_count=row.chunk_count,
            created_at=row.created_at.isoformat(),
        )
        for row in rows
    ]


@router.get("", response_model=list[DocumentResponse])
def list_documents(db: Annotated[Session, Depends(get_db)]) -> list[DocumentResponse]:
    return get_document_list(db)


@router.get("/list", response_model=list[DocumentResponse])
def list_documents_alias(db: Annotated[Session, Depends(get_db)]) -> list[DocumentResponse]:
    return get_document_list(db)

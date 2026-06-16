from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: str
    title: str
    source: str
    content_type: str
    chunk_count: int
    created_at: str

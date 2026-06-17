from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: str
    title: str
    source: str
    content_type: str
    chunk_count: int
    access_roles: list[str]
    created_at: str

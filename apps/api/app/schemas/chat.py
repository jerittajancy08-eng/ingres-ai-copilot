from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    language: str = "en"
    conversation_id: str | None = None
    top_k: int = Field(default=4, ge=1, le=12)


class QueryRequest(BaseModel):
    query: str = Field(min_length=1)
    language: str = "en"
    top_k: int = Field(default=4, ge=1, le=12)


class Citation(BaseModel):
    title: str
    source: str
    excerpt: str
    chunk_index: int
    score: float | None = None


class ChatResponse(BaseModel):
    conversation_id: str | None = None
    answer: str
    language: str
    citations: list[Citation]


class ConversationResponse(BaseModel):
    id: str
    title: str
    updated_at: str


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    language: str
    created_at: str


class ConversationDetailResponse(ConversationResponse):
    messages: list[MessageResponse]

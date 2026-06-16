from uuid import uuid4

import chromadb

from app.core.config import settings
from app.rag.embeddings import get_collection_name, get_embedding_function


CHUNK_SIZE = 1200
CHUNK_OVERLAP = 180


def get_groundwater_collection():
    client = chromadb.PersistentClient(path=settings.chroma_persist_directory)
    return client.get_or_create_collection(
        get_collection_name(),
        embedding_function=get_embedding_function(),
        metadata={"hnsw:space": "cosine", "domain": "groundwater", "embedding_provider": get_collection_name()},
    )


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    normalized = "\n".join(line.strip() for line in text.splitlines())
    paragraphs = [part.strip() for part in normalized.split("\n\n") if part.strip()]
    chunks: list[str] = []
    current = ""

    for paragraph in paragraphs or [normalized.strip()]:
        if not paragraph:
            continue
        if len(current) + len(paragraph) + 2 <= chunk_size:
            current = f"{current}\n\n{paragraph}".strip()
            continue
        if current:
            chunks.extend(split_long_text(current, chunk_size, overlap))
        current = paragraph

    if current:
        chunks.extend(split_long_text(current, chunk_size, overlap))
    return [chunk for chunk in chunks if chunk.strip()]


def split_long_text(text: str, chunk_size: int, overlap: int) -> list[str]:
    if len(text) <= chunk_size:
        return [text]
    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end].strip())
        if end == len(text):
            break
        start = max(0, end - overlap)
    return chunks


def ingest_document(title: str, source: str, text: str) -> dict[str, int | str]:
    collection = get_groundwater_collection()
    chunks = chunk_text(text)
    ids = [str(uuid4()) for _ in chunks]
    metadatas = [
        {"title": title, "source": source, "chunk_index": index, "document_id": source}
        for index, _ in enumerate(chunks)
    ]
    if chunks:
        collection.add(documents=chunks, ids=ids, metadatas=metadatas)
    return {"document_id": source, "chunks": len(chunks)}

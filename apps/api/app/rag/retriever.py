from dataclasses import dataclass

import chromadb

from app.core.config import settings
from app.rag.embeddings import get_collection_name, get_embedding_function


@dataclass(frozen=True)
class RetrievedDocument:
    title: str
    source: str
    excerpt: str
    chunk_index: int
    score: float | None = None
    access_roles: list[str] | None = None


class GroundwaterRetriever:
    def __init__(self) -> None:
        self.embedding_function = get_embedding_function()
        self.client = chromadb.PersistentClient(path=settings.chroma_persist_directory)
        self.collection = self.client.get_or_create_collection(
            get_collection_name(),
            embedding_function=self.embedding_function,
            metadata={"hnsw:space": "cosine", "domain": "groundwater", "embedding_provider": get_collection_name()},
        )

    def retrieve(self, query: str, limit: int = 4) -> list[RetrievedDocument]:
        query = query.strip()
        if not query or self.collection.count() == 0:
            return []

        query_embedding = self.embedding_function.embed_query(query)
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=limit,
            include=["documents", "metadatas", "distances"],
        )
        documents = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]
        retrieved: list[RetrievedDocument] = []
        for document, metadata, distance in zip(documents, metadatas, distances, strict=False):
            retrieved.append(
                RetrievedDocument(
                    title=str(metadata.get("title", "Groundwater reference")),
                    source=str(metadata.get("source", "local")),
                    excerpt=document,
                    chunk_index=int(metadata.get("chunk_index", 0)),
                    score=max(0.0, 1 - float(distance)) if distance is not None else None,
                    access_roles=str(metadata.get("access_roles", "viewer")).split(","),
                )
            )
        return retrieved

    def build_context(self, query: str, limit: int = 4) -> tuple[str, list[RetrievedDocument]]:
        documents = self.retrieve(query, limit)
        context = "\n\n".join(
            f"[{index}] {doc.title} (source: {doc.source}, chunk: {doc.chunk_index})\n{doc.excerpt}"
            for index, doc in enumerate(documents, start=1)
        )
        return context, documents

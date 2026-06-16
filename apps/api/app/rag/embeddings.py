import hashlib
import math
import re

import google.generativeai as genai

from app.core.config import settings


def get_collection_name() -> str:
    if settings.gemini_api_key:
        return "groundwater_knowledge_gemini"
    return "groundwater_knowledge_local"


def get_embedding_function():
    if settings.gemini_api_key:
        return GeminiEmbeddingFunction()
    return HashingEmbeddingFunction()


class GeminiEmbeddingFunction:
    """Chroma embedding function backed by Gemini text embeddings."""

    def __init__(self) -> None:
        genai.configure(api_key=settings.gemini_api_key)
        self.model = settings.gemini_embedding_model

    def __call__(self, input: list[str]) -> list[list[float]]:  # Chroma calls this argument `input`.
        return [self.embed(text) for text in input]

    def embed(self, text: str) -> list[float]:
        response = genai.embed_content(
            model=self.model,
            content=text,
            task_type="retrieval_document",
            title="INGRES groundwater knowledge",
        )
        embedding = response.get("embedding", [])
        return [float(value) for value in embedding]

    def embed_query(self, text: str) -> list[float]:
        response = genai.embed_content(
            model=self.model,
            content=text,
            task_type="retrieval_query",
        )
        embedding = response.get("embedding", [])
        return [float(value) for value in embedding]


class HashingEmbeddingFunction:
    """Small deterministic fallback when Gemini credentials are not configured."""

    def __init__(self, dimensions: int = 384) -> None:
        self.dimensions = dimensions

    def __call__(self, input: list[str]) -> list[list[float]]:  # Chroma calls this argument `input`.
        return [self.embed(text) for text in input]

    def embed(self, text: str) -> list[float]:
        vector = [0.0] * self.dimensions
        tokens = re.findall(r"[\w]+", text.lower())
        for token in tokens:
            digest = hashlib.blake2b(token.encode("utf-8"), digest_size=8).digest()
            index = int.from_bytes(digest[:4], "big") % self.dimensions
            sign = 1.0 if digest[4] % 2 == 0 else -1.0
            vector[index] += sign

        norm = math.sqrt(sum(value * value for value in vector))
        if norm == 0:
            return vector
        return [value / norm for value in vector]

    def embed_query(self, text: str) -> list[float]:
        return self.embed(text)

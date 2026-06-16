import google.generativeai as genai

from app.core.config import settings
from app.rag.retriever import RetrievedDocument


class GeminiService:
    def __init__(self) -> None:
        self.enabled = bool(settings.gemini_api_key)
        if self.enabled:
            genai.configure(api_key=settings.gemini_api_key)
            self.model = genai.GenerativeModel(settings.gemini_model)
        else:
            self.model = None

    async def generate_groundwater_answer(self, message: str, language: str, context: list[RetrievedDocument]) -> str:
        if not context:
            return (
                "I do not have enough information in the uploaded documents to answer that. "
                "Upload a relevant PDF, DOCX, or TXT source and try again."
            )

        context_text = "\n\n".join(
            f"[{index}] Title: {doc.title}\nSource: {doc.source}\nChunk: {doc.chunk_index}\nContent:\n{doc.excerpt}"
            for index, doc in enumerate(context, start=1)
        )
        prompt = (
            "You are INGRES AI Copilot, a multilingual groundwater assistant. "
            "Answer only from the retrieved context below. If the context does not contain the answer, say you do not "
            "have enough information in the uploaded documents. Do not add outside facts, estimates, or assumptions. "
            "Cite every factual claim with bracket citations like [1] or [2]. Keep the answer concise and practical.\n\n"
            f"Language: {language}\n"
            f"Question: {message}\n"
            f"Retrieved context:\n{context_text}"
        )
        if not self.model:
            excerpts = []
            for index, doc in enumerate(context[:3], start=1):
                excerpt = doc.excerpt.strip().replace("\n", " ")
                excerpts.append(f"[{index}] {excerpt[:420]}")
            return "GEMINI_API_KEY is not configured. Retrieved document context:\n\n" + "\n\n".join(excerpts)
        response = await self.model.generate_content_async(prompt)
        return response.text or "I do not have enough information in the uploaded documents to answer that."

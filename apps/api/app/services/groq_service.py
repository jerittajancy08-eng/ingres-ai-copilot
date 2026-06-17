import logging
from groq import AsyncGroq, APIConnectionError, APIError, APIStatusError

from app.core.config import settings
from app.rag.retriever import RetrievedDocument

logger = logging.getLogger(__name__)


RAG_RELEVANCE_THRESHOLD = 0.35
FORCE_RAG_PHRASES = (
    "according to the uploaded documents",
    "according to the documents",
    "what do the uploaded documents say",
    "what do the documents say",
    "from the uploaded files",
    "from the uploaded documents",
    "based on the uploaded documents",
    "based on the documents",
)
RAG_NO_ANSWER = "The uploaded documents do not contain enough information to answer this question."

SYSTEM_PROMPT = """
You are INGRES AI Copilot.

Rules:
- Follow the selected mode exactly.
- In RAG mode, answer only from retrieved context and cite sources as [1], [2], etc.
- In GENERAL mode, answer from general knowledge only.
- In GENERAL mode, do not mention retrieved context, uploaded documents, citations, or source numbers.
- Never mix retrieved context with general knowledge in the same answer.
- Never invent citations.
"""

RAG_PROMPT = """
Mode: RAG

Answer the question using only the retrieved context below.
Cite factual claims using the matching source number, such as [1] or [2].
If the retrieved context does not contain the answer, return exactly:
The uploaded documents do not contain enough information to answer this question.

Language: {language}

Question:
{message}

Retrieved Context:
{context_text}
"""

GENERAL_PROMPT = """
Mode: GENERAL

Answer the question using general knowledge.
Do not mention retrieved context, uploaded documents, citations, or source numbers.

Language: {language}

Question:
{message}
"""


class GroqService:
    def __init__(self) -> None:
        self.enabled = bool(settings.groq_api_key)
        
        if not settings.groq_api_key:
            logger.error("⚠️ GROQ_API_KEY is not configured. Chat will not work.")
            self.client = None
        else:
            logger.info("✓ GROQ_API_KEY loaded successfully")
            self.client = AsyncGroq(api_key=settings.groq_api_key)

    async def generate_groundwater_answer(
        self,
        message: str,
        language: str,
        context: list[RetrievedDocument],
    ) -> str:
        if not self.client:
            logger.error("❌ Groq client not initialized. GROQ_API_KEY is missing.")
            raise RuntimeError("Groq service is not configured. Set GROQ_API_KEY in .env")
        
        scores = [doc.score for doc in context if doc.score is not None]
        max_score = max(scores) if scores else None
        force_rag = self._is_document_intent(message)
        use_rag = force_rag or (max_score is not None and max_score >= RAG_RELEVANCE_THRESHOLD)
        mode = "RAG" if use_rag else "GENERAL"

        score_str = f"{max_score:.2f}" if max_score is not None else "None"
        logger.info(f"🔄 FORCE_RAG={force_rag}, MAX_SCORE={score_str}, MODE={mode}")

        if use_rag:
            if not context:
                logger.info("📄 RAG mode but no context retrieved")
                return RAG_NO_ANSWER

            context_text = "\n\n".join(
                f"[{index}] Title: {doc.title}\n"
                f"Source: {doc.source}\n"
                f"Chunk: {doc.chunk_index}\n"
                f"Content:\n{doc.excerpt}"
                for index, doc in enumerate(context, start=1)
            )
            prompt = RAG_PROMPT.format(
                language=language,
                message=message,
                context_text=context_text,
            )
            logger.info(f"📄 RAG mode: {len(context)} documents retrieved")
        else:
            prompt = GENERAL_PROMPT.format(language=language, message=message)
            logger.info("🌐 GENERAL mode: using Groq knowledge base")

        try:
            logger.info(f"📤 Sending request to Groq (model: llama-3.3-70b-versatile)...")
            response = await self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": SYSTEM_PROMPT,
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                temperature=0.2,
            )
            logger.info("✓ Groq response received successfully")
            return response.choices[0].message.content
        except (APIConnectionError, APIStatusError, APIError) as e:
            logger.error(f"❌ Groq API error: {type(e).__name__}: {str(e)}")
            raise RuntimeError(f"Groq API error: {str(e)}")
        except Exception as e:
            logger.error(f"❌ Unexpected error calling Groq: {type(e).__name__}: {str(e)}")
            raise RuntimeError(f"Unexpected error: {str(e)}")

    def _is_document_intent(self, message: str) -> bool:
        normalized = message.casefold()
        return any(phrase in normalized for phrase in FORCE_RAG_PHRASES)

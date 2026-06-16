# Architecture

INGRES AI Copilot is organized as a modular monorepo. The frontend calls versioned FastAPI endpoints. The API owns authentication, conversation persistence, analytics, groundwater data, document ingestion, RAG retrieval, and AI response orchestration.

## Request Flow

1. User submits text or speech from the chat UI.
2. FastAPI validates the authenticated request.
3. The copilot service detects language, retrieves relevant groundwater documents from ChromaDB, and calls Gemini.
4. The API persists the conversation turn and returns the answer with source citations.
5. Dashboards and admin analytics consume separate read-optimized endpoints.

## Main Boundaries

- `app/api/v1`: HTTP route layer.
- `app/services`: application services.
- `app/rag`: ingestion, embeddings, retrieval, and citation formatting.
- `app/agents`: LangGraph-compatible orchestration.
- `app/db`: database session and lifecycle.

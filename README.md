# INGRES AI Copilot

Production-oriented full-stack starter for a multilingual AI groundwater assistant for citizens, farmers, and government officers.

## Stack

- Frontend: Next.js 15, TypeScript, Tailwind CSS, Shadcn-style components
- Backend: FastAPI, Python, SQLAlchemy
- AI: Gemini API, LangGraph-ready agent service, RAG, ChromaDB
- Infra: Docker Compose, environment-based configuration

## Project Structure

```text
apps/
  web/       Next.js application
  api/       FastAPI application
docs/        API and architecture documentation
infra/       Docker and deployment assets
scripts/     Operational scripts
```

## Quick Start

1. Copy `.env.example` to `.env`.
2. Install frontend dependencies with `npm install`.
3. Install backend dependencies with `pip install -r apps/api/requirements.txt`.
4. Run API: `npm run dev:api`.
5. Run web: `npm run dev:web`.

API docs are available at `http://localhost:8000/docs`.

## Phase 1 MVP

- Landing, login, chat, dashboard, map, and admin pages.
- Token-based authentication with register/login endpoints.
- Persisted users, conversations, messages, and document metadata.
- Gemini-powered chat service with a safe local fallback when `GEMINI_API_KEY` is not configured.
- LangGraph answer-generation graph.
- ChromaDB retrieval and document ingestion.
- Document upload from the dashboard for PDF, DOCX, and TXT files with text extraction, chunking, embeddings, and ChromaDB storage.
- PostgreSQL-ready SQLAlchemy models and schema reference in `docs/POSTGRES_SCHEMA.sql`.

## Docker

Run the full stack with:

```powershell
docker compose up --build
```

The compose stack starts the web app, API, PostgreSQL, and Chroma.

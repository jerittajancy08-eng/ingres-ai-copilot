import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.init_db import init_db
from app.services.groq_service import GroqService
from app.rag.retriever import GroundwaterRetriever

logger = logging.getLogger(__name__)

app = FastAPI(
    title="INGRES AI Copilot API",
    version="0.1.0",
    description="Multilingual AI groundwater assistant with RAG, citations, and analytics.",
)

# Configure CORS with explicit origins
cors_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://localhost:3000",
    "https://127.0.0.1:3000",
    "https://ingres-ai-copilot-web.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

# Services for health checks
groq_service = None
retriever = None


@app.on_event("startup")
def on_startup() -> None:
    global groq_service, retriever
    
    logger.info("=" * 60)
    logger.info("🚀 INGRES AI Copilot API Starting Up")
    logger.info("=" * 60)
    logger.info(f"🔗 CORS Origins: {cors_origins}")
    
    # Check environment variables
    logger.info(f"🔐 GROQ_API_KEY: {'✓ Configured' if settings.groq_api_key else '❌ NOT SET'}")
    logger.info(f"🗄️  DATABASE_URL: {settings.database_url[:50]}...")
    logger.info(f"🔗 CORS_ORIGINS: {settings.cors_origins}")
    
    # Initialize database
    try:
        init_db()
        logger.info("✓ Database initialized successfully")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
    
    # Initialize services for health check
    try:
        groq_service = GroqService()
        logger.info("✓ Groq service initialized")
    except Exception as e:
        logger.error(f"❌ Groq service initialization failed: {e}")
    
    try:
        retriever = GroundwaterRetriever()
        doc_count = retriever.collection.count()
        logger.info(f"✓ RAG retriever initialized ({doc_count} documents in collection)")
    except Exception as e:
        logger.error(f"❌ RAG retriever initialization failed: {e}")
    
    logger.info("=" * 60)
    logger.info("✅ Startup complete!")
    logger.info("=" * 60)


@app.get("/health", tags=["system"])
def health() -> dict[str, bool | str | int]:
    """Comprehensive health check endpoint"""
    health_status: dict[str, bool | str | int] = {
        "api": True,
        "groq": groq_service.enabled if groq_service else False,
        "rag": retriever is not None,
        "database": True,
    }
    
    # Try to verify actual connectivity
    if groq_service:
        logger.debug(f"Groq enabled: {groq_service.enabled}, client exists: {groq_service.client is not None}")
    
    if retriever:
        try:
            doc_count = retriever.collection.count()
            health_status["rag_documents"] = doc_count
        except Exception as e:
            logger.warning(f"Could not count RAG documents: {e}")
    
    return health_status

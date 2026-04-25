"""
IntegraMind AI × Minoan Lines S.A.
AI-Powered IT & Operations Platform — FastAPI Entry Point

Stack: FastAPI + Supabase + DeepSeek AI + slowapi rate limiting
Deploy: Railway (API) + Vercel (Flutter web)
"""
import structlog
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from config import get_settings
from middleware.rate_limiter import attach_rate_limiter, ai_limit
from routers import vessels, chat, compliance, helpdesk, analytics

log = structlog.get_logger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("minoan_platform.startup", environment=settings.environment, db="supabase")
    yield
    log.info("minoan_platform.shutdown")


app = FastAPI(
    title="IntegraMind AI × Minoan Lines Platform",
    description=(
        "Production-grade AI automation platform for Minoan Lines S.A.\n\n"
        "**Stack:** FastAPI · Supabase · DeepSeek AI · Flutter\n"
        "**Built by:** IntegraMind AI (integramindai.com)\n\n"
        "### Modules\n"
        "1. **Vessel Ops** `/vessels` — AIS tracking + delay prediction\n"
        "2. **Customer Agent** `/chat` — streaming DeepSeek (Greek/English)\n"
        "3. **Compliance** `/reports` — EU ETS + FuelEU PDF reports\n"
        "4. **Helpdesk** `/tickets` — AI triage + SLA tracking\n"
        "5. **Analytics** `/analytics` — demand forecasting\n"
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ── Rate limiting ─────────────────────────────────────────────────────────────
attach_rate_limiter(app)

# ── CORS — open to all origins ────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global error handler ─────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    log.error("unhandled_exception", path=request.url.path, error=str(exc))
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)},
    )


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health", tags=["system"])
async def health():
    return {
        "status": "ok",
        "platform": "Minoan AI Platform",
        "version": "1.0.0",
        "stack": {"db": "supabase", "ai": settings.deepseek_model, "cache": "supabase-realtime"},
        "environment": settings.environment,
    }


# ── Test AI endpoint ─────────────────────────────────────────────────────────
class TestAIRequest(BaseModel):
    prompt: str
    stream: bool = True


@app.post("/test-ai", tags=["system"])
@ai_limit
async def test_ai(request: Request, payload: TestAIRequest):
    """Test the DeepSeek AI pipeline. Rate limited: 20 req/min."""
    from services.ai_service import complete, stream as ai_stream
    from fastapi.responses import StreamingResponse
    import json

    system = (
        "You are the AI assistant for Minoan Lines S.A., a Greek ferry operator. "
        "Built and maintained by IntegraMind AI. Be helpful and concise."
    )

    if payload.stream:
        async def generate():
            async for chunk in ai_stream(system, payload.prompt):
                yield f"data: {json.dumps({'text': chunk})}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )

    response = await complete(system, payload.prompt)
    return {"response": response, "model": settings.deepseek_model}


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(vessels.router)
app.include_router(chat.router)
app.include_router(compliance.router)
app.include_router(compliance.fuel_router)
app.include_router(helpdesk.router)
app.include_router(analytics.router)


@app.get("/", tags=["system"])
async def root():
    return {
        "platform": "Minoan Lines AI Platform",
        "powered_by": "IntegraMind AI × DeepSeek AI",
        "docs": "/docs",
        "modules": {
            "vessel_ops": "/vessels",
            "customer_agent": "/chat",
            "compliance": "/reports",
            "helpdesk": "/tickets",
            "analytics": "/analytics",
        },
    }
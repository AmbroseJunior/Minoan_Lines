"""
Module 2: AI Customer Support Agent — Supabase backend
POST /chat                      — streaming SSE
GET  /chat/{session_id}/history — conversation history
POST /chat/{session_id}/close   — mark resolved
"""
from __future__ import annotations

import json
import re
import uuid
from datetime import datetime, timezone
from typing import Optional

import structlog
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from middleware.rate_limiter import ai_limit, default_limit
from services.ai_service import answer_customer_query, extract_confidence, should_escalate
from supabase_client import db

log = structlog.get_logger(__name__)
router = APIRouter(prefix="/chat", tags=["customer-support"])

_GREEK_RE = re.compile(r"[\u0370-\u03FF\u1F00-\u1FFF]")
_META_RE  = re.compile(r'\{[^{}]*"confidence"[^{}]*\}', re.DOTALL)


def _detect_language(text: str) -> str:
    return "el" if _GREEK_RE.search(text) else "en"


def _extract_meta(full: str) -> tuple[str, dict]:
    m = _META_RE.search(full)
    if not m:
        return full, {}
    try:
        meta = json.loads(m.group())
        return full[:m.start()].rstrip(), meta
    except json.JSONDecodeError:
        return full, {}


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    language: Optional[str] = None


@router.post("")
@ai_limit
async def chat(request: Request, payload: ChatRequest):
    session_id = payload.session_id or str(uuid.uuid4())
    language   = payload.language or _detect_language(payload.message)

    # Upsert conversation record
    _upsert_conversation(session_id, language)

    # Load history
    history = _load_history(session_id)

    # Persist user message
    _save_message(session_id, "user", payload.message)

    full_parts: list[str] = []

    async def generate():
        nonlocal full_parts

        yield f"data: {json.dumps({'type': 'session', 'session_id': session_id})}\n\n"

        async for chunk in answer_customer_query(payload.message, language, history):
            full_parts.append(chunk)
            yield f"data: {json.dumps({'type': 'chunk', 'text': chunk})}\n\n"

        full_text = "".join(full_parts)
        clean_text, meta = _extract_meta(full_text)

        confidence = extract_confidence(meta) if meta else 1.0
        escalate   = should_escalate(confidence, meta.get("topic"))

        _save_message(session_id, "assistant", clean_text,
                      confidence_score=confidence, escalation_triggered=int(escalate))

        if escalate:
            db().table("conversations").update({
                "status": "escalated",
                "escalation_reason": meta.get("topic", "low_confidence"),
            }).eq("session_id", session_id).execute()

        yield f"data: {json.dumps({'type': 'done', 'session_id': session_id, 'escalate': escalate, 'confidence': confidence})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("/{session_id}/history")
@default_limit
async def get_history(request: Request, session_id: str):
    conv_res = db().table("conversations").select("*").eq("session_id", session_id).execute()
    if not conv_res.data:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

    msgs_res = (db().table("conversation_messages").select("*")
                .eq("session_id", session_id).order("created_at").execute())

    return {
        "session_id": session_id,
        "status": conv_res.data[0].get("status", "active"),
        "language": conv_res.data[0].get("language", "en"),
        "messages": msgs_res.data or [],
    }


@router.post("/{session_id}/close")
@default_limit
async def close_conversation(request: Request, session_id: str):
    db().table("conversations").update({
        "status": "resolved",
        "closed_at": datetime.now(timezone.utc).isoformat(),
    }).eq("session_id", session_id).execute()
    return {"session_id": session_id, "status": "resolved"}


# ── Helpers ───────────────────────────────────────────────────────────────────

def _upsert_conversation(session_id: str, language: str):
    existing = db().table("conversations").select("id").eq("session_id", session_id).execute()
    if not existing.data:
        db().table("conversations").insert({
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "language": language,
            "status": "active",
            "message_count": 0,
        }).execute()


def _load_history(session_id: str, limit: int = 20) -> list[dict]:
    res = (db().table("conversation_messages").select("role, content")
           .eq("session_id", session_id)
           .order("created_at", desc=True).limit(limit).execute())
    msgs = list(reversed(res.data or []))
    return [{"role": m["role"], "content": m["content"]} for m in msgs
            if m["role"] in ("user", "assistant")]


def _save_message(session_id: str, role: str, content: str,
                  confidence_score: float = None, escalation_triggered: int = 0):
    # Get conversation id
    conv = db().table("conversations").select("id").eq("session_id", session_id).execute()
    conv_id = conv.data[0]["id"] if conv.data else str(uuid.uuid4())

    db().table("conversation_messages").insert({
        "id": str(uuid.uuid4()),
        "conversation_id": conv_id,
        "session_id": session_id,
        "role": role,
        "content": content,
        "confidence_score": confidence_score,
        "escalation_triggered": escalation_triggered,
    }).execute()
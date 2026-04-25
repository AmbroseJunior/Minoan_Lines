"""
Module 4: IT Helpdesk AI Triage — Supabase backend
POST /tickets       — submit + auto-triage
GET  /tickets       — list (filterable)
GET  /tickets/{id}  — get single
PATCH /tickets/{id} — update status
"""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

import structlog
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel

from middleware.rate_limiter import ai_limit, default_limit
from models.ticket import PRIORITY_SLA_HOURS
from services.ai_service import classify_ticket
from supabase_client import db

log = structlog.get_logger(__name__)
router = APIRouter(prefix="/tickets", tags=["helpdesk"])

# ── Schemas ───────────────────────────────────────────────────────────────────

class TicketCreate(BaseModel):
    title: str
    description: str
    submitted_by: Optional[str] = None
    submitted_by_email: Optional[str] = None
    priority_hint: Optional[str] = None


class TicketUpdate(BaseModel):
    status: Optional[str] = None
    resolution_notes: Optional[str] = None
    assigned_to: Optional[str] = None
    priority: Optional[str] = None


# ── Counter ───────────────────────────────────────────────────────────────────

_ticket_counter: int = 0

def _next_ticket_number() -> str:
    global _ticket_counter
    _ticket_counter += 1
    return f"TKT-{datetime.now(timezone.utc).year}-{_ticket_counter:04d}"

def _compute_sla_due(priority: str) -> str:
    hours = PRIORITY_SLA_HOURS.get(priority, 24)
    return (datetime.now(timezone.utc) + timedelta(hours=hours)).isoformat()


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("", status_code=201)
@ai_limit
async def create_ticket(request: Request, payload: TicketCreate):
    log.info("helpdesk.create_ticket", title=payload.title)

    try:
        triage = await classify_ticket(payload.title, payload.description)
    except Exception as exc:
        log.error("helpdesk.triage_error", error=str(exc))
        triage = {
            "category": "Software/ERP", "priority": payload.priority_hint or "medium",
            "estimated_resolution_hours": 24, "assigned_to": "Software Support Team",
            "draft_response": "Thank you for contacting Minoan Lines IT Support. Your ticket has been received.",
            "confidence": 0.5, "escalate_to_manager": False,
        }

    priority = triage.get("priority", "medium")
    if payload.priority_hint == "critical":
        priority = "critical"

    record = {
        "id": str(uuid.uuid4()),
        "ticket_number": _next_ticket_number(),
        "title": payload.title,
        "description": payload.description,
        "submitted_by": payload.submitted_by,
        "submitted_by_email": payload.submitted_by_email,
        "category": triage.get("category"),
        "priority": priority,
        "estimated_resolution_hours": triage.get("estimated_resolution_hours"),
        "assigned_to": triage.get("assigned_to"),
        "ai_draft_response": triage.get("draft_response"),
        "ai_confidence": int(triage.get("confidence", 0.5) * 100),
        "sla_due_at": _compute_sla_due(priority),
        "status": "open",
        "sla_breached": 0,
    }

    res = db().table("tickets").insert(record).execute()
    if triage.get("escalate_to_manager"):
        log.warning("helpdesk.manager_escalation", ticket=record["ticket_number"])

    return res.data[0] if res.data else record


@router.get("")
@default_limit
async def list_tickets(
    request: Request,
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    query = db().table("tickets").select("*").order("created_at", desc=True).range(offset, offset + limit - 1)
    if status:
        query = query.eq("status", status)
    if priority:
        query = query.eq("priority", priority)
    if category:
        query = query.eq("category", category)

    res = query.execute()
    return res.data or []


@router.get("/{ticket_id}")
@default_limit
async def get_ticket(request: Request, ticket_id: str):
    res = db().table("tickets").select("*").eq("id", ticket_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")
    return res.data[0]


@router.patch("/{ticket_id}")
@default_limit
async def update_ticket(request: Request, ticket_id: str, payload: TicketUpdate):
    updates: dict = {}
    if payload.status is not None:
        updates["status"] = payload.status
        if payload.status == "resolved":
            updates["resolved_at"] = datetime.now(timezone.utc).isoformat()
    if payload.resolution_notes is not None:
        updates["resolution_notes"] = payload.resolution_notes
    if payload.assigned_to is not None:
        updates["assigned_to"] = payload.assigned_to
    if payload.priority is not None:
        updates["priority"] = payload.priority
        updates["sla_due_at"] = _compute_sla_due(payload.priority)

    updates["updated_at"] = datetime.now(timezone.utc).isoformat()

    res = db().table("tickets").update(updates).eq("id", ticket_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")
    return res.data[0]
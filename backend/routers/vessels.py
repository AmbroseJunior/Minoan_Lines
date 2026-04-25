"""
Module 1: Vessel Ops Dashboard — Supabase backend
GET  /vessels
GET  /vessels/{name}/status
GET  /vessels/{name}/delay-prediction
POST /vessels/query
POST /vessels/sync
"""
from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Optional

import structlog
from fastapi import APIRouter, BackgroundTasks, HTTPException, Query, Request
from pydantic import BaseModel

from middleware.rate_limiter import ai_limit, sync_limit, default_limit
from services.ai_service import query_vessel_data
from services.ais_service import MINOAN_FLEET, fetch_all_vessel_positions, fetch_vessel_position, predict_delay
from supabase_client import db

log = structlog.get_logger(__name__)
router = APIRouter(prefix="/vessels", tags=["vessel-ops"])


class NLQueryRequest(BaseModel):
    question: str


@router.get("")
@default_limit
async def list_vessels(request: Request, background_tasks: BackgroundTasks):
    positions = await fetch_all_vessel_positions()

    for pos in positions:
        pred = await predict_delay(pos["name"], speed_knots=pos.get("speed_knots") or 18.0)
        pos["delay_probability"] = pred["delay_probability"]

    background_tasks.add_task(_sync_to_supabase, positions)
    return positions


@router.get("/{vessel_name}/status")
@default_limit
async def get_vessel_status(request: Request, vessel_name: str):
    if vessel_name not in MINOAN_FLEET:
        raise HTTPException(status_code=404, detail=f"Vessel '{vessel_name}' not found")
    pos = await fetch_vessel_position(vessel_name)
    if not pos:
        raise HTTPException(status_code=503, detail="AIS data unavailable")
    pred = await predict_delay(vessel_name, speed_knots=pos.get("speed_knots") or 18.0)
    pos["delay_probability"] = pred["delay_probability"]
    return pos


@router.get("/{vessel_name}/delay-prediction")
@default_limit
async def get_delay_prediction(
    request: Request,
    vessel_name: str,
    weather_severity: float = Query(0.1, ge=0.0, le=1.0),
    port_congestion: float = Query(0.1, ge=0.0, le=1.0),
):
    if vessel_name not in MINOAN_FLEET:
        raise HTTPException(status_code=404, detail=f"Vessel '{vessel_name}' not found")
    pos = await fetch_vessel_position(vessel_name)
    speed = pos.get("speed_knots", 18.0) if pos else 18.0
    return await predict_delay(vessel_name, speed_knots=speed,
                                weather_severity=weather_severity,
                                port_congestion=port_congestion)


@router.post("/query")
@ai_limit
async def query_vessels(request: Request, payload: NLQueryRequest):
    positions = await fetch_all_vessel_positions()
    context = json.dumps(positions, indent=2, default=str)
    answer = await query_vessel_data(payload.question, context)
    return {"question": payload.question, "answer": answer}


@router.post("/sync")
@sync_limit
async def sync_vessels(request: Request, background_tasks: BackgroundTasks):
    positions = await fetch_all_vessel_positions()
    background_tasks.add_task(_sync_to_supabase, positions)
    return {"message": f"Syncing {len(positions)} vessels", "synced_count": len(positions)}


async def _sync_to_supabase(positions: list[dict]):
    """Upsert vessel positions + log voyage events to Supabase."""
    try:
        for pos in positions:
            name = pos.get("name")
            if not name:
                continue

            # Upsert vessel
            vessel_data = {
                "name": name,
                "mmsi": pos.get("mmsi"),
                "imo": pos.get("imo"),
                "latitude": pos.get("latitude"),
                "longitude": pos.get("longitude"),
                "speed_knots": pos.get("speed_knots"),
                "heading": pos.get("heading"),
                "nav_status": pos.get("nav_status"),
                "current_route": pos.get("current_route"),
                "departure_port": pos.get("departure_port"),
                "destination_port": pos.get("destination_port"),
                "delay_minutes": pos.get("delay_minutes", 0),
                "delay_probability": pos.get("delay_probability", 0.0),
                "position_updated_at": datetime.now(timezone.utc).isoformat(),
            }
            db().table("vessels").upsert(vessel_data, on_conflict="name").execute()

            # Log voyage event
            db().table("voyage_events").insert({
                "id": str(uuid.uuid4()),
                "vessel_name": name,
                "event_type": "position_update",
                "event_data": json.dumps(pos, default=str),
                "latitude": pos.get("latitude"),
                "longitude": pos.get("longitude"),
                "speed_knots": pos.get("speed_knots"),
                "delay_minutes": pos.get("delay_minutes", 0),
                "delay_probability": pos.get("delay_probability", 0.0),
                "source": pos.get("source", "ais"),
            }).execute()

            # Slack alert for high delay risk
            if pos.get("delay_probability", 0) > 0.70:
                await _slack_alert(name, pos)

        log.info("vessels.supabase_sync_complete", count=len(positions))
    except Exception as exc:
        log.error("vessels.supabase_sync_error", error=str(exc))


async def _slack_alert(vessel_name: str, pos: dict):
    import httpx
    from config import get_settings
    settings = get_settings()
    if not settings.slack_webhook_url:
        return
    payload = {"text": (
        f":warning: *Delay Alert — {vessel_name}*\n"
        f"Route: {pos.get('current_route', 'N/A')}\n"
        f"Delay probability: *{pos.get('delay_probability', 0):.0%}*\n"
        f"Speed: {pos.get('speed_knots', 'N/A')} kn\n"
        f"_Minoan AI Platform — IntegraMind AI_"
    )}
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post(settings.slack_webhook_url, json=payload)
    except Exception as exc:
        log.error("vessels.slack_error", error=str(exc))
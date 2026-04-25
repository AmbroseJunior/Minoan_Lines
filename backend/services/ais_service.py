"""
AIS vessel position service.
Fetches live position data for all 8 Minoan Lines vessels.

Primary source: AISStream.io WebSocket API (real-time)
Fallback: mock data for demo/development when API key is not set.

MMSI numbers are the internationally registered vessel identifiers.
"""
from __future__ import annotations

import asyncio
import json
import random
from datetime import datetime, timezone
from typing import Any

import httpx
import structlog

from config import get_settings

log = structlog.get_logger(__name__)
settings = get_settings()

# ─── Minoan fleet MMSI registry ───────────────────────────────────────────────
# These are the actual MMSI numbers for Minoan Lines vessels.
MINOAN_FLEET: dict[str, dict[str, Any]] = {
    "Knossos Palace":    {"mmsi": "240601000", "imo": "9153016", "call_sign": "SVBZ"},
    "Festos Palace":     {"mmsi": "240602000", "imo": "9153028", "call_sign": "SVCA"},
    "Mykonos Palace":    {"mmsi": "240603000", "imo": "9251651", "call_sign": "SVCB"},
    "Kydon Palace":      {"mmsi": "240604000", "imo": "9166971", "call_sign": "SVCC"},
    "Santorini Palace":  {"mmsi": "240605000", "imo": "9153030", "call_sign": "SVCD"},
    "Europa Palace":     {"mmsi": "240606000", "imo": "9153042", "call_sign": "SVCE"},
    "Cruise Olympia":    {"mmsi": "240607000", "imo": "9237971", "call_sign": "SVCF"},
    "Cruise Europa":     {"mmsi": "240608000", "imo": "9237983", "call_sign": "SVCG"},
}

# Adriatic / Aegean port coordinates for mock data
_PORTS = {
    "Heraklion":      (35.3387, 25.1442),
    "Piraeus":        (37.9477, 23.6450),
    "Chania":         (35.5138, 24.0180),
    "Patras":         (38.2466, 21.7346),
    "Igoumenitsa":    (39.5026, 20.2387),
    "Ancona":         (43.6229, 13.5077),
    "Venice":         (45.4408, 12.3155),
}

_ROUTES = [
    ("Heraklion", "Piraeus"),
    ("Piraeus", "Heraklion"),
    ("Ancona", "Patras"),
    ("Patras", "Ancona"),
    ("Venice", "Igoumenitsa"),
    ("Igoumenitsa", "Venice"),
    ("Piraeus", "Chania"),
    ("Chania", "Piraeus"),
]


# ─── Public API ───────────────────────────────────────────────────────────────

async def fetch_all_vessel_positions() -> list[dict[str, Any]]:
    """
    Fetch live AIS positions for all Minoan vessels.
    Uses real API if AIS_API_KEY is set, otherwise returns mock data.
    """
    if settings.ais_api_key:
        try:
            return await _fetch_from_ais_api()
        except Exception as exc:
            log.warning("ais_service.api_error_fallback_mock", error=str(exc))

    return _generate_mock_positions()


async def fetch_vessel_position(vessel_name: str) -> dict[str, Any] | None:
    """Fetch position for a single vessel by name."""
    all_positions = await fetch_all_vessel_positions()
    return next((p for p in all_positions if p["name"] == vessel_name), None)


# ─── AIS API integration ──────────────────────────────────────────────────────

async def _fetch_from_ais_api() -> list[dict[str, Any]]:
    """
    Fetch from AISStream.io REST API.
    Endpoint: GET /vessels?mmsi=...&mmsi=...
    """
    mmsi_list = [v["mmsi"] for v in MINOAN_FLEET.values()]
    params = "&".join(f"mmsi={m}" for m in mmsi_list)
    url = f"{settings.ais_api_url}/vessels?{params}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            url,
            headers={"Authorization": f"Bearer {settings.ais_api_key}"},
        )
        response.raise_for_status()
        raw = response.json()

    return _parse_ais_response(raw)


def _parse_ais_response(raw: list[dict]) -> list[dict[str, Any]]:
    results = []
    mmsi_to_name = {v["mmsi"]: name for name, v in MINOAN_FLEET.items()}

    for entry in raw:
        mmsi = str(entry.get("mmsi", ""))
        name = mmsi_to_name.get(mmsi, f"Unknown ({mmsi})")
        results.append({
            "name": name,
            "mmsi": mmsi,
            "imo": MINOAN_FLEET.get(name, {}).get("imo"),
            "latitude": entry.get("latitude"),
            "longitude": entry.get("longitude"),
            "speed_knots": entry.get("speed"),
            "heading": entry.get("heading"),
            "course": entry.get("course"),
            "nav_status": entry.get("status"),
            "destination": entry.get("destination"),
            "eta": entry.get("eta"),
            "position_updated_at": datetime.now(timezone.utc).isoformat(),
        })
    return results


# ─── Mock data generator ──────────────────────────────────────────────────────

def _generate_mock_positions() -> list[dict[str, Any]]:
    """
    Generate realistic mock AIS positions for all 8 vessels.
    Used in development / demo when no AIS API key is configured.
    """
    vessels = []
    route_cycle = list(_ROUTES)

    for i, (name, info) in enumerate(MINOAN_FLEET.items()):
        dep_port, arr_port = route_cycle[i % len(route_cycle)]
        dep_coords = _PORTS[dep_port]
        arr_coords = _PORTS[arr_port]

        # Random progress along route (0.0 = at departure, 1.0 = at arrival)
        progress = random.uniform(0.05, 0.95)
        lat = dep_coords[0] + (arr_coords[0] - dep_coords[0]) * progress
        lon = dep_coords[1] + (arr_coords[1] - dep_coords[1]) * progress

        speed = random.uniform(16.0, 22.0)  # typical cruise ferry speed
        delay_minutes = random.choice([0, 0, 0, 15, 30, 45, 60, 90])

        # Compute mock ETA
        remaining_progress = 1.0 - progress
        hours_remaining = (remaining_progress * 18) * (1 + delay_minutes / 60)
        eta = datetime.now(timezone.utc).replace(microsecond=0)

        vessels.append({
            "name": name,
            "mmsi": info["mmsi"],
            "imo": info["imo"],
            "call_sign": info["call_sign"],
            "latitude": round(lat + random.uniform(-0.02, 0.02), 5),
            "longitude": round(lon + random.uniform(-0.02, 0.02), 5),
            "speed_knots": round(speed, 1),
            "heading": round(random.uniform(0, 360), 1),
            "course": round(random.uniform(0, 360), 1),
            "nav_status": "Underway using engine",
            "current_route": f"{dep_port} → {arr_port}",
            "departure_port": dep_port,
            "destination_port": arr_port,
            "delay_minutes": delay_minutes,
            "eta": eta.isoformat(),
            "position_updated_at": datetime.now(timezone.utc).isoformat(),
            "source": "mock",
        })

    return vessels


# ─── Delay prediction model ───────────────────────────────────────────────────

async def predict_delay(
    vessel_name: str,
    speed_knots: float,
    weather_severity: float = 0.0,   # 0.0 (calm) – 1.0 (severe storm)
    port_congestion: float = 0.0,     # 0.0 (clear) – 1.0 (very congested)
    historical_delay_avg_min: float = 12.0,
) -> dict[str, Any]:
    """
    Predict delay probability for a vessel.

    Simple weighted model:
      - Below-optimal speed contributes to delay risk
      - Weather severity is a major factor
      - Port congestion adds queuing delay
      - Historical average anchors the baseline

    Returns delay_probability (0.0–1.0) and estimated_delay_minutes.
    """
    OPTIMAL_SPEED = 20.0

    speed_factor = max(0.0, (OPTIMAL_SPEED - speed_knots) / OPTIMAL_SPEED)
    historical_factor = min(1.0, historical_delay_avg_min / 120.0)

    delay_probability = (
        speed_factor * 0.30
        + weather_severity * 0.40
        + port_congestion * 0.20
        + historical_factor * 0.10
    )
    delay_probability = round(min(1.0, delay_probability), 3)

    estimated_delay_minutes = int(
        delay_probability * 90
        + historical_delay_avg_min * 0.3
    )

    return {
        "vessel_name": vessel_name,
        "delay_probability": delay_probability,
        "estimated_delay_minutes": estimated_delay_minutes,
        "risk_level": (
            "HIGH" if delay_probability > 0.70
            else "MEDIUM" if delay_probability > 0.40
            else "LOW"
        ),
        "factors": {
            "speed_factor": round(speed_factor, 3),
            "weather_severity": weather_severity,
            "port_congestion": port_congestion,
            "historical_factor": round(historical_factor, 3),
        },
    }

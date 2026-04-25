"""
Module 5: Data Intelligence Layer — Demand & Revenue Forecasting — Supabase backend
POST /analytics/forecast              — run passenger / revenue forecast
GET  /analytics/performance-summary   — NL summary via Claude
POST /analytics/upload                — upload historical CSV data
GET  /analytics/routes                — list available routes
"""
from __future__ import annotations

import json
from typing import Any, Optional

import structlog
from fastapi import APIRouter, File, HTTPException, Query, Request, UploadFile
from pydantic import BaseModel

from middleware.rate_limiter import ai_limit, default_limit
from services.ai_service import generate_analytics_summary
from services.forecasting_service import (
    MINOAN_ROUTES,
    calculate_occupancy_forecast,
    calculate_revenue_forecast,
    forecast_passengers,
    generate_mock_historical_data,
    parse_csv_upload,
)

log = structlog.get_logger(__name__)
router = APIRouter(prefix="/analytics", tags=["analytics"])

# In-memory store for uploaded datasets (scoped to process lifetime)
_uploaded_datasets: dict[str, Any] = {}


# ─── Schemas ─────────────────────────────────────────────────────────────────

class ForecastRequest(BaseModel):
    route: str = "Piraeus-Heraklion"
    periods: int = 90
    use_mock_data: bool = True
    vessel_capacity: int = 2000
    avg_ticket_price_eur: float = 85.0
    vehicle_ratio: float = 0.35
    avg_vehicle_price_eur: float = 120.0


class PerformanceSummaryRequest(BaseModel):
    query: str = "Summarise Q3 performance vs forecast and flag underperforming routes"
    routes: Optional[list[str]] = None
    include_revenue: bool = True


class ForecastSummary(BaseModel):
    route: str
    model: str
    periods_forecast: int
    avg_daily_passengers: float
    peak_day: str
    peak_passengers: float
    avg_daily_revenue_eur: float
    avg_occupancy_pct: float
    forecast_sample: list[dict]


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.post("/forecast", response_model=ForecastSummary)
@default_limit
async def run_forecast(request: Request, payload: ForecastRequest):
    """
    Run passenger volume + revenue + occupancy forecast for a route.
    Uses Prophet (with ARIMA fallback). Uses mock data unless CSV was uploaded.
    """
    if payload.route not in MINOAN_ROUTES:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown route. Available: {MINOAN_ROUTES}",
        )

    log.info("analytics.forecast_start", route=payload.route, periods=payload.periods)

    if not payload.use_mock_data and payload.route in _uploaded_datasets:
        df = _uploaded_datasets[payload.route]
        log.info("analytics.using_uploaded_data", route=payload.route)
    else:
        df = generate_mock_historical_data(payload.route)

    result = forecast_passengers(df, periods=payload.periods, route=payload.route)

    forecast_rows = result["forecast"]
    forecast_rows = calculate_occupancy_forecast(forecast_rows, payload.vessel_capacity)
    forecast_rows = calculate_revenue_forecast(
        forecast_rows,
        payload.avg_ticket_price_eur,
        payload.vehicle_ratio,
        payload.avg_vehicle_price_eur,
    )

    avg_revenue = sum(r.get("revenue_eur", 0) for r in forecast_rows) / len(forecast_rows)
    avg_occupancy = sum(r.get("occupancy_pct", 0) for r in forecast_rows) / len(forecast_rows)

    return ForecastSummary(
        route=result["route"],
        model=result["model"],
        periods_forecast=result["periods_forecast"],
        avg_daily_passengers=result["summary"]["avg_daily_passengers"],
        peak_day=result["summary"]["peak_day"],
        peak_passengers=result["summary"]["peak_passengers"],
        avg_daily_revenue_eur=round(avg_revenue, 2),
        avg_occupancy_pct=round(avg_occupancy, 1),
        forecast_sample=forecast_rows[:7],
    )


@router.get("/performance-summary")
@ai_limit
async def get_performance_summary(
    request: Request,
    query: str = Query("Summarise Q3 performance vs forecast and flag underperforming routes"),
    routes: Optional[str] = Query(None, description="Comma-separated route names"),
):
    """Natural language analytics summary powered by Claude."""
    target_routes = routes.split(",") if routes else MINOAN_ROUTES[:4]

    all_forecasts = []
    for route in target_routes:
        try:
            df = generate_mock_historical_data(route)
            result = forecast_passengers(df, periods=30, route=route)
            fc = result["forecast"]
            fc = calculate_revenue_forecast(fc)
            total_rev = sum(r.get("revenue_eur", 0) for r in fc)
            all_forecasts.append({
                "route": route,
                "avg_daily_passengers": result["summary"]["avg_daily_passengers"],
                "peak_passengers": result["summary"]["peak_passengers"],
                "total_30d_revenue_eur": round(total_rev, 2),
                "model": result["model"],
            })
        except Exception as exc:
            log.error("analytics.route_forecast_error", route=route, error=str(exc))

    perf_data = json.dumps(all_forecasts, indent=2)
    answer = await generate_analytics_summary(perf_data, query)

    return {
        "query": query,
        "routes_analysed": target_routes,
        "raw_forecast_data": all_forecasts,
        "ai_summary": answer,
    }


@router.post("/upload")
@default_limit
async def upload_csv(
    request: Request,
    route: str = Query(..., description="Route name, e.g. Piraeus-Heraklion"),
    file: UploadFile = File(...),
):
    """
    Upload historical booking data CSV for a specific route.
    CSV must have columns: date, passengers
    """
    if route not in MINOAN_ROUTES:
        raise HTTPException(status_code=400, detail=f"Unknown route: {route}")

    content = await file.read()
    try:
        df = parse_csv_upload(content.decode("utf-8"))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    _uploaded_datasets[route] = df
    log.info("analytics.csv_uploaded", route=route, rows=len(df))

    return {
        "message": f"Data uploaded for route '{route}'",
        "rows": len(df),
        "date_range": {
            "start": df["ds"].min().isoformat(),
            "end": df["ds"].max().isoformat(),
        },
    }


@router.get("/routes")
@default_limit
async def list_routes(request: Request):
    """List all available Minoan Lines routes for forecasting."""
    return {
        "routes": MINOAN_ROUTES,
        "uploaded_routes": list(_uploaded_datasets.keys()),
    }
"""
Module 5: Demand & Revenue Forecasting Service
Uses ARIMA (statsmodels) for time-series forecasting.
Prophet is optional — falls back to ARIMA if not installed.
Heavy imports (numpy, pandas, statsmodels) are lazy-loaded inside functions
so they don't slow down FastAPI startup.
"""
from __future__ import annotations

import io
import math
import random
from datetime import datetime, timedelta
from typing import Any

import structlog

log = structlog.get_logger(__name__)

MINOAN_ROUTES = [
    "Piraeus-Heraklion",
    "Piraeus-Chania",
    "Ancona-Patras",
    "Venice-Igoumenitsa",
    "Patras-Ancona",
    "Igoumenitsa-Venice",
]


def forecast_passengers(
    historical_df: Any,
    periods: int = 90,
    route: str = "Piraeus-Heraklion",
) -> dict[str, Any]:
    """Forecast daily passenger volumes. Uses ARIMA (Prophet removed)."""
    return _arima_fallback(historical_df, periods, route)


def _arima_fallback(
    historical_df: Any,
    periods: int,
    route: str,
) -> dict[str, Any]:
    import numpy as np
    import pandas as pd
    from statsmodels.tsa.arima.model import ARIMA

    series = historical_df["y"].values
    model = ARIMA(series, order=(2, 1, 2))
    fitted = model.fit()
    forecast_vals = fitted.forecast(steps=periods)

    last_date = pd.to_datetime(historical_df["ds"].iloc[-1])
    future_dates = pd.date_range(start=last_date, periods=periods + 1, freq="D")[1:]

    records = [
        {"ds": d.isoformat(), "yhat": round(max(0, float(v)), 0), "yhat_lower": None, "yhat_upper": None}
        for d, v in zip(future_dates, forecast_vals)
    ]
    return {
        "route": route,
        "model": "arima",
        "periods_forecast": periods,
        "forecast": records,
        "summary": {
            "avg_daily_passengers": round(float(np.mean(forecast_vals)), 0),
            "peak_day": future_dates[int(np.argmax(forecast_vals))].isoformat(),
            "peak_passengers": round(float(np.max(forecast_vals)), 0),
        },
    }


def calculate_occupancy_forecast(
    passenger_forecast: list[dict],
    vessel_capacity: int = 2000,
) -> list[dict]:
    return [
        {**row, "occupancy_pct": round(min(100.0, (row["yhat"] / vessel_capacity) * 100), 1)}
        for row in passenger_forecast
    ]


def calculate_revenue_forecast(
    passenger_forecast: list[dict],
    avg_ticket_price_eur: float = 85.0,
    vehicle_ratio: float = 0.35,
    avg_vehicle_price_eur: float = 120.0,
) -> list[dict]:
    return [
        {
            **row,
            "revenue_eur": round(
                row["yhat"] * avg_ticket_price_eur
                + row["yhat"] * vehicle_ratio * avg_vehicle_price_eur,
                2,
            ),
        }
        for row in passenger_forecast
    ]


def generate_mock_historical_data(
    route: str = "Piraeus-Heraklion",
    years: int = 3,
) -> Any:
    import numpy as np
    import pandas as pd

    dates = pd.date_range(end=datetime.now(), periods=365 * years, freq="D")
    base_passengers = 450
    records = []

    for date in dates:
        month = date.month
        if month in (6, 7, 8, 9):
            seasonal = 3.0 + 0.5 * math.sin((month - 6) * math.pi / 3)
        elif month in (3, 4, 5, 10, 11):
            seasonal = 1.2
        else:
            seasonal = 0.4

        weekend_factor = 1.3 if date.weekday() >= 4 else 1.0
        strike_factor = 0.05 if random.random() < 0.003 else 1.0
        noise = np.random.normal(1.0, 0.08)
        passengers = max(0, base_passengers * seasonal * weekend_factor * strike_factor * noise)
        records.append({"ds": date, "y": round(passengers)})

    return pd.DataFrame(records)


def parse_csv_upload(csv_content: str) -> Any:
    import pandas as pd

    df = pd.read_csv(io.StringIO(csv_content))
    df.columns = [c.lower().strip() for c in df.columns]

    date_col = next((c for c in df.columns if "date" in c), None)
    pax_col = next((c for c in df.columns if "passenger" in c or c == "pax" or c == "y"), None)

    if not date_col or not pax_col:
        raise ValueError("CSV must have 'date' and 'passengers' columns")

    df = df.rename(columns={date_col: "ds", pax_col: "y"})
    df["ds"] = pd.to_datetime(df["ds"])
    df["y"] = pd.to_numeric(df["y"], errors="coerce").fillna(0)
    return df[["ds", "y"]].sort_values("ds").reset_index(drop=True)
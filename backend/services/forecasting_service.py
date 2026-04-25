"""
Module 5: Demand & Revenue Forecasting Service
Uses Prophet (Meta) for time-series forecasting of passenger volumes,
occupancy rates, and revenue per route.
Falls back to statsmodels ARIMA if Prophet is unavailable.
"""
from __future__ import annotations

import io
import warnings
from datetime import datetime
from typing import Any

import numpy as np
import pandas as pd
import structlog

log = structlog.get_logger(__name__)
warnings.filterwarnings("ignore")  # suppress Prophet/Stan warnings in logs

MINOAN_ROUTES = [
    "Piraeus-Heraklion",
    "Piraeus-Chania",
    "Ancona-Patras",
    "Venice-Igoumenitsa",
    "Patras-Ancona",
    "Igoumenitsa-Venice",
]


# ─── Prophet forecasting ──────────────────────────────────────────────────────

def forecast_passengers(
    historical_df: pd.DataFrame,
    periods: int = 90,
    route: str = "Piraeus-Heraklion",
) -> dict[str, Any]:
    """
    Forecast daily passenger volumes using Prophet.

    historical_df must have columns: ['ds', 'y']
      - ds: datetime
      - y: passenger count

    Returns forecast dict with dates, yhat, yhat_lower, yhat_upper.
    """
    try:
        from prophet import Prophet

        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            seasonality_mode="multiplicative",  # ferry demand spikes multiplicatively in summer
            changepoint_prior_scale=0.1,
        )

        # Add Greek summer seasonality regressor (June-September peak)
        model.add_seasonality(
            name="greek_summer",
            period=365.25,
            fourier_order=5,
        )

        model.fit(historical_df)
        future = model.make_future_dataframe(periods=periods)
        forecast = model.predict(future)

        result_df = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].tail(periods)
        return {
            "route": route,
            "model": "prophet",
            "periods_forecast": periods,
            "forecast": result_df.to_dict(orient="records"),
            "summary": {
                "avg_daily_passengers": round(result_df["yhat"].mean(), 0),
                "peak_day": result_df.loc[result_df["yhat"].idxmax(), "ds"].isoformat(),
                "peak_passengers": round(result_df["yhat"].max(), 0),
            },
        }

    except ImportError:
        log.warning("forecasting.prophet_not_available_using_arima")
        return _arima_fallback(historical_df, periods, route)

    except Exception as exc:
        log.error("forecasting.prophet_error", error=str(exc))
        return _arima_fallback(historical_df, periods, route)


def _arima_fallback(
    historical_df: pd.DataFrame,
    periods: int,
    route: str,
) -> dict[str, Any]:
    """Simple ARIMA fallback when Prophet is unavailable."""
    from statsmodels.tsa.arima.model import ARIMA

    series = historical_df["y"].values
    model = ARIMA(series, order=(2, 1, 2))
    fitted = model.fit()
    forecast_vals = fitted.forecast(steps=periods)

    last_date = pd.to_datetime(historical_df["ds"].iloc[-1])
    future_dates = pd.date_range(start=last_date, periods=periods + 1, freq="D")[1:]

    records = [
        {"ds": d.isoformat(), "yhat": round(max(0, v), 0), "yhat_lower": None, "yhat_upper": None}
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


# ─── Occupancy & revenue ─────────────────────────────────────────────────────

def calculate_occupancy_forecast(
    passenger_forecast: list[dict],
    vessel_capacity: int = 2000,
) -> list[dict]:
    """Convert passenger forecast to occupancy rate %."""
    return [
        {
            **row,
            "occupancy_pct": round(min(100.0, (row["yhat"] / vessel_capacity) * 100), 1),
        }
        for row in passenger_forecast
    ]


def calculate_revenue_forecast(
    passenger_forecast: list[dict],
    avg_ticket_price_eur: float = 85.0,
    vehicle_ratio: float = 0.35,
    avg_vehicle_price_eur: float = 120.0,
) -> list[dict]:
    """
    Project revenue per day from passenger + vehicle bookings.
    vehicle_ratio: fraction of passengers who also bring a vehicle.
    """
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


# ─── Mock / demo data generator ──────────────────────────────────────────────

def generate_mock_historical_data(
    route: str = "Piraeus-Heraklion",
    years: int = 3,
) -> pd.DataFrame:
    """
    Generate realistic synthetic historical booking data.
    Models Greek ferry demand: strong summer peaks, low winter troughs.
    """
    dates = pd.date_range(
        end=datetime.now(),
        periods=365 * years,
        freq="D",
    )

    base_passengers = 450
    records = []

    for date in dates:
        # Seasonal factor: summer peak (June–Sep) = 3x, winter trough = 0.4x
        month = date.month
        if month in (6, 7, 8, 9):
            seasonal = 3.0 + 0.5 * np.sin((month - 6) * np.pi / 3)
        elif month in (3, 4, 5, 10, 11):
            seasonal = 1.2
        else:
            seasonal = 0.4

        # Weekend boost
        weekend_factor = 1.3 if date.weekday() >= 4 else 1.0

        # Strike dip (simulate ~4 events per 3-year period)
        strike_factor = 0.05 if np.random.random() < 0.003 else 1.0

        noise = np.random.normal(1.0, 0.08)
        passengers = max(0, base_passengers * seasonal * weekend_factor * strike_factor * noise)

        records.append({"ds": date, "y": round(passengers)})

    return pd.DataFrame(records)


def parse_csv_upload(csv_content: str) -> pd.DataFrame:
    """
    Parse uploaded CSV with columns: date, passengers [, route, revenue].
    Returns a Prophet-compatible DataFrame with 'ds' and 'y' columns.
    """
    df = pd.read_csv(io.StringIO(csv_content))

    # Normalise column names
    df.columns = [c.lower().strip() for c in df.columns]

    date_col = next((c for c in df.columns if "date" in c), None)
    pax_col = next((c for c in df.columns if "passenger" in c or c == "pax" or c == "y"), None)

    if not date_col or not pax_col:
        raise ValueError("CSV must have 'date' and 'passengers' columns")

    df = df.rename(columns={date_col: "ds", pax_col: "y"})
    df["ds"] = pd.to_datetime(df["ds"])
    df["y"] = pd.to_numeric(df["y"], errors="coerce").fillna(0)

    return df[["ds", "y"]].sort_values("ds").reset_index(drop=True)

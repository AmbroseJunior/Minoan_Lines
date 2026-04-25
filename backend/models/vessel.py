"""
Vessel and voyage event models for Module 1 — Ops Dashboard.
"""
import uuid
from datetime import datetime

from sqlalchemy import (
    Column, DateTime, Float, Index, Integer, Numeric,
    String, Text, func,
)
from sqlalchemy.dialects.postgresql import UUID

from database import Base

MINOAN_VESSELS = [
    "Knossos Palace",
    "Festos Palace",
    "Mykonos Palace",
    "Kydon Palace",
    "Santorini Palace",
    "Europa Palace",
    "Cruise Olympia",
    "Cruise Europa",
]


class Vessel(Base):
    __tablename__ = "vessels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, unique=True)
    mmsi = Column(String(20), unique=True)          # Maritime Mobile Service Identity
    imo = Column(String(20), unique=True)            # IMO number
    call_sign = Column(String(20))
    flag = Column(String(10), default="GR")

    # Live position (updated from AIS feed)
    latitude = Column(Float)
    longitude = Column(Float)
    speed_knots = Column(Float)
    heading = Column(Float)
    course = Column(Float)
    nav_status = Column(String(50))                  # e.g. "Underway using engine"

    # Route info
    current_route = Column(String(200))
    departure_port = Column(String(100))
    destination_port = Column(String(100))
    eta = Column(DateTime(timezone=True))
    scheduled_departure = Column(DateTime(timezone=True))
    actual_departure = Column(DateTime(timezone=True))

    # Delay & prediction
    delay_minutes = Column(Integer, default=0)
    delay_probability = Column(Float, default=0.0)  # 0.0 – 1.0

    # Metadata
    position_updated_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index("ix_vessels_name", "name"),
        Index("ix_vessels_mmsi", "mmsi"),
    )

    def __repr__(self) -> str:
        return f"<Vessel {self.name} mmsi={self.mmsi}>"


class VoyageEvent(Base):
    """Immutable audit log of all vessel events."""
    __tablename__ = "voyage_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vessel_id = Column(UUID(as_uuid=True), nullable=False)
    vessel_name = Column(String(100), nullable=False)

    event_type = Column(String(50), nullable=False)  # position_update | departure | arrival | delay_alert | delay_prediction
    event_data = Column(Text)                         # JSON blob

    latitude = Column(Float)
    longitude = Column(Float)
    speed_knots = Column(Float)
    delay_minutes = Column(Integer)
    delay_probability = Column(Float)

    source = Column(String(50), default="ais")       # ais | manual | prediction
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("ix_voyage_events_vessel_id", "vessel_id"),
        Index("ix_voyage_events_created_at", "created_at"),
        Index("ix_voyage_events_event_type", "event_type"),
    )

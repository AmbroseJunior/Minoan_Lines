"""
IT Helpdesk ticket models for Module 4.
"""
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Index, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID

from database import Base

TICKET_CATEGORIES = [
    "Network/Vessel-comms",
    "Software/ERP",
    "Hardware",
    "Security/Access",
    "Compliance-IT",
    "Vessel-onboard-systems",
]

PRIORITY_SLA_HOURS = {
    "critical": 2,
    "high": 8,
    "medium": 24,
    "low": 72,
}


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_number = Column(String(20), unique=True, nullable=False)  # e.g. TKT-2025-0042

    # Submission
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)
    submitted_by = Column(String(200))
    submitted_by_email = Column(String(200))

    # AI classification
    category = Column(String(100))
    priority = Column(String(20), default="medium")  # critical | high | medium | low
    estimated_resolution_hours = Column(Integer)
    assigned_to = Column(String(200))
    ai_draft_response = Column(Text)
    ai_confidence = Column(Integer)          # 0-100

    # Status
    status = Column(String(30), default="open")  # open | in_progress | resolved | closed
    resolution_notes = Column(Text)
    resolved_at = Column(DateTime(timezone=True))
    sla_due_at = Column(DateTime(timezone=True))
    sla_breached = Column(Integer, default=0)    # 0 | 1

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index("ix_tickets_status", "status"),
        Index("ix_tickets_priority", "priority"),
        Index("ix_tickets_category", "category"),
        Index("ix_tickets_created_at", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<Ticket {self.ticket_number} [{self.priority}] {self.status}>"


class TicketComment(Base):
    __tablename__ = "ticket_comments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(UUID(as_uuid=True), nullable=False)
    author = Column(String(200))
    content = Column(Text, nullable=False)
    is_internal = Column(Integer, default=0)   # 0=public, 1=internal note
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("ix_ticket_comments_ticket_id", "ticket_id"),
    )

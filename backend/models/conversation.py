"""
Customer support conversation models for Module 2.
"""
import uuid

from sqlalchemy import Column, DateTime, Float, Index, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID

from database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(String(100), unique=True, nullable=False)

    language = Column(String(10), default="en")   # en | el (Greek)
    channel = Column(String(50), default="api")   # api | web | mobile

    status = Column(String(30), default="active") # active | escalated | resolved | closed
    escalation_reason = Column(Text)
    escalated_to = Column(String(200))

    resolution_summary = Column(Text)
    satisfaction_score = Column(Integer)           # 1-5 CSAT

    message_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    closed_at = Column(DateTime(timezone=True))

    __table_args__ = (
        Index("ix_conversations_session_id", "session_id"),
        Index("ix_conversations_status", "status"),
        Index("ix_conversations_created_at", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<Conversation {self.session_id} [{self.status}]>"


class ConversationMessage(Base):
    __tablename__ = "conversation_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), nullable=False)
    session_id = Column(String(100), nullable=False)

    role = Column(String(20), nullable=False)       # user | assistant | system
    content = Column(Text, nullable=False)

    confidence_score = Column(Float)                # AI confidence for this response
    escalation_triggered = Column(Integer, default=0)
    tokens_used = Column(Integer)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("ix_conv_messages_session_id", "session_id"),
        Index("ix_conv_messages_conversation_id", "conversation_id"),
    )

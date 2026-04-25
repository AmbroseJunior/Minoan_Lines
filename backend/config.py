"""
IntegraMind AI × Minoan Lines
Central configuration — all settings loaded from environment variables.
"""
from functools import lru_cache
from typing import List

import anthropic
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # ── Anthropic ──────────────────────────────────────────────────────────────
    anthropic_api_key: str
    anthropic_model: str = "claude-sonnet-4-20250514"

    # ── Supabase ───────────────────────────────────────────────────────────────
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str  # server-side only — never expose to client

    # ── AIS ───────────────────────────────────────────────────────────────────
    ais_api_key: str = ""
    ais_api_url: str = "https://api.aisstream.io/v0"

    # ── Email ─────────────────────────────────────────────────────────────────
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "Minoan AI Platform <notifications@integramindai.com>"
    compliance_report_recipient: str = "michalis.orfanoudakis@minoan.gr"
    helpdesk_digest_recipient: str = "michalis.orfanoudakis@minoan.gr"

    # ── Slack ─────────────────────────────────────────────────────────────────
    slack_webhook_url: str = ""

    # ── Auth ──────────────────────────────────────────────────────────────────
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 480

    # ── App ───────────────────────────────────────────────────────────────────
    environment: str = "development"
    log_level: str = "INFO"
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://minoan-ai.vercel.app",
    ]

    # ── Report storage ─────────────────────────────────────────────────────────
    report_storage_bucket: str = "compliance-reports"  # Supabase Storage bucket


@lru_cache
def get_settings() -> Settings:
    return Settings()


@lru_cache
def get_anthropic_client() -> anthropic.AsyncAnthropic:
    """Singleton async Anthropic client, streaming-capable."""
    settings = get_settings()
    return anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
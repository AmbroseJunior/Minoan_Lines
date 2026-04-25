"""
IntegraMind AI × Minoan Lines
Central configuration — all settings loaded from environment variables.
"""
from functools import lru_cache
from typing import List

from openai import AsyncOpenAI
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # ── DeepSeek ──────────────────────────────────────────────────────────────
    deepseek_api_key: str
    deepseek_model: str = "deepseek-chat"
    deepseek_base_url: str = "https://api.deepseek.com"

    # ── Supabase ───────────────────────────────────────────────────────────────
    supabase_url: str
    supabase_anon_key: str = ""
    supabase_service_role_key: str

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

    # ── App ───────────────────────────────────────────────────────────────────
    environment: str = "development"
    log_level: str = "INFO"
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:8080",
        "https://minoan-lines-git-master-ambrosejuniors-projects.vercel.app",
    ]

    # ── Report storage ─────────────────────────────────────────────────────────
    report_storage_bucket: str = "compliance-reports"


@lru_cache
def get_settings() -> Settings:
    return Settings()


@lru_cache
def get_ai_client() -> AsyncOpenAI:
    """Singleton async DeepSeek client (OpenAI-compatible)."""
    settings = get_settings()
    return AsyncOpenAI(
        api_key=settings.deepseek_api_key,
        base_url=settings.deepseek_base_url,
    )
"""
Supabase client — replaces SQLAlchemy/PostgreSQL.
Provides an async-compatible wrapper around the supabase-py SDK.
"""
from functools import lru_cache
from supabase import create_client, Client
from config import get_settings


@lru_cache
def get_supabase() -> Client:
    """Singleton Supabase client."""
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


# Convenience alias used in routers
def db() -> Client:
    return get_supabase()
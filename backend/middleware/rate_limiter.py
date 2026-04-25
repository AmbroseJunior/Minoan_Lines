"""
Rate limiting middleware using slowapi (Starlette/FastAPI wrapper for limits).

Tiers:
  - AI endpoints  (Claude calls)  : 20 req/min  per IP
  - Vessel sync / report generate  : 30 req/min  per IP
  - General API                    : 120 req/min per IP
"""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request

# Single shared limiter instance — imported by main.py and each router
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["120/minute"],
    headers_enabled=True,          # adds X-RateLimit-* headers to responses
    storage_uri="memory://",       # swap for "redis://..." in production
)

# Convenience decorator aliases for routers
ai_limit      = limiter.limit("20/minute")   # Claude API calls
sync_limit    = limiter.limit("30/minute")   # heavy ops
default_limit = limiter.limit("120/minute")  # standard endpoints


def attach_rate_limiter(app):
    """Call once in main.py after app creation."""
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
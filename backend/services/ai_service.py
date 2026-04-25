"""
IntegraMind AI × Minoan Lines
Reusable Claude claude-sonnet-4-20250514 wrapper.

All modules use this service. Supports:
  - streaming (SSE) responses
  - non-streaming JSON responses
  - confidence extraction from structured outputs
  - conversation history injection (for multi-turn sessions)
"""
from __future__ import annotations

import json
import re
from typing import Any, AsyncIterator

import anthropic
import structlog

from config import get_anthropic_client, get_settings

log = structlog.get_logger(__name__)
settings = get_settings()

MAX_TOKENS = 4096
ESCALATION_CONFIDENCE_THRESHOLD = 0.75


# ─── Message helpers ──────────────────────────────────────────────────────────

def _build_messages(
    user_message: str,
    history: list[dict[str, str]] | None = None,
) -> list[dict[str, str]]:
    """Build message list for the API, prepending history if provided."""
    messages: list[dict[str, str]] = []
    if history:
        messages.extend(history)
    messages.append({"role": "user", "content": user_message})
    return messages


# ─── Core wrappers ────────────────────────────────────────────────────────────

async def complete(
    system_prompt: str,
    user_message: str,
    history: list[dict[str, str]] | None = None,
    max_tokens: int = MAX_TOKENS,
    temperature: float = 0.3,
) -> str:
    """Non-streaming completion. Returns full assistant text."""
    client = get_anthropic_client()
    messages = _build_messages(user_message, history)

    response = await client.messages.create(
        model=settings.anthropic_model,
        max_tokens=max_tokens,
        temperature=temperature,
        system=system_prompt,
        messages=messages,
    )
    return response.content[0].text


async def stream(
    system_prompt: str,
    user_message: str,
    history: list[dict[str, str]] | None = None,
    max_tokens: int = MAX_TOKENS,
    temperature: float = 0.3,
) -> AsyncIterator[str]:
    """
    Streaming completion. Yields text chunks as they arrive.
    Designed for FastAPI StreamingResponse / SSE.
    """
    client = get_anthropic_client()
    messages = _build_messages(user_message, history)

    async with client.messages.stream(
        model=settings.anthropic_model,
        max_tokens=max_tokens,
        temperature=temperature,
        system=system_prompt,
        messages=messages,
    ) as stream_ctx:
        async for text in stream_ctx.text_stream:
            yield text


async def complete_json(
    system_prompt: str,
    user_message: str,
    history: list[dict[str, str]] | None = None,
    max_tokens: int = MAX_TOKENS,
) -> dict[str, Any]:
    """
    Returns a parsed JSON dict.
    System prompt must instruct the model to return valid JSON only.
    """
    # Append JSON instruction to system prompt
    json_system = (
        system_prompt
        + "\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no prose."
    )
    raw = await complete(json_system, user_message, history, max_tokens, temperature=0.1)

    # Strip possible markdown code fences
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw.strip())
    cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        log.error("ai_service.complete_json parse error", raw=raw[:500], error=str(exc))
        raise ValueError(f"Claude returned non-JSON: {raw[:200]}") from exc


# ─── Confidence extraction ────────────────────────────────────────────────────

def extract_confidence(response_data: dict[str, Any]) -> float:
    """
    Pull confidence score from structured AI response.
    Expects key 'confidence' (0.0–1.0) or 'confidence_score'.
    """
    for key in ("confidence", "confidence_score"):
        if key in response_data:
            try:
                return float(response_data[key])
            except (TypeError, ValueError):
                pass
    return 1.0  # default to confident if not provided


def should_escalate(confidence: float, topic: str | None = None) -> bool:
    """
    Escalation logic for Module 2 (Customer Agent).
    Escalates when:
      - confidence < ESCALATION_CONFIDENCE_THRESHOLD
      - topic is in sensitive categories (refunds, complaints)
    """
    if confidence < ESCALATION_CONFIDENCE_THRESHOLD:
        return True
    if topic:
        sensitive = {"refund", "refunds", "complaint", "complaints", "legal", "compensation"}
        if any(t in topic.lower() for t in sensitive):
            return True
    return False


# ─── Module-specific helpers ──────────────────────────────────────────────────

async def classify_ticket(title: str, description: str) -> dict[str, Any]:
    """
    Module 4: Classify an IT helpdesk ticket.
    Returns category, priority, estimated_hours, assigned_to, draft_response, confidence.
    """
    from prompts import TICKET_TRIAGE_PROMPT

    user_msg = f"TICKET TITLE: {title}\n\nDESCRIPTION:\n{description}"
    return await complete_json(TICKET_TRIAGE_PROMPT, user_msg)


async def answer_customer_query(
    query: str,
    language: str = "en",
    history: list[dict[str, str]] | None = None,
) -> AsyncIterator[str]:
    """
    Module 2: Stream a customer support response.
    Language hint is injected into the system prompt.
    """
    from prompts import build_customer_agent_prompt

    system_prompt = build_customer_agent_prompt(language)
    async for chunk in stream(system_prompt, query, history):
        yield chunk


async def query_vessel_data(
    natural_language_query: str,
    vessel_context: str,
) -> str:
    """
    Module 1: Answer NL queries about vessel status.
    vessel_context is a JSON string of current vessel states.
    """
    from prompts import VESSEL_QUERY_PROMPT

    user_msg = (
        f"VESSEL DATA (current state):\n{vessel_context}\n\n"
        f"USER QUESTION: {natural_language_query}"
    )
    return await complete(VESSEL_QUERY_PROMPT, user_msg)


async def parse_compliance_data(
    raw_data: str,
    report_type: str,
) -> dict[str, Any]:
    """
    Module 3: Map raw unstructured data to compliance schema.
    """
    from prompts import COMPLIANCE_PARSER_PROMPT

    user_msg = (
        f"REPORT TYPE: {report_type}\n\n"
        f"RAW DATA:\n{raw_data}"
    )
    return await complete_json(COMPLIANCE_PARSER_PROMPT, user_msg)


async def generate_analytics_summary(
    performance_data: str,
    query: str,
) -> str:
    """
    Module 5: Natural language analytics summary over forecast/performance data.
    """
    system = (
        "You are a maritime business intelligence analyst for Minoan Lines S.A., "
        "a Greek ferry operator in the Adriatic and Aegean. "
        "Analyse the provided performance data and answer the user's question concisely. "
        "Use specific numbers. Flag underperforming routes clearly. "
        "Respond in English unless the user writes in Greek."
    )
    user_msg = f"PERFORMANCE DATA:\n{performance_data}\n\nQUESTION: {query}"
    return await complete(system, user_msg, temperature=0.2)

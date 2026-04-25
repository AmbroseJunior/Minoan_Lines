"""
IntegraMind AI × Minoan Lines
DeepSeek AI wrapper (OpenAI-compatible API).

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

import structlog

from config import get_ai_client, get_settings

log = structlog.get_logger(__name__)
settings = get_settings()

MAX_TOKENS = 4096
ESCALATION_CONFIDENCE_THRESHOLD = 0.75


# ─── Message helpers ──────────────────────────────────────────────────────────

def _build_messages(
    system_prompt: str,
    user_message: str,
    history: list[dict[str, str]] | None = None,
) -> list[dict[str, str]]:
    messages: list[dict[str, str]] = [{"role": "system", "content": system_prompt}]
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
    client = get_ai_client()
    messages = _build_messages(system_prompt, user_message, history)

    response = await client.chat.completions.create(
        model=settings.deepseek_model,
        messages=messages,
        max_tokens=max_tokens,
        temperature=temperature,
    )
    return response.choices[0].message.content


async def stream(
    system_prompt: str,
    user_message: str,
    history: list[dict[str, str]] | None = None,
    max_tokens: int = MAX_TOKENS,
    temperature: float = 0.3,
) -> AsyncIterator[str]:
    """Streaming completion. Yields text chunks for SSE."""
    client = get_ai_client()
    messages = _build_messages(system_prompt, user_message, history)

    response = await client.chat.completions.create(
        model=settings.deepseek_model,
        messages=messages,
        max_tokens=max_tokens,
        temperature=temperature,
        stream=True,
    )
    async for chunk in response:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta


async def complete_json(
    system_prompt: str,
    user_message: str,
    history: list[dict[str, str]] | None = None,
    max_tokens: int = MAX_TOKENS,
) -> dict[str, Any]:
    """Returns a parsed JSON dict. System prompt must instruct JSON-only output."""
    json_system = (
        system_prompt
        + "\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no prose."
    )
    raw = await complete(json_system, user_message, history, max_tokens, temperature=0.1)

    cleaned = re.sub(r"^```(?:json)?\s*", "", raw.strip())
    cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        log.error("ai_service.complete_json parse error", raw=raw[:500], error=str(exc))
        raise ValueError(f"DeepSeek returned non-JSON: {raw[:200]}") from exc


# ─── Confidence extraction ────────────────────────────────────────────────────

def extract_confidence(response_data: dict[str, Any]) -> float:
    for key in ("confidence", "confidence_score"):
        if key in response_data:
            try:
                return float(response_data[key])
            except (TypeError, ValueError):
                pass
    return 1.0


def should_escalate(confidence: float, topic: str | None = None) -> bool:
    if confidence < ESCALATION_CONFIDENCE_THRESHOLD:
        return True
    if topic:
        sensitive = {"refund", "refunds", "complaint", "complaints", "legal", "compensation"}
        if any(t in topic.lower() for t in sensitive):
            return True
    return False


# ─── Module-specific helpers ──────────────────────────────────────────────────

async def classify_ticket(title: str, description: str) -> dict[str, Any]:
    """Module 4: Classify an IT helpdesk ticket."""
    from prompts import TICKET_TRIAGE_PROMPT
    user_msg = f"TICKET TITLE: {title}\n\nDESCRIPTION:\n{description}"
    return await complete_json(TICKET_TRIAGE_PROMPT, user_msg)


async def answer_customer_query(
    query: str,
    language: str = "en",
    history: list[dict[str, str]] | None = None,
) -> AsyncIterator[str]:
    """Module 2: Stream a customer support response."""
    from prompts import build_customer_agent_prompt
    system_prompt = build_customer_agent_prompt(language)
    async for chunk in stream(system_prompt, query, history):
        yield chunk


async def query_vessel_data(natural_language_query: str, vessel_context: str) -> str:
    """Module 1: Answer NL queries about vessel status."""
    from prompts import VESSEL_QUERY_PROMPT
    user_msg = (
        f"VESSEL DATA (current state):\n{vessel_context}\n\n"
        f"USER QUESTION: {natural_language_query}"
    )
    return await complete(VESSEL_QUERY_PROMPT, user_msg)


async def parse_compliance_data(raw_data: str, report_type: str) -> dict[str, Any]:
    """Module 3: Map raw unstructured data to compliance schema."""
    from prompts import COMPLIANCE_PARSER_PROMPT
    user_msg = f"REPORT TYPE: {report_type}\n\nRAW DATA:\n{raw_data}"
    return await complete_json(COMPLIANCE_PARSER_PROMPT, user_msg)


async def generate_analytics_summary(performance_data: str, query: str) -> str:
    """Module 5: Natural language analytics summary over forecast data."""
    system = (
        "You are a maritime business intelligence analyst for Minoan Lines S.A., "
        "a Greek ferry operator in the Adriatic and Aegean. "
        "Analyse the provided performance data and answer the user's question concisely. "
        "Use specific numbers. Flag underperforming routes clearly. "
        "Respond in English unless the user writes in Greek."
    )
    user_msg = f"PERFORMANCE DATA:\n{performance_data}\n\nQUESTION: {query}"
    return await complete(system, user_msg, temperature=0.2)
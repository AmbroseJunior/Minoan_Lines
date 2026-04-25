"""
Load all system prompts from .md files at import time.
"""
from pathlib import Path

_PROMPT_DIR = Path(__file__).parent


def _load(filename: str) -> str:
    return (_PROMPT_DIR / filename).read_text(encoding="utf-8")


TICKET_TRIAGE_PROMPT: str = _load("ticket_triage.md")
VESSEL_QUERY_PROMPT: str = _load("vessel_query.md")
COMPLIANCE_PARSER_PROMPT: str = _load("compliance_parser.md")

_CUSTOMER_AGENT_BASE: str = _load("customer_agent.md")


def build_customer_agent_prompt(language: str = "en") -> str:
    """Inject language hint into the customer agent system prompt."""
    lang_hint = (
        "The user is writing in Greek — respond ENTIRELY in Greek (Ελληνικά)."
        if language == "el"
        else "The user is writing in English — respond in English."
    )
    return f"{_CUSTOMER_AGENT_BASE}\n\n## Current Language Instruction\n{lang_hint}"

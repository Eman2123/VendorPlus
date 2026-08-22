"""
result_extractor.py

Rule-based extraction of structured call results from a raw CALL-E transcript.
Parses free-text transcript into the ResultExtractorOutput shape (PRD Section 5):
delivery_status, confidence_score, risk_signals, root_cause_analysis, recommendation.

No LLM calls here on purpose — this is deliberately simple keyword/regex matching,
per the Day 4 checklist ("rule-based extraction").
"""

import re
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from app.schemas.schemas import ResultExtractorOutput, RootCause


# ---- Keyword banks (lowercase match) ----

ON_TRACK_PHRASES = [
    "on track", "on time", "yes it will", "yes it will be", "no delay",
    "it's fine", "its fine", "should be fine", "will be delivered",
]

DELAY_PHRASES = [
    "delayed", "delay", "late", "not on track", "won't make it",
    "wont make it", "behind schedule",
]

HESITATION_PHRASES = [
    "probably", "i think", "maybe", "not sure", "should be", "i guess",
    "pata nahin", "shayad",
]

UNFIXABLE_PHRASES = [
    "not fixable", "isn't fixable", "isnt fixable", "can't fix", "cant fix",
    "nahin fix", "theek nahin kiya ja sakta", "fix nahin",
]

FIXABLE_PHRASES = [
    "fixable", "can fix", "we can fix", "fix kar sakte",
]

NO_ANSWER_MARKERS = [
    "no answer", "voicemail", "unreachable",
]

DAYS_LATE_PATTERNS = [
    re.compile(r"(\d+)\s*(?:to|-)\s*(\d+)\s*days?", re.IGNORECASE),  # "5 to 6 days"
    re.compile(r"(\d+)\s*days?\s*late", re.IGNORECASE),               # "3 days late"
    re.compile(r"about\s*(\d+)", re.IGNORECASE),                      # fallback "about 5"
]

# Non-ASCII/Urdu-Arabic or Gurmukhi script ranges -> language switch detection
NON_ENGLISH_SCRIPT = re.compile(r"[\u0600-\u06FF\u0A00-\u0A7F]")


def _lower_user_lines(transcript: str) -> list[str]:
    """Extract just the USER: lines, lowercased, from the transcript."""
    lines = []
    for line in transcript.splitlines():
        m = re.search(r"USER:\s*(.+)", line)
        if m:
            lines.append(m.group(1).strip().lower())
    return lines


def _bot_used_non_english(transcript: str) -> bool:
    for line in transcript.splitlines():
        if "BOT:" in line and NON_ENGLISH_SCRIPT.search(line):
            return True
    return False


def _extract_days_late(user_text: str) -> Optional[int]:
    for pattern in DAYS_LATE_PATTERNS:
        m = pattern.search(user_text)
        if m:
            groups = [int(g) for g in m.groups() if g and g.isdigit()]
            if len(groups) == 2:
                return round(sum(groups) / 2)  # average of a range e.g. "5 to 6" -> 6 (rounded)
            if groups:
                return groups[0]
    return None


def extract_call_result(
    call_id: UUID,
    vendor_id: UUID,
    order_id: str,
    call_timestamp: datetime,
    call_duration_seconds: int,
    transcript: str,
) -> ResultExtractorOutput:
    """
    Parse a raw transcript into the structured ResultExtractorOutput shape.
    Handles partial/unclear transcripts gracefully (low confidence, unclear status)
    rather than raising.
    """
    if not transcript or not transcript.strip():
        return ResultExtractorOutput(
            call_id=call_id,
            vendor_id=vendor_id,
            order_id=order_id,
            call_timestamp=call_timestamp,
            call_duration_seconds=call_duration_seconds,
            vendor_language_detected="unknown",
            delivery_status="unclear",
            confidence_score=0.0,
            risk_signals=["empty_transcript"],
            root_cause_analysis=RootCause(primary="no data", fixable=False),
            recommendation="retry_call",
            call_transcript=transcript or "",
        )

    user_lines = _lower_user_lines(transcript)
    full_user_text = " ".join(user_lines)

    risk_signals: list[str] = []

    # --- language detection ---
    language_switched = _bot_used_non_english(transcript)
    vendor_language_detected = "urdu" if language_switched else "english"
    if language_switched:
        risk_signals.append("language_switch")

    # --- no-answer check ---
    if any(marker in full_user_text for marker in NO_ANSWER_MARKERS) or not user_lines:
        return ResultExtractorOutput(
            call_id=call_id,
            vendor_id=vendor_id,
            order_id=order_id,
            call_timestamp=call_timestamp,
            call_duration_seconds=call_duration_seconds,
            vendor_language_detected=vendor_language_detected,
            delivery_status="unclear",
            confidence_score=0.2,
            risk_signals=risk_signals + ["no_answer"],
            root_cause_analysis=RootCause(primary="no response captured", fixable=False),
            recommendation="retry_call",
            call_transcript=transcript,
        )

    # --- delivery status ---
    is_delayed = any(p in full_user_text for p in DELAY_PHRASES)
    is_on_track = any(p in full_user_text for p in ON_TRACK_PHRASES)
    is_hesitant = any(p in full_user_text for p in HESITATION_PHRASES)

    if is_delayed:
        delivery_status = "delayed"
        risk_signals.append("explicit_delay")
    elif is_on_track and not is_hesitant:
        delivery_status = "on_track"
    else:
        delivery_status = "unclear"
        risk_signals.append("hesitant_response")

    if is_hesitant:
        risk_signals.append("hesitant_response")

    # --- days late ---
    days_late = _extract_days_late(full_user_text) if is_delayed else None

    # --- fixability / root cause ---
    is_unfixable = any(p in full_user_text for p in UNFIXABLE_PHRASES)
    is_fixable = any(p in full_user_text for p in FIXABLE_PHRASES) and not is_unfixable

    if is_delayed:
        fixable = is_fixable and not is_unfixable
        primary_cause = "vendor-reported delay" if not is_unfixable else "unresolvable delay"
        if is_unfixable:
            risk_signals.append("unfixable_delay")
        root_cause = RootCause(primary=primary_cause, fixable=fixable)
    else:
        root_cause = RootCause(primary="none reported", fixable=True)

    # --- revised delivery estimate (only when we have a days_late figure) ---
    delivery_estimate_revised = None
    if days_late is not None:
        delivery_estimate_revised = (call_timestamp + timedelta(days=days_late)).date()

    # --- confidence score (simple heuristic) ---
    confidence = 0.5
    if delivery_status in ("delayed", "on_track"):
        confidence += 0.25
    if days_late is not None:
        confidence += 0.15
    if len(user_lines) >= 3:
        confidence += 0.1
    confidence = min(confidence, 0.95)

    # --- recommendation ---
    if is_delayed and is_unfixable:
        recommendation = "escalate_to_human"
        risk_signals.append("needs_escalation")
    elif delivery_status == "unclear":
        recommendation = "retry_call"
    else:
        recommendation = "monitor"

    return ResultExtractorOutput(
        call_id=call_id,
        vendor_id=vendor_id,
        order_id=order_id,
        call_timestamp=call_timestamp,
        call_duration_seconds=call_duration_seconds,
        vendor_language_detected=vendor_language_detected,
        delivery_status=delivery_status,
        delivery_estimate_revised=delivery_estimate_revised,
        confidence_score=round(confidence, 2),
        risk_signals=risk_signals,
        root_cause_analysis=root_cause,
        recommendation=recommendation,
        call_transcript=transcript,
    )
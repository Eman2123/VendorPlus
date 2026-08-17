"""
risk_engine.py — rule-based 5-factor risk scoring (no ML).
Target: Day 5.

Factors (each scored 0-100, weights are placeholders — tune during Day 5-9
real-call testing):
    1. delivery_confidence  — inverse of confidence_score from the call
    2. variance             — how far delivery_estimate_revised drifts from deadline
    3. benchmark            — vendor's historical on-time rate (stub: neutral until data exists)
    4. macro                — external/category-level risk signals (stub: neutral)
    5. behavioral           — no_answer/unreachable pattern, hesitation signals
"""
from datetime import date

WEIGHTS = {
    "delivery_confidence": 0.35,
    "variance": 0.25,
    "benchmark": 0.15,
    "macro": 0.10,
    "behavioral": 0.15,
}

TIER_THRESHOLDS = [
    (0, 20, 0),   # Confirmed
    (20, 40, 1),  # Likely
    (40, 60, 2),  # At Risk
    (60, 80, 3),  # High Risk
    (80, 101, 4), # Critical
]


def score_to_tier(score: float) -> int:
    for lo, hi, tier in TIER_THRESHOLDS:
        if lo <= score < hi:
            return tier
    return 4


def compute_risk_score(
    delivery_confidence: float,
    variance: float,
    benchmark: float,
    macro: float,
    behavioral: float,
) -> dict:
    """All inputs are 0-100. Returns final weighted score + tier."""
    score = (
        delivery_confidence * WEIGHTS["delivery_confidence"]
        + variance * WEIGHTS["variance"]
        + benchmark * WEIGHTS["benchmark"]
        + macro * WEIGHTS["macro"]
        + behavioral * WEIGHTS["behavioral"]
    )
    score = round(min(max(score, 0), 100), 2)
    return {"score": score, "risk_tier": score_to_tier(score)}


# TODO (Day 5): implement factor derivation from the result_extractor.py
# output (confidence_score, delivery_estimate_revised vs deadline, etc).
def derive_factors_from_call(call_result: dict, deadline: date) -> dict:
    raise NotImplementedError("Derive the 5 factors from call_result — see PRD Section 4.2")

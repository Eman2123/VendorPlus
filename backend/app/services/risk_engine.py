"""
risk_engine.py

5-factor rule-based risk scoring engine.
Takes the latest ResultExtractorOutput for a vendor/order (plus vendor + order
context) and computes:
  - 5 factor scores (0-100 each, higher = riskier)
  - a final weighted score (0-100)
  - a risk_tier (0-4)

Weights (per project decision):
  variance:    30%
  benchmark:   20%
  macro:       20%
  confidence:  15%
  behavioral:  15%
"""

from datetime import date
from typing import List, Optional


WEIGHTS = {
    "variance": 0.30,
    "benchmark": 0.20,
    "macro": 0.20,
    "confidence": 0.15,
    "behavioral": 0.15,
}


def score_confidence_factor(delivery_status: str, confidence_score: float) -> float:
    """
    Higher risk when status is 'delayed' and the extractor was confident about it,
    or when status is 'unclear' (we don't actually know what's going on).
    0-100, higher = riskier.
    """
    if delivery_status == "delayed":
        return round(60 + (confidence_score * 40), 2)  # 60-100 range
    if delivery_status == "unclear":
        return round(40 + ((1 - confidence_score) * 30), 2)  # uncertainty itself is risky
    # on_track
    return round((1 - confidence_score) * 20, 2)  # low risk, but low confidence nudges it up slightly


def score_variance_factor(
    original_deadline: date,
    delivery_estimate_revised: Optional[date],
) -> float:
    """
    Measures how far the revised estimate has drifted from the original deadline.
    No revised estimate available -> treated as low variance (nothing to compare yet).
    0-100, higher = riskier.
    """
    if delivery_estimate_revised is None:
        return 10.0  # minimal signal, not zero (we don't fully trust "no info" either)

    days_drift = (delivery_estimate_revised - original_deadline).days
    if days_drift <= 0:
        return 5.0  # on time or early
    # Scale: 1 day late ~ 15, 10+ days late -> caps near 100
    return round(min(15 * days_drift, 100), 2)


def score_benchmark_factor(vendor_days_late: Optional[int], average_days_late_all_vendors: float) -> float:
    """
    Compares this vendor's current days_late against the average across all vendors.
    0-100, higher = riskier.
    """
    if vendor_days_late is None:
        return 15.0  # no delay reported -> low-ish baseline risk

    if average_days_late_all_vendors <= 0:
        return round(min(vendor_days_late * 12, 100), 2)

    ratio = vendor_days_late / average_days_late_all_vendors
    return round(min(ratio * 40, 100), 2)


def score_macro_factor(is_new_or_high_risk: bool) -> float:
    """
    Baseline risk from vendor metadata (flagged new/high-risk vendors start higher).
    0-100, higher = riskier.
    """
    return 55.0 if is_new_or_high_risk else 15.0


def score_behavioral_factor(risk_signals: List[str]) -> float:
    """
    Counts red-flag signals surfaced during the call itself.
    0-100, higher = riskier.
    """
    weights = {
        "explicit_delay": 15,
        "unfixable_delay": 25,
        "hesitant_response": 15,
        "no_answer": 30,
        "needs_escalation": 20,
        "language_switch": 5,
        "empty_transcript": 30,
    }
    score = sum(weights.get(signal, 10) for signal in risk_signals)
    return round(min(score, 100), 2)

def compute_risk_score(
    delivery_status: str,
    confidence_score: float,
    original_deadline: date,
    delivery_estimate_revised: Optional[date],
    vendor_days_late: Optional[int],
    average_days_late_all_vendors: float,
    is_new_or_high_risk: bool,
    risk_signals: List[str],
) -> dict:
    """
    Runs all 5 factors and returns the weighted score + risk tier,
    matching the risk_scores table shape (factor_*, score, risk_tier).
    """
    factor_confidence = score_confidence_factor(delivery_status, confidence_score)
    factor_variance = score_variance_factor(original_deadline, delivery_estimate_revised)
    factor_benchmark = score_benchmark_factor(vendor_days_late, average_days_late_all_vendors)
    factor_macro = score_macro_factor(is_new_or_high_risk)
    factor_behavioral = score_behavioral_factor(risk_signals)

    final_score = (
        factor_confidence * WEIGHTS["confidence"]
        + factor_variance * WEIGHTS["variance"]
        + factor_benchmark * WEIGHTS["benchmark"]
        + factor_macro * WEIGHTS["macro"]
        + factor_behavioral * WEIGHTS["behavioral"]
    )
    final_score = round(final_score, 2)

    risk_tier = score_to_tier(final_score)

    # Safety floor: an unfixable delay is inherently dangerous regardless of the
    # weighted math, so it can never land below Tier 3.
    if "unfixable_delay" in risk_signals and risk_tier < 3:
        risk_tier = 3

    return {
        "factor_delivery_confidence": factor_confidence,
        "factor_variance": factor_variance,
        "factor_benchmark": factor_benchmark,
        "factor_macro": factor_macro,
        "factor_behavioral": factor_behavioral,
        "score": final_score,
        "risk_tier": risk_tier,
    }


def score_to_tier(score: float) -> int:
    """
    Maps final 0-100 score to a risk tier 0-4.
    0 = safest, 4 = most critical.
    """
    if score < 20:
        return 0
    if score < 40:
        return 1
    if score < 60:
        return 2
    if score < 80:
        return 3
    return 4
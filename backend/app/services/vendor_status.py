"""
vendor_status.py

Shared logic for turning a vendor's latest call into the live risk_tier /
risk_score / last_call_status / alert_sent shown to the frontend. Used by
both GET /vendors and GET /dashboard so the two endpoints can never disagree
about a vendor's current status.
"""
from typing import Optional

from sqlalchemy.orm import Session

from app.db.models import Call, Order, Vendor
from app.services.risk_engine import compute_risk_score


def get_average_days_late(db: Session) -> float:
    calls_with_estimates = (
        db.query(Call, Order)
        .join(Order, Order.order_id == Call.order_id)
        .filter(Call.delivery_estimate_revised.isnot(None))
        .all()
    )

    if not calls_with_estimates:
        return 0.0

    total_days_late = 0
    count = 0
    for call, order in calls_with_estimates:
        drift = (call.delivery_estimate_revised - order.deadline).days
        if drift > 0:
            total_days_late += drift
            count += 1

    return (total_days_late / count) if count > 0 else 0.0


def compute_vendor_status(
    vendor: Vendor,
    order: Order,
    latest_call: Optional[Call],
    average_days_late_all_vendors: float,
) -> dict:
    if latest_call is None:
        return {
            "risk_tier": 0,
            "risk_score": 0.0,
            "last_call_status": "not_called",
            "alert_sent": False,
        }

    vendor_days_late = None
    if latest_call.delivery_estimate_revised:
        drift = (latest_call.delivery_estimate_revised - order.deadline).days
        vendor_days_late = drift if drift > 0 else None

    score_result = compute_risk_score(
        delivery_status=latest_call.delivery_status or "unclear",
        confidence_score=float(latest_call.confidence_score or 0.0),
        original_deadline=order.deadline,
        delivery_estimate_revised=latest_call.delivery_estimate_revised,
        vendor_days_late=vendor_days_late,
        average_days_late_all_vendors=average_days_late_all_vendors,
        is_new_or_high_risk=vendor.is_new_or_high_risk,
        risk_signals=latest_call.risk_signals or [],
    )

    risk_tier = score_result["risk_tier"]
    alert_sent = bool(risk_tier >= 3 or latest_call.unreachable_final)
    last_call_status = "unreachable" if latest_call.unreachable_final else latest_call.call_status

    return {
        "risk_tier": risk_tier,
        "risk_score": float(score_result["score"]),
        "last_call_status": last_call_status,
        "alert_sent": alert_sent,
    }

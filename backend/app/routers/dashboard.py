"""
GET /dashboard
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Vendor, Order, Call
from app.schemas.schemas import DashboardSummary
from app.services.risk_engine import compute_risk_score

router = APIRouter()


def _get_average_days_late(db: Session) -> float:
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


@router.get("/dashboard", response_model=DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db)):
    rows = db.query(Vendor, Order).join(Order, Order.vendor_id == Vendor.vendor_id).all()

    average_days_late_all_vendors = _get_average_days_late(db)

    vendors_per_tier = {"0": 0, "1": 0, "2": 0, "3": 0, "4": 0}
    unreachable_count = 0
    escalations = 0

    for vendor, order in rows:
        latest_call = (
            db.query(Call)
            .filter(Call.order_id == order.order_id)
            .order_by(Call.attempt_number.desc())
            .first()
        )

        if latest_call is None:
            vendors_per_tier["0"] += 1
            continue

        if latest_call.unreachable_final:
            unreachable_count += 1

        vendor_days_late = None
        if latest_call.delivery_estimate_revised:
            drift = (latest_call.delivery_estimate_revised - order.deadline).days
            vendor_days_late = drift if drift > 0 else None

        risk_signals = latest_call.risk_signals or []

        score_result = compute_risk_score(
            delivery_status=latest_call.delivery_status or "unclear",
            confidence_score=float(latest_call.confidence_score or 0.0),
            original_deadline=order.deadline,
            delivery_estimate_revised=latest_call.delivery_estimate_revised,
            vendor_days_late=vendor_days_late,
            average_days_late_all_vendors=average_days_late_all_vendors,
            is_new_or_high_risk=vendor.is_new_or_high_risk,
            risk_signals=risk_signals,
        )

        tier = score_result["risk_tier"]
        vendors_per_tier[str(tier)] += 1

        if tier >= 3 or "needs_escalation" in risk_signals:
            escalations += 1

    return DashboardSummary(
        vendors_per_tier=vendors_per_tier,
        unreachable_count=unreachable_count,
        escalations=escalations,
    )
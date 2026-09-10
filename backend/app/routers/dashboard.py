"""
GET /dashboard
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Vendor, Order, Call
from app.schemas.schemas import DashboardSummary
from app.services.vendor_status import compute_vendor_status, get_average_days_late

router = APIRouter()


@router.get("/dashboard", response_model=DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db)):
    rows = db.query(Vendor, Order).join(Order, Order.vendor_id == Vendor.vendor_id).all()
    average_days_late_all_vendors = get_average_days_late(db)

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

        status = compute_vendor_status(vendor, order, latest_call, average_days_late_all_vendors)

        vendors_per_tier[str(status["risk_tier"])] += 1

        if status["last_call_status"] == "unreachable":
            unreachable_count += 1

        if status["alert_sent"]:
            escalations += 1

    return DashboardSummary(
        vendors_per_tier=vendors_per_tier,
        unreachable_count=unreachable_count,
        escalations=escalations,
    )

"""
GET /dashboard
Target: Day 8 (live).
"""
from fastapi import APIRouter

from app.schemas.schemas import DashboardSummary

router = APIRouter()


@router.get("/dashboard", response_model=DashboardSummary)
def dashboard_summary():
    # TODO (Day 8): aggregate vendors_per_tier, unreachable_count, escalations
    raise NotImplementedError("Wire up aggregate query here — see docs/apicontract.md")

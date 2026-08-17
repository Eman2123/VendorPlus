"""
Pydantic models mirroring docs/apicontract.md exactly.
Keep this file in sync with the contract — it is the shared source of truth
for both the risk engine and the frontend mock data.
"""
from datetime import date, datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel


class VendorCreate(BaseModel):
    vendor_name: str
    contact_phone: str
    language_preference: str = "english"   # english | urdu | <third_language>
    order_id: str
    deadline: date
    is_new_or_high_risk: bool = False


class VendorCreateResponse(BaseModel):
    vendor_id: UUID
    order_id: str
    status: str = "created"


class VendorListItem(BaseModel):
    vendor_id: UUID
    vendor_name: str
    order_id: str
    deadline: date
    risk_tier: int
    risk_score: float
    last_call_status: Optional[str] = None
    alert_sent: bool = False


class CallTrigger(BaseModel):
    vendor_id: UUID
    order_id: str


class CallTriggerResponse(BaseModel):
    call_id: UUID
    status: str = "queued"


class RootCause(BaseModel):
    primary: str
    fixable: bool


class CallHistoryItem(BaseModel):
    call_id: UUID
    attempt_number: int
    call_timestamp: datetime
    call_status: str  # no_answer | busy | voicemail | picked_up
    call_duration_seconds: Optional[int] = None
    vendor_language_detected: Optional[str] = None
    delivery_status: Optional[str] = None
    confidence_score: Optional[float] = None
    risk_signals: List[str] = []
    root_cause_analysis: Optional[RootCause] = None
    recommendation: Optional[str] = None


class DashboardSummary(BaseModel):
    vendors_per_tier: dict
    unreachable_count: int
    escalations: int


class ResultExtractorOutput(BaseModel):
    """Full object produced by result_extractor.py after every call
    (PRD Section 5). Stored across `calls` + `risk_scores`."""
    call_id: UUID
    vendor_id: UUID
    order_id: str
    call_timestamp: datetime
    call_duration_seconds: int
    vendor_language_detected: str
    delivery_status: str
    delivery_estimate_revised: Optional[date] = None
    confidence_score: float
    risk_signals: List[str] = []
    root_cause_analysis: RootCause
    recommendation: str
    call_transcript: str

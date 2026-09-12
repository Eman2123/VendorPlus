"""
POST /call, GET /call-history
"""
import time
from app.services.alerts import check_and_send_alert
from app.services.risk_engine import compute_risk_score
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Vendor, Order, Call
from app.schemas.schemas import (
    CallTrigger,
    CallTriggerResponse,
    CallHistoryItem,
    RootCause,
)
from app.services.calle_client import place_call
from app.services.result_extractor import extract_call_result

router = APIRouter()

MAX_ATTEMPTS = 3
RETRY_DELAY_SECONDS = 5  # spaced-out retries; kept short for demo purposes


def _run_single_attempt(db: Session, vendor: Vendor, order: Order, attempt_number: int) -> Call:
    """
    Places one real call attempt, extracts the result, saves a Call row,
    and returns it. Does not manage the call_in_progress lock itself.
    """
    call_row = Call(
        vendor_id=vendor.vendor_id,
        order_id=order.order_id,
        attempt_number=attempt_number,
        call_status="in_progress",
        call_in_progress=True,
    )
    db.add(call_row)
    db.commit()
    db.refresh(call_row)

    try:
        raw_result = place_call(
            vendor_phone=vendor.contact_phone,
            vendor_name=vendor.vendor_name,
            order_id=order.order_id,
            deadline=str(order.deadline),
        )
    except Exception as e:
        print(f"[calle] place_call failed for order {order.order_id}: {e}")
        call_row.call_status = "failed"
        call_row.call_in_progress = False
        db.commit()
        return call_row

    call_result = raw_result.get("result", {})
    transcript = call_result.get("transcript") or ""
    duration = 0
    if call_result.get("calling"):
        duration = call_result["calling"].get("duration_seconds", 0)

    extracted = extract_call_result(
        call_id=call_row.call_id,
        vendor_id=vendor.vendor_id,
        order_id=order.order_id,
        call_timestamp=call_row.call_timestamp,
        call_duration_seconds=duration,
        transcript=transcript,
    )

    call_row.call_status = "picked_up" if transcript else "no_answer"
    call_row.call_duration_seconds = extracted.call_duration_seconds
    call_row.vendor_language_detected = extracted.vendor_language_detected
    call_row.delivery_status = extracted.delivery_status
    call_row.delivery_estimate_revised = extracted.delivery_estimate_revised
    call_row.confidence_score = extracted.confidence_score
    call_row.risk_signals = extracted.risk_signals
    call_row.root_cause_analysis = extracted.root_cause_analysis.model_dump()
    call_row.recommendation = extracted.recommendation
    call_row.call_transcript = transcript
    call_row.call_in_progress = False

    db.commit()
    return call_row


@router.post("/call", response_model=CallTriggerResponse, status_code=202)
def trigger_call(payload: CallTrigger, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.vendor_id == payload.vendor_id).first()
    if vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")

    order = db.query(Order).filter(Order.order_id == payload.order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    # call_in_progress lock: refuse if a call sequence for this order is already running
    active_call = (
        db.query(Call)
        .filter(Call.order_id == order.order_id, Call.call_in_progress.is_(True))
        .first()
    )
    if active_call is not None:
        raise HTTPException(status_code=409, detail="A call is already in progress for this order")

    starting_attempt = db.query(Call).filter(Call.order_id == order.order_id).count() + 1

    last_call_row = None
    for i in range(MAX_ATTEMPTS):
        attempt_number = starting_attempt + i
        last_call_row = _run_single_attempt(db, vendor, order, attempt_number)

        if last_call_row.call_status == "picked_up":
            # Success — no need to retry further
            break

        if i < MAX_ATTEMPTS - 1:
            time.sleep(RETRY_DELAY_SECONDS)


       # If every attempt in this sequence failed to connect, flag as unreachable
    if last_call_row is not None and last_call_row.call_status != "picked_up":
        last_call_row.unreachable_final = True
        db.commit()

    # Compute current risk tier and fire an alert if it crosses the threshold
    if last_call_row is not None:
        vendor_days_late = None
        if last_call_row.delivery_estimate_revised:
            drift = (last_call_row.delivery_estimate_revised - order.deadline).days
            vendor_days_late = drift if drift > 0 else None

        score_result = compute_risk_score(
            delivery_status=last_call_row.delivery_status or "unclear",
            confidence_score=float(last_call_row.confidence_score or 0.0),
            original_deadline=order.deadline,
            delivery_estimate_revised=last_call_row.delivery_estimate_revised,
            vendor_days_late=vendor_days_late,
            average_days_late_all_vendors=0.0,
            is_new_or_high_risk=vendor.is_new_or_high_risk,
            risk_signals=last_call_row.risk_signals or [],
        )

        alert_sent = check_and_send_alert(
            vendor_name=vendor.vendor_name,
            order_id=order.order_id,
            risk_tier=score_result["risk_tier"],
            unreachable_final=last_call_row.unreachable_final,
            delivery_status=last_call_row.delivery_status or "unclear",
        )

        if alert_sent:
            print(f"[alerts] Alert sent for order {order.order_id}, tier {score_result['risk_tier']}")

    return CallTriggerResponse(call_id=last_call_row.call_id, status="completed")


@router.get("/call-history", response_model=List[CallHistoryItem])
def call_history(vendor_id: UUID = Query(...), db: Session = Depends(get_db)):
    calls = (
        db.query(Call)
        .filter(Call.vendor_id == vendor_id)
        .order_by(Call.attempt_number.asc())
        .all()
    )

    result = []
    for call in calls:
        root_cause = None
        if call.root_cause_analysis:
            root_cause = RootCause(**call.root_cause_analysis)

        result.append(CallHistoryItem(
            call_id=call.call_id,
            attempt_number=call.attempt_number,
            call_timestamp=call.call_timestamp,
            call_status=call.call_status,
            call_duration_seconds=call.call_duration_seconds,
            vendor_language_detected=call.vendor_language_detected,
            delivery_status=call.delivery_status,
            confidence_score=float(call.confidence_score) if call.confidence_score else None,
            risk_signals=call.risk_signals or [],
            root_cause_analysis=root_cause,
            recommendation=call.recommendation,
        ))

    return result

"""
POST /call, GET /call-history
"""
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


@router.post("/call", response_model=CallTriggerResponse, status_code=202)
def trigger_call(payload: CallTrigger, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.vendor_id == payload.vendor_id).first()
    if vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")

    order = db.query(Order).filter(Order.order_id == payload.order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    # call_in_progress lock: refuse if a call for this order is already running
    active_call = (
        db.query(Call)
        .filter(Call.order_id == order.order_id, Call.call_in_progress.is_(True))
        .first()
    )
    if active_call is not None:
        raise HTTPException(status_code=409, detail="A call is already in progress for this order")

    attempt_number = (
        db.query(Call).filter(Call.order_id == order.order_id).count() + 1
    )

    # Placeholder row while the call is running (locks this order)
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
        call_row.call_status = "failed"
        call_row.call_in_progress = False
        db.commit()
        raise HTTPException(status_code=502, detail=f"CALL-E call failed: {e}")

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

    return CallTriggerResponse(call_id=call_row.call_id, status="completed")


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

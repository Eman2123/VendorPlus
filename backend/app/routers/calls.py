"""
POST /call, GET /call-history
Target: Day 6 (live).
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Query

from app.schemas.schemas import CallTrigger, CallTriggerResponse, CallHistoryItem

router = APIRouter()


@router.post("/call", response_model=CallTriggerResponse, status_code=202)
def trigger_call(payload: CallTrigger):
    # TODO (Day 6): check call_in_progress lock (Risk Register item), then
    # invoke CALL-E SDK via app/services/calle_client.py, queue the attempt.
    raise NotImplementedError("Wire up CALL-E SDK call here")


@router.get("/call-history", response_model=List[CallHistoryItem])
def call_history(vendor_id: UUID = Query(...)):
    # TODO (Day 6): query calls table filtered by vendor_id, ordered by attempt
    raise NotImplementedError("Wire up DB query here — see docs/apicontract.md")

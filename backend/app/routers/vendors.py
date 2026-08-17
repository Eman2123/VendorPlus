"""
POST /vendors, GET /vendors
Target: Day 5 (live), Day 1-2 stubbed so Track B can hit real routes early.
"""
from typing import List
from fastapi import APIRouter

from app.schemas.schemas import VendorCreate, VendorCreateResponse, VendorListItem

router = APIRouter()


@router.post("/vendors", response_model=VendorCreateResponse, status_code=201)
def create_vendor(payload: VendorCreate):
    # TODO (Day 5): insert into vendors + orders tables, return real vendor_id
    raise NotImplementedError("Wire up DB insert here — see docs/apicontract.md")


@router.get("/vendors", response_model=List[VendorListItem])
def list_vendors():
    # TODO (Day 5): join vendors + latest risk_scores, return tier/score per vendor
    raise NotImplementedError("Wire up DB query here — see docs/apicontract.md")

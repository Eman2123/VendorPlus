"""
POST /vendors, GET /vendors
"""

from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Vendor, Order, Call
from app.schemas.schemas import (
    VendorCreate,
    VendorCreateResponse,
    VendorListItem,
)
from app.services.vendor_status import compute_vendor_status, get_average_days_late

router = APIRouter()


@router.post("/vendors", response_model=VendorCreateResponse, status_code=201)
def create_vendor(payload: VendorCreate, db: Session = Depends(get_db)):
    vendor = Vendor(
        vendor_name=payload.vendor_name,
        contact_phone=payload.contact_phone,
        language_preference=payload.language_preference,
        is_new_or_high_risk=payload.is_new_or_high_risk,
    )

    db.add(vendor)
    db.flush()

    order = Order(
        order_id=payload.order_id,
        vendor_id=vendor.vendor_id,
        deadline=payload.deadline,
    )

    db.add(order)
    db.commit()
    db.refresh(vendor)

    return VendorCreateResponse(
        vendor_id=vendor.vendor_id,
        order_id=order.order_id,
        status="created",
    )


@router.get("/vendors", response_model=List[VendorListItem])
def list_vendors(db: Session = Depends(get_db)):
    rows = db.query(Vendor, Order).join(Order, Order.vendor_id == Vendor.vendor_id).all()
    average_days_late_all_vendors = get_average_days_late(db)

    result = []
    for vendor, order in rows:
        latest_call = (
            db.query(Call)
            .filter(Call.order_id == order.order_id)
            .order_by(Call.attempt_number.desc())
            .first()
        )

        status = compute_vendor_status(vendor, order, latest_call, average_days_late_all_vendors)

        result.append(VendorListItem(
            vendor_id=vendor.vendor_id,
            vendor_name=vendor.vendor_name,
            order_id=order.order_id,
            deadline=order.deadline,
            risk_tier=status["risk_tier"],
            risk_score=status["risk_score"],
            last_call_status=status["last_call_status"],
            alert_sent=status["alert_sent"],
        ))
    return result

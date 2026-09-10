"""
POST /vendors, GET /vendors, PUT /vendors/{vendor_id}, DELETE /vendors/{vendor_id}
"""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Vendor, Order, Call
from app.schemas.schemas import (
    VendorCreate,
    VendorCreateResponse,
    VendorListItem,
    VendorUpdate,
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


@router.put("/vendors/{vendor_id}", response_model=VendorListItem)
def update_vendor(vendor_id: UUID, payload: VendorUpdate, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.vendor_id == vendor_id).first()
    if vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")

    order = db.query(Order).filter(Order.vendor_id == vendor_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found for this vendor")

    # sirf woh fields update karo jo frontend se aayi hain (partial update)
    data = payload.model_dump(exclude_unset=True)

    if "vendor_name" in data:
        vendor.vendor_name = data["vendor_name"]
    if "contact_phone" in data:
        vendor.contact_phone = data["contact_phone"]
    if "language_preference" in data:
        vendor.language_preference = data["language_preference"]
    if "is_new_or_high_risk" in data:
        vendor.is_new_or_high_risk = data["is_new_or_high_risk"]
    if "deadline" in data:
        order.deadline = data["deadline"]

    db.commit()
    db.refresh(vendor)
    db.refresh(order)

    average_days_late_all_vendors = get_average_days_late(db)
    latest_call = (
        db.query(Call)
        .filter(Call.order_id == order.order_id)
        .order_by(Call.attempt_number.desc())
        .first()
    )
    status = compute_vendor_status(vendor, order, latest_call, average_days_late_all_vendors)

    return VendorListItem(
        vendor_id=vendor.vendor_id,
        vendor_name=vendor.vendor_name,
        order_id=order.order_id,
        deadline=order.deadline,
        risk_tier=status["risk_tier"],
        risk_score=status["risk_score"],
        last_call_status=status["last_call_status"],
        alert_sent=status["alert_sent"],
    )


@router.delete("/vendors/{vendor_id}", status_code=204)
def delete_vendor(vendor_id: UUID, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.vendor_id == vendor_id).first()
    if vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")

    db.delete(vendor)  # Order/Call cascade se delete ho jayenge (ondelete="CASCADE")
    db.commit()
    return None
from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, Numeric, SmallInteger, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from app.db.database import Base


class Vendor(Base):
    __tablename__ = "vendors"

    vendor_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()")
    )

    vendor_name = Column(Text, nullable=False)

    contact_phone = Column(Text, nullable=False)

    language_preference = Column(
        Text,
        nullable=False,
        server_default=text("'english'")
    )

    is_new_or_high_risk = Column(
        Boolean,
        nullable=False,
        server_default=text("false")
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()")
    )


class Order(Base):
    __tablename__ = "orders"

    order_id = Column(String, primary_key=True)

    vendor_id = Column(
        UUID(as_uuid=True),
        ForeignKey("vendors.vendor_id", ondelete="CASCADE"),
        nullable=False
    )

    deadline = Column(Date, nullable=False)

    status = Column(
        Text,
        nullable=False,
        server_default=text("'open'")
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()")
    )

class Call(Base):
    __tablename__ = "calls"

    call_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()")
    )

    vendor_id = Column(
        UUID(as_uuid=True),
        ForeignKey("vendors.vendor_id", ondelete="CASCADE"),
        nullable=False
    )

    order_id = Column(
        String,
        ForeignKey("orders.order_id", ondelete="CASCADE"),
        nullable=False
    )

    attempt_number = Column(Integer, nullable=False, server_default=text("1"))

    call_timestamp = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()")
    )

    call_status = Column(Text, nullable=False)
    call_duration_seconds = Column(Integer)
    vendor_language_detected = Column(Text)
    delivery_status = Column(Text)
    delivery_estimate_revised = Column(Date)
    confidence_score = Column(Numeric(4, 3))
    risk_signals = Column(JSONB, server_default=text("'[]'"))
    root_cause_analysis = Column(JSONB)
    recommendation = Column(Text)
    call_transcript = Column(Text)

    call_in_progress = Column(
        Boolean,
        nullable=False,
        server_default=text("false")
    )

    unreachable_final = Column(
        Boolean,
        nullable=False,
        server_default=text("false")
    )


class RiskScore(Base):
    __tablename__ = "risk_scores"

    risk_score_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()")
    )

    call_id = Column(
        UUID(as_uuid=True),
        ForeignKey("calls.call_id", ondelete="CASCADE"),
        nullable=False
    )

    order_id = Column(
        String,
        ForeignKey("orders.order_id", ondelete="CASCADE"),
        nullable=False
    )

    factor_delivery_confidence = Column(Numeric(5, 2), nullable=False)
    factor_variance = Column(Numeric(5, 2), nullable=False)
    factor_benchmark = Column(Numeric(5, 2), nullable=False)
    factor_macro = Column(Numeric(5, 2), nullable=False)
    factor_behavioral = Column(Numeric(5, 2), nullable=False)
    score = Column(Numeric(5, 2), nullable=False)
    risk_tier = Column(SmallInteger, nullable=False)

    alert_sent = Column(
        Boolean,
        nullable=False,
        server_default=text("false")
    )

    computed_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()")
    )
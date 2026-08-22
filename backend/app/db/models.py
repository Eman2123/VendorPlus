from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
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
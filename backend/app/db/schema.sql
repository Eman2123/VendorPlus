-- VendorPulse Database Schema
-- Matches backend/app/db/models.py exactly (4 tables: vendors, orders, calls, risk_scores)

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- needed for gen_random_uuid()

-- ============================================
-- VENDORS
-- ============================================
CREATE TABLE vendors (
    vendor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    language_preference TEXT NOT NULL DEFAULT 'english',
    is_new_or_high_risk BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ORDERS
-- One vendor -> many orders (order_id is a plain string, e.g. "PO-1042")
-- ============================================
CREATE TABLE orders (
    order_id VARCHAR(100) PRIMARY KEY,
    vendor_id UUID NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    deadline DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CALLS
-- One order -> many calls (retry attempts)
-- ============================================
CREATE TABLE calls (
    call_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    order_id VARCHAR(100) NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,

    attempt_number INTEGER NOT NULL DEFAULT 1,
    call_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    call_status TEXT NOT NULL,                    -- in_progress / picked_up / no_answer / failed
    call_duration_seconds INTEGER,
    vendor_language_detected TEXT,

    delivery_status TEXT,
    delivery_estimate_revised DATE,
    confidence_score NUMERIC(4,3),
    risk_signals JSONB DEFAULT '[]',
    root_cause_analysis JSONB,
    recommendation TEXT,
    call_transcript TEXT,

    call_in_progress BOOLEAN NOT NULL DEFAULT FALSE,
    unreachable_final BOOLEAN NOT NULL DEFAULT FALSE
);

-- ============================================
-- RISK_SCORES
-- (currently computed on-the-fly by the API; table kept for
-- historical logging if you choose to persist scores later)
-- ============================================
CREATE TABLE risk_scores (
    risk_score_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL REFERENCES calls(call_id) ON DELETE CASCADE,
    order_id VARCHAR(100) NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,

    factor_delivery_confidence NUMERIC(5,2) NOT NULL,
    factor_variance NUMERIC(5,2) NOT NULL,
    factor_benchmark NUMERIC(5,2) NOT NULL,
    factor_macro NUMERIC(5,2) NOT NULL,
    factor_behavioral NUMERIC(5,2) NOT NULL,
    score NUMERIC(5,2) NOT NULL,
    risk_tier SMALLINT NOT NULL,

    alert_sent BOOLEAN NOT NULL DEFAULT FALSE,
    computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Indexes for common lookups
-- ============================================
CREATE INDEX idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX idx_calls_vendor_id ON calls(vendor_id);
CREATE INDEX idx_calls_order_id ON calls(order_id);
CREATE INDEX idx_risk_scores_order_id ON risk_scores(order_id);
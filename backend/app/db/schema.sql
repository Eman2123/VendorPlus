-- VendorPulse Database Schema
-- Matches backend/app/schemas/schemas.py (the real API contract)
-- Tables: vendors, calls (orders are represented as fields on vendors,
-- since order_id is a plain string tied 1:1 to a vendor check-in, not a separate entity)

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- needed for gen_random_uuid()

-- ============================================
-- VENDORS
-- Mirrors VendorCreate / VendorListItem in schemas.py
-- ============================================
CREATE TABLE vendors (
    vendor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    language_preference VARCHAR(20) DEFAULT 'english',   -- 'english' | 'urdu' | <third_language>
    order_id VARCHAR(100) NOT NULL,                        -- plain string, not a separate table
    deadline DATE NOT NULL,
    is_new_or_high_risk BOOLEAN DEFAULT FALSE,

    -- current snapshot fields shown on VendorListItem
    risk_tier INTEGER DEFAULT 0,                            -- Tier 0-4
    risk_score NUMERIC(5,2) DEFAULT 0,
    last_call_status VARCHAR(50),                           -- no_answer / busy / voicemail / picked_up
    alert_sent BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CALLS
-- Mirrors CallHistoryItem / ResultExtractorOutput in schemas.py
-- One vendor -> many calls (retry attempts)
-- ============================================
CREATE TABLE calls (
    call_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    order_id VARCHAR(100) NOT NULL,

    attempt_number INTEGER NOT NULL DEFAULT 1,
    call_timestamp TIMESTAMP DEFAULT NOW(),
    call_status VARCHAR(50) NOT NULL,                       -- no_answer / busy / voicemail / picked_up
    call_duration_seconds INTEGER,
    vendor_language_detected VARCHAR(20),

    delivery_status VARCHAR(50),                            -- extracted result
    delivery_estimate_revised DATE,
    confidence_score NUMERIC(5,2),
    risk_signals TEXT[],                                    -- array of flags, matches List[str]

    -- root_cause_analysis is a nested object in schemas.py -> flattened here
    root_cause_primary TEXT,
    root_cause_fixable BOOLEAN,

    recommendation TEXT,
    call_transcript TEXT,

    -- retry/escalation bookkeeping (from A7 plan)
    call_in_progress BOOLEAN DEFAULT FALSE,
    unreachable_final BOOLEAN DEFAULT FALSE
);

-- ============================================
-- Indexes for common lookups
-- ============================================
CREATE INDEX idx_calls_vendor_id ON calls(vendor_id);
CREATE INDEX idx_vendors_risk_tier ON vendors(risk_tier);
CREATE INDEX idx_vendors_order_id ON vendors(order_id);

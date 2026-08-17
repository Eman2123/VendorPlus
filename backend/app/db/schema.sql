-- VendorPulse DB Schema (Day 1)
-- PostgreSQL

CREATE TABLE IF NOT EXISTS vendors (
    vendor_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_name         TEXT NOT NULL,
    contact_phone       TEXT NOT NULL,
    language_preference TEXT NOT NULL DEFAULT 'english',   -- english | urdu | <third_language>
    is_new_or_high_risk BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
    order_id     TEXT PRIMARY KEY,                          -- e.g. "PO-1042"
    vendor_id    UUID NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    deadline     DATE NOT NULL,
    status       TEXT NOT NULL DEFAULT 'open',               -- open | closed
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS calls (
    call_id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id                  UUID NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    order_id                   TEXT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    attempt_number              INT NOT NULL DEFAULT 1,       -- 1..3
    call_timestamp              TIMESTAMPTZ NOT NULL DEFAULT now(),
    call_status                 TEXT NOT NULL,                -- no_answer | busy | voicemail | picked_up
    call_duration_seconds       INT,
    vendor_language_detected    TEXT,
    delivery_status              TEXT,                        -- on_track | delay_likely | delayed | unknown
    delivery_estimate_revised   DATE,
    confidence_score             NUMERIC(4,3),                -- 0.000 - 1.000
    risk_signals                 JSONB DEFAULT '[]',
    root_cause_analysis          JSONB,                       -- {"primary": "...", "fixable": true}
    recommendation                TEXT,
    call_transcript               TEXT,
    call_in_progress              BOOLEAN NOT NULL DEFAULT FALSE,  -- lock flag, see risk register
    unreachable_final             BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS risk_scores (
    risk_score_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id           UUID NOT NULL REFERENCES calls(call_id) ON DELETE CASCADE,
    order_id          TEXT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    -- 5-factor rule-based inputs (each 0-100 before weighting)
    factor_delivery_confidence NUMERIC(5,2) NOT NULL,
    factor_variance             NUMERIC(5,2) NOT NULL,
    factor_benchmark            NUMERIC(5,2) NOT NULL,
    factor_macro                 NUMERIC(5,2) NOT NULL,
    factor_behavioral            NUMERIC(5,2) NOT NULL,
    score                          NUMERIC(5,2) NOT NULL,      -- 0-100 final weighted score
    risk_tier                     SMALLINT NOT NULL,            -- 0-4
    alert_sent                    BOOLEAN NOT NULL DEFAULT FALSE,
    computed_at                   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_calls_vendor ON calls(vendor_id);
CREATE INDEX IF NOT EXISTS idx_calls_order ON calls(order_id);
CREATE INDEX IF NOT EXISTS idx_risk_scores_order ON risk_scores(order_id);

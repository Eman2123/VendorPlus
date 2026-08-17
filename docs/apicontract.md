# VendorPulse — API Contract (v0.1, Day 1)

Source of truth for Track A (backend) and Track B (frontend) so Track B can build
against mock data that matches this shape exactly.

## Base URL
`http://localhost:8000` (local dev)

---

## 1. POST /vendors
Add a new vendor + order.

**Request body**
```json
{
  "vendor_name": "Acme Textiles",
  "contact_phone": "+92300xxxxxxx",
  "language_preference": "urdu",
  "order_id": "PO-1042",
  "deadline": "2026-09-25",
  "is_new_or_high_risk": false
}
```

**Response `201`**
```json
{
  "vendor_id": "uuid",
  "order_id": "PO-1042",
  "status": "created"
}
```

---

## 2. GET /vendors
List all vendors with current risk tier.

**Response `200`**
```json
[
  {
    "vendor_id": "uuid",
    "vendor_name": "Acme Textiles",
    "order_id": "PO-1042",
    "deadline": "2026-09-25",
    "risk_tier": 2,
    "risk_score": 47,
    "last_call_status": "picked_up",
    "alert_sent": false
  }
]
```

---

## 3. POST /call
Trigger a check-in call for a given vendor/order.

**Request body**
```json
{
  "vendor_id": "uuid",
  "order_id": "PO-1042"
}
```

**Response `202`**
```json
{
  "call_id": "uuid",
  "status": "queued"
}
```

---

## 4. GET /call-history?vendor_id=uuid
Return past call attempts + outcomes per vendor.

**Response `200`**
```json
[
  {
    "call_id": "uuid",
    "attempt_number": 1,
    "call_timestamp": "2026-08-22T14:03:00+05:00",
    "call_status": "picked_up",
    "call_duration_seconds": 245,
    "vendor_language_detected": "urdu",
    "delivery_status": "delay_likely",
    "confidence_score": 0.72,
    "risk_signals": ["material_shortage", "shipping_constraint"],
    "root_cause_analysis": { "primary": "raw_material_supply", "fixable": true },
    "recommendation": "expedite_partial_shipment"
  }
]
```

`call_status` enum: `no_answer | busy | voicemail | picked_up`

---

## 5. GET /dashboard
Summary counts for the dashboard widget.

**Response `200`**
```json
{
  "vendors_per_tier": { "0": 4, "1": 6, "2": 3, "3": 1, "4": 0 },
  "unreachable_count": 2,
  "escalations": 1
}
```

---

## Result Schema (result_extractor.py output — full object)

This is the canonical object stored in `calls` + `risk_scores` and consumed by
both the risk engine and the frontend. See PRD Section 5.

```json
{
  "call_id": "uuid",
  "vendor_id": "uuid",
  "order_id": "id",
  "call_timestamp": "iso8601",
  "call_duration_seconds": 245,
  "vendor_language_detected": "urdu",
  "delivery_status": "delay_likely",
  "delivery_estimate_revised": "2026-09-25",
  "confidence_score": 0.72,
  "risk_signals": ["material_shortage", "shipping_constraint"],
  "root_cause_analysis": { "primary": "raw_material_supply", "fixable": true },
  "recommendation": "expedite_partial_shipment",
  "call_transcript": "..."
}
```

## Risk Tiers

| Tier | Score  | Label      | Auto-Action |
|------|--------|------------|-------------|
| 0    | 0–20   | Confirmed  | No action, log only |
| 1    | 20–40  | Likely     | Notify, follow-up in 5 days |
| 2    | 40–60  | At Risk    | Alert procurement, suggest expedite |
| 3    | 60–80  | High Risk  | Escalate to manager, contingency planning |
| 4    | 80–100 | Critical   | Executive alert, contract clauses, backup supplier |

## Notes
- Enterprise Spec JSON is reference-only for field naming — never for scope/architecture.
- Track B: build mock data matching this exact shape so swapping to live API (Day 5) is a one-line change.

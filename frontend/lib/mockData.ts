// Mock data matching docs/apicontract.md exactly.
// Swap for real fetch() calls in lib/api.ts once the backend endpoints
// go live (Day 5 for vendors, Day 6 for call-history, Day 8 for dashboard).

export type Vendor = {
  vendor_id: string;
  vendor_name: string;
  order_id: string;
  deadline: string;
  risk_tier: 0 | 1 | 2 | 3 | 4;
  risk_score: number;
  last_call_status: "no_answer" | "busy" | "voicemail" | "picked_up" | null;
  alert_sent: boolean;
};

export type CallHistoryItem = {
  call_id: string;
  attempt_number: number;
  call_timestamp: string;
  call_status: "no_answer" | "busy" | "voicemail" | "picked_up";
  call_duration_seconds: number | null;
  vendor_language_detected: string | null;
  delivery_status: string | null;
  confidence_score: number | null;
  risk_signals: string[];
  root_cause_analysis: { primary: string; fixable: boolean } | null;
  recommendation: string | null;
};

export const mockVendors: Vendor[] = [
  {
    vendor_id: "v-001",
    vendor_name: "Acme Textiles",
    order_id: "PO-1042",
    deadline: "2026-09-25",
    risk_tier: 2,
    risk_score: 47,
    last_call_status: "picked_up",
    alert_sent: false,
  },
  {
    vendor_id: "v-002",
    vendor_name: "Karachi Steel Works",
    order_id: "PO-1043",
    deadline: "2026-09-05",
    risk_tier: 4,
    risk_score: 88,
    last_call_status: "no_answer",
    alert_sent: true,
  },
  {
    vendor_id: "v-003",
    vendor_name: "Lahore Packaging Co.",
    order_id: "PO-1044",
    deadline: "2026-10-01",
    risk_tier: 0,
    risk_score: 12,
    last_call_status: "picked_up",
    alert_sent: false,
  },
];

export const mockCallHistory: Record<string, CallHistoryItem[]> = {
  "v-001": [
    {
      call_id: "c-101",
      attempt_number: 1,
      call_timestamp: "2026-08-22T14:03:00+05:00",
      call_status: "picked_up",
      call_duration_seconds: 245,
      vendor_language_detected: "urdu",
      delivery_status: "delay_likely",
      confidence_score: 0.72,
      risk_signals: ["material_shortage", "shipping_constraint"],
      root_cause_analysis: { primary: "raw_material_supply", fixable: true },
      recommendation: "expedite_partial_shipment",
    },
  ],
};

export const mockDashboard = {
  vendors_per_tier: { "0": 4, "1": 6, "2": 3, "3": 1, "4": 0 },
  unreachable_count: 2,
  escalations: 1,
};

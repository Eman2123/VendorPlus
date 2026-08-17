// api.ts — thin fetch wrapper around the FastAPI backend.
// Start Day 4, swap mock data -> real calls Day 5+ (see docs/apicontract.md).

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function getVendors() {
  const res = await fetch(`${API_BASE}/vendors`);
  if (!res.ok) throw new Error("Failed to fetch vendors");
  return res.json();
}

export async function getCallHistory(vendorId: string) {
  const res = await fetch(`${API_BASE}/call-history?vendor_id=${vendorId}`);
  if (!res.ok) throw new Error("Failed to fetch call history");
  return res.json();
}

export async function getDashboard() {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error("Failed to fetch dashboard summary");
  return res.json();
}

export async function triggerCall(vendorId: string, orderId: string) {
  const res = await fetch(`${API_BASE}/call`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vendor_id: vendorId, order_id: orderId }),
  });
  if (!res.ok) throw new Error("Failed to trigger call");
  return res.json();
}

export async function createVendor(payload: {
  vendor_name: string;
  contact_phone: string;
  language_preference: string;
  order_id: string;
  deadline: string;
  is_new_or_high_risk: boolean;
}) {
  const res = await fetch(`${API_BASE}/vendors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create vendor");
  return res.json();
}

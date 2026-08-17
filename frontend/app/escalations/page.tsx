import { mockVendors } from "@/lib/mockData";
import RiskTierBadge from "@/components/RiskTierBadge";

// Day 8: escalation log page (tier 3/4 or unreachable_final vendors).
export default function EscalationsPage() {
  const escalated = mockVendors.filter(
    (v) => v.risk_tier >= 3 || v.last_call_status === "no_answer"
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Escalation Log</h2>
      <div className="space-y-2">
        {escalated.map((v) => (
          <div key={v.vendor_id} className="flex items-center justify-between rounded-lg border bg-white p-4">
            <p>{v.vendor_name} — {v.order_id}</p>
            <div className="flex items-center gap-3">
              <RiskTierBadge tier={v.risk_tier} />
              {v.alert_sent && <span className="text-xs text-green-600">✓ alert sent</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import RiskTierBadge from "./RiskTierBadge";
import CallStatusBadge from "./CallStatusBadge";
import type { Vendor } from "@/lib/mockData";

export default function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm">
      <div>
        <p className="font-medium">{vendor.vendor_name}</p>
        <p className="text-sm text-slate-500">
          {vendor.order_id} · due {vendor.deadline}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {vendor.last_call_status && (
          <CallStatusBadge status={vendor.last_call_status} />
        )}
        <RiskTierBadge tier={vendor.risk_tier} />
        {vendor.alert_sent && (
          <span className="text-xs text-green-600">✓ alert sent</span>
        )}
      </div>
    </div>
  );
}

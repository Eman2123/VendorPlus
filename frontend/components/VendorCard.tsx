import RiskTierBadge from "./RiskTierBadge";
import CallStatusBadge from "./CallStatusBadge";
import type { Vendor } from "@/lib/mockData";
import { Phone } from "lucide-react";

const TIER_BAR = ["bg-tier0", "bg-tier1", "bg-tier2", "bg-tier3", "bg-tier4"];

export default function VendorCard({
  vendor,
  onCheckIn,
  isCalling,
}: {
  vendor: Vendor;
  onCheckIn?: (vendor: Vendor) => void;
  isCalling?: boolean;
}) {
  return (
    <div className="flex items-stretch overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-ink-light">
      <div className={`w-1.5 shrink-0 ${TIER_BAR[vendor.risk_tier]}`} />
      <div className="flex flex-1 items-center justify-between p-4">
        <div>
          <p className="font-medium text-ink dark:text-slate-100">{vendor.vendor_name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {vendor.order_id} · due {vendor.deadline}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {vendor.last_call_status && <CallStatusBadge status={vendor.last_call_status} />}
          <RiskTierBadge tier={vendor.risk_tier} />
          {vendor.alert_sent && (
            <span className="text-xs text-green-600 dark:text-green-400">✓ alert sent</span>
          )}
          {onCheckIn && (
            <button
              onClick={() => onCheckIn(vendor)}
              disabled={isCalling}
              className="flex items-center gap-1.5 rounded-md border border-violet/30 px-2.5 py-1.5 text-xs font-medium text-violet hover:bg-violet/5 disabled:opacity-50 dark:border-violet/40 dark:text-violet dark:hover:bg-violet/10"
            >
              <Phone size={12} />
              {isCalling ? "Calling…" : "Check In"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import RiskTierBadge from "@/components/RiskTierBadge";
import ErrorBanner from "@/components/ErrorBanner";
import { getVendors } from "@/lib/api";
import type { Vendor } from "@/lib/mockData";

export default function EscalationsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getVendors()
      .then((data) => setVendors(data))
      .catch(() => setError("Couldn't reach the backend. Make sure the FastAPI server is running on :8000."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const escalated = vendors.filter((v) => v.risk_tier >= 3 || v.last_call_status === "unreachable");

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-200/60 dark:bg-white/5" />
          ))}
        </div>
      ) : escalated.length === 0 && !error ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-400 dark:border-white/10 dark:bg-ink-light">
          No escalations right now.
        </div>
      ) : (
        <div className="space-y-2">
          {escalated.map((v) => (
            <div
              key={v.vendor_id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-ink-light"
            >
              <p className="text-ink dark:text-slate-200">
                {v.vendor_name} — {v.order_id}
              </p>
              <div className="flex items-center gap-3">
                <RiskTierBadge tier={v.risk_tier} />
                {v.alert_sent && <span className="text-xs text-green-600 dark:text-green-400">✓ alert sent</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

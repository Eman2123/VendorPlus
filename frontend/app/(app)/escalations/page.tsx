"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import RiskTierBadge from "@/components/RiskTierBadge";
import ErrorBanner from "@/components/ErrorBanner";
import { getVendors } from "@/lib/api";
import type { Vendor } from "@/lib/mockData";
import { AlertTriangle, ShieldCheck, BellRing, Building2, ShieldAlert, PhoneOff } from "lucide-react";

function KpiCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number; accent: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-ink-light">
      <div 
        className="grid size-10 shrink-0 place-items-center rounded-lg" 
        style={{ backgroundColor: `${accent}1A`, color: accent }}
      >
        <Icon size={20} />
      </div>
      <div>
        <p className="font-serif text-2xl font-bold leading-none text-ink dark:text-white">{value}</p>
        <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
}

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

  const escalated = useMemo(() => {
    return vendors
      .filter((v) => v.risk_tier >= 3 || v.last_call_status === "unreachable")
      .sort((a, b) => b.risk_tier - a.risk_tier);
  }, [vendors]);

  const criticalCount = escalated.filter(v => v.risk_tier === 4).length;
  const highRiskCount = escalated.filter(v => v.risk_tier === 3).length;
  const unreachableCount = escalated.filter(v => v.last_call_status === "unreachable").length;

  const getBorderColor = (tier: number) => {
    if (tier === 4) return "#dc2626"; // Critical Red
    if (tier === 3) return "#f97316"; // High Risk Orange
    return "#64748b"; // Unreachable Gray
  };

  return (
    <div className="space-y-6">
      {/* Custom CSS for Premium Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideInUp { animation: slideInUp 0.4s ease-out forwards; opacity: 0; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        `
      }} />

      {/* ERROR BANNER */}
      {error && <ErrorBanner message={error} onRetry={load} />}

      {/* KPI ROW */}
      {!loading && !error && escalated.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard icon={AlertTriangle} label="Critical Risk" value={criticalCount} accent="#dc2626" />
          <KpiCard icon={ShieldAlert} label="High Risk" value={highRiskCount} accent="#f97316" />
          <KpiCard icon={PhoneOff} label="Unreachable" value={unreachableCount} accent="#64748b" />
        </div>
      )}

      {/* MAIN CONTENT */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-ink-light">
              <div className="size-10 animate-pulse rounded-lg bg-slate-200 dark:bg-white/5"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/4 animate-pulse rounded bg-slate-200 dark:bg-white/5"></div>
                <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-white/5"></div>
              </div>
              <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-white/5"></div>
            </div>
          ))}
        </div>
      ) : escalated.length === 0 && !error ? (
        /* Empty State - All Clear */
        <div className="animate-fadeIn flex flex-col items-center justify-center gap-4 rounded-xl border border-slate-200 bg-white py-20 text-center shadow-sm dark:border-white/10 dark:bg-ink-light">
          <div className="relative grid size-20 place-items-center rounded-2xl bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400">
            <ShieldCheck size={40} />
            <span className="absolute -right-1 -top-1 flex size-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex size-4 rounded-full bg-green-500"></span>
            </span>
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-ink dark:text-white">All Clear!</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">No vendors require immediate attention right now.</p>
          </div>
        </div>
      ) : (
        /* Escalation Cards List */
        <div className="space-y-4">
          {escalated.map((v, idx) => {
            const borderColor = getBorderColor(v.risk_tier);
            return (
              <div
                key={v.vendor_id}
                className="animate-slideInUp relative flex flex-col gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md dark:border-white/10 dark:bg-ink-light sm:flex-row sm:items-center"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                {/* Left Priority Color Bar */}
                <div 
                  className="absolute left-0 top-0 h-full w-1.5" 
                  style={{ backgroundColor: borderColor }}
                ></div>

                {/* Icon & Vendor Info */}
                <div className="flex flex-1 items-center gap-4 sm:pl-3">
                  <div 
                    className="grid size-11 shrink-0 place-items-center rounded-xl" 
                    style={{ backgroundColor: `${borderColor}1A`, color: borderColor }}
                  >
                    <AlertTriangle size={22} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif text-base font-bold text-ink dark:text-white">{v.vendor_name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Building2 size={12} /> {v.order_id}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">|</span>
                      <span className="capitalize">{v.last_call_status || "pending"}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Badges */}
                <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4 dark:border-white/5 sm:justify-end sm:border-0 sm:pt-0 sm:pl-3">
                  <RiskTierBadge tier={v.risk_tier} />
                  
                  {v.alert_sent && (
                    <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700 dark:bg-green-500/10 dark:text-green-400">
                      <BellRing size={12} />
                      Alert Sent
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
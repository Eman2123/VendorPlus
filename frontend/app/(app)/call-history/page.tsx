"use client";

import { useEffect, useState, useCallback } from "react";
import CallStatusBadge from "@/components/CallStatusBadge";
import ErrorBanner from "@/components/ErrorBanner";
import { getVendors, getCallHistory } from "@/lib/api";
import type { Vendor, CallHistoryItem } from "@/lib/mockData";
import {
  Building2, 
  ChevronDown, 
  Phone, 
  Clock,
  MessageSquare,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

export default function CallHistoryPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [history, setHistory] = useState<CallHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVendors = useCallback(() => {
    setError(null);
    getVendors()
      .then((data) => {
        setVendors(data);
        if (data.length > 0) setSelectedId((prev) => prev || data[0].vendor_id);
      })
      .catch(() => setError("Couldn't reach the backend. Make sure the FastAPI server is running on :8000."));
  }, []);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  useEffect(() => {
    if (!selectedId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getCallHistory(selectedId)
      .then((data) => setHistory(data))
      .catch(() => setError("Couldn't load call history for this vendor."))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const selectedVendor = vendors.find(v => v.vendor_id === selectedId);

  return (
    <div className="space-y-6">
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

      {error && <ErrorBanner message={error} onRetry={loadVendors} />}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        
        {/* LEFT PANEL: Vendor Selection */}
        <div className="lg:sticky lg:top-6 lg:h-fit">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-ink-light">
            <div className="border-b border-slate-100 p-4 dark:border-white/5">
              <h3 className="text-sm font-bold text-ink dark:text-white">Select Vendor</h3>
            </div>
            {/* Desktop List */}
            <div className="hidden max-h-[60vh] space-y-1 overflow-y-auto p-2 lg:block">
              {vendors.map((v) => (
                <button
                  key={v.vendor_id}
                  onClick={() => setSelectedId(v.vendor_id)}
                  className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all ${
                    selectedId === v.vendor_id 
                      ? "bg-violet/10 shadow-sm ring-1 ring-violet/30" 
                      : "hover:bg-slate-50 dark:hover:bg-white/5"
                  }`}
                >
                  <div className={`grid size-9 shrink-0 place-items-center rounded-lg ${
                    selectedId === v.vendor_id ? "bg-violet text-white" : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"
                  }`}>
                    <Building2 size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-semibold ${selectedId === v.vendor_id ? "text-violet" : "text-ink dark:text-white"}`}>{v.vendor_name}</p>
                    <p className="truncate text-xs text-slate-400">{v.order_id}</p>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Mobile Dropdown */}
            <div className="relative p-2 lg:hidden">
              <Building2 size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                disabled={vendors.length === 0}
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-10 text-sm font-medium text-ink outline-none transition-colors focus:border-violet dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                {vendors.length === 0 && <option>No vendors</option>}
                {vendors.map((v) => (
                  <option key={v.vendor_id} value={v.vendor_id}>{v.vendor_name}</option>
                ))}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Timeline & History */}
        <div className="space-y-4">
          
          {/* Vendor Info Header Card */}
          {selectedVendor && (
            <div className="animate-fadeIn flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-ink-light">
              <div className="grid size-12 place-items-center rounded-xl bg-violet/10 text-violet">
                <Building2 size={24} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-ink dark:text-white">{selectedVendor.vendor_name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Order ID: {selectedVendor.order_id}</p>
              </div>
            </div>
          )}

          {/* Timeline Area */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-ink-light">
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="size-4 animate-pulse rounded-full bg-slate-200 dark:bg-white/10"></div>
                      <div className="h-full w-0.5 animate-pulse bg-slate-200 dark:bg-white/10"></div>
                    </div>
                    <div className="h-24 w-full animate-pulse rounded-lg bg-slate-200/60 dark:bg-white/5"></div>
                  </div>
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="animate-fadeIn flex flex-col items-center justify-center gap-3 py-16 text-center text-slate-400 dark:text-slate-500">
                <div className="grid size-16 place-items-center rounded-2xl bg-slate-100 dark:bg-white/5">
                  <Phone size={28} className="rotate-[135deg] text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No calls yet</p>
                <p className="text-xs">Trigger a call from the Vendors page to see it here.</p>
              </div>
            ) : (
              <div className="relative space-y-8">
                {/* Vertical Line */}
                <div className="absolute left-[7px] top-2 h-full w-0.5 bg-slate-200 dark:bg-white/10"></div>
                
                {/* Timeline Items */}
                {history.map((c, idx) => {
                  const succeeded = c.call_status === "picked_up";
                  const unreachable = c.call_status === "unreachable" || c.call_status === "failed" || c.call_status === "no_answer";
                  const dotColor = succeeded ? "bg-tier0" : unreachable ? "bg-tier4" : "bg-violet";

                  return (
                    <div 
                      key={c.call_id} 
                      className="animate-slideInUp relative flex gap-6"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      {/* Timeline Node */}
                      <div className={`relative z-10 mt-1 grid size-4 shrink-0 place-items-center rounded-full ring-4 ring-white dark:ring-ink-light ${dotColor}`}>
                        {succeeded && (
                          <span className="absolute h-full w-full rounded-full bg-tier0 opacity-40 animate-ping"></span>
                        )}
                      </div>
                      
                      {/* Content Card */}
                      <div className="group flex-1 rounded-xl border border-slate-100 bg-slate-50/50 p-5 transition-all duration-300 hover:border-slate-200 hover:shadow-md dark:border-white/5 dark:bg-white/5 dark:hover:border-white/10">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                              <Clock size={12} /> Attempt #{c.attempt_number}
                            </span>
                            <CallStatusBadge status={c.call_status} />
                          </div>
                        </div>
                        
                        <div className="grid gap-4 sm:grid-cols-2">
                          {/* Delivery Status */}
                          <div className="space-y-1">
                            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                              <MessageSquare size={12} /> Delivery Status
                            </p>
                            <p className="text-sm font-medium text-ink dark:text-white">
                              {c.delivery_status || "Not Recorded"}
                            </p>
                          </div>

                          {/* Confidence Score */}
                          <div className="space-y-1">
                            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                              <TrendingUp size={12} /> Confidence
                            </p>
                            {c.confidence_score !== null && c.confidence_score !== undefined ? (
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                                  <div 
                                    className="h-full rounded-full bg-violet" 
                                    style={{ width: `${c.confidence_score}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-bold text-ink dark:text-white">{c.confidence_score}%</span>
                              </div>
                            ) : (
                              <p className="text-sm text-slate-400">—</p>
                            )}
                          </div>
                        </div>

                        {/* Recommendation */}
                        {c.recommendation && (
                          <div className="mt-4 border-t border-slate-200 pt-4 dark:border-white/10">
                            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                              <ShieldCheck size={12} /> AI Recommendation
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">{c.recommendation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
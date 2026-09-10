"use client";

import { useEffect, useState, useCallback } from "react";
import CallStatusBadge from "@/components/CallStatusBadge";
import ErrorBanner from "@/components/ErrorBanner";
import { getVendors, getCallHistory } from "@/lib/api";
import type { Vendor, CallHistoryItem } from "@/lib/mockData";

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          disabled={vendors.length === 0}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm dark:border-white/10 dark:bg-ink-light dark:text-slate-100"
        >
          {vendors.length === 0 && <option>No vendors</option>}
          {vendors.map((v) => (
            <option key={v.vendor_id} value={v.vendor_id}>
              {v.vendor_name}
            </option>
          ))}
        </select>
      </div>

      {error && <ErrorBanner message={error} onRetry={loadVendors} />}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-ink-light">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 dark:border-white/10 dark:text-slate-400">
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Delivery Status</th>
              <th className="px-4 py-2">Confidence</th>
              <th className="px-4 py-2">Recommendation</th>
            </tr>
          </thead>
          <tbody className="text-ink dark:text-slate-300">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            ) : history.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  No calls yet for this vendor.
                </td>
              </tr>
            ) : (
              history.map((c) => (
                <tr key={c.call_id} className="border-b border-slate-100 last:border-0 dark:border-white/5">
                  <td className="px-4 py-2">{c.attempt_number}</td>
                  <td className="px-4 py-2">
                    <CallStatusBadge status={c.call_status} />
                  </td>
                  <td className="px-4 py-2">{c.delivery_status ?? "—"}</td>
                  <td className="px-4 py-2">{c.confidence_score ?? "—"}</td>
                  <td className="px-4 py-2">{c.recommendation ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

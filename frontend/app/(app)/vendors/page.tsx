"use client";

import { useEffect, useState, useCallback } from "react";
import VendorCard from "@/components/VendorCard";
import AddVendorForm from "@/components/AddVendorForm";
import ErrorBanner from "@/components/ErrorBanner";
import { getVendors, triggerCall } from "@/lib/api";
import type { Vendor } from "@/lib/mockData";
import { Plus, Download } from "lucide-react";

export default function VendorListPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [callingId, setCallingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getVendors()
      .then((data) => setVendors(data))
      .catch(() =>
        setError("Couldn't reach the backend. Make sure the FastAPI server is running on :8000.")
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCheckIn(vendor: Vendor) {
    setCallingId(vendor.vendor_id);
    try {
      await triggerCall(vendor.vendor_id, vendor.order_id);
      load();
    } catch {
      setError("Call couldn't be triggered — check the backend logs.");
    } finally {
      setCallingId(null);
    }
  }

  function handleExportCsv() {
    const headers = ["vendor_id", "vendor_name", "order_id", "deadline", "risk_tier", "risk_score", "last_call_status", "alert_sent"];
    const csv = [headers.join(","), ...vendors.map((v: any) => headers.map((h) => v[h]).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "vendorpulse_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={handleExportCsv}
          disabled={vendors.length === 0}
          className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-ink hover:bg-slate-50 disabled:opacity-40 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
        >
          <Download size={14} /> Export CSV
        </button>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 rounded-md bg-violet px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-dark"
        >
          <Plus size={14} /> Add Vendor
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[68px] animate-pulse rounded-lg bg-slate-200/60 dark:bg-white/5" />
          ))}
        </div>
      ) : vendors.length === 0 && !error ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-400 dark:border-white/10 dark:bg-ink-light">
          No vendors yet. Add your first vendor to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {vendors.map((v) => (
            <VendorCard
              key={v.vendor_id}
              vendor={v}
              onCheckIn={handleCheckIn}
              isCalling={callingId === v.vendor_id}
            />
          ))}
        </div>
      )}

      {showAddForm && (
        <AddVendorForm onClose={() => setShowAddForm(false)} onCreated={load} />
      )}
    </div>
  );
}

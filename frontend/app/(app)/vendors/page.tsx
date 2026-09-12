"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import ErrorBanner from "@/components/ErrorBanner";
// Make sure to import updateVendor & deleteVendor from your api file
import { getVendors, triggerCall, updateVendor, deleteVendor } from "@/lib/api"; 
import type { Vendor } from "@/lib/mockData";
import {
  Plus,
  Download,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  AlertTriangle,
  Phone,
  Building2,
  Calendar,
  Activity,
  ShieldCheck,
} from "lucide-react";
import AddVendorForm from "@/components/AddVendorForm";

const TIER_LABELS = ["Confirmed", "Likely", "At Risk", "High Risk", "Critical"];
const TIER_COLORS = ["#16a34a", "#84cc16", "#eab308", "#f97316", "#dc2626"];
const CALL_STATUSES = ["pending", "completed", "unreachable", "failed"];

export default function VendorListPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [callingId, setCallingId] = useState<string | null>(null);
  
  // States for Edit, Delete, and Search
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [deletingVendor, setDeletingVendor] = useState<Vendor | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Handle Edit Save (Updates local state and calls API)
  const handleSaveEdit = async () => {
    if (!editingVendor) return;
    setIsProcessing(true);
    try {
      await updateVendor(editingVendor.vendor_id, editingVendor);
      setVendors((prev) =>
        prev.map((v) => (v.vendor_id === editingVendor.vendor_id ? editingVendor : v))
      );
      setEditingVendor(null);
    } catch {
      setError("Failed to update vendor. Check backend logs.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Delete (Updates local state and calls API)
  const handleConfirmDelete = async () => {
    if (!deletingVendor) return;
    setIsProcessing(true);
    try {
      await deleteVendor(deletingVendor.vendor_id);
      setVendors((prev) => prev.filter((v) => v.vendor_id !== deletingVendor.vendor_id));
      setDeletingVendor(null);
    } catch {
      setError("Failed to delete vendor. Check backend logs.");
    } finally {
      setIsProcessing(false);
    }
  };

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

  // Filter logic for search
  const filteredVendors = useMemo(() => {
    if (!searchQuery) return vendors;
    return vendors.filter(v => 
      v.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      v.order_id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [vendors, searchQuery]);

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        `
      }} />

      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={vendors.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition-all hover:bg-accent-dark"
          >
            <Plus size={16} /> Add Vendor
          </button>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && <ErrorBanner message={error} onRetry={load} />}

      {/* MAIN TABLE CARD */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-ink-light">
        {/* Search Bar Header */}
        <div className="border-b border-slate-100 p-4 dark:border-white/5">
          <div className="relative w-full sm:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search vendor or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-accent dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-2 p-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-200/60 dark:bg-white/5" />
            ))}
          </div>
        ) : vendors.length === 0 && !error ? (
          <div className="p-12 text-center text-sm text-slate-400">
            No vendors yet. Click "Add Vendor" to get started.
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500 dark:border-white/5 dark:bg-white/5 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Vendor Name</th>
                  <th className="px-6 py-4 font-semibold">Order ID</th>
                  <th className="px-6 py-4 font-semibold">Risk Tier</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      No vendors found matching "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((v) => (
                  <tr key={v.vendor_id} className="group transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-medium text-ink dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-lg bg-accent/10 text-accent">
                          <Building2 size={15} />
                        </div>
                        {v.vendor_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{v.order_id}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium`} style={{ backgroundColor: `${TIER_COLORS[v.risk_tier] || '#64748b'}20`, color: TIER_COLORS[v.risk_tier] || '#64748b' }}>
                        Tier {v.risk_tier}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        v.last_call_status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                        v.last_call_status === 'unreachable' ? 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                      }`}>
                        <span className={`size-1.5 rounded-full ${
                          v.last_call_status === 'completed' ? 'bg-green-500' :
                          v.last_call_status === 'unreachable' ? 'bg-slate-400' :
                          'bg-blue-500'
                        }`}/>
                        {v.last_call_status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleCheckIn(v)}
                          disabled={callingId === v.vendor_id}
                          className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-violet transition-colors hover:bg-violet/5 disabled:opacity-50 dark:hover:bg-violet/10"
                          title="Trigger Call"
                        >
                          <Phone size={14} className={callingId === v.vendor_id ? "animate-pulse" : ""}/>
                        </button>
                        <button
                          onClick={() => setEditingVendor(v)}
                          className="grid size-8 place-items-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-blue-400"
                          title="Edit Vendor"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingVendor(v)}
                          className="grid size-8 place-items-center rounded-md text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                          title="Delete Vendor"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD VENDOR MODAL */}
      {showAddForm && (
        <AddVendorForm onClose={() => setShowAddForm(false)} onCreated={load} />
      )}

      {/* EDIT MODAL - With All Fields */}
      {editingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-ink-light animate-scaleIn">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-ink dark:text-white">Edit Vendor Details</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">ID: {editingVendor.vendor_id}</p>
              </div>
              <button 
                onClick={() => setEditingVendor(null)} 
                className="grid size-8 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Vendor Name */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Vendor Name</label>
                <input
                  type="text"
                  value={editingVendor.vendor_name || ""}
                  onChange={(e) => setEditingVendor({ ...editingVendor, vendor_name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              {/* Order ID */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Order ID</label>
                <input
                  type="text"
                  value={editingVendor.order_id || ""}
                  onChange={(e) => setEditingVendor({ ...editingVendor, order_id: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Phone Number</label>
                <input
                  type="tel"
                  value={editingVendor.contact_phone || ""}
                  onChange={(e) => setEditingVendor({ ...editingVendor, contact_phone: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Deadline</label>
                <input
                  type="date"
                  value={editingVendor.deadline ? new Date(editingVendor.deadline).toISOString().split('T')[0] : ""}
                  onChange={(e) => setEditingVendor({ ...editingVendor, deadline: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              {/* Risk Score */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Risk Score (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingVendor.risk_score || 0}
                  onChange={(e) => setEditingVendor({ ...editingVendor, risk_score: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              {/* Risk Tier */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Risk Tier</label>
                <select
                  value={editingVendor.risk_tier}
                  onChange={(e) => setEditingVendor({ ...editingVendor, risk_tier: Number(e.target.value) as Vendor["risk_tier"] })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  {TIER_LABELS.map((label, idx) => (
                    <option key={idx} value={idx}>{label} (Tier {idx})</option>
                  ))}
                </select>
              </div>

              {/* Last Call Status */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Call Status</label>
                <select
                  value={editingVendor.last_call_status || "pending"}
                  onChange={(e) =>
                    setEditingVendor({
                      ...editingVendor,
                      last_call_status: (e.target.value === "pending" ? null : e.target.value) as Vendor["last_call_status"],
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  {CALL_STATUSES.map(status => (
                    <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Alert Sent */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Alert Sent</label>
                <button
                  onClick={() => setEditingVendor({ ...editingVendor, alert_sent: !editingVendor.alert_sent })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editingVendor.alert_sent ? 'bg-accent' : 'bg-slate-300 dark:bg-white/10'}`}
                >
                  <span className={`inline-block size-4 transform rounded-full bg-white transition-transform ${editingVendor.alert_sent ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setEditingVendor(null)}
                disabled={isProcessing}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isProcessing}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition-all hover:bg-accent-dark disabled:opacity-50"
              >
                {isProcessing ? "Saving..." : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-ink-light animate-scaleIn">
            <div className="mb-6 flex items-start gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-ink dark:text-white">Delete Vendor?</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Are you sure you want to remove <span className="font-semibold text-ink dark:text-white">{deletingVendor.vendor_name}</span>? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setDeletingVendor(null)}
                disabled={isProcessing}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isProcessing}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/30 transition-all hover:bg-red-700 disabled:opacity-50"
              >
                {isProcessing ? "Deleting..." : <><Trash2 size={16} /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

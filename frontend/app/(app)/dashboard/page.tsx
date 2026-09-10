"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import ErrorBanner from "@/components/ErrorBanner";
import RiskTierBadge from "@/components/RiskTierBadge";
// Make sure to add deleteVendor & updateVendor in your @/lib/api file
import { getVendors, triggerCall, deleteVendor, updateVendor } from "@/lib/api"; 
import type { Vendor } from "@/lib/mockData";
import {
  Building2,
  ShieldAlert,
  PhoneOff,
  Phone,
  Pencil,
  Trash2,
  X,
  Save,
  AlertTriangle,
  Search,
} from "lucide-react";

const TIER_LABELS = ["Confirmed", "Likely", "At Risk", "High Risk", "Critical"];
const TIER_BG = ["bg-tier0", "bg-tier1", "bg-tier2", "bg-tier3", "bg-tier4"];
const TIER_TEXT = ["text-tier0", "text-tier1", "text-tier2", "text-tier3", "text-tier4"];
const TIER_COLORS = ["#16a34a", "#84cc16", "#eab308", "#f97316", "#dc2626"];

function KpiCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number; accent: string }) {
  return (
    <div className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-ink-light dark:hover:border-white/20">
      <div 
        className="grid size-12 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110" 
        style={{ backgroundColor: `${accent}1A`, color: accent }}
      >
        <Icon size={22} strokeWidth={2} />
      </div>
      <div>
        <p className="font-serif text-3xl font-bold leading-none text-ink dark:text-white">{value}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callingId, setCallingId] = useState<string | null>(null);

  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [deletingVendor, setDeletingVendor] = useState<Vendor | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // For modal loading state
  
  const [searchQuery, setSearchQuery] = useState("");

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

  // API Call for Edit
  const handleSaveEdit = async () => {
    if (!editingVendor) return;
    setIsProcessing(true);
    try {
      // Call backend to update vendor
      await updateVendor(editingVendor.vendor_id, editingVendor);
      // Update local state
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

  // API Call for Delete
  const handleConfirmDelete = async () => {
    if (!deletingVendor) return;
    setIsProcessing(true);
    try {
      // Call backend to delete vendor
      await deleteVendor(deletingVendor.vendor_id);
      // Remove from local state
      setVendors((prev) => prev.filter((v) => v.vendor_id !== deletingVendor.vendor_id));
      setDeletingVendor(null);
    } catch {
      setError("Failed to delete vendor. Check backend logs.");
    } finally {
      setIsProcessing(false);
    }
  };

  const vendorsPerTier = useMemo(() => {
    const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    vendors.forEach((v) => (counts[v.risk_tier] += 1));
    return counts;
  }, [vendors]);

  const unreachableCount = vendors.filter((v) => v.last_call_status === "unreachable").length;
  const escalations = vendors.filter((v) => v.risk_tier >= 3).length;
  const needsAttention = vendors
    .filter((v) => v.risk_tier >= 3 || v.last_call_status === "unreachable")
    .slice(0, 5);

  const filteredVendors = useMemo(() => {
    if (!searchQuery) return vendors;
    return vendors.filter(v => 
      v.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      v.order_id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [vendors, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200/60 dark:bg-white/5" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="h-48 animate-pulse rounded-xl bg-slate-200/60 dark:bg-white/5 lg:col-span-3" />
          <div className="h-48 animate-pulse rounded-xl bg-slate-200/60 dark:bg-white/5 lg:col-span-2" />
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-slate-200/60 dark:bg-white/5" />
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={load} />;
  }

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        `
      }} />

      {/* KPI ROW */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard icon={Building2} label="Total Vendors" value={vendors.length} accent="#6640b2" />
        <KpiCard icon={ShieldAlert} label="Escalations" value={escalations} accent="#dc2626" />
        <KpiCard icon={PhoneOff} label="Unreachable" value={unreachableCount} accent="#64748b" />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* RISK DISTRIBUTION - Improved UI */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-ink-light lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-ink dark:text-white">Risk Distribution</h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-white/5 dark:text-slate-400">
              {vendors.length} vendor{vendors.length === 1 ? "" : "s"} scored
            </span>
          </div>

          {vendors.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No vendors scored yet.</p>
          ) : (
            <>
              <div className="mb-6 flex h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                {TIER_LABELS.map((label, idx) => {
                  const count = vendorsPerTier[idx] || 0;
                  return count > 0 ? (
                    <div
                      key={idx}
                      className="h-full transition-all duration-500 ease-out"
                      style={{ width: `${(count / vendors.length) * 100}%`, backgroundColor: TIER_COLORS[idx] }}
                      title={`Tier ${idx}: ${count}`}
                    />
                  ) : null;
                })}
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                {TIER_LABELS.map((label, idx) => {
                  const count = vendorsPerTier[idx] || 0;
                  const percentage = vendors.length > 0 ? Math.round((count / vendors.length) * 100) : 0;
                  return (
                    <div key={idx} className="flex items-center gap-2.5">
                      <span className={`size-3 shrink-0 rounded-full`} style={{ backgroundColor: TIER_COLORS[idx] }} />
                      <div>
                        <p className="text-base font-bold text-ink dark:text-white">{count}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          T{idx} · {percentage}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* NEEDS ATTENTION */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-ink-light lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-ink dark:text-white">Needs Attention</h3>
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          {needsAttention.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Nothing needs attention right now.</p>
          ) : (
            <div className="space-y-3">
              {needsAttention.map((v) => (
                <div key={v.vendor_id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-white/5 dark:bg-white/5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink dark:text-slate-100">{v.vendor_name}</p>
                    <div className="mt-1">
                      <RiskTierBadge tier={v.risk_tier} />
                    </div>
                  </div>
                  <button
                    onClick={() => handleCheckIn(v)}
                    disabled={callingId === v.vendor_id}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-violet/30 px-3 py-1.5 text-xs font-semibold text-violet transition-colors hover:bg-violet/5 disabled:opacity-50 dark:border-violet/40 dark:hover:bg-violet/10"
                  >
                    <Phone size={12} />
                    {callingId === v.vendor_id ? "Calling..." : "Check In"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ALL VENDORS TABLE */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-ink-light">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-ink dark:text-white">All Vendors</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage and trigger calls for your vendors.</p>
          </div>
          
          <div className="relative w-full sm:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search vendor or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-accent dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
        </div>
        
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
                  <td className="px-6 py-4">
                    <RiskTierBadge tier={v.risk_tier} />
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
      </div>

      {/* EDIT MODAL */}
      {editingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-ink-light animate-scaleIn">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-ink dark:text-white">Edit Vendor</h3>
              <button 
                onClick={() => setEditingVendor(null)} 
                className="grid size-8 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Vendor Name</label>
                <input
                  type="text"
                  value={editingVendor.vendor_name}
                  onChange={(e) => setEditingVendor({ ...editingVendor, vendor_name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Risk Tier</label>
                <select
                  value={editingVendor.risk_tier}
                  onChange={(e) => setEditingVendor({ ...editingVendor, risk_tier: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  {TIER_LABELS.map((label, idx) => (
                    <option key={idx} value={idx}>{label} (Tier {idx})</option>
                  ))}
                </select>
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
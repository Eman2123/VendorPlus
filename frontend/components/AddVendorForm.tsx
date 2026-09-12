"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createVendor } from "@/lib/api";

export default function AddVendorForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    vendor_name: "",
    contact_phone: "",
    language_preference: "english",
    order_id: "",
    deadline: "",
    is_new_or_high_risk: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createVendor(form);
      onCreated();
      onClose();
    } catch (err) {
      setError("Couldn't reach the backend. Is the FastAPI server running on :8000?");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-ink-light">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-ink dark:text-white">Add Vendor</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-ink dark:hover:text-white">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            placeholder="Vendor name"
            value={form.vendor_name}
            onChange={(e) => setForm({ ...form, vendor_name: e.target.value })}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-ink dark:text-slate-100"
          />
          <input
            placeholder="Contact phone (+92...)"
            value={form.contact_phone}
            onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-ink dark:text-slate-100"
          />
          <input
            required
            placeholder="Order ID (e.g. PO-1045)"
            value={form.order_id}
            onChange={(e) => setForm({ ...form, order_id: e.target.value })}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-ink dark:text-slate-100"
          />
          <input
            required
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-ink dark:text-slate-100"
          />
          <select
            value={form.language_preference}
            onChange={(e) => setForm({ ...form, language_preference: e.target.value })}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-ink dark:text-slate-100"
          >
            <option value="english">English</option>
            <option value="urdu">Urdu</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={form.is_new_or_high_risk}
              onChange={(e) => setForm({ ...form, is_new_or_high_risk: e.target.checked })}
            />
            New / high-risk vendor
          </label>
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-violet py-2 text-sm font-medium text-white hover:bg-violet-dark disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save Vendor"}
          </button>
        </form>
      </div>
    </div>
  );
}

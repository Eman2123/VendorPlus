import { mockDashboard } from "@/lib/mockData";

// Day 7-8: dashboard summary widget. Swap to getDashboard() Day 8.
export default function DashboardPage() {
  const { vendors_per_tier, unreachable_count, escalations } = mockDashboard;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Dashboard</h2>
      <div className="grid grid-cols-5 gap-3">
        {Object.entries(vendors_per_tier).map(([tier, count]) => (
          <div key={tier} className="rounded-lg border bg-white p-4 text-center">
            <p className="text-2xl font-semibold">{count}</p>
            <p className="text-xs text-slate-500">Tier {tier}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-4 text-sm">
        <p>Unreachable: <span className="font-medium">{unreachable_count}</span></p>
        <p>Escalations: <span className="font-medium">{escalations}</span></p>
      </div>
      <button className="rounded-md border px-3 py-1.5 text-sm">Export CSV</button>
    </div>
  );
}

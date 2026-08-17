import CallStatusBadge from "@/components/CallStatusBadge";
import { mockCallHistory } from "@/lib/mockData";

// Day 3-4: builds against mockCallHistory. Day 6: swap to getCallHistory().
export default function CallHistoryPage() {
  const history = mockCallHistory["v-001"] ?? [];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Call History — Acme Textiles</h2>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b text-slate-500">
            <th className="py-2">#</th>
            <th>Status</th>
            <th>Delivery Status</th>
            <th>Confidence</th>
            <th>Recommendation</th>
          </tr>
        </thead>
        <tbody>
          {history.map((c) => (
            <tr key={c.call_id} className="border-b">
              <td className="py-2">{c.attempt_number}</td>
              <td><CallStatusBadge status={c.call_status} /></td>
              <td>{c.delivery_status ?? "—"}</td>
              <td>{c.confidence_score ?? "—"}</td>
              <td>{c.recommendation ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

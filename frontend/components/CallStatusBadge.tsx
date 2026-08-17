type CallStatus = "no_answer" | "busy" | "voicemail" | "picked_up";

const STATUS_STYLES: Record<CallStatus, string> = {
  picked_up: "bg-green-50 text-green-700 border-green-300",
  no_answer: "bg-slate-100 text-slate-600 border-slate-300",
  busy: "bg-yellow-50 text-yellow-700 border-yellow-300",
  voicemail: "bg-blue-50 text-blue-700 border-blue-300",
};

const STATUS_LABELS: Record<CallStatus, string> = {
  picked_up: "Reached",
  no_answer: "No Answer",
  busy: "Busy",
  voicemail: "Voicemail",
};

export default function CallStatusBadge({ status }: { status: CallStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

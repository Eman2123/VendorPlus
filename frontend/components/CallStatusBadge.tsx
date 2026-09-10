type CallStatus =
  | "no_answer"
  | "busy"
  | "voicemail"
  | "picked_up"
  | "not_called"
  | "unreachable"
  | "failed"
  | "in_progress";

const STATUS_STYLES: Record<CallStatus, string> = {
  picked_up: "bg-green-50 text-green-700 border-green-300 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30",
  no_answer: "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  busy: "bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/30",
  voicemail: "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
  not_called: "bg-slate-50 text-slate-400 border-slate-200 dark:bg-white/5 dark:text-slate-500 dark:border-white/10",
  unreachable: "bg-red-50 text-red-700 border-red-300 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30",
  failed: "bg-red-50 text-red-700 border-red-300 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30",
  in_progress: "bg-violet/10 text-violet border-violet/30 animate-pulse",
};

const STATUS_LABELS: Record<CallStatus, string> = {
  picked_up: "Reached",
  no_answer: "No Answer",
  busy: "Busy",
  voicemail: "Voicemail",
  not_called: "Not Called",
  unreachable: "Unreachable",
  failed: "Call Failed",
  in_progress: "Calling…",
};

export default function CallStatusBadge({ status }: { status: CallStatus }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.not_called;
  const label = STATUS_LABELS[status] ?? status;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}

import { RefreshCcw } from "lucide-react";

export default function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
      <span>{message}</span>
      <button onClick={onRetry} className="flex items-center gap-1.5 font-medium hover:underline">
        <RefreshCcw size={13} /> Retry
      </button>
    </div>
  );
}

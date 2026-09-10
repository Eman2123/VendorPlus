"use client";

import { usePathname } from "next/navigation";
import { Search, Bell } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const PAGES: Record<string, { title: string; subtitle: string }> = {
  "/vendors": { title: "Vendors", subtitle: "Manage your vendor list and trigger check-in calls" },
  "/dashboard": { title: "Dashboard", subtitle: "Risk overview across all vendors" },
  "/call-history": { title: "Call History", subtitle: "Review past check-in call outcomes" },
  "/escalations": { title: "Escalation Log", subtitle: "Vendors that need immediate attention" },
};

export default function Topbar() {
  const pathname = usePathname();
  const page = PAGES[pathname ?? ""] ?? { title: "VendorPulse", subtitle: "" };

  return (
    <header className="sticky top-0 z-10 -mx-8 mb-6 border-b border-slate-200 bg-paper/90 px-8 py-4 backdrop-blur dark:border-white/10 dark:bg-ink/90">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-ink dark:text-white">{page.title}</h1>
          {page.subtitle && <p className="mt-0.5 text-sm text-slate-400">{page.subtitle}</p>}
        </div>
        <div className="flex items-center gap-1">
          <label className="relative hidden sm:block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={15} />
            </span>
            <input
              placeholder="Search…"
              className="w-56 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 dark:border-white/10 dark:bg-ink-light dark:text-slate-100"
            />
          </label>
          <div className="mx-1 hidden h-6 w-px bg-slate-200 dark:bg-white/10 sm:block" />
          <button className="rounded-md p-2 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-white/10" aria-label="Notifications">
            <Bell size={17} />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

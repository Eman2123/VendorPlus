"use client";

import { usePathname } from "next/navigation";
import { Search, Bell } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const PAGES: Record<string, { title: string; subtitle: string }> = {
  "/vendors": { title: "Vendor Management", subtitle: "Manage your vendor list and trigger autonomous calls" },
  "/dashboard": { title: "Dashboard Overview", subtitle: "Risk distribution and high-level metrics" },
  "/call-history": { title: "Call History", subtitle: "Review past check-in call outcomes & transcripts" },
  "/escalations": { title: "Escalation Center", subtitle: "Vendors that need immediate attention" },
};

export default function Topbar() {
  const pathname = usePathname();
  const page = PAGES[pathname ?? ""] ?? { title: "VendorPulse", subtitle: "Autonomous Vendor Risk Platform" };

  return (
    <header className="sticky top-0 z-30 -mx-4 mb-8 border-b border-slate-200/70 bg-paper/70 px-4 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-ink/70 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left Side: Page Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-xl font-bold tracking-tight text-ink dark:text-white sm:text-2xl">
              {page.title}
            </h1>
          </div>
          {page.subtitle && (
            <p className="mt-1 hidden truncate text-sm text-slate-500 dark:text-slate-400 sm:block">
              {page.subtitle}
            </p>
          )}
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Premium Pill-shaped Search Bar */}
          <div className="relative hidden md:block">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={16} />
            </span>
            <input
              placeholder="Search vendors..."
              className="w-56 rounded-full border border-slate-200 bg-white/80 py-2 pl-9 pr-4 text-sm text-ink outline-none transition-all placeholder:text-slate-400 focus:w-64 focus:border-accent focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-accent dark:focus:bg-white/10"
            />
          </div>

          {/* Grouped Action Icons (Glass Capsule) */}
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 p-1 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
            
            {/* Notification Bell with Pulsing Dot */}
            <button
              className="relative grid size-9 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex size-2.5 rounded-full bg-accent"></span>
              </span>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>

          {/* User Profile Avatar */}
          <button 
            className="hidden size-9 place-items-center rounded-full bg-gradient-to-br from-accent to-violet text-xs font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-105 sm:grid" 
            aria-label="User Profile"
          >
            VP
          </button>

        </div>
      </div>
    </header>
  );
}
"use client";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

const PAGES: Record<string, { title: string; subtitle: string }> = {
  "/vendors": { title: "Vendors", subtitle: "Manage your vendor list and trigger check-in calls" },
  "/dashboard": { title: "Dashboard", subtitle: "Risk overview across all vendors" },
  "/call-history": { title: "Call History", subtitle: "Review past check-in call outcomes" },
  "/escalations": { title: "Escalation Log", subtitle: "Vendors that need immediate attention" },
};

// Modern spring-like easing curve
const ease = [0.22, 1, 0.36, 1];

export default function Topbar() {
  const pathname = usePathname();
  const page = PAGES[pathname ?? ""] ?? { title: "VendorPulse", subtitle: "" };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease }}
      className="sticky top-0 z-30 -mx-4 mb-8 px-4 py-4 backdrop-blur-xl sm:-mx-8 sm:px-8"
    >
      {/* Glassmorphism background and ultra-modern subtle bottom border */}
      <div className="pointer-events-none absolute inset-0 -z-10 border-b border-slate-200/60 bg-paper/70 dark:border-white/5 dark:bg-ink/70" />
      
      <div className="flex items-center justify-between gap-6">
        
        {/* === STYLED TITLE & SUBTITLE SECTION === */}
        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={page.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease }}
              className="flex items-start gap-4"
            >
              {/* Glowing Gradient Accent Bar */}
              <div className="mt-1 h-12 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
              
              <div className="min-w-0">
                {/* Gradient Title for attraction */}
                <h1 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent dark:from-indigo-400 dark:to-purple-300 sm:text-3xl">
                  {page.title}
                </h1>
                
                {/* Subtitle with better contrast and styling */}
                {page.subtitle && (
                  <p className="mt-1.5 truncate text-sm font-medium text-slate-600 dark:text-slate-300">
                    {page.subtitle}
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        {/* === END STYLED SECTION === */}


        <div className="flex items-center gap-3">
          {/* Modern Pill-Shaped Search Bar */}
          <div className="group relative hidden sm:block">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400">
              <Search size={16} />
            </span>
            <input
              placeholder="Search…"
              className="w-56 rounded-full border border-slate-200/80 bg-slate-100/50 py-2.5 pl-10 pr-12 text-sm text-ink placeholder:text-slate-400 transition-all duration-300 focus:w-72 focus:border-indigo-500/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/10 dark:focus:border-indigo-400/50"
            />
            {/* Keyboard shortcut hint */}
            <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-slate-200/80 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:border-white/10 dark:bg-white/10 dark:text-slate-400 md:flex">
              ⌘K
            </kbd>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
}
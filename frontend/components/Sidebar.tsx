"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  LayoutDashboard,
  History,
  ShieldAlert,
  ChevronFirst,
  ChevronLast,
  Radio,
} from "lucide-react";

const items = [
  { href: "/vendors", label: "Vendors", icon: Building2 },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/call-history", label: "Call History", icon: History },
  { href: "/escalations", label: "Escalations", icon: ShieldAlert },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  return (
    <aside
      className={`flex shrink-0 flex-col bg-navy text-white transition-[width] duration-300 ${
        open ? "w-56" : "w-[72px]"
      }`}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-5">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-md bg-violet">
            <Radio size={15} />
          </div>
          <span className={`${open ? "block" : "hidden"} text-sm font-semibold tracking-tight`}>
            VendorPulse
          </span>
        </div>
        <button
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
        >
          {open ? <ChevronFirst size={16} /> : <ChevronLast size={16} />}
        </button>
      </div>

      <nav className="mt-4 flex-1 px-3">
        <p className={`${open ? "block" : "hidden"} px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-white/30`}>
          Navigation
        </p>
        <ul className="flex flex-col gap-0.5">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname?.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    active ? "bg-violet text-white font-medium" : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={17} />
                  <span className={open ? "block" : "hidden"}>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className={`flex items-center gap-2.5 rounded-lg p-2 ${open ? "hover:bg-white/5" : "justify-center"}`}>
          <div className="grid size-8 shrink-0 place-items-center rounded-full bg-violet/30 text-sm font-semibold text-white">
            O
          </div>
          {open && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">Owner</p>
              <p className="flex items-center gap-1.5 text-[11px] text-white/40">
                <span className="size-1.5 rounded-full bg-emerald-400" /> All systems operational
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

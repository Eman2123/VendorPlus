"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const FAQS = [
  {
    q: "How does VendorPulse contact vendors?",
    a: "It places an autonomous voice call through the CALL-E voice agent, running an adaptive check-in script that branches on hesitation, an explicit delay, a new/high-risk vendor, or a language mismatch.",
  },
  {
    q: "Is the risk score AI-generated or rule-based?",
    a: "Rule-based. Every score comes from a transparent 5-factor model (delivery confidence, variance, benchmark, macro, behavioral) mapped to Risk Tier 0–4 — no ML black box to explain.",
  },
  {
    q: "What happens when a vendor can't be reached?",
    a: "The retry manager attempts the call up to 3 times, logs the outcome of each attempt, and flags the vendor as unreachable once retries are exhausted — triggering an escalation alert automatically.",
  },
  {
    q: "Which languages are supported?",
    a: "English and Urdu out of the box, plus one additional configurable language. The system detects a mismatch mid-call and switches automatically.",
  },
  {
    q: "Can I export vendor and call data?",
    a: "Yes — a CSV export of the current vendor list is available directly from the Vendors page.",
  },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-2xl divide-y divide-slate-200 dark:divide-white/10">
      {FAQS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="py-4">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <span className="font-serif text-base font-bold text-ink dark:text-white">{item.q}</span>
              <Plus
                size={18}
                className={`shrink-0 text-accent transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-out ${
                isOpen ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <p className="overflow-hidden text-sm leading-relaxed text-slate-500 dark:text-slate-400">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

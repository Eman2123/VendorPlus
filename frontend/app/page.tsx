"use client"; 
import Link from "next/link";
import Head from "next/head";
import TiltCard from "@/components/TiltCard";
import Reveal from "@/components/Reveal";
import FaqAccordion from "@/components/FaqAccordion";
import {
  Phone,
  ShieldCheck,
  BarChart3,
  Bell,
  ArrowRight,
  Radio,
  PhoneCall,
  Cpu,
  Building2,
  Check,
  X,
  Zap,
  Target,
  Github,
  Sun,
  Moon,
} from "lucide-react";
import { useState } from "react";

const FEATURES = [
  { n: "01", icon: Zap, title: "Autonomous Voice Check-ins", desc: "CALL-E calls every vendor on schedule, runs an adaptive script, and adapts to hesitation, delay, or language switch mid-call.", highlight: "Always on schedule" },
  { n: "02", icon: Target, title: "5-Factor Risk Scoring", desc: "Every call is scored on delivery confidence, variance, benchmark, macro, and behavioral signals — mapped to transparent Tier 0-4.", highlight: "Rule-based, explainable" },
  { n: "03", icon: Bell, title: "Automatic Escalation", desc: "High-risk vendors and unreachable calls trigger email/webhook alerts and land in the escalation log automatically.", highlight: "Zero manual work" },
  { n: "04", icon: ShieldCheck, title: "No Black Box Logic", desc: "Every risk tier and recommendation traces back to a rule you can read and explain to a judge.", highlight: "Fully auditable" },
];

const PROCESS_STEPS = [
  { icon: PhoneCall, title: "Call", desc: "CALL-E dials the vendor and runs the adaptive check-in script.", detail: "Handles language switches and real hesitation detection" },
  { icon: BarChart3, title: "Extract & Score", desc: "The transcript is parsed into structured result and scored on 5 rule-based factors.", detail: "Delivery confidence, variance, benchmark, macro, behavior" },
  { icon: Bell, title: "Escalate", desc: "High-risk or unreachable vendors trigger an alert and land in the escalation log.", detail: "Instant email/webhook alerts to your team" },
];

const BENEFITS = [
  { title: "vs Manual Chase", old: "Emails and follow-up calls ad hoc", new: "Scheduled autonomous voice check-ins every time" },
  { title: "vs Late Detection", old: "Delays discovered only after they happen", new: "Risk flagged before the deadline slips" },
  { title: "vs Inconsistency", old: "No consistent way to score risk", new: "Transparent 5-factor scoring applied same way" },
  { title: "vs Forgotten Tasks", old: "Escalation depends on someone remembering", new: "Automatic email/webhook escalation instantly" },
];

const PREVIEW_ROWS = [
  { name: "Meridian Textiles", tier: 2, color: "#eab308", confidence: 65 },
  { name: "Halcyon Steel Works", tier: 4, color: "#dc2626", confidence: 25 },
  { name: "Vantage Packaging Co.", tier: 0, color: "#16a34a", confidence: 92 },
];

const STATS = [
  { value: "3", label: "Languages", subtext: "English, Urdu" },
  { value: "5", label: "Risk Factors", subtext: "Fully transparent" },
  { value: "<3min", label: "Per Call", subtext: "Average duration" },
];

const STACK = ["Next.js", "FastAPI", "PostgreSQL", "CALL-E SDK", "Tailwind CSS"];

export default function LandingPage() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle('dark');
      setIsDark(!isDark);
    }
  };

  return (
    <>
      {/* Next.js Head for Robots Meta Tag */}
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="relative min-h-screen bg-paper text-ink dark:bg-ink dark:text-white overflow-x-hidden scroll-smooth selection:bg-accent/20 selection:text-accent">
        
        {/* CSS for Dual Theme Glassmorphism & Grid (Cleaned up 3D) */}
        <style dangerouslySetInnerHTML={{
          __html: `
          html { scroll-behavior: smooth; }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
          .dark ::-webkit-scrollbar-thumb { background: #334155; }
          
          /* Grid Background */
          .grid-bg {
            background-image: radial-gradient(circle at 1px 1px, rgba(100, 116, 139, 0.15) 1px, transparent 0);
            background-size: 32px 32px;
            mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, #000 70%, transparent 100%);
          }
          .dark .grid-bg {
            background-image: radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0);
          }

          /* Glass Cards - Light & Dark Split */
          .glass-card {
            background: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(226, 232, 240, 0.8);
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
          }
          .dark .glass-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
          }
          .glass-card:hover {
            border-color: rgba(100, 116, 139, 0.3);
          }
          .dark .glass-card:hover {
            border-color: rgba(255, 255, 255, 0.15);
          }
          `
        }} />

        {/* Background Ambient Orbs */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-accent/10 dark:bg-accent/20 blur-[120px]" />
          <div className="absolute top-1/3 right-0 h-[400px] w-[400px] rounded-full bg-blue-400/10 dark:bg-blue-500/10 blur-[120px]" />
        </div>

        {/* NAV - Floating Glass Pill with GitHub & Theme Toggle */}
        <header className="fixed top-4 left-1/2 z-50 w-[95%] max-w-6xl -translate-x-1/2">
          <nav className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/70 p-3 pl-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-ink-light/50">
            <Link href="/" className="group flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-lg bg-accent text-white shadow-md shadow-accent/30 transition-transform group-hover:scale-110">
                <Radio size={14} />
              </div>
              <span className="font-serif text-lg font-bold tracking-tight text-ink dark:text-white">VendorPulse</span>
            </Link>
            
            <div className="hidden items-center gap-8 md:flex">
              <Link href="#how-it-works" className="text-sm font-medium text-slate-600 transition-colors hover:text-ink dark:text-slate-400 dark:hover:text-white">Process</Link>
              <Link href="#features" className="text-sm font-medium text-slate-600 transition-colors hover:text-ink dark:text-slate-400 dark:hover:text-white">Features</Link>
              <Link href="#faq" className="text-sm font-medium text-slate-600 transition-colors hover:text-ink dark:text-slate-400 dark:hover:text-white">FAQ</Link>
            </div>

            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme} 
                className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-all hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* GitHub Link */}
              <Link
                href="https://github.com/Eman2123/VendorPlus"
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-all hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                aria-label="GitHub Repository"
              >
                <Github size={16} />
              </Link>

              {/* Dashboard Button */}
              <Link
                href="/vendors"
                className="flex items-center gap-1.5 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 dark:bg-white dark:text-ink"
              >
                Dashboard <ArrowRight size={14} />
              </Link>
            </div>
          </nav>
        </header>

        {/* HERO - Clean, Flat & Premium (No Extreme 3D) */}
        <section className="relative z-10 overflow-hidden px-6 pb-24 pt-36 sm:px-10 sm:pb-32 sm:pt-44">
          <div className="absolute inset-0 grid-bg opacity-80 dark:opacity-40" aria-hidden />

          <div className="relative mx-auto max-w-7xl">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              {/* Left: Copy */}
              <div className="text-center lg:text-left">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-4 py-1.5 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex size-2 rounded-full bg-accent"></span>
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-widest text-accent">Vendor Risk Intelligence</p>
                </div>

                <h1 className="text-balance font-serif text-5xl font-bold leading-[1.05] tracking-tight text-ink dark:text-white sm:text-6xl lg:text-7xl">
                  Vendor delays,<br />
                  caught <span className="relative inline-block text-accent">
                    before they happen.
                    <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 200 10" fill="none">
                      <path d="M2 7.5C50 2.5 150 2.5 198 7.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </span>
                </h1>

                <p className="mx-auto mt-7 max-w-lg text-lg text-slate-600 dark:text-slate-400 lg:mx-0">
                  Autonomous phone calls to your suppliers, real-time understanding, and auto-escalation. Replace endless manual follow-ups with AI-driven intelligence.
                </p>

                <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                  <Link
                    href="/vendors"
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-accent/30 transition-all hover:scale-105 hover:bg-accent-dark sm:w-auto"
                  >
                    Get Started Now <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="#how-it-works"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white/50 px-8 py-4 text-sm font-semibold text-ink backdrop-blur-sm transition-all hover:scale-105 hover:bg-white dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:w-auto"
                  >
                    See How It Works
                  </Link>
                </div>

                <div className="mx-auto mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-slate-200 pt-8 dark:border-white/10 lg:mx-0">
                  {STATS.map((stat, i) => (
                    <div key={i} className="text-center lg:text-left">
                      <p className="font-serif text-3xl font-bold text-ink dark:text-white">{stat.value}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">{stat.label}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{stat.subtext}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Clean & Professional Dashboard Preview */}
              <div className="relative hidden lg:block">
                <TiltCard className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/50 transition-transform duration-300 hover:-translate-y-2 dark:border-white/10 dark:bg-ink-light dark:shadow-black/50">
                  {/* Browser UI */}
                  <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-3 backdrop-blur-sm dark:border-white/5 dark:bg-white/5">
                    <span className="size-3 rounded-full bg-red-400/80" />
                    <span className="size-3 rounded-full bg-yellow-400/80" />
                    <span className="size-3 rounded-full bg-green-400/80" />
                    <span className="ml-3 text-xs font-medium text-slate-400">vendorpulse.app/vendors</span>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 sm:p-8">
                    <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-6 dark:border-white/5">
                      <div>
                        <h3 className="text-lg font-bold text-ink dark:text-white">Vendor Monitor</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Real-time risk assessment</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-accent">{PREVIEW_ROWS.length}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Active Vendors</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                      {PREVIEW_ROWS.map((v) => (
                        <div key={v.name} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-slate-100/50 dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/[0.07]">
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="grid size-9 place-items-center rounded-lg bg-accent/10 text-accent">
                                <Building2 size={16} />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-ink dark:text-white">{v.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Monitored every 48h</p>
                              </div>
                            </div>
                            <span
                              className="rounded-full px-3 py-1 text-xs font-bold shadow-sm"
                              style={{ backgroundColor: `${v.color}20`, color: v.color, border: `1px solid ${v.color}40` }}
                            >
                              Tier {v.tier}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                              <div className="h-full rounded-full bg-gradient-to-r from-accent to-orange-400" style={{ width: `${v.confidence}%` }} />
                            </div>
                            <span className="w-10 text-right text-xs font-semibold text-slate-500 dark:text-slate-400">{v.confidence}%</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 pt-6 dark:border-white/5">
                      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Risk Distribution</p>
                      <div className="flex h-3 gap-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                        <div className="flex-1" style={{ backgroundColor: "#16a34a" }} />
                        <div className="flex-1" style={{ backgroundColor: "#eab308" }} />
                        <div className="flex-1" style={{ backgroundColor: "#dc2626" }} />
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="relative z-10 px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <div className="mb-6 flex items-center justify-center gap-3">
                <div className="h-px w-8 bg-accent/40" />
                <p className="text-xs font-semibold uppercase tracking-widest text-accent">Process</p>
                <div className="h-px w-8 bg-accent/40" />
              </div>
              <h2 className="text-balance font-serif text-4xl font-bold tracking-tight text-ink dark:text-white sm:text-5xl">
                How it works
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
                Three simple steps to automated vendor intelligence
              </p>
            </div>

            <div className="relative grid gap-12 sm:grid-cols-3">
              <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-white/10 sm:block" />
              
              {PROCESS_STEPS.map(({ icon: Icon, title, desc, detail }, i) => (
                <Reveal key={title} delay={i * 150} className="relative text-center">
                  <div className="relative z-10 mx-auto mb-6 grid size-14 place-items-center rounded-2xl border border-slate-200 bg-white text-accent shadow-xl transition-transform hover:scale-110 dark:border-white/10 dark:bg-ink-light dark:shadow-black/30">
                    <div className="absolute inset-0 rounded-2xl bg-accent/10 blur-md"></div>
                    <Icon size={24} strokeWidth={1.5} className="relative z-10" />
                  </div>
                  <h3 className="mb-3 font-serif text-xl font-bold text-ink dark:text-white">
                    {i + 1}. {title}
                  </h3>
                  <p className="mx-auto max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400 mb-3">
                    {desc}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                    {detail}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES - Premium Glass Bento Grid */}
        <section id="features" className="relative z-10 px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <div className="mb-6 flex items-center justify-center gap-3">
                <div className="h-px w-8 bg-accent/40" />
                <p className="text-xs font-semibold uppercase tracking-widest text-accent">Features</p>
                <div className="h-px w-8 bg-accent/40" />
              </div>
              <h2 className="text-balance font-serif text-4xl font-bold tracking-tight text-ink dark:text-white sm:text-5xl">
                Everything you need
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {FEATURES.map(({ n, icon: Icon, title, desc, highlight }, i) => (
                <Reveal key={title} delay={i * 100} className="group relative">
                  <div className="glass-card relative h-full overflow-hidden rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2">
                    {/* Hover Glow Effect */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    
                    <div className="relative mb-6 flex items-start justify-between">
                      <div className="grid size-12 place-items-center rounded-xl bg-accent/10 text-accent transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                        <Icon size={24} strokeWidth={1.5} />
                      </div>
                      <span className="font-serif text-5xl font-bold text-slate-200 transition-colors dark:text-white/5 group-hover:text-accent/10 dark:group-hover:text-accent/10">{n}</span>
                    </div>
                    
                    <h3 className="relative mb-2 font-serif text-xl font-bold text-ink dark:text-white">
                      {title}
                    </h3>
                    <p className="relative mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {desc}
                    </p>
                    <div className="relative border-t border-slate-200/50 pt-4 dark:border-white/10">
                      <p className="text-xs font-bold text-accent">✓ {highlight}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* MANUAL VS AUTOMATED */}
        <section className="relative z-10 px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <h2 className="text-balance font-serif text-4xl font-bold tracking-tight text-ink dark:text-white sm:text-5xl">
                Before & After
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {BENEFITS.map((benefit, i) => (
                <Reveal key={benefit.title} delay={i * 100}>
                  <div className="glass-card relative h-full space-y-6 overflow-hidden rounded-2xl p-8 transition-all hover:-translate-y-1">
                    <h4 className="relative text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      {benefit.title}
                    </h4>
                    <div className="relative space-y-4">
                      <div className="flex gap-3 text-sm text-slate-500 line-through decoration-red-500/50 dark:text-slate-500">
                        <X size={18} className="mt-0.5 shrink-0 text-red-500/70" />
                        <span>{benefit.old}</span>
                      </div>
                      <div className="flex gap-3 text-sm font-medium text-ink dark:text-white">
                        <Check size={18} className="mt-0.5 shrink-0 text-accent" />
                        <span>{benefit.new}</span>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* TECH STACK */}
        <section className="relative z-10 px-6 py-16 sm:px-10">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Built with Modern Tech
          </p>
          <Reveal className="flex flex-wrap items-center justify-center gap-4">
            {STACK.map((s) => (
              <span
                key={s}
                className="cursor-default rounded-full border border-slate-200 bg-white/50 px-5 py-2 text-sm font-medium text-slate-600 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-accent/30 hover:text-accent dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
              >
                {s}
              </span>
            ))}
          </Reveal>
        </section>

        {/* FAQ */}
        <section id="faq" className="relative z-10 px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-12 text-center font-serif text-4xl font-bold tracking-tight text-ink dark:text-white sm:text-5xl">
              Questions?
            </h2>
            <Reveal>
              <FaqAccordion />
            </Reveal>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative z-10 overflow-hidden px-6 py-32 text-center sm:px-10">
          <div className="absolute inset-0 grid-bg opacity-40 dark:opacity-20" />
          <div aria-hidden className="pointer-events-none absolute -bottom-40 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-accent/10 dark:bg-accent/20 blur-[120px]" />
          
          <Reveal className="relative">
            <h2 className="mx-auto max-w-2xl text-balance font-serif text-4xl font-bold leading-tight tracking-tight text-ink dark:text-white sm:text-5xl">
              Stop chasing vendors manually. <br/> Let CALL-E do the calling.
            </h2>
            <Link
              href="/vendors"
              className="mt-10 inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-accent/30 transition-all hover:scale-105 hover:bg-accent-dark"
            >
              Get Started Now <ArrowRight size={16} />
            </Link>
          </Reveal>
        </section>

        {/* FOOTER - Cleaned up (No Socials) */}
        <footer className="relative z-10 border-t border-slate-200 bg-paper dark:border-white/5 dark:bg-ink-light">
          <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div>
                <Link href="/" className="flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded-md bg-accent text-white">
                    <Radio size={14} />
                  </div>
                  <span className="font-serif text-lg font-bold text-ink dark:text-white">VendorPulse</span>
                </Link>
                <p className="mt-4 max-w-xs text-sm text-slate-500 dark:text-slate-400">
                  Autonomous AI-driven vendor risk monitoring and escalation platform.
                </p>
              </div>
              
              <div>
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Product</h3>
                <ul className="space-y-3 text-sm">
                  <li><Link href="#features" className="text-slate-600 transition-colors hover:text-accent dark:text-slate-400">Features</Link></li>
                  <li><Link href="#how-it-works" className="text-slate-600 transition-colors hover:text-accent dark:text-slate-400">How it Works</Link></li>
                  <li><Link href="/dashboard" className="text-slate-600 transition-colors hover:text-accent dark:text-slate-400">Dashboard</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Company</h3>
                <ul className="space-y-3 text-sm">
                  <li><Link href="/about" className="text-slate-600 transition-colors hover:text-accent dark:text-slate-400">About Us</Link></li>
                  <li><Link href="/contact" className="text-slate-600 transition-colors hover:text-accent dark:text-slate-400">Contact</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-white/10 sm:flex-row">
              <p className="text-xs text-slate-400 dark:text-slate-500">© {new Date().getFullYear()} VendorPulse. All rights reserved.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Powered by CALL-E AI</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Ship, Brain, FileText, Headphones, Shield, Activity,
  ChevronDown, ChevronRight, CheckCircle, AlertCircle, TrendingUp,
  Globe, Zap, Lock, ArrowRight,
  MessageCircle, Clock, Calendar, RefreshCw
} from 'lucide-react';

const QRCodeSVG = dynamic(() => import('qrcode.react').then(m => m.QRCodeSVG), { ssr: false });

const APP_URL = 'https://minoan-lines.vercel.app';

// ─── Data ────────────────────────────────────────────────────────────────────

const TIMELINE = [
  {
    period: 'Month 1–2', title: 'Compliance pilot — get inside the building',
    color: '#16a34a', textColor: 'text-green-400',
    desc: 'Module 3 deployed. EU ETS and FuelEU automation live. Michalis sees real results on real data. Trust is earned, not pitched. This is not a sale — it is a proof.',
    pricing: '€2,500 setup + €800/mo',
  },
  {
    period: 'Month 3–4', title: 'IT Helpdesk — become Michalis\'s personal relief',
    color: '#2563eb', textColor: 'text-blue-400',
    desc: 'Module 4 deployed. Michalis\'s team gets time back. He becomes your internal champion because you solved his most personal pain. He starts talking about you in management meetings.',
    pricing: '+ €5,000 setup + €900/mo',
  },
  {
    period: 'Month 5–6', title: 'Vessel dashboard — make operations visible',
    color: '#7c3aed', textColor: 'text-purple-400',
    desc: 'Module 1 deployed. Senior management and the operations team now have a live fleet view. You are no longer just Michalis\'s vendor — you are on the radar of the CEO and COO.',
    pricing: '+ €3,000 setup + €800/mo',
  },
  {
    period: 'Month 7–9', title: 'Customer support + forecasting — touch the revenue line',
    color: '#C9A84C', textColor: 'text-amber-400',
    desc: 'Modules 2 and 5 deployed. Now you are not just saving cost — you are protecting and growing revenue. Customer satisfaction improves. Demand forecasting influences pricing and capacity decisions. The CFO notices.',
    pricing: '+ €20,000 setup + €2,500/mo',
  },
  {
    period: 'Year 2', title: 'Annual review + contract renewal — lock in the retainer',
    color: '#C9A84C', textColor: 'text-amber-400',
    desc: 'Present a formal annual review with ROI metrics. Show exactly what each module saved, how much compliance cost was avoided, how many IT hours were recovered. Make the renewal a no-brainer with data.',
    pricing: 'Full platform retainer: €5,400/mo locked',
    highlight: true,
  },
  {
    period: 'Year 2–3', title: 'Heraklion Port Authority — the second contract',
    color: '#0891b2', textColor: 'text-cyan-400',
    desc: 'Minoan Lines acquired Heraklion Port Authority in September 2024. Same relationship, separate contract. Port operations automation, vessel arrival management, cargo processing. A natural expansion you propose proactively.',
    pricing: 'Separate contract: est. €15K–€30K/yr',
  },
  {
    period: 'Year 3–5', title: 'Grimaldi Group — the billion-dollar door',
    color: '#dc2626', textColor: 'text-red-400',
    desc: 'Minoan Lines is your case study. You approach Grimaldi Group directly — 50+ vessels, operations across Italy, Spain, North Africa, Baltic. Minoan becomes Module 0 of a group-wide AI automation rollout.',
    pricing: 'Group contract potential: €200K–€500K/yr',
  },
  {
    period: 'Year 5–10', title: 'Maritime sector authority — your niche is locked',
    color: '#6b7280', textColor: 'text-gray-400',
    desc: 'Grimaldi + Minoan + Heraklion Port gives you 3 maritime case studies with measurable ROI. You become the go-to AI automation firm for European ferry and RoPax operators. Mediterranean, Adriatic, Baltic. This is your sector.',
    pricing: 'Sector revenue potential: €1M+ ARR',
  },
];

const PRICING = [
  {
    tag: 'Start here — recommended',
    tagColor: 'bg-red-600',
    title: 'Compliance Pilot',
    subtitle: 'Module 3 fast-start. EU ETS and FuelEU Maritime automation live within 2 weeks. Zero disruption to your team.',
    setup: '€2,500',
    monthly: '€800/mo',
    highlight: false,
    includesLabel: 'INCLUDES',
    items: [
      'Automated vessel emissions data collection',
      'FuelEU compliance balance dashboard',
      'EU ETS allowance reporting',
      'ATHEX PDF report generation',
      'Grimaldi Group monthly report',
      'Full IT team handover + documentation',
    ],
  },
  {
    tag: 'Most complete',
    tagColor: 'bg-blue-600',
    title: 'Core Platform',
    subtitle: 'Modules 3 + 4 deployed together. Compliance automation and IT helpdesk triage — both live within 4 weeks.',
    setup: '€9,500',
    monthly: '€1,700/mo',
    highlight: true,
    includesLabel: 'EVERYTHING IN PILOT, PLUS',
    items: [
      'AI IT ticket classification + SLA tracking',
      'Automated ticket routing across 318 staff',
      'Live IT performance dashboard for management',
      'Vessel crew ticket prioritisation',
      'Monthly IT performance report — automated',
      'Priority support SLA — 4hr response',
    ],
  },
  {
    tag: 'Full platform',
    tagColor: 'bg-slate-600',
    title: 'Full Platform',
    subtitle: 'All 5 modules. The complete IntegraMind AI intelligence layer for Minoan Lines. Phased over 3 months.',
    setup: '€34K–€52K',
    monthly: '€5,400/mo',
    highlight: false,
    includesLabel: 'ALL 5 MODULES',
    items: [
      'Vessel ops dashboard + AIS + delay prediction',
      'AI customer support agent — Greek + English',
      'Full compliance + reporting automation',
      'IT helpdesk triage + SLA tracking',
      'Demand forecasting + revenue intelligence',
      'Dedicated account manager',
    ],
  },
];

const RETAINER_ITEMS = [
  'All 5 modules — maintained, monitored, continuously improved',
  'Monthly ROI report delivered to Michalis and management',
  'Quarterly strategic review — what to build next',
  'Proactive regulatory monitoring — FuelEU, ETS, IMO updates flagged automatically',
  'Priority support — 2-hour response SLA, 24/7 for critical issues',
  'Annual platform upgrade — one new feature or module per year included',
  'Dedicated account manager — Sandy or Nnamdi as named contacts',
];

const CLIENT_NEEDS = [
  { step: '1', title: 'One signed pilot agreement', desc: 'One page. No legal back-and-forth required. Standard service agreement.' },
  { step: '2', title: 'One IT contact for 1-hour onboarding call', desc: 'We handle all setup. We just need one person to confirm data access for compliance inputs.' },
  { step: '3', title: 'That\'s it', desc: 'No IT project. No procurement process. No server provisioning. We deploy on our infrastructure — you access a live platform.' },
];

const QA = [
  { q: 'We are in a very busy period with many projects ongoing.', a: 'I know — and that is exactly why the compliance pilot is designed to take zero time from your team. I do the implementation. You review the output. Two weeks. That is all I need from you.' },
  { q: 'We already have systems handling some of this.', a: 'That is good to hear. Can you tell me which parts? Because what I have built does not replace your existing systems — it sits on top of them and automates the data collection and reporting layer that those systems still leave manual.' },
  { q: 'We need to involve procurement / legal / management.', a: 'Absolutely — and the pilot is designed to give you something concrete to show them. Rather than approving a concept, they will be approving results. Let me show you the output first.' },
  { q: 'What about data security and GDPR?', a: 'Critical question — and I am glad you raised it. The platform is built on EU-hosted infrastructure. All passenger data stays within your own systems. The AI layer processes operational and compliance data only — no PII is ever exposed to external systems.' },
  { q: 'We would need to present this to Grimaldi Group.', a: 'That is actually an opportunity I welcome. The compliance automation module was designed with the Grimaldi Group reporting structure in mind — automated consolidated reports going up the chain. Minoan Lines becomes the proof of concept for the whole group.' },
  { q: 'How is this different from what big vendors offer?', a: 'The big vendors sell you a platform and then charge you six figures to configure it for your fleet. What you have here is already configured, already running, already generating your EU ETS reports. The difference is six months and €200,000 in implementation costs — saved.' },
];

// ─── Component helpers ────────────────────────────────────────────────────────

function SectionLabel({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="h-px w-8 bg-[#C9A84C]" />
      <span className={`text-[#C9A84C] text-xs font-semibold uppercase tracking-widest ${light ? 'opacity-80' : ''}`}>{children}</span>
    </div>
  );
}

function TimeBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 text-blue-200 text-xs font-medium px-3 py-1 rounded-full">
      <Clock className="w-3 h-3" /> {label}
    </span>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const [openQA, setOpenQA] = useState<number | null>(null);
  const [openPhase, setOpenPhase] = useState<number | null>(null);

  return (
    <div className="min-h-screen font-sans bg-[#0a0f1e] text-white">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #060d1f 0%, #001A4D 50%, #003087 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(ellipse at 15% 85%, rgba(201,168,76,0.08) 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(0,71,204,0.15) 0%, transparent 55%)' }} />
        <div className="max-w-5xl mx-auto px-6 py-20 relative">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-12">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs font-semibold tracking-wide">LIVE IN PRODUCTION — APRIL 2026</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
                The Intelligence Layer<br />
                <span style={{ color: '#C9A84C' }}>Minoan Lines</span> Needed.
              </h1>
              <p className="text-blue-200 text-lg leading-relaxed mb-3 max-w-xl">
                Built. Deployed. Generating compliance reports in 60 seconds.
              </p>
              <p className="text-blue-300/70 text-sm mb-8 max-w-xl">
                This is a 30-minute conversation — not a sales pitch. The platform is live. You can scan the code and use it right now.
              </p>

              {/* Agenda */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
                {[
                  { t: '0–5 min', l: 'What\'s live' },
                  { t: '5–15 min', l: 'Live demo' },
                  { t: '15–25 min', l: 'The roadmap' },
                  { t: '25–30 min', l: 'The decision' },
                ].map(({ t, l }) => (
                  <div key={t} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-center">
                    <div className="text-[#C9A84C] text-xs font-bold">{t}</div>
                    <div className="text-white text-xs mt-0.5">{l}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <a href={APP_URL} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                  style={{ background: '#C9A84C', color: '#001A4D' }}>
                  <Zap className="w-4 h-4" /> Open Live Platform
                </a>
                <a href="#offer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-white/8 text-white border border-white/20 hover:bg-white/15 transition-all">
                  See the Offer <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* QR */}
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <div className="bg-white rounded-2xl p-4 shadow-2xl shadow-blue-900/30">
                <QRCodeSVG value={APP_URL} size={148} fgColor="#001A4D" bgColor="#ffffff" />
              </div>
              <p className="text-blue-200 text-xs text-center font-medium">Scan — open on your phone now</p>
              <p className="text-blue-300/50 text-xs font-mono">{APP_URL}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE MINDSET ─────────────────────────────────────────────────── */}
      <section className="py-10 border-b border-white/5" style={{ background: '#0d1529' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start gap-6 bg-white/4 border border-white/10 rounded-2xl p-6 md:p-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-white font-bold text-lg leading-snug">You are not selling software.<br />You are becoming their infrastructure.</span>
                <span className="flex-shrink-0 bg-[#C9A84C]/20 border border-[#C9A84C]/30 text-[#C9A84C] text-xs font-semibold px-2.5 py-1 rounded-full">core mindset</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-5">
                Lifetime clients do not happen because the product is good. They happen because replacing you becomes more painful than keeping you. Your goal is to become so deeply embedded in Minoan&apos;s operations — their compliance data, their IT workflows, their passenger systems — that switching you out would mean rebuilding from scratch. That is not a trap. That is the natural result of genuine value delivered consistently over time.
              </p>
              <blockquote className="border-l-4 border-[#C9A84C] pl-4 py-1">
                <p className="text-blue-100 text-sm italic leading-relaxed">
                  &quot;Mr. Orfanoudakis, we are not here to deliver a project and move on. We want to be the company that Minoan Lines calls first when anything touches AI, data, or automation — in year one and in year ten.&quot;
                </p>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT'S LIVE ──────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <SectionLabel>0–5 min · What&apos;s Live Today</SectionLabel>
          <h2 className="text-3xl font-bold text-white mb-2">Six modules. Running in production.</h2>
          <p className="text-slate-400 mb-10 text-sm">Not a prototype. Real infrastructure. Real data. Deployable to Grimaldi Group without rewriting a line.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: MessageCircle, label: 'Sofia — AI Chat', desc: '24/7 customer assistant, 20 languages, streaming' },
              { icon: FileText, label: 'Compliance', desc: 'EU ETS & FuelEU Maritime reports in 60 seconds' },
              { icon: Headphones, label: 'IT Helpdesk', desc: 'AI triage, SLA dashboard, email alerts' },
              { icon: Ship, label: 'Fleet Ops', desc: 'Live vessel status, speed, fuel, ETA' },
              { icon: Shield, label: 'Audit Log', desc: 'Full governance timeline, exportable' },
              { icon: Activity, label: 'Health Monitor', desc: 'Platform uptime, API status, alerts' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white/4 border border-white/8 rounded-xl p-5 hover:bg-white/7 hover:border-white/15 transition-all">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: 'linear-gradient(135deg, #003087 0%, #0047CC 100%)' }}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="font-semibold text-white text-sm mb-1">{label}</div>
                <div className="text-slate-400 text-xs leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY NOW ──────────────────────────────────────────────────────── */}
      <section className="py-14 border-y border-white/5" style={{ background: '#0d1529' }}>
        <div className="max-w-5xl mx-auto px-6">
          <SectionLabel>5–10 min · Why This Cannot Wait</SectionLabel>
          <h2 className="text-3xl font-bold text-white mb-8">The regulatory clock is running.</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: FileText, title: 'EU ETS Phase 4', desc: '2024 maritime inclusion is live. Manual reporting for 8 vessels is now a compliance liability, not just an inconvenience.', color: '#ef4444' },
              { icon: Globe, title: 'FuelEU Maritime', desc: 'GHG intensity targets from January 2025. Every vessel needs annual certified compliance reports or faces EU port bans.', color: '#C9A84C' },
              { icon: TrendingUp, title: 'Cost of Delay', desc: 'A maritime compliance consultant charges €1,500–€3,000 per vessel per quarter. That is €96,000/year you are already paying, manually.', color: '#22c55e' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white/4 border border-white/8 rounded-xl p-6">
                <Icon className="w-6 h-6 mb-3" style={{ color }} />
                <div className="font-semibold text-white mb-2">{title}</div>
                <p className="text-slate-300 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5-YEAR LIFETIME ROADMAP ───────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <SectionLabel>10–20 min · The 5-Year Lifetime Client Roadmap</SectionLabel>
          <h2 className="text-3xl font-bold text-white mb-2">Not a project. A partnership.</h2>
          <p className="text-slate-400 text-sm mb-10">Every phase adds a module, deepens the relationship, and makes replacement more costly than retention.</p>

          <div className="relative">
            <div className="absolute left-4 top-4 bottom-4 w-px bg-white/10" />
            <div className="space-y-4">
              {TIMELINE.map((item, i) => (
                <div key={i} className="relative pl-10">
                  <div className="absolute left-0 top-5 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                    style={{ background: '#0a0f1e', borderColor: item.color, color: item.color }}>
                    {i + 1}
                  </div>
                  <div className={`rounded-xl border p-5 transition-all cursor-pointer ${item.highlight ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/8 bg-white/3 hover:bg-white/6'}`}
                    onClick={() => setOpenPhase(openPhase === i ? null : i)}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-xs font-bold ${item.textColor}`}>{item.period}</span>
                          {item.highlight && <span className="bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs px-2 py-0.5 rounded-full">Retainer locks in</span>}
                        </div>
                        <div className="font-semibold text-white text-sm">{item.title}</div>
                        <div className="text-xs font-medium mt-1" style={{ color: item.color }}>{item.pricing}</div>
                      </div>
                      {openPhase === i
                        ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                        : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />}
                    </div>
                    {openPhase === i && (
                      <p className="mt-3 text-slate-300 text-sm leading-relaxed border-t border-white/8 pt-3">
                        {item.desc}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── LONG-TERM RETAINER ───────────────────────────────────────────── */}
      <section className="py-14 border-y border-white/5" style={{ background: '#0d1529' }}>
        <div className="max-w-5xl mx-auto px-6">
          <SectionLabel>The Partnership Retainer — Proposed at Month 6</SectionLabel>
          <h2 className="text-3xl font-bold text-white mb-2">
            <span style={{ color: '#C9A84C' }}>€5,400 / month.</span> Not a maintenance fee.
          </h2>
          <p className="text-slate-400 text-sm mb-8">A strategic AI partnership agreement. Once all 5 modules are live and delivering measurable value, this is the transition from vendor to partner.</p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/4 border border-white/10 rounded-2xl p-6">
              <div className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">What €5,400/mo covers</div>
              <ul className="space-y-2.5">
                {RETAINER_ITEMS.map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Annual retainer value', value: '€64,800', sub: 'at full retainer rate' },
                { label: 'Lifetime client horizon', value: '10 years', sub: 'conservative projection' },
                { label: 'Minoan Lines alone — decade value', value: '€648K+', sub: 'before any group expansion', gold: true },
                { label: 'Grimaldi Group multiplier', value: '3×', sub: 'conservative group potential' },
              ].map(({ label, value, sub, gold }) => (
                <div key={label} className={`rounded-xl border p-4 ${gold ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/8 bg-white/3'}`}>
                  <div className={`text-2xl font-bold ${gold ? 'text-amber-400' : 'text-white'}`}>{value}</div>
                  <div className="text-white text-sm font-medium mt-0.5">{label}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* The number */}
          <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-6">
            <p className="text-amber-300 font-semibold text-base mb-3">
              The number that should be in your mind when you walk in Monday morning: <span className="text-amber-400 text-xl font-bold">€648,000.</span>
            </p>
            <p className="text-slate-300 text-sm leading-relaxed mb-3">
              That is what Minoan Lines alone is worth to IntegraMind AI over a decade at the full retainer — before Heraklion Port Authority, before Grimaldi Group, before any other client.
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">
              The pilot at €2,500 is not a small sale. It is the first instalment on a ten-year partnership. Walk in with that energy — not the energy of someone trying to close a deal, but the energy of someone who already knows where this relationship is going and is simply showing Michalis the first step.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECURITY ─────────────────────────────────────────────────────── */}
      <section className="py-14">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-white/3 border border-white/8 rounded-2xl p-8">
            <SectionLabel>Security &amp; GDPR</SectionLabel>
            <h2 className="text-xl font-bold text-white mb-6">Built for EU-regulated operations.</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { icon: Lock, label: 'EU-Hosted', desc: 'Supabase EU region (Frankfurt). GDPR by architecture.' },
                { icon: Shield, label: 'No PII Exposure', desc: 'AI processes operational data only. Passenger data never leaves your systems.' },
                { icon: Brain, label: 'AI Isolation', desc: 'Model processes anonymised prompts. No training on your data. Ever.' },
                { icon: RefreshCw, label: 'Audit Trail', desc: 'Every action logged. Timestamped. Exportable for regulators.' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="bg-white/4 border border-white/8 rounded-xl p-4">
                  <Icon className="w-5 h-5 text-[#C9A84C] mb-2" />
                  <div className="text-white font-semibold text-sm mb-1">{label}</div>
                  <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section id="offer" className="py-16 border-y border-white/5" style={{ background: '#0d1529' }}>
        <div className="max-w-5xl mx-auto px-6">
          <SectionLabel>20–25 min · Investment</SectionLabel>
          <h2 className="text-3xl font-bold text-white mb-2">Start where it hurts least. Stay because it delivers most.</h2>
          <p className="text-slate-400 text-sm mb-10">No procurement risk. No IT involvement. No commitment beyond the pilot.</p>

          <div className="grid md:grid-cols-3 gap-5 mb-8">
            {PRICING.map(p => (
              <div key={p.title}
                className={`rounded-2xl border p-6 flex flex-col ${p.highlight
                  ? 'border-blue-500/50 bg-blue-500/8'
                  : 'border-white/10 bg-white/3'}`}>
                <div className={`inline-flex w-fit text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 ${p.tagColor}`}>
                  {p.tag}
                </div>
                <div className="text-2xl font-bold text-white mb-0.5">{p.setup}</div>
                <div className="text-slate-400 text-sm mb-1">Then {p.monthly} maintenance</div>
                <div className="font-semibold text-white mb-1">{p.title}</div>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">{p.subtitle}</p>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{p.includesLabel}</div>
                <ul className="space-y-2 flex-1">
                  {p.items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-5 flex gap-4 items-start">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-300 mb-1">ROI on the first run</div>
              <p className="text-amber-200/80 text-sm leading-relaxed">
                A maritime compliance consultant charges €1,500–€3,000 per vessel per quarter. The platform generates the same report in 60 seconds, for all 8 vessels simultaneously, in any of 20 languages. The pilot pays for itself before the second report.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT WE NEED ─────────────────────────────────────────────────── */}
      <section className="py-14">
        <div className="max-w-5xl mx-auto px-6">
          <SectionLabel>What We Need From You</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-2">Three things. One of them is easy.</h2>
          <p className="text-slate-400 text-sm mb-8">This is designed for a very busy operations director. Zero IT project. Zero disruption.</p>
          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {CLIENT_NEEDS.map(item => (
              <div key={item.step} className="bg-white/4 border border-white/8 rounded-xl p-5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white mb-3"
                  style={{ background: 'linear-gradient(135deg, #C9A84C 0%, #e8c56d 100%)' }}>
                  {item.step}
                </div>
                <div className="font-semibold text-white mb-2">{item.title}</div>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <div className="font-semibold text-white mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-[#C9A84C]" /> From yes to live — 14 days</div>
            <div className="grid md:grid-cols-4 gap-3">
              {[
                { day: 'Day 1–2', task: 'Agreement signed. Setup begins. No IT involvement needed.' },
                { day: 'Day 3–5', task: 'Data inputs confirmed. First compliance report draft generated.' },
                { day: 'Day 6–10', task: 'Full report suite live. Dashboard access granted to your team.' },
                { day: 'Day 14', task: 'Official handover. Platform running. You review — we support.' },
              ].map(({ day, task }) => (
                <div key={day} className="bg-white/3 border border-white/8 rounded-xl p-3">
                  <div className="text-[#C9A84C] text-xs font-bold mb-1">{day}</div>
                  <p className="text-slate-300 text-xs leading-relaxed">{task}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Q&A ──────────────────────────────────────────────────────────── */}
      <section className="py-14 border-y border-white/5" style={{ background: '#0d1529' }}>
        <div className="max-w-5xl mx-auto px-6">
          <SectionLabel>25–28 min · Questions &amp; Objections</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-8">Every concern, answered directly.</h2>
          <div className="space-y-2">
            {QA.map((item, i) => (
              <div key={i} className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
                <button className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                  onClick={() => setOpenQA(openQA === i ? null : i)}>
                  <span className="font-medium text-white text-sm">{item.q}</span>
                  {openQA === i
                    ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                </button>
                {openQA === i && (
                  <div className="px-5 pb-4 border-t border-white/8">
                    <p className="mt-3 text-sm text-slate-300 leading-relaxed border-l-4 pl-3"
                      style={{ borderColor: '#C9A84C' }}>
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE CLOSE ────────────────────────────────────────────────────── */}
      <section className="py-20"
        style={{ background: 'linear-gradient(135deg, #060d1f 0%, #001A4D 60%, #003087 100%)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <TimeBadge label="28–30 min · The Decision" />
            <h2 className="text-4xl font-bold text-white mt-5 mb-3">
              One decision. Fourteen days.<br />
              <span style={{ color: '#C9A84C' }}>Then the results speak for themselves.</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4 mb-12">
            {[
              'You have seen the platform running. You have seen the compliance reports it generates. You have seen the AI answering passenger questions at 3am in Greek, Italian, and German simultaneously.',
              'The question is not whether this works. It is already working.',
              'The single most important thing to do in the first 10 minutes of that meeting is make Michalis feel that you are not a vendor. Vendors come and go. Partners stay. The moment he feels the difference — in how you speak, how prepared you are, how well you know his company — the lifetime relationship has already begun.',
            ].map((text, i) => (
              <div key={i} className="bg-white/5 border border-white/8 rounded-xl px-6 py-4">
                <p className="text-blue-100 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
            <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl px-6 py-5">
              <p className="text-white font-semibold text-sm leading-relaxed mb-2">
                I am proposing a four-week compliance pilot at €2,500. No IT involvement from your side. No procurement risk. If at the end of four weeks you have not seen clear value, we part ways and you keep every report that was generated.
              </p>
              <p className="font-bold text-lg" style={{ color: '#C9A84C' }}>
                All I need from you today is a yes to start the clock.
              </p>
            </div>
          </div>

          {/* Final QR */}
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-2xl">
              <QRCodeSVG value={APP_URL} size={120} fgColor="#001A4D" bgColor="#ffffff" />
            </div>
            <p className="text-blue-200 text-sm">Scan to explore the live platform right now</p>
            <a href={APP_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
              style={{ background: '#C9A84C', color: '#001A4D' }}>
              <Zap className="w-4 h-4" /> Open Live Platform
            </a>
            <p className="text-blue-300/40 text-xs font-mono mt-1">{APP_URL}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="bg-[#030811] px-6 py-5 text-center border-t border-white/5">
        <p className="text-slate-600 text-xs">
          IntegraMindAI · Built for Minoan Lines S.A. · Grimaldi Group · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

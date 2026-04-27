'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Ship, Brain, BarChart2, FileText, Headphones, Shield, Activity,
  ChevronDown, ChevronRight, CheckCircle, AlertCircle, TrendingUp,
  Globe, Zap, Lock, Users, ArrowRight, Star, Target, Layers,
  MessageCircle, Clock, MapPin
} from 'lucide-react';

const QRCodeSVG = dynamic(() => import('qrcode.react').then(m => m.QRCodeSVG), { ssr: false });

const APP_URL = 'https://minoan-lines.vercel.app';

const PHASES = [
  {
    phase: '0', label: 'Foundation', status: 'live', color: '#16a34a', bg: 'bg-green-50', border: 'border-green-200',
    period: 'Live — April 2026',
    items: [
      'AI Customer Assistant (24/7 SSE streaming, 20 languages)',
      'EU ETS & FuelEU Maritime Compliance Reports (multi-language PDF)',
      'IT Helpdesk with AI Triage, SLA Dashboard & Email Alerts',
      'Fleet Vessel Tracking Dashboard',
      'Audit Log & Activity Timeline',
      'Health Monitoring & API Status',
      'Role-based Auth (Supabase), Dark Mode, Responsive PWA',
    ],
  },
  {
    phase: '1', label: 'Intelligence', status: 'next', color: '#2563eb', bg: 'bg-blue-50', border: 'border-blue-200',
    period: 'Q3 2026',
    items: [
      'Predictive Maintenance Engine (anomaly detection on vessel sensor data)',
      'Crew Scheduling AI with fatigue & certification compliance',
      'Dynamic Fuel Optimisation per route & sea conditions',
      'Passenger Sentiment Analysis from feedback streams',
    ],
  },
  {
    phase: '2', label: 'Automation', status: 'planned', color: '#7c3aed', bg: 'bg-purple-50', border: 'border-purple-200',
    period: 'Q4 2026',
    items: [
      'Automated ETS Allowance Purchasing (threshold-triggered)',
      'Fleet-wide Consolidated Compliance Reporting',
      'Real-time Port Authority Data Integration (SafeSeaNet)',
      'Cargo & Freight Revenue Optimisation Module',
    ],
  },
  {
    phase: '3', label: 'Group Scale', status: 'vision', color: '#C9A84C', bg: 'bg-amber-50', border: 'border-amber-200',
    period: '2027',
    items: [
      'Grimaldi Group Fleet Integration (50+ vessels)',
      'Cross-fleet Compliance Consolidation for Group HQ',
      'Multi-entity Audit & Governance Dashboard',
      'Group-level AI Decision Support for Executives',
    ],
  },
];

const QA = [
  {
    q: 'We are in a very busy period with many projects ongoing.',
    a: 'I know — and that is exactly why the compliance pilot is designed to take zero time from your team. I do the implementation. You review the output. Two weeks. That is all I need from you.',
  },
  {
    q: 'We already have systems handling some of this.',
    a: 'That is good to hear. Can you tell me which parts? Because what I have built does not replace your existing systems — it sits on top of them and automates the data collection and reporting layer that those systems still leave manual.',
  },
  {
    q: 'We need to involve procurement / legal / management.',
    a: 'Absolutely — and the pilot is designed to give you something concrete to show them. Rather than approving a concept, they will be approving results. Let me show you the output first.',
  },
  {
    q: 'What about data security and GDPR?',
    a: 'Critical question — and I am glad you raised it. The platform is built on EU-hosted infrastructure. All passenger data stays within your own systems. The AI layer processes operational and compliance data only — no PII is ever exposed to external systems.',
  },
  {
    q: 'We would need to present this to Grimaldi Group.',
    a: 'That is actually an opportunity I welcome. The compliance automation module was designed with the Grimaldi Group reporting structure in mind — automated consolidated reports going up the chain. Minoan Lines becomes the proof of concept for the whole group.',
  },
  {
    q: 'How is this different from what the big vendors offer?',
    a: 'The big vendors sell you a platform and then charge you six figures to configure it for your fleet. What you have here is already configured, already running, already generating your EU ETS reports. The difference is six months and €200,000 in implementation costs — saved.',
  },
];

const COSTS = [
  { label: 'Compliance Pilot (4 weeks)', price: '€4,900', note: 'EU ETS + FuelEU reports, full setup, zero IT involvement required', highlight: false },
  { label: 'Full Platform — Year 1', price: '€18,000', note: 'All Phase 0 modules + Phase 1 rollout + dedicated support', highlight: true },
  { label: 'Grimaldi Group License', price: 'Custom', note: 'Group-wide deployment, consolidated reporting, executive dashboard', highlight: false },
];

const DELIVERED = [
  { icon: MessageCircle, label: 'AI Chat', desc: '24/7 customer assistant, 20 languages' },
  { icon: FileText, label: 'Compliance', desc: 'EU ETS & FuelEU Maritime PDF reports' },
  { icon: Headphones, label: 'Helpdesk', desc: 'AI triage, SLA tracking, email alerts' },
  { icon: Ship, label: 'Fleet', desc: 'Vessel dashboard, real-time status' },
  { icon: Shield, label: 'Audit', desc: 'Full activity log & governance timeline' },
  { icon: Activity, label: 'Health', desc: 'API & platform monitoring' },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="h-px w-8 bg-[#C9A84C]" />
      <span className="text-[#C9A84C] text-xs font-semibold uppercase tracking-widest">{children}</span>
    </div>
  );
}

export default function DemoPage() {
  const [openQA, setOpenQA] = useState<number | null>(null);
  const [openPhase, setOpenPhase] = useState<number | null>(0);

  return (
    <div className="min-h-screen font-sans" style={{ background: 'linear-gradient(180deg, #f0f4ff 0%, #f8faff 100%)' }}>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #001A4D 0%, #003087 60%, #0047CC 100%)' }}>
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #C9A84C 0%, transparent 50%), radial-gradient(circle at 80% 20%, #4a9eff 0%, transparent 50%)' }} />
        <div className="max-w-5xl mx-auto px-6 py-20 relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 mb-6 border border-white/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 text-xs font-semibold tracking-wide">LIVE PLATFORM — APRIL 2026</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
                The Intelligence Layer<br />
                <span style={{ color: '#C9A84C' }}>Minoan Lines</span> Needed.
              </h1>
              <p className="text-blue-200 text-lg leading-relaxed mb-6 max-w-xl">
                Built in production. Saving hours today. Designed to scale across the Grimaldi Group tomorrow.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href={APP_URL} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                  style={{ background: '#C9A84C', color: '#001A4D' }}>
                  <Zap className="w-4 h-4" /> Open Live Platform
                </a>
                <a href="#offer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all">
                  See the Offer <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <div className="bg-white rounded-2xl p-4 shadow-2xl">
                <QRCodeSVG value={APP_URL} size={140} fgColor="#001A4D" bgColor="#ffffff" />
              </div>
              <p className="text-blue-200 text-xs text-center font-medium">Scan to open the platform</p>
              <p className="text-blue-300/60 text-xs text-center font-mono">{APP_URL}</p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Live */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <SectionLabel>What&apos;s Live Today</SectionLabel>
          <h2 className="text-3xl font-bold text-[#001A4D] mb-2">Six modules. Fully deployed.</h2>
          <p className="text-gray-500 mb-10">Not a prototype. Not a demo environment. Production infrastructure on Vercel + Supabase, serving real data.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {DELIVERED.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: 'linear-gradient(135deg, #003087 0%, #0047CC 100%)' }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="font-semibold text-[#001A4D] text-sm mb-1">{label}</div>
                <div className="text-gray-500 text-xs leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Now */}
      <section className="py-16 bg-[#001A4D]">
        <div className="max-w-5xl mx-auto px-6">
          <SectionLabel>Why Now</SectionLabel>
          <h2 className="text-3xl font-bold text-white mb-8">The regulatory window is closing.</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: FileText, title: 'EU ETS Phase 4', desc: '2024 maritime inclusion is live. Allowance costs are rising. Manual reporting is no longer viable at scale.', color: '#ef4444' },
              { icon: Globe, title: 'FuelEU Maritime', desc: 'GHG intensity targets kick in January 2025. Every vessel in the EU fleet needs annual compliance reports.', color: '#C9A84C' },
              { icon: TrendingUp, title: 'Cost of Delay', desc: 'Every month without automation is a month of manual reporting hours and missed optimisation savings.', color: '#22c55e' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <Icon className="w-6 h-6 mb-3" style={{ color }} />
                <div className="font-semibold text-white mb-2">{title}</div>
                <p className="text-blue-200 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grimaldi Group Angle */}
      <section id="grimaldi" className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <SectionLabel>The Bigger Picture</SectionLabel>
          <h2 className="text-3xl font-bold text-[#001A4D] mb-4">
            Not a Minoan Lines expense.<br />
            <span style={{ color: '#003087' }}>A Grimaldi Group asset.</span>
          </h2>
          <p className="text-gray-600 leading-relaxed mb-8 max-w-2xl">
            Minoan Lines is a Grimaldi Group company. What is being built here is not a cost centre for one subsidiary — it is the intelligence infrastructure that can run across the Group&apos;s entire fleet of 100+ vessels, with a single consolidation layer feeding executive reporting at Group HQ.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Layers, title: 'Minoan Lines → Proof of Concept', desc: 'Four weeks to demonstrate ROI. One compliance report that would otherwise take days. That is the conversation to bring to Naples.' },
              { icon: Users, title: 'Group Rollout → Multiplied Value', desc: 'The platform architecture is fleet-agnostic. Adding a Grimaldi vessel is configuration, not development. The cost per vessel drops by 80% at group scale.' },
              { icon: Target, title: 'Consolidated Reporting', desc: 'Group compliance officers receive a single consolidated dashboard across all subsidiaries. Automated. Audit-ready. No manual aggregation.' },
              { icon: Star, title: 'Competitive Intelligence', desc: 'AI-driven route and fuel optimisation generates data insights that give Grimaldi Group a measurable edge on the routes that matter most.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #C9A84C 0%, #e8c56d 100%)' }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-[#001A4D] mb-1">{title}</div>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <SectionLabel>Roadmap</SectionLabel>
          <h2 className="text-3xl font-bold text-[#001A4D] mb-8">Four phases. One platform.</h2>
          <div className="space-y-3">
            {PHASES.map((p, i) => (
              <div key={p.phase} className={`rounded-xl border ${p.border} ${p.bg} overflow-hidden`}>
                <button className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setOpenPhase(openPhase === i ? null : i)}>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: p.color }}>
                      {p.phase}
                    </span>
                    <div>
                      <div className="font-semibold text-[#001A4D] text-sm">Phase {p.phase}: {p.label}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3" /> {p.period}
                        {p.status === 'live' && (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs font-medium ml-1">
                            <CheckCircle className="w-3 h-3" /> Live
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {openPhase === i ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </button>
                {openPhase === i && (
                  <div className="px-5 pb-4 border-t border-gray-200/60">
                    <ul className="mt-3 space-y-2">
                      {p.items.map(item => (
                        <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: p.color }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-[#001A4D] rounded-2xl p-8 md:p-10">
            <SectionLabel>Security &amp; Compliance</SectionLabel>
            <h2 className="text-2xl font-bold text-white mb-6">Built for EU-regulated maritime operations.</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { icon: Lock, label: 'EU-Hosted Infrastructure', desc: 'All data on Supabase EU region (Frankfurt). GDPR compliant by architecture.' },
                { icon: Shield, label: 'No PII Exposure', desc: 'AI processes operational and compliance data only. Passenger PII never leaves your systems.' },
                { icon: Brain, label: 'AI Model Isolation', desc: 'DeepSeek API processes anonymised operational prompts. No training on your data.' },
                { icon: MapPin, label: 'Audit Trail', desc: 'Every action logged with timestamp, user, and metadata. Exportable for regulators.' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <Icon className="w-5 h-5 text-[#C9A84C] mb-2" />
                  <div className="text-white font-semibold text-sm mb-1">{label}</div>
                  <p className="text-blue-200 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Investment & Offer */}
      <section id="offer" className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <SectionLabel>Investment &amp; Offer</SectionLabel>
          <h2 className="text-3xl font-bold text-[#001A4D] mb-2">Clear pricing. Immediate value.</h2>
          <p className="text-gray-500 mb-10">Start with the pilot. There is no commitment beyond four weeks.</p>
          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {COSTS.map(c => (
              <div key={c.label}
                className={`rounded-2xl p-6 border-2 transition-shadow ${c.highlight
                  ? 'border-[#003087] bg-white shadow-xl shadow-blue-900/10'
                  : 'border-gray-200 bg-white shadow-sm'}`}>
                {c.highlight && (
                  <div className="inline-flex items-center gap-1 bg-[#003087] text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    <Star className="w-3 h-3" /> Recommended
                  </div>
                )}
                <div className="text-2xl font-bold text-[#001A4D] mb-1">{c.price}</div>
                <div className="font-semibold text-gray-900 mb-2">{c.label}</div>
                <p className="text-gray-500 text-sm leading-relaxed">{c.note}</p>
              </div>
            ))}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex gap-4 items-start">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-900 mb-1">ROI Reference Point</div>
              <p className="text-amber-800 text-sm leading-relaxed">
                A single EU ETS compliance report prepared manually by a maritime compliance consultant costs €1,500–€3,000 per vessel per quarter. The platform generates the same report in under 60 seconds, for all 8 vessels simultaneously, in any of 20 languages. The pilot pays for itself on the first report run.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Q&A */}
      <section id="qa" className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <SectionLabel>Questions &amp; Objections</SectionLabel>
          <h2 className="text-3xl font-bold text-[#001A4D] mb-8">Every concern, answered directly.</h2>
          <div className="space-y-3">
            {QA.map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <button className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                  onClick={() => setOpenQA(openQA === i ? null : i)}>
                  <span className="font-medium text-gray-900 text-sm">{item.q}</span>
                  {openQA === i ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </button>
                {openQA === i && (
                  <div className="px-5 pb-4 border-t border-gray-100">
                    <p className="mt-3 text-sm text-gray-700 leading-relaxed"
                      style={{ borderLeft: '3px solid #C9A84C', paddingLeft: '12px' }}>
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Close */}
      <section style={{ background: 'linear-gradient(135deg, #001A4D 0%, #003087 100%)' }}>
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-10">
            <SectionLabel>The Close</SectionLabel>
            <h2 className="text-4xl font-bold text-white mb-4">
              One decision. Four weeks.<br />
              <span style={{ color: '#C9A84C' }}>Then you own the results.</span>
            </h2>
          </div>
          <div className="max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-8 mb-10">
            <p className="text-blue-100 text-base leading-loose mb-6">
              You have seen the platform running. You have seen the compliance reports it generates. You have seen the AI answering passenger questions at 3am in Greek, Italian, and German simultaneously.
            </p>
            <p className="text-blue-100 text-base leading-loose mb-6">
              The question is not whether this works. It is already working.
            </p>
            <p className="text-blue-100 text-base leading-loose mb-6">
              The question is whether Minoan Lines — and through you, Grimaldi Group — wants to be the first in your sector to have this intelligence layer running at scale, or whether you want to be in the position of catching up to whoever moves first.
            </p>
            <p className="text-white font-semibold text-base leading-loose">
              I am proposing a four-week compliance pilot at €4,900. No IT involvement from your side. No procurement risk. If at the end of four weeks you have not seen clear value, we part ways and you keep every report that was generated.
            </p>
            <p className="font-bold text-lg mt-6" style={{ color: '#C9A84C' }}>
              All I need from you today is a yes to start the clock.
            </p>
          </div>

          {/* Final QR */}
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-2xl">
              <QRCodeSVG value={APP_URL} size={120} fgColor="#001A4D" bgColor="#ffffff" />
            </div>
            <p className="text-blue-200 text-sm text-center">Scan to explore the live platform right now</p>
            <a href={APP_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
              style={{ background: '#C9A84C', color: '#001A4D' }}>
              <Zap className="w-4 h-4" /> Open Live Platform
            </a>
            <p className="text-blue-300/60 text-xs font-mono mt-1">{APP_URL}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="bg-[#000d2b] px-6 py-6 text-center">
        <p className="text-blue-300/60 text-xs">
          IntegraMindAI · Built for Minoan Lines S.A. · Grimaldi Group · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

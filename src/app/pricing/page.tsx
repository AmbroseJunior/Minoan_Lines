'use client';
import Link from 'next/link';
import { CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';

const PLANS = [
  {
    tag: 'START HERE — RECOMMENDED',
    tagColor: 'bg-red-600',
    name: 'Compliance Pilot',
    price: '€3,000',
    sub: 'Module 3 fast-start. EU ETS & FuelEU live in 2 weeks.',
    monthly: '€800/mo maintenance',
    highlight: false,
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
    tag: 'MOST COMPLETE',
    tagColor: 'bg-blue-600',
    name: 'Core Platform',
    price: '€9,500',
    sub: 'Modules 3+4. Compliance + IT Helpdesk. Live in 4 weeks.',
    monthly: '€1,700/mo maintenance',
    highlight: true,
    items: [
      'Everything in Compliance Pilot, plus:',
      'AI IT ticket classification + SLA tracking',
      'Automated ticket routing across 318 staff',
      'Live IT performance dashboard for management',
      'Vessel crew ticket prioritisation',
      'Monthly IT performance report — automated',
      'Priority support SLA — 4hr response',
    ],
  },
  {
    tag: 'FULL PLATFORM',
    tagColor: 'bg-slate-600',
    name: 'All 5 Modules',
    price: '€34K–€52K',
    sub: 'Complete platform. Phased over 3 months.',
    monthly: '€6,000/mo retainer',
    highlight: false,
    items: [
      'Vessel ops dashboard + AIS + delay prediction',
      'Sofia AI Agent — Greek + English + 18 more',
      'Full compliance + reporting automation',
      'IT helpdesk triage + SLA tracking',
      'Demand forecasting + revenue intelligence',
      'Dedicated account manager',
    ],
  },
];

const RETAINER = [
  'All 5 modules — maintained, monitored, continuously improved',
  'Monthly ROI report delivered to Michalis and management',
  'Quarterly strategic review — what to build next',
  'Proactive regulatory monitoring — FuelEU, ETS, IMO updates flagged automatically',
  'Priority support — 2-hour response SLA, 24/7 for critical issues',
  'Annual platform upgrade — one new feature or module per year included',
  'Dedicated account manager — Sandy or Nnamdi as named contacts',
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#070c1a] font-sans text-white">

      {/* Header */}
      <div className="border-b border-white/8" style={{ background: 'linear-gradient(135deg, #060d1f 0%, #001A4D 80%)' }}>
        <div className="max-w-4xl mx-auto px-6 py-10">
          <Link href="/demo" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to pitch
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <span className="h-px w-8 bg-[#C9A84C]" />
            <span className="text-[#C9A84C] text-xs font-semibold uppercase tracking-widest">Investment</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Start where it hurts least.<br />
            <span style={{ color: '#C9A84C' }}>Stay because it delivers most.</span>
          </h1>
          <p className="text-slate-400 text-sm">No procurement risk. No IT involvement. No commitment beyond the pilot.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map(p => (
            <div key={p.name}
              className={`rounded-2xl border flex flex-col ${p.highlight
                ? 'border-blue-500/50 bg-blue-500/8'
                : 'border-white/10 bg-white/3'}`}>
              <div className="p-6 flex-1">
                <span className={`inline-block text-white text-xs font-bold px-3 py-1 rounded-full mb-4 ${p.tagColor}`}>
                  {p.tag}
                </span>
                <div className="text-3xl font-bold text-white mb-0.5">{p.price}</div>
                <div className="text-slate-400 text-sm mb-1">Then {p.monthly}</div>
                <div className="font-semibold text-white mb-2 text-lg">{p.name}</div>
                <p className="text-slate-400 text-xs leading-relaxed mb-5">{p.sub}</p>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Includes</div>
                <ul className="space-y-2">
                  {p.items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* If he asks about price */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
          <p className="text-white font-semibold text-sm mb-3">If he asks about price — say this:</p>
          <blockquote className="border-l-4 border-[#C9A84C] pl-4">
            <p className="text-blue-100 text-sm italic leading-relaxed">
              &quot;Our conservative estimate is that these modules save Minoan Lines between €14,000 and €31,000 per month in compliance costs, IT overhead, and support operations. We are asking for €6,000 at the full platform. That is a 2.6x return at minimum. The question is not whether €6,000 is expensive. The question is whether you can afford not to have this running.&quot;
            </p>
          </blockquote>
        </div>

        {/* ROI anchor */}
        <div className="bg-amber-500/8 border border-amber-500/20 rounded-2xl p-6">
          <p className="text-amber-300 font-bold text-sm mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> ROI anchor — know this cold:
          </p>
          <p className="text-slate-300 text-sm leading-relaxed mb-3">
            A maritime compliance consultant charges <strong className="text-white">€1,500–3,000 per vessel per quarter</strong> = <strong className="text-white">€96,000/year</strong> for 8 vessels.
          </p>
          <p className="text-white font-semibold text-sm mb-1">Your platform generates the same certified report for all 8 vessels in 60 seconds.</p>
          <p className="text-slate-400 text-sm">The pilot at €3,000 pays for itself before the second report is generated.</p>
        </div>

        {/* Year 2+ Retainer */}
        <div className="rounded-2xl border border-amber-500/25 overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-500/15" style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, transparent 100%)' }}>
            <div className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-1">Long-term partnership retainer — what to propose at Month 6</div>
            <div className="text-3xl font-bold text-white">€6,000 <span className="text-lg font-normal text-slate-400">/ month</span></div>
          </div>
          <div className="p-6 bg-white/2">
            <p className="text-slate-300 text-sm leading-relaxed mb-5">
              Once all 5 modules are live and delivering measurable value, transition the relationship to a formal annual retainer. This is not a maintenance fee — it is a strategic AI partnership agreement.
            </p>
            <ul className="space-y-2.5 mb-6">
              {RETAINER.map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { val: '€72,000', label: 'Annual retainer value' },
                { val: '10 yrs', label: 'Lifetime client horizon' },
                { val: '€758K+', label: 'Minoan Lines alone, decade value', gold: true },
                { val: '3×', label: 'Grimaldi Group multiplier' },
              ].map(({ val, label, gold }) => (
                <div key={label} className={`rounded-xl p-4 border text-center ${gold ? 'border-amber-500/40 bg-amber-500/8' : 'border-white/8 bg-white/3'}`}>
                  <div className={`text-xl font-bold ${gold ? 'text-amber-400' : 'text-white'}`}>{val}</div>
                  <div className="text-slate-400 text-xs mt-1 leading-snug">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* The number */}
        <div className="rounded-2xl p-8 text-center border border-amber-500/20"
          style={{ background: 'linear-gradient(135deg, #060d1f 0%, #001A4D 100%)' }}>
          <p className="text-slate-300 text-sm leading-relaxed mb-4 max-w-2xl mx-auto">
            The pilot at €3,000 is not a small sale. It is the first instalment on a ten-year partnership. Walk in with that energy — not the energy of someone trying to close a deal, but the energy of someone who already knows where this relationship is going.
          </p>
          <p className="font-bold text-2xl md:text-3xl" style={{ color: '#C9A84C' }}>
            The number in your mind walking in: €758,000.
          </p>
          <p className="text-slate-400 text-sm mt-2">That is Minoan Lines alone, over a decade.</p>

          <div className="mt-6">
            <Link href="/demo"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105 text-[#001A4D]"
              style={{ background: '#C9A84C' }}>
              <ArrowLeft className="w-4 h-4" /> Back to pitch script
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

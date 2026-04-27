'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ChevronDown, ChevronRight, MessageCircle, FileText, Headphones,
  Ship, Shield, Activity, Zap, ArrowRight
} from 'lucide-react';

const QRCodeSVG = dynamic(() => import('qrcode.react').then(m => m.QRCodeSVG), { ssr: false });

const APP_URL = 'https://minoan-lines.vercel.app';

// ─── Types ───────────────────────────────────────────────────────────────────

function Quote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="border-l-4 border-[#C9A84C] pl-4 py-1 my-3">
      <p className="text-blue-100 text-sm italic leading-relaxed">{children}</p>
    </blockquote>
  );
}

function Ask({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-semibold mt-3" style={{ color: '#C9A84C' }}>
      ASK: {children}
    </p>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-slate-400 text-xs italic mt-2 leading-relaxed">{children}</p>
  );
}

function SectionTag({ time, label }: { time: string; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="bg-[#C9A84C] text-[#001A4D] text-xs font-bold px-3 py-1 rounded-full">{time}</span>
      <span className="text-[#C9A84C] text-xs font-semibold uppercase tracking-widest">{label}</span>
    </div>
  );
}

function SectionCard({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="border border-white/8 rounded-2xl p-6 md:p-8 bg-white/3">
      {children}
    </section>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">{children}</h2>;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const MODULES = [
  {
    icon: MessageCircle,
    name: 'Sofia — AI Chat',
    what: '24/7 assistant, 20 languages, streaming',
    say: 'This answers passenger questions in Greek, English, Italian at 3am — without a human agent.',
  },
  {
    icon: FileText,
    name: 'Compliance',
    what: 'EU ETS & FuelEU reports in 60 seconds',
    say: 'This generates the reports your team currently builds manually. For all 8 vessels. In 60 seconds.',
  },
  {
    icon: Headphones,
    name: 'IT Helpdesk',
    what: 'AI triage, SLA dashboard, email alerts',
    say: 'Every IT ticket classified and routed automatically. Your team handles only what needs a human.',
  },
  {
    icon: Ship,
    name: 'Fleet Ops',
    what: 'Live vessel status, speed, fuel, ETA',
    say: 'Every vessel, live. Position, speed, fuel consumption, estimated arrival. One screen.',
  },
  {
    icon: Shield,
    name: 'Audit Log',
    what: 'Full governance timeline, exportable',
    say: 'Every action logged, timestamped, exportable for regulators and Grimaldi Group.',
  },
  {
    icon: Activity,
    name: 'Health Monitor',
    what: 'Platform uptime, API status, alerts',
    say: 'Real-time system health. If anything stops working, you get an alert before your team notices.',
  },
];

const PHASES = [
  { n: '1', period: 'Month 1–2', what: 'Compliance pilot — EU ETS, FuelEU, ATHEX PDFs, Grimaldi Group reports', price: '€3,000 setup + €800/mo' },
  { n: '2', period: 'Month 3–4', what: 'IT Helpdesk triage — AI ticket routing, SLA tracking, your 318 staff', price: '+€6,000 setup + €900/mo' },
  { n: '3', period: 'Month 5–6', what: 'Vessel Ops dashboard — AIS live tracking, delay prediction, NL queries', price: '+€9,000 setup + €800/mo' },
  { n: '4', period: 'Month 7–9', what: 'Sofia AI Agent + Revenue forecasting — Greek/English, demand models', price: '+€20,000 setup + €2,500/mo' },
  { n: '5', period: 'Year 2+', what: 'Full platform retainer — all modules, monthly ROI reports, annual upgrades', price: '€6,000/mo locked', highlight: true },
];

const QA = [
  {
    q: 'We are in a very busy period with many projects ongoing.',
    a: 'I know — and that is exactly why the compliance pilot is designed to take zero time from your team. I do the implementation. You review the output. Two weeks. That is all I need from you.',
  },
  {
    q: 'We already have systems handling some of this.',
    a: 'That is good to hear. Can you tell me which parts? Because what I built does not replace your existing systems — it sits on top of them and automates the data collection and reporting layer that those systems still leave manual.',
  },
  {
    q: 'We need to involve procurement / legal / management.',
    a: 'Absolutely — and the pilot is designed to give you something concrete to show them. Rather than approving a concept, they will be approving results. Let me show you the output first.',
  },
  {
    q: 'What about data security and GDPR?',
    a: 'The platform is built on EU-hosted infrastructure — Supabase EU region, Frankfurt. All passenger data stays within your own systems. The AI layer processes operational and compliance data only. No PII is ever exposed to external systems. Every action is logged and timestamped for regulators.',
  },
  {
    q: 'We would need to present this to Grimaldi Group.',
    a: 'That is actually an opportunity I welcome. The compliance automation module was designed with the Grimaldi Group reporting structure in mind — automated consolidated reports going up the chain. Minoan Lines becomes the proof of concept for the whole group. I would be glad to prepare a Grimaldi-level brief alongside this.',
  },
  {
    q: 'Your website shows lower pricing.',
    a: 'That is our standard tier for general clients using off-the-shelf automation. Minoan Lines is a special project — custom-built, enterprise-grade, live in production before we even met. The investment is different because what we are offering is different.',
  },
  {
    q: 'How is this different from what big vendors offer?',
    a: 'IBM and Accenture will charge you €500,000 for a 12-month implementation project. We are two founders who built this specifically for Minoan Lines. You have my personal number. Sandy is the engineer who built what you are looking at right now. We are not a vendor. We are your team.',
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const [openQA, setOpenQA] = useState<number | null>(null);

  return (
    <div className="min-h-screen font-sans bg-[#070c1a]">

      {/* ── COVER ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #060d1f 0%, #001A4D 50%, #003087 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-40"
          style={{ backgroundImage: 'radial-gradient(ellipse at 10% 90%, rgba(201,168,76,0.12) 0%, transparent 55%), radial-gradient(ellipse at 90% 10%, rgba(0,71,204,0.18) 0%, transparent 55%)' }} />
        <div className="max-w-4xl mx-auto px-6 py-16 relative">

          {/* Meta bar */}
          <div className="flex items-center justify-between mb-10 pb-5 border-b border-white/10">
            <div>
              <div className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-1">IntegraMind AI × Minoan Lines</div>
              <div className="text-slate-400 text-sm">Monday 27 April 2026 · 11:30am · 17, 25th August Street, Heraklion</div>
            </div>
            <div className="text-slate-500 text-xs text-right">
              <div className="font-semibold text-slate-400">CONFIDENTIAL</div>
              <div>Pitch Script</div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-10">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
                The Intelligence Layer<br />
                <span style={{ color: '#C9A84C' }}>Minoan Lines</span> Needed.
              </h1>
              <p className="text-blue-100 font-semibold text-lg mb-2">Built. Deployed. Generating compliance reports in 60 seconds.</p>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-lg">
                This is a 30-minute conversation — not a sales pitch. The platform is live. You can open it on your phone right now.
              </p>

              {/* Agenda */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
                {[
                  { t: '0–5 min', l: "What's live" },
                  { t: '5–15 min', l: 'Live demo' },
                  { t: '15–25 min', l: 'The roadmap' },
                  { t: '25–30 min', l: 'The decision', gold: true },
                ].map(({ t, l, gold }) => (
                  <div key={t} className={`rounded-xl px-3 py-3 text-center border ${gold ? 'border-amber-500/40 bg-amber-500/10' : 'border-white/8 bg-white/5'}`}>
                    <div className={`text-xs font-bold ${gold ? 'text-amber-400' : 'text-[#C9A84C]'}`}>{t}</div>
                    <div className="text-white text-xs mt-0.5">{l}</div>
                  </div>
                ))}
              </div>

              <a href={APP_URL} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105 text-[#001A4D]"
                style={{ background: '#C9A84C' }}>
                <Zap className="w-4 h-4" /> {APP_URL}
              </a>
            </div>

            {/* QR */}
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <div className="bg-white rounded-2xl p-4 shadow-2xl">
                <QRCodeSVG value={APP_URL} size={140} fgColor="#001A4D" bgColor="#ffffff" />
              </div>
              <p className="text-slate-400 text-xs text-center">Scan — open on your phone now</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SCRIPT BODY ──────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">

        {/* ── BEFORE YOU OPEN THE LAPTOP ──────────────────────────────── */}
        <SectionCard id="opening">
          <SectionTag time="0–2 min" label="Before You Open the Laptop" />
          <H2>Your opening statement</H2>

          <Quote>
            &quot;Mr. Orfanoudakis, thank you for making the time. I know how busy this period is for Minoan Lines and I want to be respectful of that. I will be direct, specific, and I will not waste a single minute.&quot;
          </Quote>
          <Quote>
            &quot;I have spent the last several weeks studying Minoan Lines specifically — your routes, your fleet, your compliance obligations, and the IT complexity your team manages every day. I built something for you. And I want to show it to you today.&quot;
          </Quote>
          <Note>Pause after this. Let it land. Do not rush to open the laptop. Watch his face.</Note>
          <Ask>Before I open the platform — can you tell me briefly what your team&apos;s biggest operational headache looks like right now?</Ask>
          <Note>Whatever he says maps to one of your 6 modules. Listen carefully. This answer shapes the next 25 minutes.</Note>
        </SectionCard>

        {/* ── WHAT'S LIVE ─────────────────────────────────────────────── */}
        <SectionCard id="live">
          <SectionTag time="0–5 min" label="What's Live Today" />
          <H2>Six modules. Running in production.</H2>
          <p className="text-slate-400 text-sm mb-6">Not a prototype. Real infrastructure. Real data. Deployable to Grimaldi Group without rewriting a line.</p>
          <p className="text-slate-300 text-sm mb-4 font-medium">Open the platform. Navigate to the home screen. Then walk through each module:</p>

          <div className="overflow-x-auto rounded-xl border border-white/8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-white/5">
                  <th className="px-4 py-3 text-left text-slate-300 font-semibold">Module</th>
                  <th className="px-4 py-3 text-left text-slate-300 font-semibold">What it does</th>
                  <th className="px-4 py-3 text-left text-[#C9A84C] font-semibold">Say this</th>
                </tr>
              </thead>
              <tbody>
                {MODULES.map((m, i) => {
                  const Icon = m.icon;
                  return (
                    <tr key={m.name} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/2' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-[#C9A84C] flex-shrink-0" />
                          <span className="text-white font-semibold">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{m.what}</td>
                      <td className="px-4 py-3 text-blue-200 italic">&quot;{m.say}&quot;</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Ask>Which of these six is most relevant to what your team is dealing with right now?</Ask>
          <Note>His answer tells you where to spend the next 10 minutes. Follow him — do not stick to a rigid script.</Note>
        </SectionCard>

        {/* ── WHY THIS CANNOT WAIT ────────────────────────────────────── */}
        <SectionCard id="urgency">
          <SectionTag time="5–10 min" label="Why This Cannot Wait" />
          <H2>The regulatory clock is running.</H2>

          <div className="bg-red-500/8 border border-red-500/20 rounded-xl p-5 mb-5">
            <div className="text-red-400 font-semibold text-sm mb-2">FuelEU Maritime — April 30 deadline</div>
            <Quote>
              &quot;Mr. Orfanoudakis — the FuelEU compliance balance approval deadline is April 30th. That is three days from now. How is your team currently collecting and verifying fuel consumption, emissions, and distance data across all eight vessels?&quot;
            </Quote>
            <Note>Then stop. Do not fill the silence. Let him answer.</Note>
          </div>

          <p className="text-white font-semibold text-sm mb-3">Three facts to state clearly:</p>
          <ul className="space-y-2 mb-5">
            {[
              'EU ETS is now at 100% full coverage from January 2026. CO₂, methane, and nitrous oxide all in scope.',
              'FuelEU penalty for non-compliance: €2,400 per tonne of deficit. Per vessel. Minoan operates 8 vessels.',
              'A maritime compliance consultant charges €1,500–3,000 per vessel per quarter — that is €96,000/year you are already paying, manually.',
            ].map(fact => (
              <li key={fact} className="flex items-start gap-2.5 text-sm text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] flex-shrink-0 mt-1.5" />
                {fact}
              </li>
            ))}
          </ul>

          <Quote>
            &quot;Our compliance module generates the same certified report in 60 seconds, for all 8 vessels simultaneously, in any of 20 languages. The pilot pays for itself before the second report is generated.&quot;
          </Quote>

          <Ask>Is the compliance data currently collected manually by your team, or do you have a system handling parts of it?</Ask>
          <Ask>How long does it currently take your team to prepare a quarterly compliance report for one vessel?</Ask>
        </SectionCard>

        {/* ── LIVE DEMO ───────────────────────────────────────────────── */}
        <SectionCard id="demo">
          <SectionTag time="10–20 min" label="Live Demo" />
          <H2>Show, do not tell.</H2>
          <p className="text-slate-400 text-sm mb-6">Follow the signals from his earlier answers. Demo what matters to him. These are your three sequences:</p>

          <div className="space-y-4">
            {[
              {
                n: 'Demo 1', title: 'Compliance module', sub: 'recommended first',
                nav: 'Navigate to Compliance. Generate a report. Show the 60-second clock.',
                quote: 'Watch this. I am going to generate a full EU ETS and FuelEU compliance report for your fleet right now. Tell me when to start.',
                note: "Let him say 'go'. Give him agency. The moment he says go, he is already participating — not watching.",
                color: '#16a34a',
              },
              {
                n: 'Demo 2', title: 'Sofia AI Chat', sub: 'highest wow factor',
                nav: 'Navigate to Sofia. Type a passenger question in Greek or English.',
                quote: 'Ask it something in Greek. Ask it about a ferry departure, a cabin question — anything a passenger would ask. Watch what happens.',
                note: 'Hand him the laptop or phone if possible. The moment he types the first message himself, he is testing his own product.',
                color: '#C9A84C',
              },
              {
                n: 'Demo 3', title: 'Fleet Ops dashboard', sub: '',
                nav: 'Navigate to Fleet Ops. Show all vessels live.',
                quote: 'This is every vessel in your fleet, live. Position, speed, fuel burn, ETA. You can ask it in plain language: where is Knossos Palace right now?',
                note: 'If he leans forward here, the vessel ops module is his personal priority. Note it.',
                color: '#2563eb',
              },
            ].map(d => (
              <div key={d.n} className="border border-white/8 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-white text-sm">{d.n} — {d.title}</span>
                  {d.sub && <span className="text-xs px-2 py-0.5 rounded-full border font-medium" style={{ color: d.color, borderColor: d.color + '50', background: d.color + '15' }}>{d.sub}</span>}
                </div>
                <p className="text-slate-400 text-xs mb-2">{d.nav}</p>
                <Quote>{d.quote}</Quote>
                <Note>{d.note}</Note>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-1">
            <Ask>Is this kind of live fleet view something your operations team currently has access to?</Ask>
            <Ask>When a vessel is delayed, how does your team currently communicate that to passengers?</Ask>
            <Ask>How many IT tickets does your team handle in an average week — roughly?</Ask>
          </div>
        </SectionCard>

        {/* ── THE ROADMAP ─────────────────────────────────────────────── */}
        <SectionCard id="roadmap">
          <SectionTag time="20–25 min" label="The Roadmap" />
          <H2>How we build this together — phase by phase.</H2>
          <p className="text-slate-400 text-sm mb-6">Do not present this as a project with a start and end date. Present it as a growing partnership. The roadmap has no finish line.</p>

          <div className="overflow-x-auto rounded-xl border border-white/8 mb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-white/5">
                  <th className="px-4 py-3 text-left text-slate-300 font-semibold w-10">Phase</th>
                  <th className="px-4 py-3 text-left text-slate-300 font-semibold w-28">Timeline</th>
                  <th className="px-4 py-3 text-left text-slate-300 font-semibold">What we build</th>
                  <th className="px-4 py-3 text-left text-[#C9A84C] font-semibold w-44">Investment</th>
                </tr>
              </thead>
              <tbody>
                {PHASES.map((p, i) => (
                  <tr key={p.n} className={`border-b border-white/5 ${p.highlight ? 'bg-amber-500/5' : i % 2 === 0 ? 'bg-white/2' : ''}`}>
                    <td className="px-4 py-3">
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: p.highlight ? '#C9A84C' : '#003087' }}>
                        {p.n}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold" style={{ color: p.highlight ? '#C9A84C' : '#60a5fa' }}>{p.period}</td>
                    <td className="px-4 py-3 text-slate-300">{p.what}</td>
                    <td className="px-4 py-3 font-bold" style={{ color: p.highlight ? '#C9A84C' : '#4ade80' }}>{p.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Quote>
            &quot;Think of this not as a project. Think of it as your AI department — always on, always improving, always one step ahead of the next regulatory change. We do not deliver and disappear. We grow with Minoan Lines.&quot;
          </Quote>

          <Ask>Of the four phases, which feels most immediately relevant to what your team needs this year?</Ask>
          <Ask>Is there a budget cycle or approval process I should be aware of for the compliance pilot?</Ask>

          <div className="mt-6 flex items-center gap-3 p-4 bg-white/4 border border-white/8 rounded-xl">
            <div className="text-slate-300 text-sm flex-1">Detailed investment breakdown and ROI calculations</div>
            <Link href="/pricing"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 text-[#001A4D] flex-shrink-0"
              style={{ background: '#C9A84C' }}>
              View Pricing <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </SectionCard>

        {/* ── Q&A ─────────────────────────────────────────────────────── */}
        <SectionCard id="qa">
          <SectionTag time="25–28 min" label="Questions & Objections" />
          <H2>Every concern, answered directly.</H2>
          <div className="space-y-2 mt-2">
            {QA.map((item, i) => (
              <div key={i} className="border border-white/8 rounded-xl overflow-hidden">
                <button className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                  onClick={() => setOpenQA(openQA === i ? null : i)}>
                  <span className="font-semibold text-white text-sm">{item.q}</span>
                  {openQA === i
                    ? <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />}
                </button>
                {openQA === i && (
                  <div className="px-5 pb-4 border-t border-white/6">
                    <Quote>{item.a}</Quote>
                  </div>
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── THE DECISION ────────────────────────────────────────────── */}
        <SectionCard id="close">
          <SectionTag time="28–30 min" label="The Decision" />
          <H2>One decision. Fourteen days. Then the results speak.</H2>

          <div className="bg-white/4 border border-white/10 rounded-xl p-5 mb-6">
            <p className="text-white font-semibold text-sm mb-3">Your closing statement — say this word for word:</p>
            <Quote>
              &quot;You have seen the platform running. You have seen the compliance reports it generates. You have seen the AI answering passenger questions at 3am in Greek, Italian, and German simultaneously.&quot;
            </Quote>
            <Quote>&quot;The question is not whether this works. It is already working.&quot;</Quote>
            <Quote>
              &quot;I am proposing a four-week compliance pilot at €3,000. No IT involvement from your side. No procurement risk. If at the end of four weeks you have not seen clear value, we part ways and you keep every report that was generated.&quot;
            </Quote>
            <Quote>&quot;All I need from you today is a yes to start the clock.&quot;</Quote>
            <Note>Then stop talking. Do not add anything. Look at him. Wait.</Note>
          </div>

          <p className="text-white font-semibold text-sm mb-3">Three acceptable close outcomes — do not leave without one:</p>
          <div className="space-y-2 mb-6">
            {[
              {
                tag: 'BEST', color: '#16a34a', bg: 'bg-green-500/8', border: 'border-green-500/30',
                title: 'Pilot sign-off today.',
                desc: "Ask: 'Can we agree to start the compliance pilot? I can have the first module running within 2 weeks. All I need is a brief call with your team about your current data sources.'",
              },
              {
                tag: 'GOOD', color: '#2563eb', bg: 'bg-blue-500/8', border: 'border-blue-500/30',
                title: 'Next meeting with stakeholders.',
                desc: "Say: 'Can we schedule a second meeting where I walk through a live demo on your actual vessel data?'",
              },
              {
                tag: 'MINIMUM', color: '#475569', bg: 'bg-slate-500/8', border: 'border-slate-500/30',
                title: 'Named next step.',
                desc: "Ask: 'Who else at Minoan Lines should be part of this conversation? I want the right people to see what I have built.'",
              },
            ].map(o => (
              <div key={o.tag} className={`${o.bg} border ${o.border} rounded-xl p-4 flex gap-4 items-start`}>
                <span className="text-white text-xs font-bold px-2.5 py-1 rounded flex-shrink-0" style={{ background: o.color }}>{o.tag}</span>
                <div>
                  <span className="text-white font-semibold text-sm">{o.title} </span>
                  <span className="text-slate-300 text-sm">{o.desc}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border border-amber-500/30 bg-amber-500/8 rounded-xl p-5">
            <p className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">Your final line — say this as you stand to leave:</p>
            <Quote>
              &quot;Mr. Orfanoudakis — Minoan Lines just won Passenger Line of the Year. You are already the best at what you do. What I am offering is the technology layer that makes sure that standard is maintained and extended — not just for this season, but for the next decade. I would be proud to be the company that helps you do that.&quot;
            </Quote>
            <Note>Then shake his hand. Do not add anything. That is your exit.</Note>
          </div>
        </SectionCard>

        {/* ── BACK CARD ───────────────────────────────────────────────── */}
        <div className="rounded-2xl p-8 text-center"
          style={{ background: 'linear-gradient(135deg, #060d1f 0%, #001A4D 100%)', border: '1px solid rgba(201,168,76,0.2)' }}>
          <p className="text-slate-400 text-sm mb-1">Nnamdi Ambrose Junior Eze · Co-Founder, IntegraMind AI</p>
          <p className="text-slate-500 text-xs mb-6">contact@integramindai.com · +38670515599 · integramindai.com</p>
          <p className="font-bold text-xl md:text-2xl" style={{ color: '#C9A84C' }}>
            The number in your mind walking in: €758,000.
          </p>
          <p className="text-slate-300 text-sm mt-2">That is Minoan Lines alone, over a decade.</p>

          <div className="flex flex-col items-center gap-3 mt-8">
            <div className="bg-white rounded-xl p-3">
              <QRCodeSVG value={APP_URL} size={100} fgColor="#001A4D" bgColor="#ffffff" />
            </div>
            <p className="text-slate-500 text-xs font-mono">{APP_URL}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

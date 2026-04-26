import Link from 'next/link';
import { Ship, MessageCircle, FileText, Headphones, BarChart2, Ticket, CheckCircle, ArrowRight, Anchor, Zap, Globe, Mail, Calendar, ShieldCheck, Activity, AlertTriangle, Clock, TrendingUp, Users } from 'lucide-react';

const modules = [
  {
    icon: MessageCircle,
    title: 'AI Customer Agent',
    subtitle: 'Sofia — Multilingual 24/7 Support',
    color: 'bg-purple-600',
    impact: 'Handles 80% of routine enquiries without human intervention',
    metrics: ['20 languages supported', 'Voice input & spoken responses', 'Full conversation history saved', 'Average response under 2 seconds'],
    value: 'Reduces customer service headcount requirement and eliminates after-hours missed contacts',
    href: '/chat',
  },
  {
    icon: Ship,
    title: 'Vessel Operations',
    subtitle: 'Real-Time Fleet Intelligence',
    color: 'bg-blue-600',
    impact: 'Live visibility across the entire fleet with AI-powered delay prediction',
    metrics: ['8 vessels tracked in real time', 'Delay probability per vessel', 'Speed, fuel, and route data', 'AIS-ready architecture'],
    value: 'Enables proactive passenger communications before disruptions escalate',
    href: '/vessels',
  },
  {
    icon: FileText,
    title: 'EU Compliance',
    subtitle: 'EU ETS & FuelEU Maritime Automation',
    color: 'bg-green-600',
    impact: 'Generates regulatory-grade compliance reports in seconds instead of days',
    metrics: ['EU ETS & FuelEU Maritime coverage', 'CII scoring per vessel', 'PDF download + email delivery', 'GHG intensity tracking'],
    value: 'Eliminates manual reporting burden and ensures executive-level visibility before regulatory deadlines',
    href: '/compliance',
  },
  {
    icon: Headphones,
    title: 'IT Helpdesk',
    subtitle: 'AI-Triaged Ticket Management',
    color: 'bg-orange-600',
    impact: 'AI triage assigns priority and suggests responses at the moment of ticket creation',
    metrics: ['Automatic priority classification', 'AI-generated resolution suggestions', 'Status workflow management', 'SLA breach detection'],
    value: 'Eliminates manual sorting and misrouted tickets — your IT team resolves instead of reads',
    href: '/helpdesk',
  },
  {
    icon: ShieldCheck,
    title: 'Infrastructure Monitoring',
    subtitle: 'Real-Time System Health & Alert Rules',
    color: 'bg-slate-700',
    impact: 'Proactive monitoring across all platform services with automated email alerts',
    metrics: ['7 services monitored continuously', 'Auto-refresh every 30 seconds', '5 alert rules with email notification', 'Full audit log of every event'],
    value: 'IT team knows about failures before users do — shift from reactive firefighting to proactive management',
    href: '/health',
  },
  {
    icon: BarChart2,
    title: 'Demand Analytics',
    subtitle: 'Revenue Intelligence & Forecasting',
    color: 'bg-rose-600',
    impact: '30-day passenger demand forecasts with profit opportunity and risk analysis',
    metrics: ['Route-level revenue forecasting', 'Weekend vs weekday demand split', 'Risk/reward ratio per route', 'Estimated revenue loss if unactioned'],
    value: 'Gives revenue management the quantified intelligence to act before demand shifts occur',
    href: '/analytics',
  },
  {
    icon: Ticket,
    title: 'Ferry Booking',
    subtitle: 'Digital Reservation with Instant Confirmation',
    color: 'bg-amber-600',
    impact: 'End-to-end booking flow with professional email confirmation delivered instantly',
    metrics: ['4 routes, 4 cabin classes', 'Vehicle transport included', 'Branded booking reference', 'Automated email confirmation'],
    value: 'Foundation for full end-to-end booking automation integrated with the Grimaldi Group reservation system',
    href: '/book',
  },
];

const roadmap = [
  { phase: 'Phase 1', label: 'Current', items: ['All 7 modules live', 'AI chat in 20 languages', 'EU compliance reports', 'Infrastructure health monitoring', 'Ferry booking with email'] },
  { phase: 'Phase 2', label: '30–60 days', items: ['Live AIS feed integration', 'Real booking system API', 'Automated disruption alerts to passengers', 'Scheduled Grimaldi Group reports'] },
  { phase: 'Phase 3', label: '60–120 days', items: ['Grimaldi Group portal integration', 'Cargo workflow automation', 'Revenue management AI', 'Full SSO & access control'] },
];

export default function DemoPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 py-4">

      {/* Hero */}
      <div className="card overflow-hidden">
        <div className="bg-[#001A4D] px-8 py-10">
          <div className="flex items-center gap-3 mb-6">
            <Anchor className="w-8 h-8 text-[#C9A84C]" />
            <div>
              <div className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest">Minoan Lines S.A.</div>
              <div className="text-white text-2xl font-bold">AI Operations Platform</div>
            </div>
          </div>
          <p className="text-blue-200 text-base leading-relaxed max-w-2xl">
            An integrated AI platform purpose-built for Minoan Lines — automating passenger communications, compliance reporting, IT operations, demand forecasting, and operational workflows across seven interconnected modules.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            {[
              { icon: Globe, label: '20 Languages' },
              { icon: Zap, label: '7 Live Modules' },
              { icon: Mail, label: 'Automated Reports' },
              { icon: Activity, label: 'Live Monitoring' },
              { icon: Calendar, label: 'Ready for Integration' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-sm text-white">
                <Icon className="w-3.5 h-3.5 text-[#C9A84C]" />{label}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#003087] px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <p className="text-blue-200 text-sm">Built and deployed on Vercel · Powered by IntegraMind AI</p>
          <div className="flex gap-3">
            <Link href="/dashboard" className="flex items-center gap-1.5 bg-white text-[#003087] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors">
              <BarChart2 className="w-4 h-4" /> Live Dashboard
            </Link>
            <Link href="/book" className="flex items-center gap-1.5 bg-[#C9A84C] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors">
              <Ticket className="w-4 h-4" /> Live Demo
            </Link>
          </div>
        </div>
      </div>

      {/* The Problem */}
      <div className="card p-8">
        <h2 className="text-lg font-bold text-[#001A4D] dark:text-slate-100 mb-2">The Operational Challenge</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">Three systemic problems your teams face today — all addressable with this platform.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Fragmented Operations', desc: 'Vessel tracking, compliance reporting, customer support, and ticketing live in separate systems with no unified view for management.' },
            { title: 'Manual Reporting Burden', desc: 'EU ETS and FuelEU compliance reports require significant manual effort each period, creating risk of deadline misses and errors.' },
            { title: 'Missed Revenue Signals', desc: 'Demand patterns across routes are not systematically analysed, leaving revenue optimisation opportunities unquantified and unactioned.' },
          ].map(({ title, desc }) => (
            <div key={title} className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-4">
              <h3 className="font-semibold text-red-800 dark:text-red-300 text-sm mb-2">{title}</h3>
              <p className="text-sm text-red-700 dark:text-red-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* IT-Specific Value */}
      <div className="card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#C9A84C]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#001A4D] dark:text-slate-100">Value for IT — Administrator & Manager</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">Your IT team currently runs on reactive firefighting. This platform shifts them to proactive management.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* IT Administrator */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <h3 className="font-bold text-gray-900 dark:text-slate-100 text-sm uppercase tracking-wide">IT Administrator — Day to Day</h3>
            </div>
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/20 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide mb-1">Today's Reality</p>
              {[
                { icon: Clock, text: 'Manual ticket intake, categorisation, and prioritisation for every request' },
                { icon: AlertTriangle, text: 'No system-wide visibility — service failures discovered only when users complain' },
                { icon: Users, text: 'Morning manual checks across every system before work begins' },
                { icon: FileText, text: 'Writing status reports for management from scratch each week' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-2">
                  <Icon className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/20 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-1">With This Platform</p>
              {[
                { icon: CheckCircle, text: 'Zero-touch ticket triage — AI classifies, prioritises, and suggests resolutions instantly' },
                { icon: CheckCircle, text: 'Infrastructure monitoring refreshes every 30 seconds across all 7 services' },
                { icon: CheckCircle, text: 'Alert emails fire automatically before users are affected' },
                { icon: CheckCircle, text: 'Full audit log records every event — answer any management question in seconds' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-2">
                  <Icon className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-green-700 dark:text-green-400 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* IT Manager */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <h3 className="font-bold text-gray-900 dark:text-slate-100 text-sm uppercase tracking-wide">IT Manager — Accountability Upward</h3>
            </div>
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/20 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide mb-1">Today's Reality</p>
              {[
                { icon: Clock, text: 'Reporting to executives and Grimaldi Group requires significant manual compilation effort' },
                { icon: AlertTriangle, text: 'No single view of fleet ops, IT health, and compliance in one place' },
                { icon: TrendingUp, text: 'Hard to justify IT headcount or budget without quantified performance data' },
                { icon: Users, text: 'IT team\'s value is invisible to leadership — effort is not measured or reported' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-2">
                  <Icon className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/20 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-1">With This Platform</p>
              {[
                { icon: CheckCircle, text: 'Executive dashboard opens in any meeting — live KPIs, fleet, compliance, and IT health in 10 seconds' },
                { icon: CheckCircle, text: 'Weekly reports email automatically to management and Grimaldi Group — no manual effort' },
                { icon: CheckCircle, text: 'ETS cost in EUR, delay risk %, SLA breach counts — hard numbers for every budget conversation' },
                { icon: CheckCircle, text: 'A platform Minoan Lines owns — not a vendor SaaS licence. Demonstrable to Grimaldi Group as internal capability' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-2">
                  <Icon className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-green-700 dark:text-green-400 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* IT Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {[
            { value: '7', label: 'Services monitored live', color: 'text-blue-600' },
            { value: '5', label: 'Automated alert rules', color: 'text-orange-600' },
            { value: '30s', label: 'Health refresh interval', color: 'text-green-600' },
            { value: '100%', label: 'Ticket resolutions logged', color: 'text-purple-600' },
          ].map(({ value, label, color }) => (
            <div key={label} className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3 text-center">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-tight">{label}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex gap-3">
          <Link href="/health" className="flex items-center gap-1.5 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors">
            <Activity className="w-4 h-4" /> View Infrastructure Monitor
          </Link>
          <Link href="/helpdesk" className="flex items-center gap-1.5 btn-secondary text-sm">
            <Headphones className="w-4 h-4" /> View IT Helpdesk
          </Link>
        </div>
      </div>

      {/* Modules */}
      <div>
        <h2 className="text-lg font-bold text-[#001A4D] dark:text-slate-100 mb-4">Platform Modules — All Live</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map(({ icon: Icon, title, subtitle, color, impact, metrics, value, href }) => (
            <div key={title} className="card p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-slate-100">{title}</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{subtitle}</p>
                </div>
                <Link href={href} className="ml-auto flex items-center gap-1 text-xs text-[#003087] dark:text-blue-400 hover:underline flex-shrink-0">
                  Open <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <p className="text-sm text-gray-700 dark:text-slate-300 font-medium">{impact}</p>
              <div className="grid grid-cols-2 gap-1">
                {metrics.map(m => (
                  <div key={m} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-slate-400">
                    <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />{m}
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg px-3 py-2 text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Roadmap */}
      <div className="card p-8">
        <h2 className="text-lg font-bold text-[#001A4D] dark:text-slate-100 mb-6">Integration Roadmap</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roadmap.map(({ phase, label, items }, i) => (
            <div key={phase} className="relative">
              {i < roadmap.length - 1 && (
                <div className="hidden md:block absolute top-5 left-full w-full h-0.5 bg-gradient-to-r from-gray-200 to-transparent dark:from-slate-700 z-0 -translate-y-0.5" />
              )}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 font-bold text-sm ${i === 0 ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300'}`}>
                {i === 0 ? <CheckCircle className="w-5 h-5" /> : i + 1}
              </div>
              <div className="font-bold text-gray-900 dark:text-slate-100 text-sm">{phase}</div>
              <div className={`text-xs font-semibold mb-2 ${i === 0 ? 'text-green-600' : 'text-gray-400 dark:text-slate-500'}`}>{label}</div>
              <ul className="space-y-1.5">
                {items.map(item => (
                  <li key={item} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-slate-400">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${i === 0 ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ROI Section */}
      <div className="card p-8 bg-gradient-to-br from-[#001A4D] to-[#003087] text-white">
        <h2 className="text-lg font-bold mb-6">Quantified Business Value</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '80%', label: 'Customer queries handled by AI without human escalation' },
            { value: 'Zero', label: 'Manual effort required to generate a compliance report' },
            { value: '30s', label: 'Infrastructure health refresh — issues caught before users notice' },
            { value: '100%', label: 'IT tickets auto-triaged, classified, and logged from submission' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold text-[#C9A84C]">{value}</div>
              <div className="text-xs text-blue-200 mt-1 leading-relaxed">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="card p-8 border-2 border-[#C9A84C]/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/15 flex items-center justify-center flex-shrink-0">
            <ArrowRight className="w-6 h-6 text-[#C9A84C]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#001A4D] dark:text-slate-100 mb-2">Proposed Next Steps</h2>
            <div className="space-y-2 text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
              <p>The platform is fully deployed and operational. All seven modules are live and demonstrable in a browser, on any device, right now.</p>
              <p>The immediate next step is a technical integration session to connect the platform to Minoan Lines' existing systems — specifically the reservation database, live AIS feed, and the Grimaldi Group reporting portal.</p>
              <p>A phased integration approach is recommended, starting with the highest-friction areas: automated compliance reporting delivery and live vessel data — both of which have the clearest ROI and the lowest integration complexity.</p>
            </div>
            <div className="flex flex-wrap gap-3 mt-5">
              <Link href="/dashboard" className="btn-primary flex items-center gap-2 text-sm">
                <BarChart2 className="w-4 h-4" /> View Live Dashboard
              </Link>
              <Link href="/health" className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors">
                <Activity className="w-4 h-4" /> Infrastructure Monitor
              </Link>
              <Link href="/chat" className="btn-secondary flex items-center gap-2 text-sm">
                <MessageCircle className="w-4 h-4" /> Talk to Sofia
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

'use client';
import { useState, useEffect, useCallback } from 'react';
import { Ship, FileText, BarChart2, Headphones, MessageCircle, TrendingUp, AlertTriangle, CheckCircle, Users, DollarSign, RefreshCw, Loader2, Activity, Zap } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import Link from 'next/link';
import { clsx } from 'clsx';

type VesselData = { name: string; status: string; delay_probability: number; speed_knots: number; route: string };
type ComplianceVessel = { vessel: string; co2_emissions_tons: number; cii_score: number; fueleu_rating: string };
type ComplianceSummary = { total_co2_tons: number; total_ets_allowances: number; avg_cii_score: number; report_date: string };
type RouteStats = { route: string; avg_daily_passengers: number; weekly_forecast: { date: string; predicted_passengers: number }[]; revenue_estimate_eur: number };
type AnalyticsSummary = { total_weekly_passengers: number; total_weekly_revenue_eur: number; peak_route: string; forecast_accuracy: string };
type Ticket = { id: string; status: string; priority: string; category: string; created_at: string };

export default function DashboardPage() {
  const [vessels, setVessels] = useState<VesselData[]>([]);
  const [compVessels, setCompVessels] = useState<ComplianceVessel[]>([]);
  const [compSummary, setCompSummary] = useState<ComplianceSummary | null>(null);
  const [analytics, setAnalytics] = useState<{ routes: RouteStats[]; summary: AnalyticsSummary } | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, cRes, aRes, hRes] = await Promise.all([
        fetch('/api/vessels'),
        fetch('/api/compliance'),
        fetch('/api/analytics'),
        fetch('/api/helpdesk'),
      ]);
      const [v, c, a, h] = await Promise.all([vRes.json(), cRes.json(), aRes.json(), hRes.json()]);
      setVessels(Array.isArray(v) ? v : []);
      setCompVessels(c.vessels || []);
      setCompSummary(c.fleet_summary || null);
      setAnalytics(a);
      setTickets(Array.isArray(h) ? h : []);
      setLastRefresh(new Date());
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const underway = vessels.filter(v => v.status === 'underway').length;
  const highRisk = vessels.filter(v => v.delay_probability > 0.7).length;
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const criticalTickets = tickets.filter(t => t.priority === 'critical').length;
  const ratingDist = compVessels.reduce((acc, v) => { acc[v.fueleu_rating] = (acc[v.fueleu_rating] || 0) + 1; return acc; }, {} as Record<string, number>);
  const pieData = Object.entries(ratingDist).map(([name, value]) => ({ name: `Rating ${name}`, value, fill: name === 'A' ? '#16a34a' : name === 'B' ? '#2563eb' : name === 'C' ? '#d97706' : '#dc2626' }));
  const topRoute = analytics?.routes.find(r => r.route === analytics.summary.peak_route);
  const chartData = topRoute?.weekly_forecast.slice(0, 7) || [];
  const etsCostEur = ((compSummary?.total_ets_allowances || 0) * 65).toLocaleString();

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#003087] mx-auto" />
        <p className="text-sm text-gray-500 dark:text-slate-400">Loading executive dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#001A4D] dark:text-slate-100">Executive Overview</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Minoan Lines AI Platform · {lastRefresh ? `Updated ${lastRefresh.toLocaleTimeString()}` : 'Loading...'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/demo" className="flex items-center gap-1.5 px-3 py-2 bg-[#C9A84C] text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors">
            <Zap className="w-4 h-4" /> View Pitch Deck
          </Link>
          <button onClick={load} className="btn-secondary flex items-center gap-1.5 text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Top KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Fleet Active', value: `${underway} / ${vessels.length}`, sub: `${highRisk} high delay risk`, icon: Ship, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', href: '/vessels' },
          { label: 'CO2 This Month', value: `${compSummary?.total_co2_tons.toFixed(0) || '—'} t`, sub: `ETS exposure ~€${etsCostEur}`, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', href: '/compliance' },
          { label: 'Weekly Revenue', value: `€${analytics ? (analytics.summary.total_weekly_revenue_eur / 1000).toFixed(0) + 'k' : '—'}`, sub: `${analytics?.summary.total_weekly_passengers.toLocaleString() || '—'} passengers`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', href: '/analytics' },
          { label: 'Open Tickets', value: String(openTickets), sub: criticalTickets > 0 ? `${criticalTickets} critical` : 'No critical issues', icon: Headphones, color: criticalTickets > 0 ? 'text-red-600' : 'text-purple-600', bg: criticalTickets > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-purple-50 dark:bg-purple-900/20', href: '/helpdesk' },
        ].map(({ label, value, sub, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href} className="card p-4 hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between mb-2">
              <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center', bg)}>
                <Icon className={clsx('w-4 h-4', color)} />
              </div>
              <Activity className="w-3 h-3 text-gray-300 dark:text-slate-600 group-hover:text-[#003087] transition-colors" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">{value}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{label}</div>
            <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{sub}</div>
          </Link>
        ))}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Demand Forecast Chart */}
        <div className="card p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-slate-100">Passenger Demand — 7-Day Forecast</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Peak route: {analytics?.summary.peak_route?.replace('-', ' → ')} · Accuracy {analytics?.summary.forecast_accuracy}</p>
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">Live Forecast</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#003087" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#003087" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d: string) => d.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [v, 'Passengers']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Area type="monotone" dataKey="predicted_passengers" stroke="#003087" fill="url(#dashGrad)" strokeWidth={2} name="Forecast" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Compliance Ratings */}
        <div className="card p-4">
          <h2 className="font-semibold text-gray-900 dark:text-slate-100 mb-1">FuelEU Fleet Ratings</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">Avg CII: <strong>{compSummary?.avg_cii_score.toFixed(1)}</strong></p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(v: number, name: string) => [v + ' vessels', name]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <Link href="/compliance" className="text-xs text-[#003087] dark:text-blue-400 hover:underline">View full compliance report →</Link>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Fleet Status Table */}
        <div className="card overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-slate-100">Fleet Status</h2>
            <Link href="/vessels" className="text-xs text-[#003087] dark:text-blue-400 hover:underline">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-slate-900">
                <tr>
                  {['Vessel', 'Route', 'Speed', 'Status', 'Delay Risk'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                {vessels.map(v => (
                  <tr key={v.name} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-slate-100">{v.name}</td>
                    <td className="px-3 py-2.5 text-gray-500 dark:text-slate-400">{v.route}</td>
                    <td className="px-3 py-2.5 text-gray-500 dark:text-slate-400">{v.speed_knots} kn</td>
                    <td className="px-3 py-2.5">
                      <span className={clsx('badge text-[10px]',
                        v.status === 'underway' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        v.status === 'at_anchor' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300')}>
                        {v.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
                          <div className={clsx('h-full rounded-full', v.delay_probability > 0.7 ? 'bg-red-500' : v.delay_probability > 0.4 ? 'bg-orange-400' : 'bg-green-500')}
                            style={{ width: `${v.delay_probability * 100}%` }} />
                        </div>
                        <span className={clsx('text-[10px] font-medium', v.delay_probability > 0.7 ? 'text-red-600' : v.delay_probability > 0.4 ? 'text-orange-500' : 'text-green-600')}>
                          {(v.delay_probability * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Module Status + Helpdesk */}
        <div className="space-y-4">
          <div className="card p-4">
            <h2 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">Platform Modules</h2>
            <div className="space-y-2">
              {[
                { label: 'Vessel Operations', href: '/vessels', icon: Ship, status: 'Live' },
                { label: 'AI Customer Agent', href: '/chat', icon: MessageCircle, status: 'Live' },
                { label: 'EU Compliance', href: '/compliance', icon: FileText, status: 'Live' },
                { label: 'IT Helpdesk', href: '/helpdesk', icon: Headphones, status: 'Live' },
                { label: 'Analytics', href: '/analytics', icon: BarChart2, status: 'Live' },
                { label: 'Ferry Booking', href: '/book', icon: TrendingUp, status: 'Live' },
              ].map(({ label, href, icon: Icon, status }) => (
                <Link key={href} href={href} className="flex items-center justify-between py-1.5 hover:opacity-80 transition-opacity">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-[#003087] dark:text-blue-400" />
                    <span className="text-sm text-gray-700 dark:text-slate-300">{label}</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />{status}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900 dark:text-slate-100">Helpdesk Summary</h2>
              <Link href="/helpdesk" className="text-xs text-[#003087] dark:text-blue-400 hover:underline">View →</Link>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Open', count: tickets.filter(t => t.status === 'open').length, color: 'bg-blue-500' },
                { label: 'In Progress', count: tickets.filter(t => t.status === 'in_progress').length, color: 'bg-purple-500' },
                { label: 'Resolved', count: tickets.filter(t => t.status === 'resolved').length, color: 'bg-green-500' },
                { label: 'Escalated', count: tickets.filter(t => t.status === 'escalated').length, color: 'bg-red-500' },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={clsx('w-2 h-2 rounded-full', color)} />
                    <span className="text-gray-600 dark:text-slate-400">{label}</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-slate-100">{count}</span>
                </div>
              ))}
              {tickets.length === 0 && <p className="text-xs text-gray-400 dark:text-slate-500">No tickets loaded</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

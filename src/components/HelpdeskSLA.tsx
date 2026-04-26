'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

type Stats = {
  total: number;
  byStatus: { open: number; in_progress: number; resolved: number; escalated: number };
  byCategory: { name: string; count: number }[];
  avgResolutionHours: number | null;
  overdueCount: number;
  resolvedCount: number;
  slaBreachRate: number;
  weeklyTrend: { day: string; count: number }[];
};

const STATUS_COLORS: Record<string, string> = {
  open: '#3b82f6',
  in_progress: '#a855f7',
  resolved: '#22c55e',
  escalated: '#ef4444',
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

export default function HelpdeskSLA() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/helpdesk/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="card p-6 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-[#003087]" />
    </div>
  );
  if (!stats) return null;

  const statusPie = Object.entries(stats.byStatus)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-500" />Total Tickets
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">{stats.total}</div>
          <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{stats.resolvedCount} resolved</div>
        </div>

        <div className={clsx('card p-4', stats.overdueCount > 0 ? 'border-l-4 border-red-500' : '')}>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 mb-1">
            <AlertTriangle className={clsx('w-4 h-4', stats.overdueCount > 0 ? 'text-red-500' : 'text-gray-400')} />
            Overdue (&gt;24h)
          </div>
          <div className={clsx('text-2xl font-bold', stats.overdueCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-slate-100')}>
            {stats.overdueCount}
          </div>
          <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">SLA breach: {stats.slaBreachRate}%</div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 mb-1">
            <Clock className="w-4 h-4 text-purple-500" />Avg Resolution
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            {stats.avgResolutionHours != null ? `${stats.avgResolutionHours}h` : '—'}
          </div>
          <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">across resolved tickets</div>
        </div>

        <div className={clsx('card p-4', stats.byStatus.open > 0 ? '' : '')}>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 mb-1">
            <AlertCircle className="w-4 h-4 text-orange-500" />Open Now
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">{stats.byStatus.open}</div>
          <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{stats.byStatus.in_progress} in progress</div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly trend */}
        <div className="card p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Tickets — Last 7 Days</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyTrend} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" fill="#003087" radius={[4, 4, 0, 0]} name="Tickets" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status donut */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">By Status</h3>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} innerRadius={28}>
                  {statusPie.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] || '#9ca3af'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 justify-center">
            {statusPie.map(s => (
              <span key={s.name} className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: STATUS_COLORS[s.name] }} />
                {s.name.replace('_', ' ')} ({s.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      {stats.byCategory.length > 0 && (
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Tickets by Category</h3>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byCategory} layout="vertical" margin={{ top: 0, right: 16, left: 32, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" fill="#C9A84C" radius={[0, 4, 4, 0]} name="Tickets" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

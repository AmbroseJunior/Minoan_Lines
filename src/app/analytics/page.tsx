'use client';
import { useState, useEffect, useCallback } from 'react';
import { BarChart2, TrendingUp, Users, DollarSign, RefreshCw, Loader2, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type RouteStats = {
  route: string;
  avg_daily_passengers: number;
  weekly_forecast: { date: string; predicted_passengers: number; lower_bound: number; upper_bound: number }[];
  revenue_estimate_eur: number;
};

type Analytics = {
  routes: RouteStats[];
  summary: { total_weekly_passengers: number; total_weekly_revenue_eur: number; peak_route: string; forecast_accuracy: string };
  generated_at: string;
};

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string>('');
  const [insights, setInsights] = useState('');
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      const json = await res.json();
      setData(json);
      if (json.routes?.length) setSelected(json.routes[0].route);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function generateInsights() {
    if (!selected) return;
    setGenerating(true);
    setInsights('');
    try {
      const res = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ route: selected, horizon_days: 30 }),
      });
      const json = await res.json();
      setInsights(json.insights || '');
    } finally { setGenerating(false); }
  }

  if (loading) return <div className="card p-8 text-center"><Loader2 className="w-8 h-8 animate-spin text-[#003087] mx-auto" /></div>;

  const s = data?.summary;
  const chartData = data?.routes.find(r => r.route === selected)?.weekly_forecast || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-[#003087]" />
          <h1 className="text-xl font-bold text-[#001A4D]">Demand Analytics</h1>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-1.5 text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {s && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Weekly Passengers', value: s.total_weekly_passengers.toLocaleString(), icon: Users },
            { label: 'Weekly Revenue', value: `€${(s.total_weekly_revenue_eur / 1000).toFixed(0)}k`, icon: DollarSign },
            { label: 'Peak Route', value: s.peak_route?.split('-').join(' → '), icon: TrendingUp },
            { label: 'Forecast Accuracy', value: s.forecast_accuracy, icon: BarChart2 },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="card p-4">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Icon className="w-4 h-4 text-[#003087]" />{label}
              </div>
              <div className="text-xl font-bold text-gray-900 truncate">{value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card p-4 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-semibold text-gray-900">7-Day Demand Forecast</h2>
          <select value={selected} onChange={e => setSelected(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]">
            {data?.routes.map(r => <option key={r.route} value={r.route}>{r.route.replace('-', ' → ')}</option>)}
          </select>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="passGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#003087" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#003087" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [v, 'Passengers']} labelFormatter={l => `Date: ${l}`} />
              <Area type="monotone" dataKey="upper_bound" stroke="transparent" fill="url(#passGrad)" name="Range" />
              <Area type="monotone" dataKey="predicted_passengers" stroke="#003087" fill="transparent" strokeWidth={2} name="Forecast" />
              <Area type="monotone" dataKey="lower_bound" stroke="transparent" fill="white" name="" legendType="none" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C9A84C]" />
          <h2 className="font-semibold text-gray-900">AI Demand Insights</h2>
        </div>
        <button onClick={generateInsights} disabled={generating} className="btn-primary flex items-center gap-2 text-sm">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate Insights for {selected?.replace('-', ' → ')}
        </button>
        {insights && (
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {insights}
          </div>
        )}
      </div>
    </div>
  );
}

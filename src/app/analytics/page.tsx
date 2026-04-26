'use client';
import { useState, useEffect, useCallback } from 'react';
import { BarChart2, TrendingUp, Users, DollarSign, RefreshCw, Loader2, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';

type ForecastDay = { date: string; predicted_passengers: number; lower_bound: number; upper_bound: number };
type RouteStats = { route: string; avg_daily_passengers: number; weekly_forecast: ForecastDay[]; revenue_estimate_eur: number };
type Analytics = { routes: RouteStats[]; summary: { total_weekly_passengers: number; total_weekly_revenue_eur: number; peak_route: string; forecast_accuracy: string }; generated_at: string };

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('');
  const [insights, setInsights] = useState('');
  const [insightError, setInsightError] = useState('');
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
    setInsightError('');
    try {
      const res = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ route: selected, horizon_days: 30 }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setInsights(json.insights || '');
    } catch (e) {
      setInsightError(e instanceof Error ? e.message : 'Failed to generate insights');
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
          <h1 className="text-xl font-bold text-[#001A4D] dark:text-slate-100">{t('analytics.title')}</h1>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-1.5 text-sm">
          <RefreshCw className="w-4 h-4" />{t('analytics.refresh')}
        </button>
      </div>

      {s && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t('analytics.weeklyPassengers'), value: s.total_weekly_passengers.toLocaleString(), icon: Users },
            { label: t('analytics.weeklyRevenue'), value: `€${(s.total_weekly_revenue_eur / 1000).toFixed(0)}k`, icon: DollarSign },
            { label: t('analytics.peakRoute'), value: s.peak_route?.replace('-', ' → '), icon: TrendingUp },
            { label: t('analytics.forecastAccuracy'), value: s.forecast_accuracy, icon: BarChart2 },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="card p-4">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 mb-1">
                <Icon className="w-4 h-4 text-[#003087] dark:text-blue-400" />{label}
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-slate-100 truncate">{value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card p-4 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-semibold text-gray-900 dark:text-slate-100">{t('analytics.forecastTitle')}</h2>
          <select value={selected} onChange={e => setSelected(e.target.value)}
            className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">
            {data?.routes.map(r => (
              <option key={r.route} value={r.route}>{r.route.replace('-', ' → ')}</option>
            ))}
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
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d: string) => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [v, 'Passengers']} />
              <Area type="monotone" dataKey="upper_bound" stroke="transparent" fill="url(#passGrad)" legendType="none" name="Range" />
              <Area type="monotone" dataKey="predicted_passengers" stroke="#003087" fill="transparent" strokeWidth={2} name="Forecast" />
              <Area type="monotone" dataKey="lower_bound" stroke="transparent" fill="white" legendType="none" name="" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C9A84C]" />
          <h2 className="font-semibold text-gray-900 dark:text-slate-100">{t('analytics.aiInsights')}</h2>
        </div>
        <button onClick={generateInsights} disabled={generating} className="btn-primary flex items-center gap-2 text-sm">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generating ? t('common.loading') : `${t('analytics.generateInsights')} ${selected.replace('-', ' → ')}`}
        </button>
        {insightError && <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg p-3 text-sm">{insightError}</div>}
        {insights && (
          <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-5 text-sm text-gray-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed border-l-4 border-[#C9A84C]" style={{ fontFamily: 'Georgia, serif', lineHeight: '1.8' }}>
            {insights}
          </div>
        )}
      </div>
    </div>
  );
}

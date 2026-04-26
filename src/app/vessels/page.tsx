'use client';
import { useState, useEffect, useCallback } from 'react';
import { Ship, RefreshCw, Anchor, Navigation } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

type Vessel = {
  name: string; status: string; speed_knots: number; route: string;
  lat: number; lon: number; delay_probability: number; eta_hours: number | null;
  fuel_consumption_tons: number; last_updated: string;
};

function riskColor(p: number) {
  if (p > 0.7) return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
  if (p > 0.4) return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400';
  return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
}

function statusBadge(s: string) {
  if (s === 'underway') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  if (s === 'at_anchor') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  return 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300';
}

export default function VesselsPage() {
  const { t } = useTranslation();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vessels');
      setVessels(await res.json());
      setLastRefresh(new Date());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const statusLabel = (s: string) => t(`vessels.status.${s}`, s.replace('_', ' '));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ship className="w-5 h-5 text-[#003087]" />
          <h1 className="text-xl font-bold text-[#001A4D] dark:text-slate-100">{t('vessels.title')}</h1>
        </div>
        <button onClick={load} disabled={loading} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
          {t('vessels.refresh')}
        </button>
      </div>

      {lastRefresh && (
        <p className="text-xs text-gray-400 dark:text-slate-500">{t('vessels.lastUpdated')}: {lastRefresh.toLocaleTimeString()}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading && !vessels.length
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-2/3" />
              </div>
            ))
          : vessels.map(v => (
              <div key={v.name} className="card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Anchor className="w-4 h-4 text-[#003087]" />
                    <span className="font-semibold text-sm text-gray-900 dark:text-slate-100">{v.name}</span>
                  </div>
                  <span className={clsx('badge', statusBadge(v.status))}>
                    {statusLabel(v.status)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                  <Navigation className="w-3 h-3" />{v.route}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 dark:bg-slate-900 rounded p-2">
                    <div className="text-gray-400 dark:text-slate-500">{t('vessels.speed')}</div>
                    <div className="font-medium text-gray-900 dark:text-slate-100">{v.speed_knots} kn</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-900 rounded p-2">
                    <div className="text-gray-400 dark:text-slate-500">{t('vessels.fuel')}</div>
                    <div className="font-medium text-gray-900 dark:text-slate-100">{v.fuel_consumption_tons} t/day</div>
                  </div>
                  {v.eta_hours && (
                    <div className="bg-gray-50 dark:bg-slate-900 rounded p-2">
                      <div className="text-gray-400 dark:text-slate-500">{t('vessels.eta')}</div>
                      <div className="font-medium text-gray-900 dark:text-slate-100">{v.eta_hours}h</div>
                    </div>
                  )}
                  <div className={clsx('rounded p-2', riskColor(v.delay_probability))}>
                    <div className="opacity-70">{t('vessels.delayRisk')}</div>
                    <div className="font-medium">{(v.delay_probability * 100).toFixed(0)}%</div>
                  </div>
                </div>
                <div className="text-[10px] text-gray-400 dark:text-slate-500">
                  {v.lat.toFixed(3)}°N {v.lon.toFixed(3)}°E
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}

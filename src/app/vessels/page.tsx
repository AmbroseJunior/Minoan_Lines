'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Ship, RefreshCw, Anchor, Navigation, Clock, MapPin, Fuel, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

const VesselMap = dynamic(() => import('@/components/VesselMap'), { ssr: false, loading: () => (
  <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl">
    <div className="text-sm text-gray-400 dark:text-slate-500 animate-pulse">Loading map...</div>
  </div>
) });

type Vessel = {
  name: string; status: string; speed_knots: number; route: string;
  lat: number; lon: number; delay_probability: number;
  departure_time: string; arrival_time: string; eta_label: string; eta_hours: number | null;
  fuel_consumption_tons: number; last_updated: string; heading: number;
  ais_live?: boolean;
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
  const [vessels, setVessels]     = useState<Vessel[]>([]);
  const [loading, setLoading]     = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [selected, setSelected]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vessels');
      const data = await res.json();
      setVessels(data);
      setLastRefresh(new Date());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const underway = vessels.filter(v => v.status === 'underway').length;
  const highRisk = vessels.filter(v => v.delay_probability > 0.7).length;
  const aisLive  = vessels.filter(v => v.ais_live).length;

  const scrollToCard = (name: string) => {
    setSelected(name);
    const el = document.getElementById(`vessel-${name.replace(/\s+/g, '-')}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ship className="w-5 h-5 text-[#003087]" />
          <h1 className="text-xl font-bold text-[#001A4D] dark:text-slate-100">{t('vessels.title')}</h1>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <p className="text-xs text-gray-400 dark:text-slate-500 hidden sm:block">
              Updated {lastRefresh.toLocaleTimeString()}
            </p>
          )}
          <button onClick={load} disabled={loading} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
            {t('vessels.refresh')}
          </button>
        </div>
      </div>

      {/* Fleet summary strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Fleet Size', value: vessels.length, icon: Ship, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Underway', value: underway, icon: Navigation, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'High Delay Risk', value: highRisk, icon: AlertTriangle, color: highRisk > 0 ? 'text-red-600' : 'text-gray-400', bg: highRisk > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-slate-800' },
          { label: 'AIS Live Feed', value: aisLive, icon: Navigation, color: aisLive > 0 ? 'text-emerald-600' : 'text-gray-400', bg: aisLive > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-gray-50 dark:bg-slate-800' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-3 flex items-center gap-3">
            <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', bg)}>
              <Icon className={clsx('w-4 h-4', color)} />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-slate-100">{value}</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="card overflow-hidden" style={{ height: '420px' }}>
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 dark:border-slate-700">
          <MapPin className="w-4 h-4 text-[#003087] dark:text-blue-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">Fleet Live Positions — Aegean Sea</span>
          <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Live
          </span>
        </div>
        <div style={{ height: 'calc(100% - 41px)' }}>
          <VesselMap vessels={vessels} selectedName={selected ?? undefined} onSelect={scrollToCard} />
        </div>
      </div>

      {/* Vessel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading && !vessels.length
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
                <div className="h-16 bg-gray-200 dark:bg-slate-700 rounded" />
              </div>
            ))
          : vessels.map(v => (
              <div
                key={v.name}
                id={`vessel-${v.name.replace(/\s+/g, '-')}`}
                onClick={() => setSelected(v.name === selected ? null : v.name)}
                className={clsx(
                  'card p-4 space-y-3 cursor-pointer transition-all',
                  v.name === selected
                    ? 'ring-2 ring-[#003087] dark:ring-blue-400 shadow-md'
                    : 'hover:shadow-md'
                )}
              >
                {/* Name + status */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Anchor className="w-4 h-4 text-[#003087] dark:text-blue-400 flex-shrink-0" />
                    <span className="font-semibold text-sm text-gray-900 dark:text-slate-100">{v.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {v.ais_live && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />AIS
                      </span>
                    )}
                    <span className={clsx('badge text-[10px]', statusBadge(v.status))}>
                      {v.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Route */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                  <Navigation className="w-3 h-3 flex-shrink-0" />
                  <span className="font-medium">{v.route}</span>
                </div>

                {/* Departure / Arrival */}
                <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-start gap-1.5">
                    <Clock className="w-3 h-3 text-gray-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">
                        {v.status === 'underway' ? 'Departure' : 'Next Schedule'}
                      </div>
                      <div className="text-xs font-medium text-gray-800 dark:text-slate-200">{v.departure_time}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3 h-3 text-[#003087] dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">
                        {v.status === 'underway' ? 'Arrival' : 'Est. Arrival'}
                      </div>
                      <div className="text-xs font-medium text-gray-800 dark:text-slate-200">{v.arrival_time}</div>
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-gray-50 dark:bg-slate-900 rounded p-2 text-center">
                    <div className="text-gray-400 dark:text-slate-500 text-[10px]">Speed</div>
                    <div className="font-medium text-gray-900 dark:text-slate-100">
                      {v.status === 'underway' ? `${v.speed_knots} kn` : '—'}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-900 rounded p-2 text-center">
                    <div className="text-[10px] text-gray-400 dark:text-slate-500 flex items-center justify-center gap-0.5">
                      <Fuel className="w-2.5 h-2.5" />Fuel
                    </div>
                    <div className="font-medium text-gray-900 dark:text-slate-100">{v.fuel_consumption_tons}t</div>
                  </div>
                  <div className={clsx('rounded p-2 text-center', riskColor(v.delay_probability))}>
                    <div className="opacity-70 text-[10px]">Delay</div>
                    <div className="font-medium">{(v.delay_probability * 100).toFixed(0)}%</div>
                  </div>
                </div>

                {/* Delay bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-gray-400 dark:text-slate-500">
                    <span>Delay probability</span>
                    <span>{v.eta_label}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={clsx('h-full rounded-full transition-all',
                        v.delay_probability > 0.7 ? 'bg-red-500' :
                        v.delay_probability > 0.4 ? 'bg-orange-400' : 'bg-green-500'
                      )}
                      style={{ width: `${v.delay_probability * 100}%` }}
                    />
                  </div>
                </div>

                {/* Coordinates */}
                <div className="text-[10px] text-gray-300 dark:text-slate-600">
                  {v.lat}°N · {v.lon}°E
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}

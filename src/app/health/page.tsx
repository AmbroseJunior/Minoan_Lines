'use client';
import { useState, useEffect, useCallback } from 'react';
import { Activity, CheckCircle, AlertTriangle, XCircle, RefreshCw, Loader2, Bell, BellOff, Shield, Database, Cpu, Mail, Ship, MessageCircle, FileText, Headphones, BarChart2, Clock, Zap } from 'lucide-react';
import { clsx } from 'clsx';

type ServiceHealth = { name: string; status: 'healthy' | 'degraded' | 'down'; ms: number; error?: string; detail?: string; http?: number };
type HealthData = {
  overall: string; checked_at: string; response_ms: number; uptime_pct: string;
  modules: ServiceHealth[]; services: ServiceHealth[];
  summary: { total: number; healthy: number; degraded: number; down: number };
};
type AlertResult = { rule: string; triggered: boolean; severity: string; message: string; value?: string | number; threshold?: string | number };
type AlertData = { alerts: AlertResult[]; triggered: number; critical: number; email_sent: boolean; checked_at: string };

const MODULE_ICONS: Record<string, React.ElementType> = {
  'Vessel Operations API': Ship,
  'Compliance API': FileText,
  'Analytics API': BarChart2,
  'Helpdesk API': Headphones,
};

const SERVICE_ICONS: Record<string, React.ElementType> = {
  'Supabase Database': Database,
  'DeepSeek AI API': Cpu,
  'Resend Email': Mail,
};

function StatusBadge({ status }: { status: string }) {
  if (status === 'healthy') return (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2.5 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Healthy
    </span>
  );
  if (status === 'degraded') return (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-2.5 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Degraded
    </span>
  );
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 px-2.5 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />Down
    </span>
  );
}

function msBar(ms: number) {
  const w = Math.min((ms / 3000) * 100, 100);
  const color = ms < 500 ? 'bg-green-500' : ms < 1500 ? 'bg-amber-400' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
        <div className={clsx('h-full rounded-full', color)} style={{ width: `${w}%` }} />
      </div>
      <span className="text-xs text-gray-500 dark:text-slate-400 tabular-nums">{ms}ms</span>
    </div>
  );
}

const ALERT_RULES = [
  { key: 'vessel_delay', label: 'Vessel Delay Risk', desc: 'Triggers when any vessel exceeds 70% delay probability', severity: 'warning', icon: Ship },
  { key: 'critical_tickets', label: 'Critical IT Tickets', desc: 'Triggers when critical tickets remain open', severity: 'critical', icon: Headphones },
  { key: 'fleet_cii', label: 'Fleet CII Score', desc: 'Triggers when fleet average CII drops below 65', severity: 'warning', icon: FileText },
  { key: 'ets_exposure', label: 'ETS Cost Exposure', desc: 'Triggers when ETS exposure exceeds EUR 150,000', severity: 'warning', icon: AlertTriangle },
  { key: 'stale_tickets', label: 'Stale Open Tickets', desc: 'Triggers when tickets remain open for more than 48 hours', severity: 'info', icon: Clock },
];

export default function HealthPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [alertData, setAlertData] = useState<AlertData | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [runningAlerts, setRunningAlerts] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastAlert, setLastAlert] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    setLoadingHealth(true);
    try {
      const res = await fetch('/api/health');
      setHealth(await res.json());
    } finally { setLoadingHealth(false); }
  }, []);

  const runAlertCheck = useCallback(async () => {
    setRunningAlerts(true);
    try {
      const res = await fetch('/api/alerts/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notify_email: notifyEmail || undefined }),
      });
      const data = await res.json();
      setAlertData(data);
      setLastAlert(new Date());
    } finally { setRunningAlerts(false); }
  }, [notifyEmail]);

  useEffect(() => {
    checkHealth();
    runAlertCheck();
  }, [checkHealth, runAlertCheck]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(checkHealth, 30000);
    return () => clearInterval(id);
  }, [autoRefresh, checkHealth]);

  const overallColor = health?.overall === 'healthy' ? 'bg-green-500' : health?.overall === 'degraded' ? 'bg-amber-500' : 'bg-red-500';
  const overallLabel = health?.overall === 'healthy' ? 'All Systems Operational' : health?.overall === 'degraded' ? 'Partial Degradation' : 'Service Disruption';
  const overallTextColor = health?.overall === 'healthy' ? 'text-green-700 dark:text-green-400' : health?.overall === 'degraded' ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400';
  const overallBg = health?.overall === 'healthy' ? 'bg-green-50 dark:bg-green-900/20' : health?.overall === 'degraded' ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-red-50 dark:bg-red-900/20';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#001A4D] dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#003087]" /> Infrastructure Health
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            {health ? `Last checked: ${new Date(health.checked_at).toLocaleTimeString()}` : 'Checking...'}
            {autoRefresh && <span className="text-green-600 dark:text-green-400 ml-2">· Auto-refreshing every 30s</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setAutoRefresh(a => !a)}
            className={clsx('flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              autoRefresh ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'btn-secondary')}>
            {autoRefresh ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{autoRefresh ? 'Live' : 'Paused'}</span>
          </button>
          <button onClick={checkHealth} disabled={loadingHealth} className="btn-secondary flex items-center gap-1.5 text-sm">
            <RefreshCw className={clsx('w-4 h-4', loadingHealth && 'animate-spin')} /> Refresh
          </button>
        </div>
      </div>

      {/* Overall Status Banner */}
      {health && (
        <div className={clsx('card p-4 flex items-center justify-between', overallBg)}>
          <div className="flex items-center gap-3">
            <div className={clsx('w-3 h-3 rounded-full', overallColor, health.overall === 'healthy' && 'animate-pulse')} />
            <div>
              <div className={clsx('font-bold', overallTextColor)}>{overallLabel}</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">{health.summary.healthy} of {health.summary.total} systems healthy · Platform uptime {health.uptime_pct}%</div>
            </div>
          </div>
          <div className="flex items-center gap-6 text-center">
            {[
              { label: 'Healthy', count: health.summary.healthy, color: 'text-green-600' },
              { label: 'Degraded', count: health.summary.degraded, color: 'text-amber-600' },
              { label: 'Down', count: health.summary.down, color: 'text-red-600' },
            ].map(({ label, count, color }) => (
              <div key={label}>
                <div className={clsx('text-xl font-bold', color)}>{count}</div>
                <div className="text-xs text-gray-500 dark:text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Module + Service Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Application Modules */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#003087]" />
            <h2 className="font-semibold text-gray-900 dark:text-slate-100">Application Modules</h2>
          </div>
          {loadingHealth ? (
            <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-[#003087] mx-auto" /></div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
              {health?.modules.map(s => {
                const Icon = MODULE_ICONS[s.name] || Activity;
                return (
                  <div key={s.name} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#003087] dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-slate-100">{s.name}</div>
                        {s.error && <div className="text-xs text-red-500">{s.error}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {msBar(s.ms)}
                      <StatusBadge status={s.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* External Services */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#003087]" />
            <h2 className="font-semibold text-gray-900 dark:text-slate-100">External Services</h2>
          </div>
          {loadingHealth ? (
            <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-[#003087] mx-auto" /></div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
              {health?.services.map(s => {
                const Icon = SERVICE_ICONS[s.name] || Activity;
                return (
                  <div key={s.name} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-slate-100">{s.name}</div>
                        {(s.error || s.detail) && <div className="text-xs text-gray-400 dark:text-slate-500">{s.error || s.detail}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {msBar(s.ms)}
                      <StatusBadge status={s.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Alert Rules */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#003087]" />
              <h2 className="font-semibold text-gray-900 dark:text-slate-100">Alert Rules</h2>
              {alertData && <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', alertData.triggered > 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400')}>
                {alertData.triggered > 0 ? `${alertData.triggered} triggered` : 'All clear'}
              </span>}
            </div>
            <div className="flex items-center gap-2">
              <input type="email" value={notifyEmail} onChange={e => setNotifyEmail(e.target.value)}
                placeholder="Alert email (optional)"
                className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 w-52" />
              <button onClick={runAlertCheck} disabled={runningAlerts}
                className="btn-primary flex items-center gap-1.5 text-sm py-1.5">
                {runningAlerts ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                {runningAlerts ? 'Checking...' : 'Run Check'}
              </button>
            </div>
          </div>
          {lastAlert && <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">Last checked: {lastAlert.toLocaleTimeString()}{alertData?.email_sent && ' · Alert email sent'}</p>}
        </div>
        <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
          {ALERT_RULES.map(rule => {
            const result = alertData?.alerts.find(a => a.rule === rule.label);
            const Icon = rule.icon;
            return (
              <div key={rule.key} className={clsx('flex items-start gap-4 px-4 py-3', result?.triggered ? 'bg-red-50/50 dark:bg-red-900/5' : '')}>
                <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                  result?.triggered
                    ? rule.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
                    : 'bg-green-50 dark:bg-green-900/20')}>
                  {result?.triggered
                    ? <AlertTriangle className={clsx('w-4 h-4', rule.severity === 'critical' ? 'text-red-600' : 'text-amber-600')} />
                    : <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{rule.label}</span>
                    <span className={clsx('text-[10px] font-bold uppercase px-1.5 py-0.5 rounded',
                      rule.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                      rule.severity === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400')}>
                      {rule.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{result ? result.message : rule.desc}</p>
                  {result?.triggered && result.value !== undefined && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-red-600 dark:text-red-400 font-medium">Current: {result.value}</span>
                      {result.threshold !== undefined && <span className="text-xs text-gray-400">· Threshold: {result.threshold}</span>}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {result ? (
                    result.triggered
                      ? <XCircle className="w-5 h-5 text-red-500" />
                      : <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-200 dark:border-slate-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Platform Stats */}
      {health && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Platform Uptime', value: `${health.uptime_pct}%`, icon: Activity, color: 'text-green-600' },
            { label: 'Check Duration', value: `${health.response_ms}ms`, icon: Zap, color: 'text-blue-600' },
            { label: 'Services Healthy', value: `${health.summary.healthy}/${health.summary.total}`, icon: CheckCircle, color: 'text-green-600' },
            { label: 'Alert Rules Active', value: String(ALERT_RULES.length), icon: Bell, color: 'text-purple-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-4">
              <Icon className={clsx('w-4 h-4 mb-2', color)} />
              <div className="text-xl font-bold text-gray-900 dark:text-slate-100">{value}</div>
              <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

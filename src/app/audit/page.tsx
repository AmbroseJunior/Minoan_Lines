'use client';
import { useState, useEffect, useCallback } from 'react';
import { Shield, RefreshCw, Loader2, Ticket, FileText, Activity, Filter } from 'lucide-react';
import { clsx } from 'clsx';

type AuditEntry = {
  id: string;
  event_type: string;
  module: string;
  summary: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

const MODULE_ICON: Record<string, React.ElementType> = {
  helpdesk: Ticket,
  compliance: FileText,
  health: Activity,
};

const MODULE_COLOR: Record<string, string> = {
  helpdesk: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  compliance: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  health: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const EVENT_COLOR: Record<string, string> = {
  ticket_created: 'border-blue-400 bg-blue-50 dark:bg-blue-900/10',
  ticket_updated: 'border-purple-400 bg-purple-50 dark:bg-purple-900/10',
  report_generated: 'border-green-400 bg-green-50 dark:bg-green-900/10',
  alert_triggered: 'border-red-400 bg-red-50 dark:bg-red-900/10',
};

const MODULES = ['', 'helpdesk', 'compliance', 'health'];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModule, setFilterModule] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/audit${filterModule ? `?module=${filterModule}` : ''}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setEntries(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load audit log');
    } finally { setLoading(false); }
  }, [filterModule]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#003087]" />
          <h1 className="text-xl font-bold text-[#001A4D] dark:text-slate-100">Audit Log</h1>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-1.5 text-sm">
          <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Module filter */}
      <div className="flex gap-2 flex-wrap items-center">
        <Filter className="w-4 h-4 text-gray-400" />
        {MODULES.map(m => (
          <button key={m} onClick={() => setFilterModule(m)}
            className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              filterModule === m
                ? 'bg-[#003087] text-white'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700')}>
            {m || 'All Modules'}
          </button>
        ))}
      </div>

      {error && (
        <div className="card p-4 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20">
          {error} — ensure the <code>audit_log</code> table exists in Supabase.
        </div>
      )}

      {loading ? (
        <div className="card p-8 text-center"><Loader2 className="w-8 h-8 animate-spin text-[#003087] mx-auto" /></div>
      ) : entries.length === 0 ? (
        <div className="card p-8 text-center text-gray-500 dark:text-slate-400">
          <Shield className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          No audit events yet. Events are logged automatically as you use the platform.
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200 dark:bg-slate-700" />

          <div className="space-y-3">
            {entries.map(entry => {
              const Icon = MODULE_ICON[entry.module] || Activity;
              return (
                <div key={entry.id} className="relative flex gap-4 pl-4">
                  {/* Dot */}
                  <div className={clsx(
                    'relative z-10 flex-shrink-0 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center mt-2',
                    entry.event_type.includes('created') ? 'bg-blue-500' :
                    entry.event_type.includes('updated') ? 'bg-purple-500' :
                    entry.event_type.includes('escalat') ? 'bg-red-500' :
                    entry.event_type.includes('report') ? 'bg-green-500' : 'bg-gray-400'
                  )} />

                  {/* Card */}
                  <div className={clsx(
                    'flex-1 card p-3.5 border-l-4',
                    EVENT_COLOR[entry.event_type] || 'border-gray-300 bg-white dark:bg-slate-800'
                  )}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={clsx('badge flex items-center gap-1', MODULE_COLOR[entry.module] || 'bg-gray-100 text-gray-600')}>
                          <Icon className="w-3 h-3" />{entry.module}
                        </span>
                        <span className="badge bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-xs">
                          {entry.event_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-slate-500 flex-shrink-0">{timeAgo(entry.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-slate-300 mt-1.5 font-medium">{entry.summary}</p>
                    {Object.keys(entry.metadata || {}).length > 0 && (
                      <div className="mt-1.5 flex gap-2 flex-wrap">
                        {Object.entries(entry.metadata).map(([k, v]) => (
                          <span key={k} className="text-xs text-gray-400 dark:text-slate-500">
                            <span className="font-medium text-gray-500 dark:text-slate-400">{k}:</span> {String(v)}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                      {new Date(entry.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

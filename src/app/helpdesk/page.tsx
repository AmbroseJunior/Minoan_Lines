'use client';
import { useState, useEffect, useCallback } from 'react';
import { Headphones, Plus, RefreshCw, AlertCircle, Clock, CheckCircle, X, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

type Ticket = {
  id: string; title: string; description: string; category: string;
  priority: string; status: string; reported_by: string;
  suggested_response: string; estimated_resolution_hours: number; created_at: string;
};

const priorityColor = (p: string) =>
  ({ critical: 'bg-red-100 text-red-700', high: 'bg-orange-100 text-orange-700', medium: 'bg-yellow-100 text-yellow-700' }[p] ?? 'bg-green-100 text-green-700');
const statusColor = (s: string) =>
  ({ open: 'bg-blue-100 text-blue-700', in_progress: 'bg-purple-100 text-purple-700', resolved: 'bg-green-100 text-green-700', escalated: 'bg-red-100 text-red-700' }[s] ?? 'bg-gray-100 text-gray-700');

export default function HelpdeskPage() {
  const { t: tr } = useTranslation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({ title: '', description: '', reported_by: '' });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setFetchError('');
    try {
      const res = await fetch(`/api/helpdesk${filterStatus ? `?status=${filterStatus}` : ''}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setTickets(Array.isArray(data) ? data : []);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Failed to load tickets');
    } finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  async function createTicket(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/helpdesk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setForm({ title: '', description: '', reported_by: '' });
      setShowForm(false);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to create ticket');
    } finally { setCreating(false); }
  }

  async function updateStatus(id: string, status: string) {
    await fetch('/api/helpdesk', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  const filters = ['', 'open', 'in_progress', 'resolved', 'escalated'] as const;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-[#003087]" />
          <h1 className="text-xl font-bold text-[#001A4D]">{tr('helpdesk.title')}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-secondary flex items-center gap-1.5 text-sm">
            <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-1.5 text-sm">
            <Plus className="w-4 h-4" />{tr('helpdesk.newTicket')}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{tr('helpdesk.newTicket')}</h2>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <form onSubmit={createTicket} className="space-y-3">
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder={`${tr('helpdesk.titleLabel')} *`} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]" />
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder={`${tr('helpdesk.descLabel')} *`} required rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]" />
            <input value={form.reported_by} onChange={e => setForm(f => ({ ...f, reported_by: e.target.value }))}
              placeholder={tr('helpdesk.nameLabel')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]" />
            <button type="submit" disabled={creating} className="btn-primary flex items-center gap-2 text-sm">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {tr('helpdesk.submit')}
            </button>
          </form>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {filters.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              filterStatus === s ? 'bg-[#003087] text-white' : 'bg-white text-gray-600 border hover:bg-gray-50')}>
            {s ? tr(`helpdesk.filters.${s}`, s) : tr('helpdesk.filters.all')}
          </button>
        ))}
      </div>

      {fetchError && (
        <div className="card p-4 text-red-600 text-sm bg-red-50">
          ⚠️ {fetchError} — run <code>supabase-schema.sql</code> in your Supabase SQL editor first.
        </div>
      )}

      {loading ? (
        <div className="card p-8 text-center"><Loader2 className="w-8 h-8 animate-spin text-[#003087] mx-auto" /></div>
      ) : !fetchError && tickets.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">
          <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-400" />
          {tr('helpdesk.noTickets')}
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map(ticket => (
            <div key={ticket.id} className="card overflow-hidden">
              <div className="p-4 cursor-pointer" onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={clsx('badge', priorityColor(ticket.priority))}>{ticket.priority}</span>
                      <span className={clsx('badge', statusColor(ticket.status))}>{ticket.status.replace('_', ' ')}</span>
                      <span className="badge bg-gray-100 text-gray-600">{ticket.category}</span>
                    </div>
                    <h3 className="font-medium text-gray-900 mt-1 truncate">{ticket.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />{new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                      {ticket.estimated_resolution_hours && <span>~{ticket.estimated_resolution_hours}h</span>}
                      {ticket.reported_by && <span>by {ticket.reported_by}</span>}
                    </div>
                  </div>
                  <AlertCircle className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                </div>
              </div>

              {expandedId === ticket.id && (
                <div className="px-4 pb-4 space-y-3 border-t pt-3">
                  <p className="text-sm text-gray-600">{ticket.description}</p>
                  {ticket.suggested_response && (
                    <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
                      <strong>{tr('helpdesk.aiSuggested')}:</strong> {ticket.suggested_response}
                    </div>
                  )}
                  {ticket.status !== 'resolved' && (
                    <div className="flex gap-2 flex-wrap">
                      {ticket.status === 'open' && (
                        <button onClick={() => updateStatus(ticket.id, 'in_progress')} className="btn-secondary text-xs py-1.5">
                          {tr('helpdesk.markInProgress')}
                        </button>
                      )}
                      <button onClick={() => updateStatus(ticket.id, 'resolved')} className="btn-primary text-xs py-1.5 bg-green-600 hover:bg-green-700">
                        {tr('helpdesk.markResolved')}
                      </button>
                      <button onClick={() => updateStatus(ticket.id, 'escalated')} className="btn-secondary text-xs py-1.5 text-red-600">
                        {tr('helpdesk.escalate')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

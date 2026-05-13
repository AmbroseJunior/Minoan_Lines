'use client';
import { useState, useEffect, useCallback } from 'react';
import { Wrench, Plus, RefreshCw, ChevronDown, ChevronUp, X, Loader2, AlertTriangle, CheckCircle, Clock, Package, Fuel, ClipboardList, Ship, Boxes, FlaskConical, Gauge } from 'lucide-react';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────

type WorkOrder = {
  id: string; work_order_number: string; asset_name: string; title: string;
  description: string; work_type: string; priority: string; status: string;
  assigned_to?: string; estimated_hours?: number; actual_hours?: number;
  parts_cost: number; labour_cost: number; scheduled_date?: string;
  completed_date?: string; technician_notes?: string; ai_priority_note?: string; created_at: string;
};
type Asset = {
  id: string; asset_number: string; name: string; asset_type: string;
  make?: string; model?: string; build_year?: number; imo_number?: string;
  flag_state: string; status: string; last_service_date?: string;
  next_service_date?: string; engine_hours: number; notes?: string;
};
type Schedule = {
  id: string; asset_name: string; schedule_name: string; maintenance_type: string;
  interval_type: string; interval_value: number; last_done_date?: string; next_due_date: string;
};
type Part = {
  id: string; part_number: string; name: string; category: string;
  unit: string; quantity_on_hand: number; minimum_stock_level: number;
  reorder_quantity: number; unit_cost?: number; vendor?: string; location?: string;
};
type Inspection = {
  id: string; asset_name: string; inspection_type: string; inspector_name: string;
  inspection_date: string; overall_status: string; defects_found?: string;
  corrective_actions?: string; next_inspection_date?: string;
};
type FuelLog = {
  id: string; asset_name: string; log_date: string; fuel_type: string;
  quantity_mt: number; cost_per_mt?: number; total_cost?: number;
  bunker_port?: string; supplier?: string; voyage_reference?: string;
};

// ─── Helpers ─────────────────────────────────────────────────

const priorityColor = (p: string) => ({ critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', low: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400' }[p] ?? 'bg-gray-100 text-gray-600');
const statusColor = (s: string) => ({ open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', in_progress: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', waiting_parts: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', cancelled: 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400' }[s] ?? 'bg-gray-100 text-gray-600');
const assetStatusColor = (s: string) => ({ operational: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', in_maintenance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', out_of_service: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', decommissioned: 'bg-gray-100 text-gray-500' }[s] ?? 'bg-gray-100 text-gray-600');
const inspectionColor = (s: string) => ({ passed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', passed_with_defects: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', failed: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' }[s] ?? 'bg-gray-100 text-gray-600');
const fuelColor = (t: string) => ({ hfo: 'bg-slate-100 text-slate-700', mgo: 'bg-blue-100 text-blue-700', lng: 'bg-emerald-100 text-emerald-700', diesel: 'bg-amber-100 text-amber-700', petrol: 'bg-orange-100 text-orange-700' }[t] ?? 'bg-gray-100 text-gray-600');
const assetTypeIcon = (t: string) => ({ vessel: '🚢', vehicle: '🚌', crane: '🏗️', generator: '⚡', equipment: '⚙️', tender: '⛵' }[t] ?? '⚙️');

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
function scheduleUrgency(next: string): 'overdue' | 'urgent' | 'warning' | 'ok' {
  const d = daysUntil(next);
  if (d < 0) return 'overdue';
  if (d <= 7) return 'urgent';
  if (d <= 30) return 'warning';
  return 'ok';
}
const urgencyStyle = { overdue: 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10', urgent: 'border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/10', warning: 'border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10', ok: '' };
const urgencyBadge = { overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', urgent: 'bg-orange-100 text-orange-700', warning: 'bg-yellow-100 text-yellow-700', ok: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };

const WORK_TYPES = ['preventive', 'corrective', 'inspection', 'emergency', 'modification'];
const INSPECT_TYPES = ['pre_voyage', 'post_voyage', 'routine', 'safety', 'class_survey', 'port_state', 'flag_state'];
const FUEL_TYPES = ['hfo', 'mgo', 'lng', 'diesel', 'petrol'];

// ─── Main Component ───────────────────────────────────────────

export default function MaintenancePage() {
  const [tab, setTab] = useState<'workorders' | 'schedule' | 'assets' | 'inventory' | 'inspections' | 'fuel'>('workorders');

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [inventory, setInventory] = useState<Part[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);

  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);

  const [woFilter, setWoFilter] = useState('');
  const [woPriorityFilter, setWoPriorityFilter] = useState('');
  const [expandedWO, setExpandedWO] = useState<string | null>(null);
  const [showWOForm, setShowWOForm] = useState(false);
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stockEdit, setStockEdit] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState('');

  const [woForm, setWoForm] = useState({ asset_name: '', title: '', description: '', work_type: 'preventive', priority: 'normal', assigned_to: '', estimated_hours: '', scheduled_date: '' });
  const [inspForm, setInspForm] = useState({ asset_name: '', inspection_type: 'routine', inspector_name: '', inspection_date: '', overall_status: 'passed', defects_found: '', corrective_actions: '', next_inspection_date: '' });
  const [fuelForm, setFuelForm] = useState({ asset_name: '', fuel_type: 'hfo', quantity_mt: '', cost_per_mt: '', bunker_port: '', supplier: '', log_date: '', voyage_reference: '' });

  const loadWO = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (woFilter) params.set('status', woFilter);
      if (woPriorityFilter) params.set('priority', woPriorityFilter);
      const res = await fetch(`/api/maintenance?${params}`);
      setWorkOrders(await res.json());
    } catch {} finally { setLoading(false); }
  }, [woFilter, woPriorityFilter]);

  const loadAssets = useCallback(async () => {
    setSubLoading(true);
    try { const r = await fetch('/api/maintenance/assets'); setAssets(await r.json()); } catch {} finally { setSubLoading(false); }
  }, []);

  const loadSchedules = useCallback(async () => {
    setSubLoading(true);
    try { const r = await fetch('/api/maintenance/schedules'); setSchedules(await r.json()); } catch {} finally { setSubLoading(false); }
  }, []);

  const loadInventory = useCallback(async () => {
    setSubLoading(true);
    try { const r = await fetch('/api/maintenance/inventory'); setInventory(await r.json()); } catch {} finally { setSubLoading(false); }
  }, []);

  const loadInspections = useCallback(async () => {
    setSubLoading(true);
    try { const r = await fetch('/api/maintenance/inspections'); setInspections(await r.json()); } catch {} finally { setSubLoading(false); }
  }, []);

  const loadFuel = useCallback(async () => {
    setSubLoading(true);
    try { const r = await fetch('/api/maintenance/fuel'); setFuelLogs(await r.json()); } catch {} finally { setSubLoading(false); }
  }, []);

  useEffect(() => { loadWO(); loadAssets(); }, [loadWO, loadAssets]);
  useEffect(() => {
    if (tab === 'schedule' && !schedules.length) loadSchedules();
    if (tab === 'inventory' && !inventory.length) loadInventory();
    if (tab === 'inspections' && !inspections.length) loadInspections();
    if (tab === 'fuel' && !fuelLogs.length) loadFuel();
  }, [tab]);  // eslint-disable-line react-hooks/exhaustive-deps

  // Stats
  const openWO = workOrders.filter(w => w.status === 'open' || w.status === 'in_progress').length;
  const criticalWO = workOrders.filter(w => w.priority === 'critical' && w.status !== 'completed').length;
  const inMaintenance = assets.filter(a => a.status === 'in_maintenance' || a.status === 'out_of_service').length;
  const lowStock = inventory.filter(p => p.quantity_on_hand <= p.minimum_stock_level).length;

  async function createWO(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch('/api/maintenance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...woForm, estimated_hours: woForm.estimated_hours ? Number(woForm.estimated_hours) : undefined }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setShowWOForm(false);
      setWoForm({ asset_name: '', title: '', description: '', work_type: 'preventive', priority: 'normal', assigned_to: '', estimated_hours: '', scheduled_date: '' });
      loadWO();
    } catch (err) { alert(err instanceof Error ? err.message : 'Failed'); }
    finally { setSaving(false); }
  }

  async function updateWOStatus(id: string, status: string, extraFields?: Record<string, unknown>) {
    await fetch('/api/maintenance', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, ...extraFields }) });
    loadWO();
  }

  async function createInspection(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch('/api/maintenance/inspections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(inspForm) });
      if (!res.ok) throw new Error('Failed');
      setShowInspectionForm(false);
      setInspForm({ asset_name: '', inspection_type: 'routine', inspector_name: '', inspection_date: '', overall_status: 'passed', defects_found: '', corrective_actions: '', next_inspection_date: '' });
      loadInspections();
    } catch (err) { alert(err instanceof Error ? err.message : 'Failed'); }
    finally { setSaving(false); }
  }

  async function createFuelLog(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch('/api/maintenance/fuel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...fuelForm, quantity_mt: Number(fuelForm.quantity_mt), cost_per_mt: fuelForm.cost_per_mt ? Number(fuelForm.cost_per_mt) : undefined }) });
      if (!res.ok) throw new Error('Failed');
      setShowFuelForm(false);
      setFuelForm({ asset_name: '', fuel_type: 'hfo', quantity_mt: '', cost_per_mt: '', bunker_port: '', supplier: '', log_date: '', voyage_reference: '' });
      loadFuel();
    } catch (err) { alert(err instanceof Error ? err.message : 'Failed'); }
    finally { setSaving(false); }
  }

  async function updateStock(id: string) {
    await fetch('/api/maintenance/inventory', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, quantity_on_hand: Number(stockValue) }) });
    setStockEdit(null);
    loadInventory();
  }

  const inputClass = 'w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100';
  const assetNames = assets.map(a => a.name);

  const tabs: { key: typeof tab; label: string; icon: typeof Wrench }[] = [
    { key: 'workorders', label: 'Work Orders', icon: Wrench },
    { key: 'schedule', label: 'PM Schedule', icon: Clock },
    { key: 'assets', label: 'Fleet Assets', icon: Ship },
    { key: 'inventory', label: 'Parts', icon: Boxes },
    { key: 'inspections', label: 'Inspections', icon: ClipboardList },
    { key: 'fuel', label: 'Fuel', icon: Fuel },
  ];

  // Fuel totals
  const fuelTotalMT = fuelLogs.reduce((s, f) => s + f.quantity_mt, 0);
  const fuelTotalCost = fuelLogs.reduce((s, f) => s + (f.total_cost || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-[#003087]" />
          <h1 className="text-xl font-bold text-[#001A4D] dark:text-slate-100">Fleet Maintenance</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { if (tab === 'workorders') loadWO(); else if (tab === 'assets') loadAssets(); else if (tab === 'schedule') loadSchedules(); else if (tab === 'inventory') loadInventory(); else if (tab === 'inspections') loadInspections(); else loadFuel(); }}
            className="btn-secondary flex items-center gap-1.5 text-sm">
            <RefreshCw className={clsx('w-4 h-4', (loading || subLoading) && 'animate-spin')} />
          </button>
          {tab === 'workorders' && <button onClick={() => setShowWOForm(s => !s)} className="btn-primary flex items-center gap-1.5 text-sm"><Plus className="w-4 h-4" />New Work Order</button>}
          {tab === 'inspections' && <button onClick={() => setShowInspectionForm(s => !s)} className="btn-primary flex items-center gap-1.5 text-sm"><Plus className="w-4 h-4" />New Inspection</button>}
          {tab === 'fuel' && <button onClick={() => setShowFuelForm(s => !s)} className="btn-primary flex items-center gap-1.5 text-sm"><Plus className="w-4 h-4" />Add Fuel Log</button>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Open Work Orders', value: openWO, icon: Wrench, color: openWO > 0 ? 'text-blue-600' : 'text-gray-400', bg: openWO > 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-slate-800' },
          { label: 'Critical Priority', value: criticalWO, icon: AlertTriangle, color: criticalWO > 0 ? 'text-red-600' : 'text-gray-400', bg: criticalWO > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-slate-800' },
          { label: 'Assets Off-Line', value: inMaintenance, icon: Ship, color: inMaintenance > 0 ? 'text-amber-600' : 'text-gray-400', bg: inMaintenance > 0 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-gray-50 dark:bg-slate-800' },
          { label: 'Low Stock Parts', value: lowStock, icon: Package, color: lowStock > 0 ? 'text-orange-600' : 'text-gray-400', bg: lowStock > 0 ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-gray-50 dark:bg-slate-800' },
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

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={clsx('flex items-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
              tab === key ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300')}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* ══════════ WORK ORDERS ══════════ */}
      {tab === 'workorders' && (
        <div className="space-y-4">
          {showWOForm && (
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 dark:text-slate-100">New Work Order</h2>
                <button onClick={() => setShowWOForm(false)}><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              <form onSubmit={createWO} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input value={woForm.asset_name} onChange={e => setWoForm(f => ({ ...f, asset_name: e.target.value }))} placeholder="Asset name *" required className={inputClass} list="asset-list" />
                  <datalist id="asset-list">{assetNames.map(n => <option key={n} value={n} />)}</datalist>
                  <input value={woForm.title} onChange={e => setWoForm(f => ({ ...f, title: e.target.value }))} placeholder="Title *" required className={inputClass} />
                </div>
                <textarea value={woForm.description} onChange={e => setWoForm(f => ({ ...f, description: e.target.value }))} placeholder="Description *" required rows={2} className={inputClass} />
                <div className="grid grid-cols-4 gap-3">
                  <select value={woForm.work_type} onChange={e => setWoForm(f => ({ ...f, work_type: e.target.value }))} className={inputClass}>
                    {WORK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select value={woForm.priority} onChange={e => setWoForm(f => ({ ...f, priority: e.target.value }))} className={inputClass}>
                    {['low', 'normal', 'high', 'critical'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input value={woForm.assigned_to} onChange={e => setWoForm(f => ({ ...f, assigned_to: e.target.value }))} placeholder="Assigned to" className={inputClass} />
                  <input value={woForm.scheduled_date} onChange={e => setWoForm(f => ({ ...f, scheduled_date: e.target.value }))} type="date" className={inputClass} />
                </div>
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create Work Order (AI will assess priority)
                </button>
              </form>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {(['', 'open', 'in_progress', 'waiting_parts', 'completed'] as const).map(s => (
              <button key={s} onClick={() => setWoFilter(s)}
                className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  woFilter === s ? 'bg-[#003087] text-white' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border dark:border-slate-700 hover:bg-gray-50')}>
                {s ? s.replace('_', ' ') : 'All'}
              </button>
            ))}
            <div className="ml-auto flex gap-2">
              {['', 'critical', 'high'].map(p => (
                <button key={p} onClick={() => setWoPriorityFilter(p)}
                  className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    woPriorityFilter === p ? 'bg-red-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border dark:border-slate-700 hover:bg-gray-50')}>
                  {p ? p.toUpperCase() : 'All Priority'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="card p-8 text-center"><Loader2 className="w-8 h-8 animate-spin text-[#003087] mx-auto" /></div>
          ) : (
            <div className="space-y-2">
              {workOrders.map(wo => (
                <div key={wo.id} className="card overflow-hidden">
                  <div className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                    onClick={() => setExpandedWO(expandedWO === wo.id ? null : wo.id)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-gray-400 dark:text-slate-500">{wo.work_order_number}</span>
                          <span className={clsx('badge text-[10px]', priorityColor(wo.priority))}>{wo.priority}</span>
                          <span className={clsx('badge text-[10px]', statusColor(wo.status))}>{wo.status.replace('_', ' ')}</span>
                          <span className="badge text-[10px] bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400">{wo.work_type}</span>
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-slate-100 mt-1 text-sm">{wo.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 dark:text-slate-500 flex-wrap">
                          <span>{wo.asset_name}</span>
                          {wo.assigned_to && <span>· {wo.assigned_to}</span>}
                          {wo.scheduled_date && <span>· Sched: {new Date(wo.scheduled_date).toLocaleDateString()}</span>}
                          {wo.estimated_hours && <span>· ~{wo.estimated_hours}h</span>}
                        </div>
                      </div>
                      {expandedWO === wo.id ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                    </div>
                  </div>

                  {expandedWO === wo.id && (
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100 dark:border-slate-700 pt-3">
                      <p className="text-sm text-gray-600 dark:text-slate-300">{wo.description}</p>
                      {wo.ai_priority_note && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2 text-xs text-blue-700 dark:text-blue-300">
                          <strong>AI Assessment: </strong>{wo.ai_priority_note}
                        </div>
                      )}
                      {wo.technician_notes && (
                        <div className="bg-gray-50 dark:bg-slate-900 rounded-lg px-3 py-2 text-xs text-gray-600 dark:text-slate-300">
                          <strong>Technician notes: </strong>{wo.technician_notes}
                        </div>
                      )}
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="bg-gray-50 dark:bg-slate-900 rounded p-2 text-center">
                          <div className="text-gray-400 dark:text-slate-500 text-[10px]">Est. Hours</div>
                          <div className="font-medium text-gray-800 dark:text-slate-200">{wo.estimated_hours ?? '—'}</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-900 rounded p-2 text-center">
                          <div className="text-gray-400 dark:text-slate-500 text-[10px]">Actual Hours</div>
                          <div className="font-medium text-gray-800 dark:text-slate-200">{wo.actual_hours ?? '—'}</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-900 rounded p-2 text-center">
                          <div className="text-gray-400 dark:text-slate-500 text-[10px]">Parts Cost</div>
                          <div className="font-medium text-gray-800 dark:text-slate-200">€{wo.parts_cost.toLocaleString()}</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-900 rounded p-2 text-center">
                          <div className="text-gray-400 dark:text-slate-500 text-[10px]">Labour Cost</div>
                          <div className="font-medium text-gray-800 dark:text-slate-200">€{wo.labour_cost.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {wo.status === 'open' && (
                          <button onClick={() => updateWOStatus(wo.id, 'in_progress')} className="btn-secondary text-xs py-1.5">Start Work</button>
                        )}
                        {wo.status === 'in_progress' && (
                          <>
                            <button onClick={() => updateWOStatus(wo.id, 'waiting_parts')} className="btn-secondary text-xs py-1.5">Waiting Parts</button>
                            <button onClick={() => updateWOStatus(wo.id, 'completed')} className="btn-primary text-xs py-1.5 bg-green-600 hover:bg-green-700 shadow-none" style={{ background: '#16a34a' }}>Complete</button>
                          </>
                        )}
                        {wo.status === 'waiting_parts' && (
                          <button onClick={() => updateWOStatus(wo.id, 'in_progress')} className="btn-secondary text-xs py-1.5">Parts Received — Resume</button>
                        )}
                        {wo.status !== 'completed' && wo.status !== 'cancelled' && (
                          <button onClick={() => updateWOStatus(wo.id, 'cancelled')} className="btn-secondary text-xs py-1.5 text-red-500 dark:text-red-400">Cancel</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {workOrders.length === 0 && !loading && (
                <div className="card p-8 text-center text-gray-500 dark:text-slate-400">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-400" />No work orders found.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════ PM SCHEDULE ══════════ */}
      {tab === 'schedule' && (
        <div className="space-y-2">
          {subLoading ? (
            <div className="card p-8 text-center"><Loader2 className="w-8 h-8 animate-spin text-[#003087] mx-auto" /></div>
          ) : (
            schedules
              .sort((a, b) => new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime())
              .map(s => {
                const urg = scheduleUrgency(s.next_due_date);
                const days = daysUntil(s.next_due_date);
                return (
                  <div key={s.id} className={clsx('card p-4 rounded-xl', urgencyStyle[urg])}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-gray-900 dark:text-slate-100">{s.schedule_name}</span>
                          <span className={clsx('badge text-[10px]', urgencyBadge[urg])}>
                            {urg === 'overdue' ? `${Math.abs(days)}d overdue` : urg === 'ok' ? `${days}d` : `${days}d`}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-slate-400 flex-wrap">
                          <span>{s.asset_name}</span>
                          <span>·</span>
                          <span>{s.maintenance_type}</span>
                          <span>·</span>
                          <span>Every {s.interval_value} {s.interval_type}</span>
                        </div>
                      </div>
                      <div className="text-right text-xs flex-shrink-0">
                        {s.last_done_date && <div className="text-gray-400 dark:text-slate-500">Last: {new Date(s.last_done_date).toLocaleDateString()}</div>}
                        <div className={clsx('font-medium', urg === 'overdue' ? 'text-red-600' : urg === 'urgent' ? 'text-orange-600' : 'text-gray-700 dark:text-slate-300')}>
                          Due: {new Date(s.next_due_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
          {!subLoading && schedules.length === 0 && (
            <div className="card p-8 text-center text-gray-500 dark:text-slate-400"><CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-400" />No PM schedules found.</div>
          )}
        </div>
      )}

      {/* ══════════ FLEET ASSETS ══════════ */}
      {tab === 'assets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {subLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
                <div className="h-12 bg-gray-200 dark:bg-slate-700 rounded" />
              </div>
            ))
          ) : assets.map(asset => (
            <div key={asset.id} className="card p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{assetTypeIcon(asset.asset_type)}</span>
                  <div>
                    <div className="font-semibold text-sm text-gray-900 dark:text-slate-100">{asset.name}</div>
                    <div className="text-[10px] text-gray-400 dark:text-slate-500">{asset.asset_number}</div>
                  </div>
                </div>
                <span className={clsx('badge text-[10px]', assetStatusColor(asset.status))}>{asset.status.replace('_', ' ')}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {asset.make && <div className="bg-gray-50 dark:bg-slate-900 rounded p-2"><div className="text-gray-400 dark:text-slate-500 text-[10px]">Make / Model</div><div className="font-medium text-gray-800 dark:text-slate-200">{asset.make} {asset.model}</div></div>}
                {asset.build_year && <div className="bg-gray-50 dark:bg-slate-900 rounded p-2"><div className="text-gray-400 dark:text-slate-500 text-[10px]">Built</div><div className="font-medium text-gray-800 dark:text-slate-200">{asset.build_year} · {asset.flag_state}</div></div>}
                {asset.imo_number && <div className="bg-gray-50 dark:bg-slate-900 rounded p-2"><div className="text-gray-400 dark:text-slate-500 text-[10px]">IMO Number</div><div className="font-medium text-gray-800 dark:text-slate-200">{asset.imo_number}</div></div>}
                {asset.engine_hours > 0 && <div className="bg-gray-50 dark:bg-slate-900 rounded p-2"><div className="text-gray-400 dark:text-slate-500 text-[10px]">Engine Hours</div><div className="font-medium text-gray-800 dark:text-slate-200">{asset.engine_hours.toLocaleString()} h</div></div>}
              </div>
              <div className="space-y-1 text-xs">
                {asset.last_service_date && <div className="flex justify-between"><span className="text-gray-400 dark:text-slate-500">Last Service</span><span className="text-gray-700 dark:text-slate-300">{new Date(asset.last_service_date).toLocaleDateString()}</span></div>}
                {asset.next_service_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 dark:text-slate-500">Next Service</span>
                    <span className={clsx('font-medium', daysUntil(asset.next_service_date) < 30 ? 'text-orange-600' : 'text-gray-700 dark:text-slate-300')}>{new Date(asset.next_service_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              {asset.notes && <p className="text-[10px] text-gray-400 dark:text-slate-500 italic">{asset.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {/* ══════════ PARTS INVENTORY ══════════ */}
      {tab === 'inventory' && (
        <div className="space-y-2">
          {lowStock > 0 && (
            <div className="card p-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <strong>{lowStock} item{lowStock !== 1 ? 's' : ''} at or below minimum stock level</strong> — reorder required.
              </div>
            </div>
          )}
          {subLoading ? (
            <div className="card p-8 text-center"><Loader2 className="w-8 h-8 animate-spin text-[#003087] mx-auto" /></div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                    {['Part #', 'Name', 'Category', 'In Stock', 'Min Level', 'Unit Cost', 'Vendor', 'Location', ''].map(h => (
                      <th key={h} className="text-left text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide px-3 py-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(part => {
                    const isLow = part.quantity_on_hand <= part.minimum_stock_level;
                    return (
                      <tr key={part.id} className={clsx('border-b border-gray-50 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50', isLow && 'bg-orange-50/50 dark:bg-orange-900/5')}>
                        <td className="px-3 py-2.5 font-mono text-xs text-gray-500 dark:text-slate-400">{part.part_number}</td>
                        <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-slate-100">{part.name}</td>
                        <td className="px-3 py-2.5"><span className="badge text-[10px] bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300">{part.category}</span></td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            {stockEdit === part.id ? (
                              <div className="flex items-center gap-1">
                                <input type="number" value={stockValue} onChange={e => setStockValue(e.target.value)} className="w-16 border rounded px-2 py-1 text-xs dark:bg-slate-900 dark:border-slate-600" />
                                <button onClick={() => updateStock(part.id)} className="text-xs text-green-600 font-semibold hover:underline">Save</button>
                                <button onClick={() => setStockEdit(null)} className="text-xs text-gray-400 hover:underline">Cancel</button>
                              </div>
                            ) : (
                              <span className={clsx('font-semibold', isLow ? 'text-orange-600 dark:text-orange-400' : 'text-gray-800 dark:text-slate-200')}>
                                {part.quantity_on_hand} {part.unit}
                              </span>
                            )}
                            {isLow && <span className="text-[9px] font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded-full">LOW</span>}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-gray-500 dark:text-slate-400">{part.minimum_stock_level} {part.unit}</td>
                        <td className="px-3 py-2.5 text-gray-600 dark:text-slate-300">{part.unit_cost ? `€${part.unit_cost.toLocaleString()}` : '—'}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-500 dark:text-slate-400">{part.vendor || '—'}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-400 dark:text-slate-500">{part.location || '—'}</td>
                        <td className="px-3 py-2.5">
                          <button onClick={() => { setStockEdit(part.id); setStockValue(String(part.quantity_on_hand)); }} className="text-xs text-[#003087] dark:text-blue-400 hover:underline font-medium">Adjust</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══════════ INSPECTIONS ══════════ */}
      {tab === 'inspections' && (
        <div className="space-y-4">
          {showInspectionForm && (
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 dark:text-slate-100">New Inspection Record</h2>
                <button onClick={() => setShowInspectionForm(false)}><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              <form onSubmit={createInspection} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input value={inspForm.asset_name} onChange={e => setInspForm(f => ({ ...f, asset_name: e.target.value }))} placeholder="Asset name *" required className={inputClass} list="asset-list2" />
                  <datalist id="asset-list2">{assetNames.map(n => <option key={n} value={n} />)}</datalist>
                  <select value={inspForm.inspection_type} onChange={e => setInspForm(f => ({ ...f, inspection_type: e.target.value }))} className={inputClass}>
                    {INSPECT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input value={inspForm.inspector_name} onChange={e => setInspForm(f => ({ ...f, inspector_name: e.target.value }))} placeholder="Inspector name *" required className={inputClass} />
                  <input value={inspForm.inspection_date} onChange={e => setInspForm(f => ({ ...f, inspection_date: e.target.value }))} type="date" className={inputClass} />
                  <select value={inspForm.overall_status} onChange={e => setInspForm(f => ({ ...f, overall_status: e.target.value }))} className={inputClass}>
                    <option value="passed">Passed</option>
                    <option value="passed_with_defects">Passed with Defects</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <textarea value={inspForm.defects_found} onChange={e => setInspForm(f => ({ ...f, defects_found: e.target.value }))} placeholder="Defects found (if any)" rows={2} className={inputClass} />
                <textarea value={inspForm.corrective_actions} onChange={e => setInspForm(f => ({ ...f, corrective_actions: e.target.value }))} placeholder="Corrective actions taken" rows={2} className={inputClass} />
                <div className="grid grid-cols-2 gap-3">
                  <input value={inspForm.next_inspection_date} onChange={e => setInspForm(f => ({ ...f, next_inspection_date: e.target.value }))} type="date" placeholder="Next inspection date" className={inputClass} />
                  <button type="submit" disabled={saving} className="btn-primary flex items-center justify-center gap-2 text-sm">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}Save Inspection
                  </button>
                </div>
              </form>
            </div>
          )}
          {subLoading ? (
            <div className="card p-8 text-center"><Loader2 className="w-8 h-8 animate-spin text-[#003087] mx-auto" /></div>
          ) : (
            <div className="space-y-2">
              {inspections.map(ins => (
                <div key={ins.id} className="card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-gray-900 dark:text-slate-100">{ins.asset_name}</span>
                        <span className="badge text-[10px] bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300">{ins.inspection_type.replace('_', ' ')}</span>
                        <span className={clsx('badge text-[10px]', inspectionColor(ins.overall_status))}>{ins.overall_status.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 dark:text-slate-500">
                        <span>Inspector: {ins.inspector_name}</span>
                        <span>·</span>
                        <span>{new Date(ins.inspection_date).toLocaleDateString()}</span>
                        {ins.next_inspection_date && <span>· Next: {new Date(ins.next_inspection_date).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                  {ins.defects_found && (
                    <div className="bg-orange-50 dark:bg-orange-900/10 rounded-lg px-3 py-2 text-xs text-orange-700 dark:text-orange-300">
                      <strong>Defects: </strong>{ins.defects_found}
                    </div>
                  )}
                  {ins.corrective_actions && (
                    <div className="bg-green-50 dark:bg-green-900/10 rounded-lg px-3 py-2 text-xs text-green-700 dark:text-green-300">
                      <strong>Actions: </strong>{ins.corrective_actions}
                    </div>
                  )}
                </div>
              ))}
              {inspections.length === 0 && !subLoading && (
                <div className="card p-8 text-center text-gray-500 dark:text-slate-400"><ClipboardList className="w-10 h-10 mx-auto mb-2 text-gray-300" />No inspection records found.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════ FUEL LOG ══════════ */}
      {tab === 'fuel' && (
        <div className="space-y-4">
          {showFuelForm && (
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 dark:text-slate-100">Add Fuel Log</h2>
                <button onClick={() => setShowFuelForm(false)}><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              <form onSubmit={createFuelLog} className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <input value={fuelForm.asset_name} onChange={e => setFuelForm(f => ({ ...f, asset_name: e.target.value }))} placeholder="Asset name *" required className={inputClass} list="asset-list3" />
                  <datalist id="asset-list3">{assetNames.map(n => <option key={n} value={n} />)}</datalist>
                  <select value={fuelForm.fuel_type} onChange={e => setFuelForm(f => ({ ...f, fuel_type: e.target.value }))} className={inputClass}>
                    {FUEL_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                  </select>
                  <input value={fuelForm.log_date} onChange={e => setFuelForm(f => ({ ...f, log_date: e.target.value }))} type="date" className={inputClass} />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <input value={fuelForm.quantity_mt} onChange={e => setFuelForm(f => ({ ...f, quantity_mt: e.target.value }))} type="number" step="0.1" placeholder="Qty (MT) *" required className={inputClass} />
                  <input value={fuelForm.cost_per_mt} onChange={e => setFuelForm(f => ({ ...f, cost_per_mt: e.target.value }))} type="number" placeholder="€/MT" className={inputClass} />
                  <input value={fuelForm.bunker_port} onChange={e => setFuelForm(f => ({ ...f, bunker_port: e.target.value }))} placeholder="Bunker port" className={inputClass} />
                  <input value={fuelForm.supplier} onChange={e => setFuelForm(f => ({ ...f, supplier: e.target.value }))} placeholder="Supplier" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input value={fuelForm.voyage_reference} onChange={e => setFuelForm(f => ({ ...f, voyage_reference: e.target.value }))} placeholder="Voyage reference" className={inputClass} />
                  <button type="submit" disabled={saving} className="btn-primary flex items-center justify-center gap-2 text-sm">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}Save Fuel Log
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Fuel Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><Gauge className="w-4 h-4 text-slate-600 dark:text-slate-300" /></div>
              <div><div className="text-lg font-bold text-gray-900 dark:text-slate-100">{fuelTotalMT.toFixed(1)} MT</div><div className="text-xs text-gray-500 dark:text-slate-400">Total Bunkered</div></div>
            </div>
            <div className="card p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center"><Fuel className="w-4 h-4 text-green-600" /></div>
              <div><div className="text-lg font-bold text-gray-900 dark:text-slate-100">€{(fuelTotalCost / 1000).toFixed(0)}K</div><div className="text-xs text-gray-500 dark:text-slate-400">Total Fuel Cost</div></div>
            </div>
            <div className="card p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center"><FlaskConical className="w-4 h-4 text-blue-600" /></div>
              <div><div className="text-lg font-bold text-gray-900 dark:text-slate-100">{fuelTotalMT > 0 ? `€${(fuelTotalCost / fuelTotalMT).toFixed(0)}` : '—'}</div><div className="text-xs text-gray-500 dark:text-slate-400">Avg Cost / MT</div></div>
            </div>
          </div>

          {subLoading ? (
            <div className="card p-8 text-center"><Loader2 className="w-8 h-8 animate-spin text-[#003087] mx-auto" /></div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                    {['Date', 'Asset', 'Type', 'Qty (MT)', '€/MT', 'Total Cost', 'Port', 'Supplier', 'Voyage'].map(h => (
                      <th key={h} className="text-left text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide px-3 py-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fuelLogs.map(log => (
                    <tr key={log.id} className="border-b border-gray-50 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-slate-300">{new Date(log.log_date).toLocaleDateString()}</td>
                      <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-slate-100">{log.asset_name}</td>
                      <td className="px-3 py-2.5"><span className={clsx('badge text-[10px]', fuelColor(log.fuel_type))}>{log.fuel_type.toUpperCase()}</span></td>
                      <td className="px-3 py-2.5 font-semibold text-gray-800 dark:text-slate-200">{log.quantity_mt}</td>
                      <td className="px-3 py-2.5 text-gray-600 dark:text-slate-300">{log.cost_per_mt ? `€${log.cost_per_mt}` : '—'}</td>
                      <td className="px-3 py-2.5 font-medium text-gray-800 dark:text-slate-200">{log.total_cost ? `€${log.total_cost.toLocaleString()}` : '—'}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500 dark:text-slate-400">{log.bunker_port || '—'}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500 dark:text-slate-400">{log.supplier || '—'}</td>
                      <td className="px-3 py-2.5 text-xs font-mono text-gray-400 dark:text-slate-500">{log.voyage_reference || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {fuelLogs.length === 0 && !subLoading && (
                <div className="p-8 text-center text-gray-500 dark:text-slate-400"><Fuel className="w-10 h-10 mx-auto mb-2 text-gray-300" />No fuel logs found.</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
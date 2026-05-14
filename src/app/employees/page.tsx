'use client';
import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, RefreshCw, Search, ChevronDown, ChevronUp, X, Loader2, UserCheck, UserX, CalendarDays, Clock, CheckCircle, XCircle, AlertTriangle, Building2, Phone, Mail, FileText, Trash2, Pencil } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

type Employee = {
  id: string; employee_number: string; first_name: string; last_name: string;
  email: string; phone?: string; department: string; job_title: string;
  employment_type: string; manager_name?: string; hire_date: string;
  contract_end_date?: string; status: string; nationality: string;
  stcw_expiry?: string; medical_expiry?: string; notes?: string; created_at: string;
};

type LeaveRequest = {
  id: string; employee_name: string; leave_type: string; start_date: string;
  end_date: string; days_requested: number; reason?: string; status: string;
  reviewed_by?: string; reviewed_at?: string; ai_assessment?: string; created_at: string;
};

const DEPTS = ['Bridge', 'Engineering', 'Passenger Services', 'Safety & Security', 'Human Resources', 'Catering', 'Finance', 'IT & Communications', 'Port Operations'];
const TYPES = ['permanent', 'contract', 'seasonal', 'part_time'];
const LEAVE_TYPES = ['annual', 'sick', 'maternity', 'paternity', 'unpaid', 'emergency', 'study'];

const typeBadge = (t: string) => ({ permanent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', contract: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', seasonal: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', part_time: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300' }[t] ?? 'bg-gray-100 text-gray-600');
const statusBadge = (s: string) => ({ active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', on_leave: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', inactive: 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400', terminated: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' }[s] ?? 'bg-gray-100 text-gray-600');
const leaveBadge = (s: string) => ({ pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', rejected: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', cancelled: 'bg-gray-100 text-gray-500' }[s] ?? 'bg-gray-100 text-gray-600');
const leaveTypeBadge = (t: string) => ({ annual: 'bg-blue-50 text-blue-700', sick: 'bg-orange-50 text-orange-700', emergency: 'bg-red-50 text-red-700', study: 'bg-indigo-50 text-indigo-700', maternity: 'bg-pink-50 text-pink-700', paternity: 'bg-cyan-50 text-cyan-700', unpaid: 'bg-gray-50 text-gray-600' }[t] ?? 'bg-gray-50 text-gray-600');

function isExpiringSoon(dateStr?: string): boolean {
  if (!dateStr) return false;
  const diff = (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 90;
}
function isExpired(dateStr?: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

export default function EmployeesPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'personnel' | 'leave' | 'org'>('personnel');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leave, setLeave] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterLeaveStatus, setFilterLeaveStatus] = useState('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Employee>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [addForm, setAddForm] = useState({ first_name: '', last_name: '', email: '', phone: '', department: '', job_title: '', employment_type: 'permanent', hire_date: '', contract_end_date: '', nationality: 'Greek', stcw_expiry: '', medical_expiry: '' });
  const [leaveForm, setLeaveForm] = useState({ employee_name: '', leave_type: 'annual', start_date: '', end_date: '', reason: '' });

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterDept) params.set('department', filterDept);
      if (filterStatus) params.set('status', filterStatus);
      if (filterType) params.set('employment_type', filterType);
      const res = await fetch(`/api/employees?${params}`);
      setEmployees(await res.json());
    } catch { /* seed data will show */ }
    finally { setLoading(false); }
  }, [filterDept, filterStatus, filterType]);

  const loadLeave = useCallback(async () => {
    setLeaveLoading(true);
    try {
      const res = await fetch(`/api/employees/leave${filterLeaveStatus ? `?status=${filterLeaveStatus}` : ''}`);
      setLeave(await res.json());
    } catch { /* seed data will show */ }
    finally { setLeaveLoading(false); }
  }, [filterLeaveStatus]);

  useEffect(() => { loadEmployees(); }, [loadEmployees]);
  useEffect(() => { if (tab === 'leave') loadLeave(); }, [tab, loadLeave]);

  const filtered = employees.filter(e => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${e.first_name} ${e.last_name} ${e.job_title} ${e.department} ${e.employee_number}`.toLowerCase().includes(q);
  });

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    onLeave: employees.filter(e => e.status === 'on_leave').length,
    expiring: employees.filter(e => isExpiringSoon(e.stcw_expiry) || isExpiringSoon(e.medical_expiry) || isExpiringSoon(e.contract_end_date)).length,
  };

  const pendingLeave = leave.filter(l => l.status === 'pending').length;

  async function addEmployee(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch('/api/employees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(addForm) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setShowAddForm(false);
      setAddForm({ first_name: '', last_name: '', email: '', phone: '', department: '', job_title: '', employment_type: 'permanent', hire_date: '', contract_end_date: '', nationality: 'Greek', stcw_expiry: '', medical_expiry: '' });
      loadEmployees();
    } catch (err) { alert(err instanceof Error ? err.message : 'Failed'); }
    finally { setSaving(false); }
  }

  async function updateStatus(id: string, status: string) {
    await fetch('/api/employees', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    loadEmployees();
  }

  async function deleteEmployee(id: string) {
    if (!confirm(t('employees.deleteConfirm'))) return;
    await fetch(`/api/employees?id=${id}`, { method: 'DELETE' });
    setExpandedId(null); loadEmployees();
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch('/api/employees', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editId, ...editForm }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setEditId(null);
      loadEmployees();
    } catch (err) { alert(err instanceof Error ? err.message : 'Failed'); }
    finally { setSaving(false); }
  }

  async function submitLeave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch('/api/employees/leave', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(leaveForm) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setShowLeaveForm(false);
      setLeaveForm({ employee_name: '', leave_type: 'annual', start_date: '', end_date: '', reason: '' });
      loadLeave();
    } catch (err) { alert(err instanceof Error ? err.message : 'Failed'); }
    finally { setSaving(false); }
  }

  async function reviewLeave(id: string, status: 'approved' | 'rejected') {
    await fetch('/api/employees/leave', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, reviewed_by: 'HR Manager' }) });
    loadLeave();
  }

  const deptGroups = DEPTS.map(d => ({ dept: d, employees: employees.filter(e => e.department === d) })).filter(g => g.employees.length > 0);

  const inputClass = 'w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100';
  const selectClass = inputClass;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#003087]" />
          <h1 className="text-xl font-bold text-[#001A4D] dark:text-slate-100">{t('employees.title')}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { tab === 'leave' ? loadLeave() : loadEmployees(); }} className="btn-secondary flex items-center gap-1.5 text-sm">
            <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
          </button>
          {tab === 'personnel' && (
            <button onClick={() => setShowAddForm(s => !s)} className="btn-primary flex items-center gap-1.5 text-sm">
              <Plus className="w-4 h-4" />{t('employees.addCrew')}
            </button>
          )}
          {tab === 'leave' && (
            <button onClick={() => setShowLeaveForm(s => !s)} className="btn-primary flex items-center gap-1.5 text-sm">
              <Plus className="w-4 h-4" />{t('employees.requestLeave')}
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: t('employees.totalCrew'), value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: t('employees.active'), value: stats.active, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: t('employees.onLeave'), value: stats.onLeave, icon: CalendarDays, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
          { label: t('employees.docsExpiring'), value: stats.expiring, icon: AlertTriangle, color: stats.expiring > 0 ? 'text-red-600' : 'text-gray-400', bg: stats.expiring > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-slate-800' },
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
      <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
        {([['personnel', t('employees.personnel')], ['leave', `${t('employees.leaveRequests')}${pendingLeave > 0 ? ` (${pendingLeave})` : ''}`], ['org', t('employees.organisation')]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={clsx('flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all',
              tab === key ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300')}>
            {label}
          </button>
        ))}
      </div>

      {/* PERSONNEL TAB */}
      {tab === 'personnel' && (
        <div className="space-y-4">
          {showAddForm && (
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 dark:text-slate-100">{t('employees.newCrew')}</h2>
                <button onClick={() => setShowAddForm(false)}><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              <form onSubmit={addEmployee} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input value={addForm.first_name} onChange={e => setAddForm(f => ({ ...f, first_name: e.target.value }))} placeholder={`${t('employees.firstName')} *`} required className={inputClass} />
                  <input value={addForm.last_name} onChange={e => setAddForm(f => ({ ...f, last_name: e.target.value }))} placeholder={`${t('employees.lastName')} *`} required className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} placeholder="Email *" required type="email" className={inputClass} />
                  <input value={addForm.phone} onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select value={addForm.department} onChange={e => setAddForm(f => ({ ...f, department: e.target.value }))} required className={selectClass}>
                    <option value="">Department *</option>
                    {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input value={addForm.job_title} onChange={e => setAddForm(f => ({ ...f, job_title: e.target.value }))} placeholder="Job title *" required className={inputClass} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <select value={addForm.employment_type} onChange={e => setAddForm(f => ({ ...f, employment_type: e.target.value }))} className={selectClass}>
                    {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                  <input value={addForm.hire_date} onChange={e => setAddForm(f => ({ ...f, hire_date: e.target.value }))} type="date" placeholder="Hire date *" required className={inputClass} />
                  <input value={addForm.contract_end_date} onChange={e => setAddForm(f => ({ ...f, contract_end_date: e.target.value }))} type="date" placeholder="Contract end" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-slate-400 mb-1 block">STCW Expiry</label>
                    <input value={addForm.stcw_expiry} onChange={e => setAddForm(f => ({ ...f, stcw_expiry: e.target.value }))} type="date" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-slate-400 mb-1 block">Medical Expiry</label>
                    <input value={addForm.medical_expiry} onChange={e => setAddForm(f => ({ ...f, medical_expiry: e.target.value }))} type="date" className={inputClass} />
                  </div>
                </div>
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {t('employees.addCrewMember')}
                </button>
              </form>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-2 flex-wrap items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('employees.searchCrew')} className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003087]" />
            </div>
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003087]">
              <option value="">{t('employees.allDepts')}</option>
              {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003087]">
              <option value="">{t('employees.allStatus')}</option>
              <option value="active">{t('employees.active')}</option>
              <option value="on_leave">{t('employees.onLeave')}</option>
              <option value="inactive">Inactive</option>
            </select>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003087]">
              <option value="">{t('employees.allTypes')}</option>
              {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="card p-8 text-center"><Loader2 className="w-8 h-8 animate-spin text-[#003087] mx-auto" /></div>
          ) : (
            <div className="space-y-2">
              {filtered.map(emp => {
                const docWarning = isExpired(emp.stcw_expiry) || isExpired(emp.medical_expiry);
                const docAlert = !docWarning && (isExpiringSoon(emp.stcw_expiry) || isExpiringSoon(emp.medical_expiry) || isExpiringSoon(emp.contract_end_date));
                return (
                  <div key={emp.id} className="card overflow-hidden">
                    <div className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                      onClick={() => setExpandedId(expandedId === emp.id ? null : emp.id)}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900 dark:text-slate-100 text-sm">{emp.first_name} {emp.last_name}</span>
                            <span className="text-xs text-gray-400 dark:text-slate-500">{emp.employee_number}</span>
                            {docWarning && <span className="flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-full"><AlertTriangle className="w-2.5 h-2.5" />{t('employees.docExpired')}</span>}
                            {!docWarning && docAlert && <span className="flex items-center gap-1 text-[10px] font-semibold text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded-full"><AlertTriangle className="w-2.5 h-2.5" />{t('employees.expiringSoon')}</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-gray-500 dark:text-slate-400">{emp.job_title}</span>
                            <span className="text-gray-300 dark:text-slate-600">·</span>
                            <span className="text-xs text-gray-500 dark:text-slate-400">{emp.department}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className={clsx('badge text-[10px]', typeBadge(emp.employment_type))}>{emp.employment_type.replace('_', ' ')}</span>
                          <span className={clsx('badge text-[10px]', statusBadge(emp.status))}>{emp.status.replace('_', ' ')}</span>
                          {expandedId === emp.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </div>
                    </div>

                    {expandedId === emp.id && (
                      <div className="px-4 pb-4 space-y-4 border-t border-gray-100 dark:border-slate-700 pt-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                            <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate text-xs">{emp.email}</span>
                          </div>
                          {emp.phone && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                              <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <span className="text-xs">{emp.phone}</span>
                            </div>
                          )}
                          {emp.manager_name && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                              <Users className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <span className="text-xs">{t('employees.reportsTo')}: {emp.manager_name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                            <CalendarDays className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="text-xs">{t('employees.hired')}: {new Date(emp.hire_date).toLocaleDateString()}</span>
                          </div>
                          {emp.contract_end_date && (
                            <div className={clsx('flex items-center gap-2', isExpired(emp.contract_end_date) ? 'text-red-600' : isExpiringSoon(emp.contract_end_date) ? 'text-orange-600' : 'text-gray-600 dark:text-slate-300')}>
                              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-xs">{t('employees.contractEnds')}: {new Date(emp.contract_end_date).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                            <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="text-xs">{emp.nationality}</span>
                          </div>
                        </div>

                        {(emp.stcw_expiry || emp.medical_expiry) && (
                          <div className="grid grid-cols-2 gap-2">
                            {emp.stcw_expiry && (
                              <div className={clsx('rounded-lg p-2.5 text-xs', isExpired(emp.stcw_expiry) ? 'bg-red-50 dark:bg-red-900/20' : isExpiringSoon(emp.stcw_expiry) ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-gray-50 dark:bg-slate-900')}>
                                <div className="text-gray-400 dark:text-slate-500 text-[10px] uppercase tracking-wide">{t('employees.stcwCert')}</div>
                                <div className={clsx('font-medium mt-0.5', isExpired(emp.stcw_expiry) ? 'text-red-600' : isExpiringSoon(emp.stcw_expiry) ? 'text-orange-600' : 'text-gray-800 dark:text-slate-200')}>
                                  {new Date(emp.stcw_expiry).toLocaleDateString()}
                                  {isExpired(emp.stcw_expiry) && ` — ${t('employees.expired')}`}
                                  {!isExpired(emp.stcw_expiry) && isExpiringSoon(emp.stcw_expiry) && ` — ${t('employees.expiredSoon')}`}
                                </div>
                              </div>
                            )}
                            {emp.medical_expiry && (
                              <div className={clsx('rounded-lg p-2.5 text-xs', isExpired(emp.medical_expiry) ? 'bg-red-50 dark:bg-red-900/20' : isExpiringSoon(emp.medical_expiry) ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-gray-50 dark:bg-slate-900')}>
                                <div className="text-gray-400 dark:text-slate-500 text-[10px] uppercase tracking-wide">{t('employees.medicalCert')}</div>
                                <div className={clsx('font-medium mt-0.5', isExpired(emp.medical_expiry) ? 'text-red-600' : isExpiringSoon(emp.medical_expiry) ? 'text-orange-600' : 'text-gray-800 dark:text-slate-200')}>
                                  {new Date(emp.medical_expiry).toLocaleDateString()}
                                  {isExpired(emp.medical_expiry) && ` — ${t('employees.expired')}`}
                                  {!isExpired(emp.medical_expiry) && isExpiringSoon(emp.medical_expiry) && ` — ${t('employees.expiredSoon')}`}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2 flex-wrap items-center">
                          {emp.status === 'active' && (
                            <button onClick={() => updateStatus(emp.id, 'on_leave')} className="btn-secondary text-xs py-1.5 flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" />{t('employees.markOnLeave')}
                            </button>
                          )}
                          {emp.status === 'on_leave' && (
                            <button onClick={() => updateStatus(emp.id, 'active')} className="btn-secondary text-xs py-1.5 flex items-center gap-1">
                              <UserCheck className="w-3 h-3" />{t('employees.markActive')}
                            </button>
                          )}
                          {emp.status !== 'terminated' && (
                            <button onClick={() => updateStatus(emp.id, 'terminated')} className="btn-secondary text-xs py-1.5 flex items-center gap-1 text-orange-600 dark:text-orange-400">
                              <UserX className="w-3 h-3" />{t('employees.terminate')}
                            </button>
                          )}
                          <button
                            onClick={(ev) => { ev.stopPropagation(); setEditId(editId === emp.id ? null : emp.id); setEditForm({ ...emp }); }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-blue-200 dark:border-blue-800 transition-colors">
                            <Pencil className="w-3 h-3" />{t('employees.edit')}
                          </button>
                          <button onClick={() => deleteEmployee(emp.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 transition-colors">
                            <Trash2 className="w-3 h-3" />{t('employees.delete')}
                          </button>
                        </div>

                        {editId === emp.id && (
                          <form onSubmit={saveEdit} className="space-y-3 border-t border-blue-100 dark:border-blue-900/30 pt-3 bg-blue-50/40 dark:bg-blue-900/10 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">{t('employees.editEmployee')}: {emp.first_name} {emp.last_name}</span>
                              <button type="button" onClick={() => setEditId(null)}><X className="w-3.5 h-3.5 text-gray-400" /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <input value={editForm.first_name ?? ''} onChange={e => setEditForm(f => ({ ...f, first_name: e.target.value }))} placeholder={t('employees.firstName')} className={inputClass} />
                              <input value={editForm.last_name ?? ''} onChange={e => setEditForm(f => ({ ...f, last_name: e.target.value }))} placeholder={t('employees.lastName')} className={inputClass} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <input value={editForm.email ?? ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} type="email" placeholder={t('employees.email')} className={inputClass} />
                              <input value={editForm.phone ?? ''} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} placeholder={t('employees.phone')} className={inputClass} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <select value={editForm.department ?? ''} onChange={e => setEditForm(f => ({ ...f, department: e.target.value }))} className={inputClass}>
                                {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                              <input value={editForm.job_title ?? ''} onChange={e => setEditForm(f => ({ ...f, job_title: e.target.value }))} placeholder={t('employees.jobTitle')} className={inputClass} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-gray-500 dark:text-slate-400 mb-1 block">{t('employees.stcwExpiry')}</label>
                                <input value={editForm.stcw_expiry ?? ''} onChange={e => setEditForm(f => ({ ...f, stcw_expiry: e.target.value }))} type="date" className={inputClass} />
                              </div>
                              <div>
                                <label className="text-[10px] text-gray-500 dark:text-slate-400 mb-1 block">{t('employees.medicalExpiry')}</label>
                                <input value={editForm.medical_expiry ?? ''} onChange={e => setEditForm(f => ({ ...f, medical_expiry: e.target.value }))} type="date" className={inputClass} />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button type="submit" disabled={saving} className="btn-primary text-xs py-1.5 flex items-center gap-1.5">
                                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}{t('employees.save')}
                              </button>
                              <button type="button" onClick={() => setEditId(null)} className="btn-secondary text-xs py-1.5">{t('employees.cancel')}</button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {filtered.length === 0 && !loading && (
                <div className="card p-8 text-center text-gray-500 dark:text-slate-400">
                  <Users className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-slate-600" />
                  {t('employees.noCrewFound')}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* LEAVE TAB */}
      {tab === 'leave' && (
        <div className="space-y-4">
          {showLeaveForm && (
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 dark:text-slate-100">{t('employees.submitRequest')}</h2>
                <button onClick={() => setShowLeaveForm(false)}><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              <form onSubmit={submitLeave} className="space-y-3">
                <input value={leaveForm.employee_name} onChange={e => setLeaveForm(f => ({ ...f, employee_name: e.target.value }))} placeholder={`${t('employees.employeeName')} *`} required className={inputClass} list="emp-list" />
                <datalist id="emp-list">{employees.map(e => <option key={e.id} value={`${e.first_name} ${e.last_name}`} />)}</datalist>
                <div className="grid grid-cols-3 gap-3">
                  <select value={leaveForm.leave_type} onChange={e => setLeaveForm(f => ({ ...f, leave_type: e.target.value }))} className={selectClass}>
                    {LEAVE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                  <input value={leaveForm.start_date} onChange={e => setLeaveForm(f => ({ ...f, start_date: e.target.value }))} type="date" required className={inputClass} />
                  <input value={leaveForm.end_date} onChange={e => setLeaveForm(f => ({ ...f, end_date: e.target.value }))} type="date" required className={inputClass} />
                </div>
                <textarea value={leaveForm.reason} onChange={e => setLeaveForm(f => ({ ...f, reason: e.target.value }))} placeholder="Reason" rows={2} className={inputClass} />
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}{t('employees.submitRequest')}
                </button>
              </form>
            </div>
          )}

          <div className="flex gap-2">
            {(['', 'pending', 'approved', 'rejected'] as const).map(s => (
              <button key={s} onClick={() => setFilterLeaveStatus(s)}
                className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  filterLeaveStatus === s ? 'bg-[#003087] text-white' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border dark:border-slate-700 hover:bg-gray-50')}>
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
              </button>
            ))}
          </div>

          {leaveLoading ? (
            <div className="card p-8 text-center"><Loader2 className="w-8 h-8 animate-spin text-[#003087] mx-auto" /></div>
          ) : (
            <div className="space-y-2">
              {leave.map(req => (
                <div key={req.id} className="card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-gray-900 dark:text-slate-100">{req.employee_name}</span>
                        <span className={clsx('badge text-[10px]', leaveTypeBadge(req.leave_type))}>{req.leave_type}</span>
                        <span className={clsx('badge text-[10px]', leaveBadge(req.status))}>{req.status}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-slate-400">
                        <span>{new Date(req.start_date).toLocaleDateString()} → {new Date(req.end_date).toLocaleDateString()}</span>
                        <span className="font-medium text-gray-700 dark:text-slate-300">{req.days_requested} days</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-slate-500 flex-shrink-0">{new Date(req.created_at).toLocaleDateString()}</div>
                  </div>
                  {req.reason && <p className="text-xs text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-900 rounded-lg px-3 py-2">{req.reason}</p>}
                  {req.ai_assessment && (
                    <div className="text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2">
                      <strong>AI: </strong>{req.ai_assessment}
                    </div>
                  )}
                  {req.reviewed_by && (
                    <div className="text-xs text-gray-400 dark:text-slate-500">
                      Reviewed by {req.reviewed_by} · {req.reviewed_at ? new Date(req.reviewed_at).toLocaleDateString() : ''}
                    </div>
                  )}
                  {req.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => reviewLeave(req.id, 'approved')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors">
                        <CheckCircle className="w-3 h-3" />{t('employees.approve')}
                      </button>
                      <button onClick={() => reviewLeave(req.id, 'rejected')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 border border-red-200 dark:border-red-800 transition-colors">
                        <XCircle className="w-3 h-3" />{t('employees.reject')}
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {leave.length === 0 && !leaveLoading && (
                <div className="card p-8 text-center text-gray-500 dark:text-slate-400">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-400" />
                  {t('employees.noLeaveFound')}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ORG TAB */}
      {tab === 'org' && (
        <div className="space-y-3">
          {loading ? (
            <div className="card p-8 text-center"><Loader2 className="w-8 h-8 animate-spin text-[#003087] mx-auto" /></div>
          ) : (
            deptGroups.map(({ dept, employees: deptEmps }) => (
              <div key={dept} className="card p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#003087] dark:text-blue-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm">{dept}</h3>
                  <span className="ml-auto text-xs text-gray-400 dark:text-slate-500">{deptEmps.length} {deptEmps.length !== 1 ? t('employees.membersPlural') : t('employees.members')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {deptEmps.map(emp => (
                    <div key={emp.id} className="flex items-center gap-2.5 bg-gray-50 dark:bg-slate-900 rounded-lg p-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#003087] to-[#0047CC] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {emp.first_name[0]}{emp.last_name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-gray-900 dark:text-slate-100 truncate">{emp.first_name} {emp.last_name}</div>
                        <div className="text-[10px] text-gray-500 dark:text-slate-400 truncate">{emp.job_title}</div>
                      </div>
                      <span className={clsx('ml-auto badge text-[9px] flex-shrink-0', statusBadge(emp.status))}>{emp.status.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
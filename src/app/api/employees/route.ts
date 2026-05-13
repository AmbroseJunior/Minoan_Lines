import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Employee = {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department: string;
  job_title: string;
  employment_type: string;
  manager_name?: string;
  hire_date: string;
  contract_end_date?: string;
  status: string;
  nationality: string;
  stcw_expiry?: string;
  medical_expiry?: string;
  notes?: string;
  created_at: string;
};

const SEED: Employee[] = [
  { id: 'emp-001', employee_number: 'EMP-001', first_name: 'Nikolaos', last_name: 'Papadopoulos', email: 'n.papadopoulos@minoanlines.gr', phone: '+30 2810 330000', department: 'Bridge', job_title: 'Master', employment_type: 'permanent', hire_date: '2008-03-15', status: 'active', nationality: 'Greek', stcw_expiry: '2025-09-01', medical_expiry: '2025-06-01', created_at: '2008-03-15T00:00:00Z' },
  { id: 'emp-002', employee_number: 'EMP-002', first_name: 'Dimitrios', last_name: 'Alexiou', email: 'd.alexiou@minoanlines.gr', phone: '+30 2810 330001', department: 'Engineering', job_title: 'Chief Engineer', employment_type: 'permanent', hire_date: '2010-06-01', status: 'active', nationality: 'Greek', stcw_expiry: '2025-12-01', medical_expiry: '2025-11-01', created_at: '2010-06-01T00:00:00Z' },
  { id: 'emp-003', employee_number: 'EMP-003', first_name: 'Elena', last_name: 'Stavros', email: 'e.stavros@minoanlines.gr', phone: '+30 2810 330002', department: 'Passenger Services', job_title: 'Chief Purser', employment_type: 'permanent', manager_name: 'Nikolaos Papadopoulos', hire_date: '2012-04-20', status: 'active', nationality: 'Greek', medical_expiry: '2025-08-01', created_at: '2012-04-20T00:00:00Z' },
  { id: 'emp-004', employee_number: 'EMP-004', first_name: 'Kostas', last_name: 'Manolis', email: 'k.manolis@minoanlines.gr', phone: '+30 2810 330003', department: 'Bridge', job_title: 'Chief Officer', employment_type: 'permanent', manager_name: 'Nikolaos Papadopoulos', hire_date: '2014-09-01', status: 'active', nationality: 'Greek', stcw_expiry: '2026-03-01', medical_expiry: '2026-01-01', created_at: '2014-09-01T00:00:00Z' },
  { id: 'emp-005', employee_number: 'EMP-005', first_name: 'Maria', last_name: 'Theodorou', email: 'm.theodorou@minoanlines.gr', phone: '+30 2810 330004', department: 'Human Resources', job_title: 'HR Manager', employment_type: 'permanent', hire_date: '2011-02-14', status: 'active', nationality: 'Greek', medical_expiry: '2026-02-01', created_at: '2011-02-14T00:00:00Z' },
  { id: 'emp-006', employee_number: 'EMP-006', first_name: 'Alexandros', last_name: 'Petrou', email: 'a.petrou@minoanlines.gr', phone: '+30 2810 330005', department: 'Engineering', job_title: '2nd Engineer', employment_type: 'permanent', manager_name: 'Dimitrios Alexiou', hire_date: '2016-07-11', status: 'active', nationality: 'Greek', stcw_expiry: '2025-07-01', medical_expiry: '2025-07-01', created_at: '2016-07-11T00:00:00Z' },
  { id: 'emp-007', employee_number: 'EMP-007', first_name: 'Sofia', last_name: 'Kanellopoulou', email: 's.kanellopoulou@minoanlines.gr', phone: '+30 2810 330006', department: 'Passenger Services', job_title: 'Hotel Manager', employment_type: 'seasonal', manager_name: 'Elena Stavros', hire_date: '2020-05-01', contract_end_date: '2025-10-31', status: 'active', nationality: 'Greek', medical_expiry: '2025-05-01', created_at: '2020-05-01T00:00:00Z' },
  { id: 'emp-008', employee_number: 'EMP-008', first_name: 'Giorgos', last_name: 'Naxakis', email: 'g.naxakis@minoanlines.gr', phone: '+30 2810 330007', department: 'Engineering', job_title: 'Engine Technician', employment_type: 'contract', manager_name: 'Dimitrios Alexiou', hire_date: '2023-01-15', contract_end_date: '2025-12-31', status: 'active', nationality: 'Greek', stcw_expiry: '2025-11-01', medical_expiry: '2025-10-01', created_at: '2023-01-15T00:00:00Z' },
  { id: 'emp-009', employee_number: 'EMP-009', first_name: 'Anastasia', last_name: 'Kyriakou', email: 'a.kyriakou@minoanlines.gr', phone: '+30 2810 330008', department: 'Passenger Services', job_title: 'Passenger Services Officer', employment_type: 'permanent', manager_name: 'Elena Stavros', hire_date: '2018-03-01', status: 'active', nationality: 'Greek', medical_expiry: '2026-03-01', created_at: '2018-03-01T00:00:00Z' },
  { id: 'emp-010', employee_number: 'EMP-010', first_name: 'Ioannis', last_name: 'Georgiou', email: 'i.georgiou@minoanlines.gr', phone: '+30 2810 330009', department: 'Safety & Security', job_title: 'Safety Officer', employment_type: 'permanent', hire_date: '2013-11-20', status: 'on_leave', nationality: 'Greek', stcw_expiry: '2026-06-01', medical_expiry: '2026-05-01', created_at: '2013-11-20T00:00:00Z' },
  { id: 'emp-011', employee_number: 'EMP-011', first_name: 'Christos', last_name: 'Lambrakis', email: 'c.lambrakis@minoanlines.gr', phone: '+30 2810 330010', department: 'Bridge', job_title: 'Deck Officer', employment_type: 'permanent', manager_name: 'Kostas Manolis', hire_date: '2019-08-15', status: 'active', nationality: 'Greek', stcw_expiry: '2026-08-01', medical_expiry: '2026-07-01', created_at: '2019-08-15T00:00:00Z' },
  { id: 'emp-012', employee_number: 'EMP-012', first_name: 'Vasiliki', last_name: 'Antoniou', email: 'v.antoniou@minoanlines.gr', phone: '+30 2810 330011', department: 'Catering', job_title: 'Catering Manager', employment_type: 'permanent', hire_date: '2015-04-01', status: 'active', nationality: 'Greek', medical_expiry: '2025-09-01', created_at: '2015-04-01T00:00:00Z' },
  { id: 'emp-013', employee_number: 'EMP-013', first_name: 'Petros', last_name: 'Stavridis', email: 'p.stavridis@minoanlines.gr', phone: '+30 2810 330012', department: 'IT & Communications', job_title: 'IT Systems Officer', employment_type: 'permanent', hire_date: '2021-01-10', status: 'active', nationality: 'Greek', medical_expiry: '2026-01-01', created_at: '2021-01-10T00:00:00Z' },
  { id: 'emp-014', employee_number: 'EMP-014', first_name: 'Aikaterini', last_name: 'Panou', email: 'a.panou@minoanlines.gr', phone: '+30 2810 330013', department: 'Finance', job_title: 'Finance Officer', employment_type: 'contract', hire_date: '2022-09-01', contract_end_date: '2025-08-31', status: 'active', nationality: 'Greek', medical_expiry: '2026-09-01', created_at: '2022-09-01T00:00:00Z' },
  { id: 'emp-015', employee_number: 'EMP-015', first_name: 'Manolis', last_name: 'Katsarakis', email: 'm.katsarakis@minoanlines.gr', phone: '+30 2810 330014', department: 'Port Operations', job_title: 'Port Operations Manager', employment_type: 'permanent', hire_date: '2009-05-20', status: 'active', nationality: 'Greek', medical_expiry: '2026-05-01', created_at: '2009-05-20T00:00:00Z' },
];

async function writeAudit(event_type: string, summary: string, metadata: Record<string, unknown>) {
  try {
    const db = supabaseAdmin();
    await db.from('audit_log').insert({ event_type, module: 'employees', summary, metadata, created_at: new Date().toISOString() });
  } catch {}
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const dept = url.searchParams.get('department');
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('employment_type');

    const db = supabaseAdmin();
    let query = db.from('employees').select('*').order('last_name');
    if (dept) query = query.eq('department', dept);
    if (status) query = query.eq('status', status);
    if (type) query = query.eq('employment_type', type);

    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) {
      let seed = SEED;
      if (dept) seed = seed.filter(e => e.department === dept);
      if (status) seed = seed.filter(e => e.status === status);
      if (type) seed = seed.filter(e => e.employment_type === type);
      return NextResponse.json(seed);
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(SEED);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { first_name, last_name, email, department, job_title, employment_type, hire_date } = body;
    if (!first_name || !last_name || !email || !department || !job_title || !employment_type || !hire_date) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const employee_number = `EMP-${String(Date.now()).slice(-4)}`;
    const db = supabaseAdmin();
    const { data, error } = await db.from('employees').insert({
      ...body,
      employee_number,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).select().single();

    if (error) throw error;
    await writeAudit('employee_created', `New employee: ${first_name} ${last_name} (${job_title}, ${department})`, { id: data.id });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to create employee' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const db = supabaseAdmin();
    const { data, error } = await db.from('employees').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;

    await writeAudit('employee_updated', `Employee ${id} updated`, { id, updates: Object.keys(updates) });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to update employee' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const db = supabaseAdmin();
    const { error } = await db.from('employees').delete().eq('id', id);
    if (error) throw error;

    await writeAudit('employee_deleted', `Employee ${id} deleted`, { id });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to delete employee' }, { status: 500 });
  }
}

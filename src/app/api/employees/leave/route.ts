import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { deepseek, DEEPSEEK_MODEL } from '@/lib/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type LeaveRequest = {
  id: string;
  employee_id?: string;
  employee_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason?: string;
  status: string;
  reviewed_by?: string;
  reviewed_at?: string;
  ai_assessment?: string;
  notes?: string;
  created_at: string;
};

const SEED: LeaveRequest[] = [
  { id: 'lv-001', employee_name: 'Ioannis Georgiou', leave_type: 'annual', start_date: '2026-05-15', end_date: '2026-05-26', days_requested: 12, reason: 'Family vacation planned months in advance.', status: 'pending', created_at: '2026-05-02T09:00:00Z' },
  { id: 'lv-002', employee_name: 'Kostas Manolis', leave_type: 'emergency', start_date: '2026-05-16', end_date: '2026-05-17', days_requested: 2, reason: 'Family emergency — father hospitalised.', status: 'pending', created_at: '2026-05-13T07:30:00Z' },
  { id: 'lv-003', employee_name: 'Anastasia Kyriakou', leave_type: 'study', start_date: '2026-05-20', end_date: '2026-05-24', days_requested: 5, reason: 'Attending IMO safety management certification course in Athens.', status: 'pending', created_at: '2026-05-10T11:00:00Z' },
  { id: 'lv-004', employee_name: 'Sofia Kanellopoulou', leave_type: 'annual', start_date: '2026-06-01', end_date: '2026-06-14', days_requested: 14, reason: 'Annual leave — summer schedule.', status: 'approved', reviewed_by: 'Maria Theodorou', reviewed_at: '2026-04-20T10:00:00Z', created_at: '2026-04-15T09:00:00Z' },
  { id: 'lv-005', employee_name: 'Giorgos Naxakis', leave_type: 'sick', start_date: '2026-05-10', end_date: '2026-05-12', days_requested: 3, reason: 'Medical certificate attached — acute respiratory infection.', status: 'approved', reviewed_by: 'Maria Theodorou', reviewed_at: '2026-05-10T08:00:00Z', created_at: '2026-05-10T07:45:00Z' },
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
    const status = url.searchParams.get('status');

    const db = supabaseAdmin();
    let query = db.from('leave_requests').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) {
      const seed = status ? SEED.filter(l => l.status === status) : SEED;
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
    const { employee_name, leave_type, start_date, end_date, reason } = body;
    if (!employee_name || !leave_type || !start_date || !end_date) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    const days_requested = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    let ai_assessment = '';
    try {
      const completion = await deepseek.chat.completions.create({
        model: DEEPSEEK_MODEL,
        messages: [{
          role: 'user',
          content: `Assess this maritime crew leave request. Respond in one sentence (under 25 words):
Employee: ${employee_name}
Type: ${leave_type} leave
Duration: ${days_requested} days (${start_date} to ${end_date})
Reason: ${reason || 'Not provided'}
Assessment (mention operational impact if critical, or approve if routine):`
        }],
        max_tokens: 60,
      });
      ai_assessment = completion.choices[0].message.content?.trim() || '';
    } catch {}

    const db = supabaseAdmin();
    const { data, error } = await db.from('leave_requests').insert({
      ...body,
      days_requested,
      status: 'pending',
      ai_assessment,
      created_at: new Date().toISOString(),
    }).select().single();

    if (error) throw error;
    await writeAudit('leave_requested', `Leave request: ${employee_name} — ${days_requested} days ${leave_type}`, { id: data.id });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to submit leave request' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, reviewed_by, notes } = body;
    if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 });

    const db = supabaseAdmin();
    const { data, error } = await db.from('leave_requests')
      .update({ status, reviewed_by, notes, reviewed_at: new Date().toISOString() })
      .eq('id', id).select().single();
    if (error) throw error;

    await writeAudit('leave_reviewed', `Leave request ${id} ${status} by ${reviewed_by || 'HR'}`, { id, status });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to update leave request' }, { status: 500 });
  }
}
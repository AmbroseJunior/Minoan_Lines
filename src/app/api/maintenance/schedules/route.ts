import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const today = new Date();
const daysFromNow = (n: number) => new Date(today.getTime() + n * 86400000).toISOString().split('T')[0];
const daysAgo = (n: number) => new Date(today.getTime() - n * 86400000).toISOString().split('T')[0];

const SEED = [
  { id: 'sch-001', asset_name: 'Knossos Palace', schedule_name: 'Main Engine Service (2000h)', maintenance_type: 'Engine Service', interval_type: 'engine_hours', interval_value: 2000, last_done_date: daysAgo(185), next_due_date: daysAgo(3), is_active: true },
  { id: 'sch-002', asset_name: 'Festos Palace', schedule_name: 'Annual Class Renewal Survey', maintenance_type: 'Class Survey', interval_type: 'months', interval_value: 12, last_done_date: daysAgo(347), next_due_date: daysFromNow(18), is_active: true },
  { id: 'sch-003', asset_name: 'Europa Palace', schedule_name: 'Hull Underwater Cleaning', maintenance_type: 'Hull Maintenance', interval_type: 'days', interval_value: 90, last_done_date: daysAgo(83), next_due_date: daysFromNow(7), is_active: true },
  { id: 'sch-004', asset_name: 'All Vessels', schedule_name: 'Mandatory Fire & Abandon Ship Drill', maintenance_type: 'Safety Drill', interval_type: 'days', interval_value: 14, last_done_date: daysAgo(9), next_due_date: daysFromNow(5), is_active: true },
  { id: 'sch-005', asset_name: 'Kydon Palace', schedule_name: 'Safety Equipment Monthly Check', maintenance_type: 'Safety Equipment', interval_type: 'days', interval_value: 30, last_done_date: daysAgo(8), next_due_date: daysFromNow(22), is_active: true },
  { id: 'sch-006', asset_name: 'Port Crane Heraklion #1', schedule_name: 'Annual Load Test & Certification', maintenance_type: 'Load Test', interval_type: 'months', interval_value: 12, last_done_date: daysAgo(320), next_due_date: daysFromNow(45), is_active: true },
  { id: 'sch-007', asset_name: 'Europa Palace', schedule_name: 'Bow Thruster Service', maintenance_type: 'Thruster Maintenance', interval_type: 'months', interval_value: 6, last_done_date: daysAgo(160), next_due_date: daysFromNow(20), is_active: true },
  { id: 'sch-008', asset_name: 'Emergency Generator Set Port', schedule_name: 'Generator Load Bank Test', maintenance_type: 'Generator Test', interval_type: 'months', interval_value: 3, last_done_date: daysAgo(42), next_due_date: daysFromNow(48), is_active: true },
];

export async function GET() {
  try {
    const db = supabaseAdmin();
    const { data, error } = await db.from('maintenance_schedules').select('*').eq('is_active', true).order('next_due_date');
    if (error) throw error;
    return NextResponse.json(data && data.length ? data : SEED);
  } catch {
    return NextResponse.json(SEED);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = supabaseAdmin();
    const { data, error } = await db.from('maintenance_schedules').insert({ ...body, is_active: true, created_at: new Date().toISOString() }).select().single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}
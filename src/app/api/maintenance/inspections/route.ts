import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SEED = [
  { id: 'ins-001', asset_name: 'Knossos Palace', inspection_type: 'pre_voyage', inspector_name: 'Nikolaos Papadopoulos', inspection_date: '2026-05-13', overall_status: 'passed', defects_found: null, corrective_actions: null, next_inspection_date: '2026-05-14', created_at: '2026-05-13T04:30:00Z' },
  { id: 'ins-002', asset_name: 'Festos Palace', inspection_type: 'safety', inspector_name: 'Ioannis Georgiou', inspection_date: '2026-05-12', overall_status: 'passed_with_defects', defects_found: 'Life jacket bin #4 on Deck 7 showing surface corrosion on hinges. Three life jackets require re-webbing.', corrective_actions: 'Corrode Tec applied to hinges. Life jackets replaced from stores. Re-inspection scheduled.', next_inspection_date: '2026-05-20', created_at: '2026-05-12T10:00:00Z' },
  { id: 'ins-003', asset_name: 'Kydon Palace', inspection_type: 'port_state', inspector_name: 'Port State Control Officer — Heraklion', inspection_date: '2026-05-08', overall_status: 'passed', defects_found: null, corrective_actions: null, next_inspection_date: '2027-05-08', created_at: '2026-05-08T09:30:00Z' },
  { id: 'ins-004', asset_name: 'Europa Palace', inspection_type: 'routine', inspector_name: 'Ioannis Georgiou', inspection_date: '2026-05-11', overall_status: 'passed', defects_found: null, corrective_actions: null, next_inspection_date: '2026-05-25', created_at: '2026-05-11T08:00:00Z' },
  { id: 'ins-005', asset_name: 'Port Crane Heraklion #1', inspection_type: 'class_survey', inspector_name: 'Bureau Veritas Surveyor', inspection_date: '2026-01-03', overall_status: 'passed', defects_found: null, corrective_actions: null, next_inspection_date: '2027-01-03', created_at: '2026-01-03T11:00:00Z' },
];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const asset = url.searchParams.get('asset');

    const db = supabaseAdmin();
    let query = db.from('inspection_records').select('*').order('inspection_date', { ascending: false }).limit(50);
    if (asset) query = query.ilike('asset_name', `%${asset}%`);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data && data.length ? data : SEED);
  } catch {
    return NextResponse.json(SEED);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { asset_name, inspection_type, inspector_name, inspection_date, overall_status } = body;
    if (!asset_name || !inspection_type || !inspector_name || !overall_status) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }
    const db = supabaseAdmin();
    const { data, error } = await db.from('inspection_records').insert({
      ...body,
      inspection_date: inspection_date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    }).select().single();
    if (error) throw error;

    try {
      const supaAdmin = supabaseAdmin();
      await supaAdmin.from('audit_log').insert({ event_type: 'inspection_created', module: 'maintenance', summary: `Inspection: ${asset_name} — ${overall_status}`, metadata: { id: data.id }, created_at: new Date().toISOString() });
    } catch {}

    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { deepseek, DEEPSEEK_MODEL } from '@/lib/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type WorkOrder = {
  id: string;
  work_order_number: string;
  asset_name: string;
  title: string;
  description: string;
  work_type: string;
  priority: string;
  status: string;
  assigned_to?: string;
  estimated_hours?: number;
  actual_hours?: number;
  parts_cost: number;
  labour_cost: number;
  scheduled_date?: string;
  completed_date?: string;
  technician_notes?: string;
  ai_priority_note?: string;
  created_at: string;
};

const SEED: WorkOrder[] = [
  { id: 'wo-001', work_order_number: 'WO-2026-047', asset_name: 'Knossos Palace', title: 'Main Engine Oil & Filter Change', description: 'Scheduled 2000-hour main engine service — oil drain, new filters, inspection of oil pan for metal particles.', work_type: 'preventive', priority: 'normal', status: 'in_progress', assigned_to: 'Dimitrios Alexiou', estimated_hours: 8, parts_cost: 1240, labour_cost: 480, scheduled_date: '2026-05-12', created_at: '2026-05-10T08:00:00Z', ai_priority_note: 'Routine PM — proceed as scheduled. No safety impact.' },
  { id: 'wo-002', work_order_number: 'WO-2026-048', asset_name: 'Kydon Palace', title: 'Hull Cleaning & Anti-Fouling Inspection', description: 'Vessel in dry dock. Full underwater hull inspection, cleaning, and assessment of anti-fouling paint condition.', work_type: 'corrective', priority: 'high', status: 'open', assigned_to: 'Alexandros Petrou', estimated_hours: 24, parts_cost: 4800, labour_cost: 2400, scheduled_date: '2026-05-15', created_at: '2026-05-08T10:00:00Z', ai_priority_note: 'Overdue hull cleaning affecting fuel efficiency — expedite.' },
  { id: 'wo-003', work_order_number: 'WO-2026-049', asset_name: 'Europa Palace', title: 'CO₂ Fire Suppression System Inspection', description: 'Annual ISM-required inspection of engine room CO₂ fire suppression system. Test triggering mechanisms, check cylinder pressures.', work_type: 'inspection', priority: 'normal', status: 'completed', assigned_to: 'Ioannis Georgiou', estimated_hours: 4, actual_hours: 3.5, parts_cost: 0, labour_cost: 210, scheduled_date: '2026-05-10', completed_date: '2026-05-10', technician_notes: 'All 12 cylinders at required pressure. Trigger mechanisms tested and functional.', created_at: '2026-05-05T09:00:00Z', ai_priority_note: 'Mandatory safety compliance — completed on time.' },
  { id: 'wo-004', work_order_number: 'WO-2026-050', asset_name: 'Port Crane Heraklion #1', title: 'EMERGENCY: Hydraulic Seal Failure', description: 'Hydraulic fluid leak from main boom cylinder. Crane non-operational. Immediate repair required to resume port operations.', work_type: 'emergency', priority: 'critical', status: 'open', assigned_to: 'Giorgos Naxakis', estimated_hours: 6, parts_cost: 3200, labour_cost: 900, scheduled_date: '2026-05-13', created_at: '2026-05-13T06:30:00Z', ai_priority_note: 'CRITICAL: port operations blocked — assign top resource immediately.' },
  { id: 'wo-005', work_order_number: 'WO-2026-051', asset_name: 'Festos Palace', title: 'Navigation Radar Calibration & ARPA Test', description: 'SOLAS-required radar calibration. Test ARPA tracking, verify chart overlay accuracy, check heading sensor alignment.', work_type: 'preventive', priority: 'low', status: 'in_progress', assigned_to: 'Christos Lambrakis', estimated_hours: 3, parts_cost: 0, labour_cost: 180, scheduled_date: '2026-05-14', created_at: '2026-05-11T14:00:00Z', ai_priority_note: 'Routine compliance check — low risk.' },
  { id: 'wo-006', work_order_number: 'WO-2026-052', asset_name: 'Knossos Palace', title: 'Lifeboat Release Mechanism Overhaul', description: 'Lifeboat #3 hydrostatic release unit due for 2-year replacement. Davit greasing and load test required per SOLAS.', work_type: 'inspection', priority: 'high', status: 'waiting_parts', assigned_to: 'Ioannis Georgiou', estimated_hours: 5, parts_cost: 1850, labour_cost: 300, scheduled_date: '2026-05-18', created_at: '2026-05-09T11:00:00Z', technician_notes: 'Awaiting HRU unit from Survitec. ETA 16 May.', ai_priority_note: 'High safety priority — parts on order, track delivery.' },
  { id: 'wo-007', work_order_number: 'WO-2026-053', asset_name: 'Terminal Shuttle Bus A', title: 'Annual Vehicle Service', description: 'Full annual service: oil change, brake inspection, tyre rotation, air filter, coolant top-up.', work_type: 'preventive', priority: 'low', status: 'completed', assigned_to: 'Giorgos Naxakis', estimated_hours: 2, actual_hours: 1.5, parts_cost: 320, labour_cost: 90, completed_date: '2026-05-11', technician_notes: 'Front brake pads at 20% — monitor, replace at next service.', created_at: '2026-05-08T09:00:00Z', ai_priority_note: 'Routine service completed. Note brake pad wear.' },
  { id: 'wo-008', work_order_number: 'WO-2026-054', asset_name: 'Kydon Palace', title: 'Stern Tube Shaft Seal Investigation', description: 'Water ingress reported near stern tube. Investigate shaft seal condition. Vessel in dry dock — opportunity inspection.', work_type: 'corrective', priority: 'critical', status: 'open', assigned_to: 'Dimitrios Alexiou', estimated_hours: 12, parts_cost: 8500, labour_cost: 1800, scheduled_date: '2026-05-15', created_at: '2026-05-12T16:00:00Z', ai_priority_note: 'CRITICAL: potential water ingress — immediate investigation required.' },
];

async function writeAudit(event_type: string, summary: string, metadata: Record<string, unknown>) {
  try {
    const db = supabaseAdmin();
    await db.from('audit_log').insert({ event_type, module: 'maintenance', summary, metadata, created_at: new Date().toISOString() });
  } catch {}
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    const asset = url.searchParams.get('asset');

    const db = supabaseAdmin();
    let query = db.from('work_orders').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (asset) query = query.ilike('asset_name', `%${asset}%`);

    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) {
      let seed = SEED;
      if (status) seed = seed.filter(w => w.status === status);
      if (priority) seed = seed.filter(w => w.priority === priority);
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
    const { asset_name, title, description, work_type } = body;
    if (!asset_name || !title || !description || !work_type) {
      return NextResponse.json({ error: 'asset_name, title, description, and work_type required' }, { status: 400 });
    }

    let ai_priority_note = '';
    let priority = body.priority || 'normal';
    try {
      const completion = await deepseek.chat.completions.create({
        model: DEEPSEEK_MODEL,
        messages: [{
          role: 'user',
          content: `Assess this maritime maintenance work order. Respond with JSON only:
Asset: ${asset_name}
Title: ${title}
Type: ${work_type}
Description: ${description}
Return: {"priority": "low|normal|high|critical", "note": "one-sentence assessment under 20 words"}`
        }],
        max_tokens: 100,
      });
      const raw = completion.choices[0].message.content || '';
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.priority) priority = parsed.priority;
        if (parsed.note) ai_priority_note = parsed.note;
      }
    } catch {}

    const work_order_number = `WO-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
    const db = supabaseAdmin();
    const { data, error } = await db.from('work_orders').insert({
      ...body,
      work_order_number,
      priority,
      status: 'open',
      ai_priority_note,
      parts_cost: body.parts_cost || 0,
      labour_cost: body.labour_cost || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).select().single();

    if (error) throw error;
    await writeAudit('work_order_created', `New ${priority} work order: "${title}" on ${asset_name}`, { id: data.id, priority });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to create work order' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    if (updates.status === 'completed') updates.completed_date = new Date().toISOString().split('T')[0];

    const db = supabaseAdmin();
    const { data, error } = await db.from('work_orders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id).select().single();
    if (error) throw error;

    await writeAudit('work_order_updated', `Work order ${id} status → ${updates.status || 'updated'}`, { id });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to update work order' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const db = supabaseAdmin();
    const { error } = await db.from('work_orders').delete().eq('id', id);
    if (error) throw error;

    await writeAudit('work_order_deleted', `Work order ${id} deleted`, { id });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to delete work order' }, { status: 500 });
  }
}
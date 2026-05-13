import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SEED = [
  { id: 'ast-001', asset_number: 'ML-001', name: 'Knossos Palace', asset_type: 'vessel', make: 'Fincantieri', model: 'Ro-Pax', build_year: 1994, imo_number: '9081064', flag_state: 'Greece', status: 'operational', last_service_date: '2026-02-10', next_service_date: '2026-08-10', engine_hours: 54820, notes: 'Flagship vessel. Piraeus–Heraklion route.', created_at: '2020-01-01T00:00:00Z' },
  { id: 'ast-002', asset_number: 'ML-002', name: 'Festos Palace', asset_type: 'vessel', make: 'Fincantieri', model: 'Ro-Pax', build_year: 2001, imo_number: '9225395', flag_state: 'Greece', status: 'operational', last_service_date: '2026-01-20', next_service_date: '2026-07-20', engine_hours: 41330, notes: 'Piraeus–Heraklion route.', created_at: '2020-01-01T00:00:00Z' },
  { id: 'ast-003', asset_number: 'ML-003', name: 'Kydon Palace', asset_type: 'vessel', make: 'Brodosplit', model: 'Ro-Pax', build_year: 1990, imo_number: '8905599', flag_state: 'Greece', status: 'in_maintenance', last_service_date: '2025-11-05', next_service_date: '2026-05-30', engine_hours: 67450, notes: 'Currently in dry dock — hull and shaft seal work.', created_at: '2020-01-01T00:00:00Z' },
  { id: 'ast-004', asset_number: 'ML-004', name: 'Europa Palace', asset_type: 'vessel', make: 'Fincantieri', model: 'Ro-Pax', build_year: 2002, imo_number: '9236213', flag_state: 'Greece', status: 'operational', last_service_date: '2026-03-15', next_service_date: '2026-09-15', engine_hours: 38910, notes: 'Piraeus–Chania route.', created_at: '2020-01-01T00:00:00Z' },
  { id: 'ast-005', asset_number: 'ML-005', name: 'Port Crane Heraklion #1', asset_type: 'crane', make: 'Liebherr', model: 'LHM 400', build_year: 2010, flag_state: 'Greece', status: 'out_of_service', last_service_date: '2026-01-10', next_service_date: '2026-05-15', engine_hours: 12400, notes: 'Hydraulic seal failure — awaiting repair parts.', created_at: '2020-01-01T00:00:00Z' },
  { id: 'ast-006', asset_number: 'ML-006', name: 'Terminal Shuttle Bus A', asset_type: 'vehicle', make: 'Mercedes-Benz', model: 'Sprinter 519', build_year: 2019, flag_state: 'Greece', status: 'operational', last_service_date: '2026-05-11', next_service_date: '2026-11-11', engine_hours: 0, notes: 'Passenger transfer at Heraklion port. Annual service completed.', created_at: '2020-01-01T00:00:00Z' },
  { id: 'ast-007', asset_number: 'ML-007', name: 'Emergency Generator Set Port', asset_type: 'generator', make: 'Caterpillar', model: 'C32 ACERT', build_year: 2015, flag_state: 'Greece', status: 'operational', last_service_date: '2026-04-01', next_service_date: '2026-10-01', engine_hours: 3210, notes: 'Port terminal emergency power backup.', created_at: '2020-01-01T00:00:00Z' },
  { id: 'ast-008', asset_number: 'ML-008', name: 'Pilot Tender ML-01', asset_type: 'tender', make: 'Sealine', model: 'T60 Aura', build_year: 2008, flag_state: 'Greece', status: 'operational', last_service_date: '2026-03-20', next_service_date: '2026-09-20', engine_hours: 8920, notes: 'Port pilot transfer vessel.', created_at: '2020-01-01T00:00:00Z' },
];

export async function GET() {
  try {
    const db = supabaseAdmin();
    const { data, error } = await db.from('fleet_assets').select('*').order('asset_number');
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
    const asset_number = `ML-${String(Date.now()).slice(-3)}`;
    const { data, error } = await db.from('fleet_assets').insert({
      ...body, asset_number, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).select().single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const db = supabaseAdmin();
    const { data, error } = await db.from('fleet_assets').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}
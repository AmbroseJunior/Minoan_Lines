import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SEED = [
  { id: 'fl-001', asset_name: 'Knossos Palace', log_date: '2026-05-10', fuel_type: 'hfo', quantity_mt: 180, cost_per_mt: 620, total_cost: 111600, bunker_port: 'Piraeus', supplier: 'Aegean Bunkering Services', voyage_reference: 'KP-2026-089', created_at: '2026-05-10T18:00:00Z' },
  { id: 'fl-002', asset_name: 'Festos Palace', log_date: '2026-05-09', fuel_type: 'mgo', quantity_mt: 45, cost_per_mt: 750, total_cost: 33750, bunker_port: 'Heraklion', supplier: 'ELPE Bunkering', voyage_reference: 'FP-2026-091', created_at: '2026-05-09T14:30:00Z' },
  { id: 'fl-003', asset_name: 'Knossos Palace', log_date: '2026-05-07', fuel_type: 'mgo', quantity_mt: 28, cost_per_mt: 755, total_cost: 21140, bunker_port: 'Chania', supplier: 'ELPE Bunkering', voyage_reference: 'KP-2026-088', created_at: '2026-05-07T10:00:00Z' },
  { id: 'fl-004', asset_name: 'Europa Palace', log_date: '2026-05-06', fuel_type: 'hfo', quantity_mt: 156, cost_per_mt: 615, total_cost: 95940, bunker_port: 'Piraeus', supplier: 'Aegean Bunkering Services', voyage_reference: 'EP-2026-078', created_at: '2026-05-06T19:00:00Z' },
  { id: 'fl-005', asset_name: 'Festos Palace', log_date: '2026-05-04', fuel_type: 'hfo', quantity_mt: 142, cost_per_mt: 618, total_cost: 87756, bunker_port: 'Piraeus', supplier: 'Aegean Bunkering Services', voyage_reference: 'FP-2026-087', created_at: '2026-05-04T17:30:00Z' },
  { id: 'fl-006', asset_name: 'Pilot Tender ML-01', log_date: '2026-05-12', fuel_type: 'diesel', quantity_mt: 1.2, cost_per_mt: 1100, total_cost: 1320, bunker_port: 'Heraklion', supplier: 'EKO Petrol', voyage_reference: null, created_at: '2026-05-12T08:00:00Z' },
];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const asset = url.searchParams.get('asset');

    const db = supabaseAdmin();
    let query = db.from('fuel_logs').select('*').order('log_date', { ascending: false }).limit(50);
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
    const { asset_name, fuel_type, quantity_mt, log_date } = body;
    if (!asset_name || !fuel_type || !quantity_mt) {
      return NextResponse.json({ error: 'asset_name, fuel_type, and quantity_mt required' }, { status: 400 });
    }

    const total_cost = body.cost_per_mt ? parseFloat(quantity_mt) * parseFloat(body.cost_per_mt) : null;

    const db = supabaseAdmin();
    const { data, error } = await db.from('fuel_logs').insert({
      ...body,
      total_cost,
      log_date: log_date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    }).select().single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SEED = [
  { id: 'prt-001', part_number: 'ENG-001', name: 'Fuel Injector Nozzle (MAN B&W)', category: 'engine', unit: 'pcs', quantity_on_hand: 12, minimum_stock_level: 8, reorder_quantity: 12, unit_cost: 450, vendor: 'MAN Energy Solutions', location: 'Engine Store A-12', created_at: '2024-01-01T00:00:00Z' },
  { id: 'prt-002', part_number: 'ENG-002', name: 'Turbocharger Bearing Kit', category: 'engine', unit: 'sets', quantity_on_hand: 3, minimum_stock_level: 4, reorder_quantity: 6, unit_cost: 1200, vendor: 'ABB Turbocharging', location: 'Engine Store A-15', created_at: '2024-01-01T00:00:00Z' },
  { id: 'prt-003', part_number: 'ELEC-001', name: 'Navigation Light LED Assembly', category: 'electrical', unit: 'pcs', quantity_on_hand: 24, minimum_stock_level: 10, reorder_quantity: 12, unit_cost: 85, vendor: 'Perko Marine', location: 'Electrical Store B-03', created_at: '2024-01-01T00:00:00Z' },
  { id: 'prt-004', part_number: 'SAFE-001', name: 'EPIRB Battery Pack (Jotron)', category: 'safety', unit: 'pcs', quantity_on_hand: 6, minimum_stock_level: 8, reorder_quantity: 8, unit_cost: 320, vendor: 'Jotron AS', location: 'Safety Store C-01', created_at: '2024-01-01T00:00:00Z' },
  { id: 'prt-005', part_number: 'NAV-001', name: 'GPS Antenna Module (Furuno)', category: 'navigation', unit: 'pcs', quantity_on_hand: 4, minimum_stock_level: 2, reorder_quantity: 4, unit_cost: 520, vendor: 'Furuno Electric', location: 'Nav Store D-02', created_at: '2024-01-01T00:00:00Z' },
  { id: 'prt-006', part_number: 'HULL-001', name: 'Sacrificial Zinc Anode 10kg', category: 'hull', unit: 'pcs', quantity_on_hand: 45, minimum_stock_level: 20, reorder_quantity: 30, unit_cost: 42, vendor: 'Cathelco Ltd', location: 'Deck Store E-07', created_at: '2024-01-01T00:00:00Z' },
  { id: 'prt-007', part_number: 'FUEL-001', name: 'HFO Purifier Filter Element', category: 'fuel_system', unit: 'pcs', quantity_on_hand: 18, minimum_stock_level: 10, reorder_quantity: 15, unit_cost: 78, vendor: 'Alfa Laval', location: 'Engine Store A-08', created_at: '2024-01-01T00:00:00Z' },
  { id: 'prt-008', part_number: 'HYD-001', name: 'Hydraulic Seal Kit 65mm', category: 'hydraulic', unit: 'sets', quantity_on_hand: 2, minimum_stock_level: 5, reorder_quantity: 8, unit_cost: 890, vendor: 'Parker Hannifin', location: 'Engine Store A-20', created_at: '2024-01-01T00:00:00Z' },
  { id: 'prt-009', part_number: 'CONS-001', name: 'Engine Room Absorbent Wipes (200pk)', category: 'consumable', unit: 'cases', quantity_on_hand: 42, minimum_stock_level: 20, reorder_quantity: 24, unit_cost: 28, vendor: 'Spilfyter', location: 'Engine Store A-01', created_at: '2024-01-01T00:00:00Z' },
  { id: 'prt-010', part_number: 'DECK-001', name: 'Mooring Line 60m × 44mm', category: 'deck', unit: 'coils', quantity_on_hand: 8, minimum_stock_level: 5, reorder_quantity: 6, unit_cost: 320, vendor: 'Hampidjan', location: 'Deck Store E-01', created_at: '2024-01-01T00:00:00Z' },
];

export async function GET() {
  try {
    const db = supabaseAdmin();
    const { data, error } = await db.from('parts_inventory').select('*').order('part_number');
    if (error) throw error;
    return NextResponse.json(data && data.length ? data : SEED);
  } catch {
    return NextResponse.json(SEED);
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, quantity_on_hand, ...rest } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const db = supabaseAdmin();
    const { data, error } = await db.from('parts_inventory')
      .update({ quantity_on_hand, ...rest, updated_at: new Date().toISOString() })
      .eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = supabaseAdmin();
    const { data, error } = await db.from('parts_inventory').insert({ ...body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }).select().single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const db = supabaseAdmin();
    const url = new URL(req.url);
    const module = url.searchParams.get('module');
    const limit = parseInt(url.searchParams.get('limit') || '100');

    let query = db.from('audit_log').select('*').order('created_at', { ascending: false }).limit(limit);
    if (module) query = query.eq('module', module);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return NextResponse.json(data || []);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event_type, module, summary, metadata } = body;
    if (!event_type || !module || !summary) {
      return NextResponse.json({ error: 'event_type, module, summary required' }, { status: 400 });
    }
    const db = supabaseAdmin();
    const { data, error } = await db.from('audit_log').insert({
      event_type, module, summary,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    }).select().single();
    if (error) throw new Error(error.message);
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}

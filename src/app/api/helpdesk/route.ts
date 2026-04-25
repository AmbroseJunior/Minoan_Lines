import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { deepseek, DEEPSEEK_MODEL } from '@/lib/ai';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const db = supabaseAdmin();
  const url = new URL(req.url);
  const status = url.searchParams.get('status');

  let query = db.from('helpdesk_tickets').select('*').order('created_at', { ascending: false }).limit(50);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title, description, category = 'general', reported_by = 'Anonymous' } = body;

  if (!title || !description) {
    return NextResponse.json({ error: 'title and description required' }, { status: 400 });
  }

  // AI triage
  const triagePrompt = `Analyze this IT helpdesk ticket for a ferry company and respond with JSON only:
Title: ${title}
Description: ${description}
Return: {"priority": "critical|high|medium|low", "category": "network|hardware|software|booking|crewing|general", "suggested_response": "brief helpful response", "estimated_resolution_hours": number}`;

  let triage = { priority: 'medium', category, suggested_response: 'We will investigate shortly.', estimated_resolution_hours: 24 };

  try {
    const completion = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: [{ role: 'user', content: triagePrompt }],
      max_tokens: 300,
    });
    const raw = completion.choices[0].message.content || '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) triage = { ...triage, ...JSON.parse(jsonMatch[0]) };
  } catch {}

  const db = supabaseAdmin();
  const { data, error } = await db.from('helpdesk_tickets').insert({
    title,
    description,
    category: triage.category,
    priority: triage.priority,
    status: 'open',
    reported_by,
    suggested_response: triage.suggested_response,
    estimated_resolution_hours: triage.estimated_resolution_hours,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, status, resolution_notes } = body;

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const db = supabaseAdmin();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status) updates.status = status;
  if (resolution_notes) updates.resolution_notes = resolution_notes;
  if (status === 'resolved') updates.resolved_at = new Date().toISOString();

  const { data, error } = await db.from('helpdesk_tickets').update(updates).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

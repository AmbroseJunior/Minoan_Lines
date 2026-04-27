import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { deepseek, DEEPSEEK_MODEL } from '@/lib/ai';
import { Resend } from 'resend';

export const runtime = 'nodejs';

async function writeAudit(event_type: string, summary: string, metadata: Record<string, unknown>) {
  try {
    const db = supabaseAdmin();
    await db.from('audit_log').insert({ event_type, module: 'helpdesk', summary, metadata, created_at: new Date().toISOString() });
  } catch {}
}

async function sendAlertEmail(subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const alertEmail = process.env.ALERT_EMAIL;
  if (!apiKey || !alertEmail) return;
  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: 'Minoan Lines AI <alerts@integramindai.com>',
      to: [alertEmail],
      subject,
      html,
    });
  } catch {}
}

export async function GET(req: Request) {
  try {
    const db = supabaseAdmin();
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    let query = db.from('helpdesk_tickets').select('*').order('created_at', { ascending: false }).limit(50);
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return NextResponse.json(data || []);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, category = 'general', reported_by = 'Anonymous', booking_reference, ticket_number } = body;
    if (!title || !description) {
      return NextResponse.json({ error: 'title and description required' }, { status: 400 });
    }

    let triage = { priority: 'medium', category, suggested_response: 'We will investigate shortly and update you.', estimated_resolution_hours: 24 };
    try {
      const triagePrompt = `Analyze this IT helpdesk ticket for a ferry company and respond with JSON only:
Title: ${title}
Description: ${description}
Return: {"priority": "critical|high|medium|low", "category": "network|hardware|software|booking|crewing|general", "suggested_response": "brief helpful response under 50 words", "estimated_resolution_hours": number}`;
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
      title, description,
      category: triage.category, priority: triage.priority,
      status: 'open', reported_by,
      booking_reference: booking_reference || null,
      ticket_number: ticket_number || null,
      suggested_response: triage.suggested_response,
      estimated_resolution_hours: triage.estimated_resolution_hours,
      created_at: new Date().toISOString(),
    }).select().single();

    if (error) throw new Error(error.message);

    await writeAudit('ticket_created', `New ${triage.priority} ticket: "${title}" by ${reported_by}`, { id: data.id, priority: triage.priority, category: triage.category });

    if (triage.priority === 'critical' || triage.priority === 'high') {
      await sendAlertEmail(
        `🚨 ${triage.priority.toUpperCase()} Helpdesk Ticket: ${title}`,
        `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#001A4D;padding:20px 24px;border-radius:8px 8px 0 0">
            <div style="color:#C9A84C;font-weight:700;font-size:18px">⚠️ ${triage.priority.toUpperCase()} Priority Ticket</div>
            <div style="color:#93c5fd;font-size:13px;margin-top:4px">Minoan Lines IT Helpdesk · IntegraMind AI</div>
          </div>
          <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-radius:0 0 8px 8px">
            <p style="font-size:15px;font-weight:600;color:#111827;margin:0 0 8px">${title}</p>
            <p style="font-size:14px;color:#4b5563;margin:0 0 16px">${description}</p>
            <table style="font-size:13px;border-collapse:collapse;width:100%">
              <tr><td style="padding:4px 8px;color:#6b7280">Reported by</td><td style="padding:4px 8px;font-weight:500">${reported_by}</td></tr>
              <tr><td style="padding:4px 8px;color:#6b7280">Category</td><td style="padding:4px 8px">${triage.category}</td></tr>
              <tr><td style="padding:4px 8px;color:#6b7280">Est. Resolution</td><td style="padding:4px 8px">${triage.estimated_resolution_hours}h</td></tr>
              ${booking_reference ? `<tr><td style="padding:4px 8px;color:#6b7280">Booking Ref</td><td style="padding:4px 8px">${booking_reference}</td></tr>` : ''}
            </table>
            <div style="margin-top:16px;padding:12px;background:#fef2f2;border-left:4px solid #ef4444;border-radius:4px">
              <strong style="color:#dc2626">AI Suggested Response:</strong>
              <p style="color:#7f1d1d;margin:4px 0 0;font-size:13px">${triage.suggested_response}</p>
            </div>
          </div>
        </div>`
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to create ticket' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const db = supabaseAdmin();
    const { error } = await db.from('helpdesk_tickets').delete().eq('id', id);
    if (error) throw new Error(error.message);
    await writeAudit('ticket_deleted', `Ticket ${id} deleted`, { id });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to delete ticket' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, resolution_notes } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const db = supabaseAdmin();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (resolution_notes) updates.resolution_notes = resolution_notes;
    if (status === 'resolved') updates.resolved_at = new Date().toISOString();

    const { data, error } = await db.from('helpdesk_tickets').update(updates).eq('id', id).select().single();
    if (error) throw new Error(error.message);

    await writeAudit('ticket_updated', `Ticket status changed to "${status}"`, { id, status });

    if (status === 'escalated') {
      const ticket = data as { title?: string; reported_by?: string; description?: string };
      await sendAlertEmail(
        `🔴 ESCALATED Ticket: ${ticket?.title || id}`,
        `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#7f1d1d;padding:20px 24px;border-radius:8px 8px 0 0">
            <div style="color:#fca5a5;font-weight:700;font-size:18px">🔴 Ticket Escalated</div>
            <div style="color:#fecaca;font-size:13px;margin-top:4px">Immediate attention required</div>
          </div>
          <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-radius:0 0 8px 8px">
            <p style="font-size:15px;font-weight:600;color:#111827">${ticket?.title || 'Ticket ' + id}</p>
            <p style="font-size:14px;color:#4b5563">${ticket?.description || ''}</p>
            <p style="font-size:13px;color:#6b7280">Reported by: <strong>${ticket?.reported_by || 'Unknown'}</strong></p>
            <p style="font-size:12px;color:#9ca3af;margin-top:16px">Powered by IntegraMind AI · Minoan Lines Platform</p>
          </div>
        </div>`
      );
    }

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to update ticket' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

type AlertResult = {
  rule: string;
  triggered: boolean;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  value?: string | number;
  threshold?: string | number;
};

const BASE = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export async function POST(req: Request) {
  try {
    const { notify_email } = await req.json().catch(() => ({}));

    const [vesselRes, helpRes, compRes] = await Promise.all([
      fetch(`${BASE}/api/vessels`).then(r => r.json()).catch(() => []),
      fetch(`${BASE}/api/helpdesk`).then(r => r.json()).catch(() => []),
      fetch(`${BASE}/api/compliance`).then(r => r.json()).catch(() => ({})),
    ]);

    const alerts: AlertResult[] = [];

    // Rule 1: High delay risk vessels
    const highRisk = Array.isArray(vesselRes) ? vesselRes.filter((v: { delay_probability: number }) => v.delay_probability > 0.7) : [];
    alerts.push({
      rule: 'Vessel Delay Risk',
      triggered: highRisk.length > 0,
      severity: highRisk.length >= 3 ? 'critical' : 'warning',
      message: highRisk.length > 0
        ? `${highRisk.length} vessel${highRisk.length > 1 ? 's' : ''} (${highRisk.map((v: { name: string }) => v.name).join(', ')}) showing delay probability above 70%`
        : 'All vessels operating within normal delay parameters',
      value: highRisk.length,
      threshold: 0,
    });

    // Rule 2: Critical helpdesk tickets
    const criticalOpen = Array.isArray(helpRes) ? helpRes.filter((t: { priority: string; status: string }) => t.priority === 'critical' && t.status !== 'resolved') : [];
    alerts.push({
      rule: 'Critical IT Tickets',
      triggered: criticalOpen.length > 0,
      severity: 'critical',
      message: criticalOpen.length > 0
        ? `${criticalOpen.length} critical ticket${criticalOpen.length > 1 ? 's' : ''} unresolved: ${criticalOpen.map((t: { title: string }) => t.title).join('; ')}`
        : 'No critical tickets outstanding',
      value: criticalOpen.length,
      threshold: 0,
    });

    // Rule 3: Fleet CII average below threshold
    const avgCII = compRes?.fleet_summary?.avg_cii_score || 0;
    alerts.push({
      rule: 'Fleet CII Score',
      triggered: avgCII > 0 && avgCII < 65,
      severity: 'warning',
      message: avgCII < 65
        ? `Fleet average CII score of ${avgCII.toFixed(1)} is below the minimum acceptable threshold of 65`
        : `Fleet average CII score is ${avgCII.toFixed(1)} — within acceptable range`,
      value: avgCII.toFixed(1),
      threshold: 65,
    });

    // Rule 4: ETS exposure threshold
    const totalETS = compRes?.fleet_summary?.total_ets_allowances || 0;
    const etsCostEur = totalETS * 65;
    alerts.push({
      rule: 'ETS Cost Exposure',
      triggered: etsCostEur > 150000,
      severity: 'warning',
      message: etsCostEur > 150000
        ? `EU ETS exposure estimated at EUR ${etsCostEur.toLocaleString()} — exceeds EUR 150,000 advisory threshold`
        : `EU ETS exposure within normal range at EUR ${etsCostEur.toLocaleString()}`,
      value: `EUR ${etsCostEur.toLocaleString()}`,
      threshold: 'EUR 150,000',
    });

    // Rule 5: Stale data — helpdesk tickets open > 48h
    const staleCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const staleTickets = Array.isArray(helpRes)
      ? helpRes.filter((t: { status: string; created_at: string }) => t.status === 'open' && new Date(t.created_at) < staleCutoff)
      : [];
    alerts.push({
      rule: 'Stale Open Tickets',
      triggered: staleTickets.length > 0,
      severity: 'info',
      message: staleTickets.length > 0
        ? `${staleTickets.length} ticket${staleTickets.length > 1 ? 's' : ''} have been open for more than 48 hours without action`
        : 'All tickets are being actioned within SLA',
      value: staleTickets.length,
      threshold: 0,
    });

    const triggered = alerts.filter(a => a.triggered);
    const critical = triggered.filter(a => a.severity === 'critical');

    // Save to Supabase audit log — non-fatal
    try {
      const db = supabaseAdmin();
      await db.from('audit_log').insert({
        event_type: 'alert_check',
        module: 'alerts',
        summary: `Alert check ran: ${triggered.length} triggered (${critical.length} critical)`,
        metadata: { alerts, triggered_count: triggered.length },
      });
    } catch {}

    // Send email if there are triggered alerts and recipient provided
    const apiKey = process.env.RESEND_API_KEY;
    let emailSent = false;
    if (triggered.length > 0 && notify_email && apiKey) {
      const resend = new Resend(apiKey);
      const date = new Date().toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' });
      const rows = triggered.map(a => `
        <tr style="border-bottom:1px solid #e5e7eb">
          <td style="padding:10px 16px;font-weight:600;color:${a.severity === 'critical' ? '#dc2626' : a.severity === 'warning' ? '#d97706' : '#2563eb'}">${a.rule}</td>
          <td style="padding:10px 16px">
            <span style="background:${a.severity === 'critical' ? '#fee2e2' : a.severity === 'warning' ? '#fef9c3' : '#dbeafe'};color:${a.severity === 'critical' ? '#dc2626' : a.severity === 'warning' ? '#854d0e' : '#1d4ed8'};padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:700;text-transform:uppercase">${a.severity}</span>
          </td>
          <td style="padding:10px 16px;color:#374151;font-size:13px">${a.message}</td>
        </tr>`).join('');

      await resend.emails.send({
        from: 'Minoan Lines Ops <reports@integramindai.com>',
        to: [notify_email],
        subject: `${critical.length > 0 ? '[CRITICAL] ' : '[WARNING] '}${triggered.length} Alert${triggered.length > 1 ? 's' : ''} Triggered — Minoan Lines Platform`,
        html: `<!DOCTYPE html><html><body style="font-family:Inter,system-ui,sans-serif;background:#f3f4f6;margin:0;padding:24px">
<div style="max-width:680px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
  <div style="background:${critical.length > 0 ? '#7f1d1d' : '#001A4D'};padding:24px 32px">
    <div style="color:#fca5a5;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Minoan Lines — Infrastructure Alert</div>
    <div style="color:#fff;font-size:18px;font-weight:700;margin-top:4px">${triggered.length} Alert${triggered.length > 1 ? 's' : ''} Require Attention</div>
    <div style="color:#fcd34d;font-size:13px;margin-top:6px">${date}</div>
  </div>
  <div style="padding:28px 32px">
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead><tr style="background:#f9fafb">
        <th style="padding:10px 16px;text-align:left;color:#6b7280;font-weight:600">Rule</th>
        <th style="padding:10px 16px;text-align:left;color:#6b7280;font-weight:600">Severity</th>
        <th style="padding:10px 16px;text-align:left;color:#6b7280;font-weight:600">Detail</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
  <div style="background:#f9fafb;padding:14px 32px;border-top:1px solid #e5e7eb">
    <p style="font-size:12px;color:#9ca3af;margin:0">Minoan Lines AI Platform · Infrastructure Monitoring · Powered by IntegraMind AI</p>
  </div>
</div></body></html>`,
      });
      emailSent = true;
    }

    return NextResponse.json({ alerts, triggered: triggered.length, critical: critical.length, email_sent: emailSent, checked_at: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Alert check failed' }, { status: 500 });
  }
}

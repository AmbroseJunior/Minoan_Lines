import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { deepseek, DEEPSEEK_MODEL } from '@/lib/ai';

export const runtime = 'nodejs';

const VESSELS = ['Knossos Palace', 'Festos Palace', 'Mykonos Palace', 'Kydon Palace',
  'Santorini Palace', 'Europa Palace', 'Cruise Olympia', 'Cruise Europa'];

function buildComplianceData() {
  return VESSELS.map(name => {
    const fuelTons = 18 + Math.random() * 12;
    const co2 = fuelTons * 3.114;
    const cii_score = 60 + Math.random() * 30;
    const fuelEuRating = cii_score > 85 ? 'A' : cii_score > 75 ? 'B' : cii_score > 65 ? 'C' : 'D';
    return { vessel: name, fuel_consumption_tons: parseFloat(fuelTons.toFixed(1)), co2_emissions_tons: parseFloat(co2.toFixed(1)), eu_ets_allowances_needed: parseFloat((co2 * 0.5).toFixed(1)), cii_score: parseFloat(cii_score.toFixed(1)), fueleu_rating: fuelEuRating, ghg_intensity: parseFloat((fuelTons * 0.23).toFixed(2)) };
  });
}

// GET /api/cron/reports — called by Vercel Cron every Monday 07:00 UTC
export async function GET(req: Request) {
  // Verify this is a legitimate Vercel cron call
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const recipients = (process.env.REPORT_RECIPIENTS || '').split(',').map(e => e.trim()).filter(Boolean);
  if (!recipients.length) {
    return NextResponse.json({ skipped: true, reason: 'No REPORT_RECIPIENTS configured' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 503 });

  const data = buildComplianceData();
  const totalCO2 = data.reduce((s, v) => s + v.co2_emissions_tons, 0).toFixed(1);
  const avgCII = (data.reduce((s, v) => s + v.cii_score, 0) / data.length).toFixed(1);
  const totalETS = data.reduce((s, v) => s + v.eu_ets_allowances_needed, 0).toFixed(1);

  const completion = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODEL,
    messages: [{ role: 'user', content: `Write a brief weekly fleet compliance summary for Minoan Lines S.A. Fleet of ${data.length} vessels. Total CO2: ${totalCO2}t. Avg CII: ${avgCII}. ETS allowances needed: ${totalETS}. Plain prose only, no markdown, no emojis, under 200 words. Include one key action item for the week.` }],
    max_tokens: 400,
  });

  let summary = completion.choices[0].message.content || '';
  summary = summary.replace(/#{1,6}\s/g, '').replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1').replace(/^\s*[-*+]\s/gm, '');

  const date = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const vesselRows = data.map((v, i) => `
    <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f9fafb'}">
      <td style="padding:8px 12px;font-weight:500;color:#111827">${v.vessel}</td>
      <td style="padding:8px 12px;text-align:center;color:#374151">${v.co2_emissions_tons}t</td>
      <td style="padding:8px 12px;text-align:center;color:#374151">${v.cii_score}</td>
      <td style="padding:8px 12px;text-align:center">
        <span style="background:${v.fueleu_rating === 'A' ? '#dcfce7' : v.fueleu_rating === 'B' ? '#dbeafe' : '#fef9c3'};color:${v.fueleu_rating === 'A' ? '#166534' : v.fueleu_rating === 'B' ? '#1e40af' : '#854d0e'};padding:2px 8px;border-radius:9999px;font-size:12px;font-weight:600">${v.fueleu_rating}</span>
      </td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Inter,system-ui,sans-serif;background:#f3f4f6;margin:0;padding:24px">
<div style="max-width:680px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
  <div style="background:#001A4D;padding:24px 32px">
    <div style="color:#C9A84C;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Minoan Lines S.A.</div>
    <div style="color:#fff;font-size:18px;font-weight:700;margin-top:4px">Weekly Fleet Compliance Report</div>
    <div style="color:#93c5fd;font-size:13px;margin-top:6px">${date}</div>
  </div>
  <div style="background:#003087;padding:12px 32px;display:flex;gap:32px">
    ${[['Total CO2', totalCO2 + 't'], ['Avg CII Score', avgCII], ['ETS Allowances', totalETS]].map(([l, v]) => `<div><div style="color:#93c5fd;font-size:11px;font-weight:600;text-transform:uppercase">${l}</div><div style="color:#fff;font-size:16px;font-weight:700">${v}</div></div>`).join('')}
  </div>
  <div style="padding:28px 32px">
    <div style="background:#f0f9ff;border-left:4px solid #003087;padding:16px;border-radius:0 8px 8px 0;margin-bottom:24px;font-size:14px;line-height:1.7;color:#1e3a5f;white-space:pre-wrap">${summary}</div>
    <h3 style="font-size:14px;font-weight:600;color:#111827;margin-bottom:12px">Fleet Data</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead><tr style="background:#001A4D"><th style="padding:8px 12px;text-align:left;color:#93c5fd;font-weight:500">Vessel</th><th style="padding:8px 12px;text-align:center;color:#93c5fd;font-weight:500">CO2</th><th style="padding:8px 12px;text-align:center;color:#93c5fd;font-weight:500">CII</th><th style="padding:8px 12px;text-align:center;color:#93c5fd;font-weight:500">FuelEU</th></tr></thead>
      <tbody>${vesselRows}</tbody>
    </table>
  </div>
  <div style="background:#f9fafb;padding:14px 32px;border-top:1px solid #e5e7eb">
    <p style="font-size:12px;color:#9ca3af;margin:0">Automated weekly report · Minoan Lines AI Platform · Powered by IntegraMind AI</p>
  </div>
</div>
</body></html>`;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: 'Minoan Lines Reports <reports@integramindai.com>',
    to: recipients,
    subject: `Weekly Fleet Compliance Report — Minoan Lines S.A. (${date})`,
    html,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, sent_to: recipients, date });
}

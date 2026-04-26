import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

const BASE = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

async function probe(name: string, url: string, init?: RequestInit) {
  const start = Date.now();
  try {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(6000) });
    const ms = Date.now() - start;
    const status = res.ok ? 'healthy' : ms > 3000 ? 'degraded' : 'degraded';
    return { name, status, ms, http: res.status };
  } catch (e) {
    return { name, status: 'down' as const, ms: Date.now() - start, error: e instanceof Error ? e.message : 'timeout' };
  }
}

async function checkSupabase() {
  const start = Date.now();
  try {
    const db = supabaseAdmin();
    const { error } = await db.from('helpdesk_tickets').select('id').limit(1);
    const ms = Date.now() - start;
    return { name: 'Supabase Database', status: error ? 'degraded' : 'healthy', ms, detail: error?.message };
  } catch (e) {
    return { name: 'Supabase Database', status: 'down' as const, ms: Date.now() - start, error: e instanceof Error ? e.message : 'unreachable' };
  }
}

async function checkDeepSeek() {
  const start = Date.now();
  try {
    const res = await fetch('https://api.deepseek.com/v1/models', {
      headers: { Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` },
      signal: AbortSignal.timeout(5000),
    });
    const ms = Date.now() - start;
    return { name: 'DeepSeek AI API', status: res.ok ? 'healthy' : 'degraded', ms, http: res.status };
  } catch (e) {
    return { name: 'DeepSeek AI API', status: 'down' as const, ms: Date.now() - start, error: e instanceof Error ? e.message : 'unreachable' };
  }
}

async function checkResend() {
  const start = Date.now();
  if (!process.env.RESEND_API_KEY) {
    return { name: 'Resend Email', status: 'degraded' as const, ms: 0, detail: 'API key not configured' };
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      signal: AbortSignal.timeout(4000),
    });
    const ms = Date.now() - start;
    return { name: 'Resend Email', status: res.status === 405 || res.ok ? 'healthy' : 'degraded', ms, http: res.status };
  } catch (e) {
    return { name: 'Resend Email', status: 'down' as const, ms: Date.now() - start, error: e instanceof Error ? e.message : 'unreachable' };
  }
}

export async function GET() {
  const start = Date.now();

  const [vessels, compliance, analytics, helpdesk, db, ai, email] = await Promise.all([
    probe('Vessel Operations API', `${BASE}/api/vessels`),
    probe('Compliance API', `${BASE}/api/compliance`),
    probe('Analytics API', `${BASE}/api/analytics`),
    probe('Helpdesk API', `${BASE}/api/helpdesk`),
    checkSupabase(),
    checkDeepSeek(),
    checkResend(),
  ]);

  const modules = [vessels, compliance, analytics, helpdesk];
  const services = [db, ai, email];
  const all = [...modules, ...services];

  const healthyCount = all.filter(s => s.status === 'healthy').length;
  const downCount = all.filter(s => s.status === 'down').length;
  const overall = downCount > 0 ? 'degraded' : healthyCount === all.length ? 'healthy' : 'degraded';

  return NextResponse.json({
    overall,
    checked_at: new Date().toISOString(),
    response_ms: Date.now() - start,
    uptime_pct: ((healthyCount / all.length) * 100).toFixed(1),
    modules,
    services,
    summary: { total: all.length, healthy: healthyCount, degraded: all.filter(s => s.status === 'degraded').length, down: downCount },
  });
}

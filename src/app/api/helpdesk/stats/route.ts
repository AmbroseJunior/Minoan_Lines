import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const db = supabaseAdmin();
    const { data: tickets, error } = await db
      .from('helpdesk_tickets')
      .select('id, status, priority, category, created_at, resolved_at, estimated_resolution_hours')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw new Error(error.message);
    const all = tickets || [];

    const now = Date.now();
    const msPerHour = 3_600_000;

    const total = all.length;
    const byStatus = { open: 0, in_progress: 0, resolved: 0, escalated: 0 };
    const byCategory: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    let resolutionHoursSum = 0;
    let resolvedCount = 0;
    let overdueCount = 0;

    for (const t of all) {
      byStatus[t.status as keyof typeof byStatus] = (byStatus[t.status as keyof typeof byStatus] || 0) + 1;
      byCategory[t.category] = (byCategory[t.category] || 0) + 1;
      byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;

      if (t.status === 'resolved' && t.resolved_at && t.created_at) {
        const hours = (new Date(t.resolved_at).getTime() - new Date(t.created_at).getTime()) / msPerHour;
        resolutionHoursSum += hours;
        resolvedCount++;
      }

      if (t.status !== 'resolved' && t.created_at) {
        const ageHours = (now - new Date(t.created_at).getTime()) / msPerHour;
        if (ageHours > 24) overdueCount++;
      }
    }

    // Weekly trend: last 7 days ticket count
    const weeklyTrend: { day: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86_400_000);
      const label = d.toLocaleDateString('en-GB', { weekday: 'short' });
      const count = all.filter(t => {
        const td = new Date(t.created_at);
        return td.toDateString() === d.toDateString();
      }).length;
      weeklyTrend.push({ day: label, count });
    }

    return NextResponse.json({
      total,
      byStatus,
      byCategory: Object.entries(byCategory).map(([name, count]) => ({ name, count })),
      byPriority: Object.entries(byPriority).map(([name, count]) => ({ name, count })),
      avgResolutionHours: resolvedCount > 0 ? Math.round(resolutionHoursSum / resolvedCount) : null,
      overdueCount,
      resolvedCount,
      slaBreachRate: total > 0 ? Math.round((overdueCount / total) * 100) : 0,
      weeklyTrend,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}

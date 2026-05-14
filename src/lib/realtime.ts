'use client';
import { useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase Realtime (WebSocket-based) for live table subscriptions.
// Uses the public anon key — RLS on the table controls what can be observed.

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export function useTableSubscription(
  table: string,
  event: RealtimeEvent = '*',
  onEvent: (payload: Record<string, unknown>) => void,
) {
  const cbRef = useRef(onEvent);
  cbRef.current = onEvent;

  useEffect(() => {
    const client = getClient();
    if (!client) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channel = client.channel(`realtime:${table}`);
    channel
      .on('postgres_changes' as any, { event, schema: 'public', table }, (payload: Record<string, unknown>) => {
        cbRef.current(payload);
      })
      .subscribe();

    return () => { client.removeChannel(channel); };
  }, [table, event]);
}

export function useWorkOrderUpdates(onEvent: (payload: Record<string, unknown>) => void) {
  return useTableSubscription('work_orders', '*', onEvent);
}

export function useLeaveRequestUpdates(onEvent: (payload: Record<string, unknown>) => void) {
  return useTableSubscription('leave_requests', '*', onEvent);
}

export function useEmployeeUpdates(onEvent: (payload: Record<string, unknown>) => void) {
  return useTableSubscription('employees', '*', onEvent);
}
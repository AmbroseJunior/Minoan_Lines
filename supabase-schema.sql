-- Run this in your Supabase SQL editor

-- Chat messages
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);
create index on chat_messages(session_id, created_at);

-- Compliance reports
create table if not exists compliance_reports (
  id uuid primary key default gen_random_uuid(),
  report_type text not null,
  content text not null,
  vessel_data jsonb,
  generated_at timestamptz default now()
);

-- Helpdesk tickets
create table if not exists helpdesk_tickets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text default 'general',
  priority text default 'medium',
  status text default 'open',
  reported_by text default 'Anonymous',
  suggested_response text,
  estimated_resolution_hours int default 24,
  resolution_notes text,
  resolved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on helpdesk_tickets(status, created_at desc);

-- Vessel positions cache
create table if not exists vessel_positions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text,
  speed_knots float,
  route text,
  lat float,
  lon float,
  delay_probability float,
  updated_at timestamptz default now()
);
create unique index on vessel_positions(name);

-- RLS (disable for service role, enable for anon reads where appropriate)
alter table chat_messages enable row level security;
alter table compliance_reports enable row level security;
alter table helpdesk_tickets enable row level security;
alter table vessel_positions enable row level security;

-- Allow service role full access (already default)
-- Allow anon read vessel positions
create policy "public read vessels" on vessel_positions for select using (true);

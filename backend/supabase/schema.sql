-- ============================================================
-- Minoan Lines AI Platform — Supabase Schema
-- IntegraMind AI × Minoan Lines S.A.
-- ============================================================
-- Run this in Supabase SQL Editor (Project → SQL Editor → New query)
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1. Vessels ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vessels (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT        NOT NULL UNIQUE,
    mmsi            TEXT,
    imo             TEXT,
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    speed_knots     DOUBLE PRECISION,
    heading         DOUBLE PRECISION,
    nav_status      TEXT,
    current_route   TEXT,
    departure_port  TEXT,
    destination_port TEXT,
    delay_minutes   INTEGER     DEFAULT 0,
    delay_probability DOUBLE PRECISION DEFAULT 0.0,
    position_updated_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. Voyage Events ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS voyage_events (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    vessel_name     TEXT        NOT NULL REFERENCES vessels(name) ON DELETE CASCADE,
    event_type      TEXT        NOT NULL DEFAULT 'position_update',
    event_data      JSONB,
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    speed_knots     DOUBLE PRECISION,
    delay_minutes   INTEGER     DEFAULT 0,
    delay_probability DOUBLE PRECISION DEFAULT 0.0,
    source          TEXT        DEFAULT 'ais',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voyage_events_vessel_name ON voyage_events(vessel_name);
CREATE INDEX IF NOT EXISTS idx_voyage_events_created_at  ON voyage_events(created_at DESC);

-- ── 3. Conversations (Customer Support) ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS conversations (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      TEXT        NOT NULL UNIQUE,
    language        TEXT        NOT NULL DEFAULT 'en',
    status          TEXT        NOT NULL DEFAULT 'active',  -- active | escalated | resolved
    message_count   INTEGER     DEFAULT 0,
    escalation_reason TEXT,
    closed_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status     ON conversations(status);

-- ── 4. Conversation Messages ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS conversation_messages (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id      UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    session_id           TEXT        NOT NULL,
    role                 TEXT        NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content              TEXT        NOT NULL,
    confidence_score     DOUBLE PRECISION,
    escalation_triggered INTEGER     DEFAULT 0,
    created_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conv_messages_session_id  ON conversation_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_conv_messages_created_at  ON conversation_messages(created_at);

-- ── 5. IT Helpdesk Tickets ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tickets (
    id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number               TEXT        NOT NULL UNIQUE,
    title                       TEXT        NOT NULL,
    description                 TEXT        NOT NULL,
    submitted_by                TEXT,
    submitted_by_email          TEXT,
    category                    TEXT,        -- Software/ERP | Network/Connectivity | Hardware | Security | Vessel IT | Other
    priority                    TEXT        NOT NULL DEFAULT 'medium',  -- critical | high | medium | low
    status                      TEXT        NOT NULL DEFAULT 'open',    -- open | in_progress | resolved | closed
    assigned_to                 TEXT,
    estimated_resolution_hours  INTEGER,
    ai_draft_response           TEXT,
    ai_confidence               INTEGER,     -- 0-100
    sla_due_at                  TIMESTAMPTZ,
    sla_breached                INTEGER     DEFAULT 0,
    resolution_notes            TEXT,
    resolved_at                 TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_status   ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);

-- ── 6. Compliance Reports ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS compliance_reports (
    id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type                 TEXT        NOT NULL,   -- eu_ets | fueleu | iso9001 | athex_quarterly
    report_period               TEXT        NOT NULL,   -- e.g. "2025-Q1"
    vessel_name                 TEXT,                   -- NULL = fleet-wide
    fuel_consumed_mt            DOUBLE PRECISION,
    co2_emissions_mt            DOUBLE PRECISION,
    ets_allowances_required     DOUBLE PRECISION,
    ets_cost_eur                DOUBLE PRECISION,
    ghg_intensity_gco2eq_mj     DOUBLE PRECISION,
    fueleu_compliance_balance   DOUBLE PRECISION,
    pdf_path                    TEXT,
    json_data                   JSONB,
    status                      TEXT        NOT NULL DEFAULT 'generated',
    created_at                  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_reports_type   ON compliance_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_period ON compliance_reports(report_period);

-- ── 7. Fuel Consumption Records ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS fuel_consumption_records (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    vessel_name         TEXT        NOT NULL,
    voyage_id           TEXT        NOT NULL,
    departure_port      TEXT        NOT NULL,
    arrival_port        TEXT        NOT NULL,
    departure_time      TIMESTAMPTZ NOT NULL,
    arrival_time        TIMESTAMPTZ NOT NULL,
    distance_nm         DOUBLE PRECISION NOT NULL,
    fuel_type           TEXT        NOT NULL DEFAULT 'HFO',
    fuel_consumed_mt    DOUBLE PRECISION NOT NULL,
    co2_emission_factor DOUBLE PRECISION NOT NULL DEFAULT 3.206,
    co2_emissions_mt    DOUBLE PRECISION NOT NULL,
    is_eu_ets_voyage    BOOLEAN     DEFAULT TRUE,
    idempotency_key     TEXT        NOT NULL UNIQUE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fuel_records_vessel_name ON fuel_consumption_records(vessel_name);
CREATE INDEX IF NOT EXISTS idx_fuel_records_departure   ON fuel_consumption_records(departure_time DESC);

-- ── 8. Row Level Security (RLS) ──────────────────────────────────────────────
-- All tables use service_role key from backend — no user-level RLS needed.
-- Enable RLS but grant full access to service_role.

ALTER TABLE vessels                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE voyage_events           ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_reports      ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_consumption_records ENABLE ROW LEVEL SECURITY;

-- Service role bypass (used by FastAPI backend)
CREATE POLICY "service_role_all_vessels"
    ON vessels FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_voyage_events"
    ON voyage_events FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_conversations"
    ON conversations FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_conversation_messages"
    ON conversation_messages FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_tickets"
    ON tickets FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_compliance_reports"
    ON compliance_reports FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_fuel_records"
    ON fuel_consumption_records FOR ALL USING (auth.role() = 'service_role');

-- ── 9. Realtime Publications ─────────────────────────────────────────────────
-- Enable realtime for tables that the Flutter app subscribes to.

BEGIN;
  -- Vessels: live map updates
  ALTER PUBLICATION supabase_realtime ADD TABLE vessels;
  -- Tickets: live helpdesk dashboard
  ALTER PUBLICATION supabase_realtime ADD TABLE tickets;
  -- Conversations: live chat status
  ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
COMMIT;

-- ── 10. Seed: Minoan Fleet ───────────────────────────────────────────────────
-- Insert the 8 vessels so the vessels table is pre-populated.

INSERT INTO vessels (name, mmsi, imo, nav_status)
VALUES
    ('Knossos Palace',  '239123456', '9167545', 'underway'),
    ('Festos Palace',   '239234567', '9167557', 'underway'),
    ('Knossos',         '239345678', '8814275', 'at_anchor'),
    ('Festos',          '239456789', '8814287', 'underway'),
    ('Olympia Palace',  '239567890', '9167569', 'underway'),
    ('Ikarus Palace',   '239678901', '9167571', 'moored'),
    ('Europa Palace',   '239789012', '9167583', 'underway'),
    ('Ariadne',         '239890123', '7392345', 'at_anchor')
ON CONFLICT (name) DO NOTHING;
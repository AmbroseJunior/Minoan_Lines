-- ============================================================
-- Minoan Lines AI Platform — Employees & Fleet Maintenance
-- Run this in Supabase > SQL Editor
-- ============================================================

-- ─── EMPLOYEES MODULE ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS employees (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_number     TEXT UNIQUE NOT NULL,
  first_name          TEXT NOT NULL,
  last_name           TEXT NOT NULL,
  email               TEXT UNIQUE NOT NULL,
  phone               TEXT,
  department          TEXT NOT NULL,
  job_title           TEXT NOT NULL,
  employment_type     TEXT NOT NULL CHECK (employment_type IN ('permanent','contract','seasonal','part_time')),
  manager_name        TEXT,
  hire_date           DATE NOT NULL,
  contract_end_date   DATE,
  status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','on_leave','terminated')),
  nationality         TEXT DEFAULT 'Greek',
  stcw_expiry         DATE,
  medical_expiry      DATE,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leave_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID REFERENCES employees(id) ON DELETE CASCADE,
  employee_name   TEXT NOT NULL,
  leave_type      TEXT NOT NULL CHECK (leave_type IN ('annual','sick','maternity','paternity','unpaid','emergency','study')),
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  days_requested  INTEGER NOT NULL,
  reason          TEXT,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  reviewed_by     TEXT,
  reviewed_at     TIMESTAMPTZ,
  ai_assessment   TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── FLEET MAINTENANCE MODULE ────────────────────────────────

CREATE TABLE IF NOT EXISTS fleet_assets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_number      TEXT UNIQUE NOT NULL,
  name              TEXT NOT NULL,
  asset_type        TEXT NOT NULL CHECK (asset_type IN ('vessel','vehicle','equipment','crane','generator','tender')),
  make              TEXT,
  model             TEXT,
  build_year        INTEGER,
  imo_number        TEXT,
  flag_state        TEXT DEFAULT 'Greece',
  status            TEXT NOT NULL DEFAULT 'operational' CHECK (status IN ('operational','in_maintenance','out_of_service','decommissioned')),
  last_service_date DATE,
  next_service_date DATE,
  engine_hours      NUMERIC DEFAULT 0,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS work_orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_number   TEXT UNIQUE NOT NULL,
  asset_name          TEXT NOT NULL,
  title               TEXT NOT NULL,
  description         TEXT NOT NULL,
  work_type           TEXT NOT NULL CHECK (work_type IN ('preventive','corrective','inspection','emergency','modification')),
  priority            TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','critical')),
  status              TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','waiting_parts','completed','cancelled')),
  assigned_to         TEXT,
  estimated_hours     NUMERIC,
  actual_hours        NUMERIC,
  parts_cost          NUMERIC DEFAULT 0,
  labour_cost         NUMERIC DEFAULT 0,
  scheduled_date      DATE,
  completed_date      DATE,
  technician_notes    TEXT,
  ai_priority_note    TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS maintenance_schedules (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_name        TEXT NOT NULL,
  schedule_name     TEXT NOT NULL,
  maintenance_type  TEXT NOT NULL,
  interval_type     TEXT NOT NULL CHECK (interval_type IN ('days','engine_hours','months')),
  interval_value    INTEGER NOT NULL,
  last_done_date    DATE,
  next_due_date     DATE NOT NULL,
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS parts_inventory (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_number           TEXT UNIQUE NOT NULL,
  name                  TEXT NOT NULL,
  category              TEXT NOT NULL CHECK (category IN ('engine','electrical','safety','navigation','hull','fuel_system','hydraulic','consumable','deck','other')),
  unit                  TEXT NOT NULL DEFAULT 'pcs',
  quantity_on_hand      NUMERIC NOT NULL DEFAULT 0,
  minimum_stock_level   NUMERIC NOT NULL DEFAULT 5,
  reorder_quantity      NUMERIC DEFAULT 10,
  unit_cost             NUMERIC,
  vendor                TEXT,
  location              TEXT,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inspection_records (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_name            TEXT NOT NULL,
  inspection_type       TEXT NOT NULL CHECK (inspection_type IN ('pre_voyage','post_voyage','routine','safety','class_survey','port_state','flag_state')),
  inspector_name        TEXT NOT NULL,
  inspection_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  overall_status        TEXT NOT NULL CHECK (overall_status IN ('passed','passed_with_defects','failed')),
  defects_found         TEXT,
  corrective_actions    TEXT,
  next_inspection_date  DATE,
  created_at            TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fuel_logs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_name            TEXT NOT NULL,
  log_date              DATE NOT NULL DEFAULT CURRENT_DATE,
  fuel_type             TEXT NOT NULL CHECK (fuel_type IN ('hfo','mgo','lng','diesel','petrol')),
  quantity_mt           NUMERIC NOT NULL,
  cost_per_mt           NUMERIC,
  total_cost            NUMERIC,
  bunker_port           TEXT,
  supplier              TEXT,
  voyage_reference      TEXT,
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_employees_dept     ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_status   ON employees(status);
CREATE INDEX IF NOT EXISTS idx_leave_status       ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_wo_status          ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_wo_priority        ON work_orders(priority);
CREATE INDEX IF NOT EXISTS idx_pm_next_due        ON maintenance_schedules(next_due_date);
CREATE INDEX IF NOT EXISTS idx_parts_category     ON parts_inventory(category);
CREATE INDEX IF NOT EXISTS idx_fuel_asset         ON fuel_logs(asset_name);
CREATE INDEX IF NOT EXISTS idx_inspect_date       ON inspection_records(inspection_date DESC);
-- ============================================================
-- ImmoGest Database Schema
-- Run this file first to create all tables, constraints, and RLS policies.
-- ============================================================

-- ============================================================
-- 1. ADMINS
-- ============================================================
CREATE TABLE admins (
  id               TEXT PRIMARY KEY,
  first_name       TEXT NOT NULL,
  last_name        TEXT NOT NULL,
  email            TEXT NOT NULL UNIQUE,
  phone            TEXT NOT NULL,
  role             TEXT NOT NULL CHECK (role IN ('super_admin', 'admin_manager', 'admin_support')),
  password         TEXT NOT NULL,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by       TEXT REFERENCES admins(id)
);

-- ============================================================
-- 2. BUILDINGS
-- ============================================================
CREATE TABLE buildings (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  address          TEXT NOT NULL,
  city             TEXT NOT NULL,
  province         TEXT NOT NULL,
  postal_code      TEXT NOT NULL,
  total_units      INTEGER NOT NULL,
  occupied_units   INTEGER NOT NULL DEFAULT 0,
  floors           INTEGER NOT NULL,
  year_built       INTEGER NOT NULL,
  manager_id       TEXT REFERENCES admins(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. APARTMENTS  (tenant_id FK added later to break circular ref)
-- ============================================================
CREATE TABLE apartments (
  id               TEXT PRIMARY KEY,
  building_id      TEXT NOT NULL REFERENCES buildings(id),
  unit_number      TEXT NOT NULL,
  floor            INTEGER NOT NULL,
  rooms            INTEGER NOT NULL,
  area             NUMERIC NOT NULL,
  rent             NUMERIC NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
  tenant_id        TEXT  -- FK added via ALTER TABLE after tenants is created
);

-- ============================================================
-- 4. TENANTS  (lease_id FK added later to break circular ref)
-- ============================================================
CREATE TABLE tenants (
  id                    TEXT PRIMARY KEY,
  first_name            TEXT NOT NULL,
  last_name             TEXT NOT NULL,
  email                 TEXT NOT NULL UNIQUE,
  phone                 TEXT NOT NULL,
  password              TEXT NOT NULL,
  status                TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'pending_approval', 'suspended')),
  building_id           TEXT REFERENCES buildings(id),
  apartment_id          TEXT REFERENCES apartments(id),
  lease_id              TEXT,  -- FK added via ALTER TABLE after leases is created
  must_change_password  BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by            TEXT REFERENCES admins(id)
);

-- Add the deferred FK from apartments -> tenants
ALTER TABLE apartments
  ADD CONSTRAINT fk_apartments_tenant
  FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- ============================================================
-- 5. LEASES
-- ============================================================
CREATE TABLE leases (
  id               TEXT PRIMARY KEY,
  tenant_id        TEXT NOT NULL REFERENCES tenants(id),
  apartment_id     TEXT NOT NULL REFERENCES apartments(id),
  building_id      TEXT NOT NULL REFERENCES buildings(id),
  start_date       TEXT NOT NULL,
  end_date         TEXT NOT NULL,
  monthly_rent     NUMERIC NOT NULL,
  deposit_amount   NUMERIC NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('active', 'expired', 'terminated', 'pending')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by       TEXT NOT NULL REFERENCES admins(id)
);

-- Add the deferred FK from tenants -> leases
ALTER TABLE tenants
  ADD CONSTRAINT fk_tenants_lease
  FOREIGN KEY (lease_id) REFERENCES leases(id);

-- ============================================================
-- 6. INCIDENTS
-- ============================================================
CREATE TABLE incidents (
  id               TEXT PRIMARY KEY,
  title            TEXT NOT NULL,
  description      TEXT NOT NULL,
  building_id      TEXT NOT NULL REFERENCES buildings(id),
  apartment_id     TEXT NOT NULL REFERENCES apartments(id),
  reported_by      TEXT NOT NULL REFERENCES tenants(id),
  assigned_to      TEXT REFERENCES admins(id),
  status           TEXT NOT NULL CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  priority         TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at      TIMESTAMPTZ
);

-- ============================================================
-- 7. PENDING APPLICATIONS
-- ============================================================
CREATE TABLE pending_applications (
  id                   TEXT PRIMARY KEY,
  first_name           TEXT NOT NULL,
  last_name            TEXT NOT NULL,
  email                TEXT NOT NULL,
  phone                TEXT NOT NULL,
  password             TEXT NOT NULL,
  housing_preference   TEXT,
  documents            TEXT[] NOT NULL DEFAULT '{}',
  status               TEXT NOT NULL CHECK (status IN ('pending_review', 'approved', 'rejected')),
  reviewed_by          TEXT REFERENCES admins(id),
  review_note          TEXT,
  submitted_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at          TIMESTAMPTZ
);

-- ============================================================
-- 8. PAYMENTS
-- ============================================================
CREATE TABLE payments (
  id               TEXT PRIMARY KEY,
  tenant_id        TEXT NOT NULL REFERENCES tenants(id),
  lease_id         TEXT NOT NULL REFERENCES leases(id),
  amount           NUMERIC NOT NULL,
  monthly_rent     NUMERIC NOT NULL,
  month            TEXT NOT NULL,
  due_date         TEXT NOT NULL,
  paid_at          TIMESTAMPTZ,
  status           TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  method           TEXT CHECK (method IN ('bank_transfer', 'credit_card', 'cash', 'cheque')),
  reference        TEXT,
  late_fee         NUMERIC NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 9. POINTS TRANSACTIONS
-- ============================================================
CREATE TABLE points_transactions (
  id                  TEXT PRIMARY KEY,
  tenant_id           TEXT NOT NULL REFERENCES tenants(id),
  type                TEXT NOT NULL CHECK (type IN ('earned_early_payment', 'earned_on_time', 'earned_loyalty', 'earned_no_incident', 'redeemed', 'bonus')),
  points              INTEGER NOT NULL,
  description         TEXT NOT NULL,
  related_payment_id  TEXT REFERENCES payments(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 10. LOYALTY PROFILES
-- ============================================================
CREATE TABLE loyalty_profiles (
  tenant_id            TEXT PRIMARY KEY REFERENCES tenants(id),
  total_points         INTEGER NOT NULL DEFAULT 0,
  current_tier         TEXT NOT NULL CHECK (current_tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  punctuality_score    INTEGER NOT NULL DEFAULT 0,
  consecutive_on_time  INTEGER NOT NULL DEFAULT 0,
  total_payments       INTEGER NOT NULL DEFAULT 0,
  on_time_payments     INTEGER NOT NULL DEFAULT 0
);

-- ============================================================
-- 11. CONVERSATIONS
-- ============================================================
CREATE TABLE conversations (
  id               TEXT PRIMARY KEY,
  tenant_id        TEXT NOT NULL REFERENCES tenants(id),
  admin_id         TEXT NOT NULL REFERENCES admins(id),
  subject          TEXT NOT NULL,
  last_message_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  unread_admin     INTEGER NOT NULL DEFAULT 0,
  unread_client    INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 12. MESSAGES
-- ============================================================
CREATE TABLE messages (
  id               TEXT PRIMARY KEY,
  conversation_id  TEXT NOT NULL REFERENCES conversations(id),
  sender_id        TEXT NOT NULL,
  sender_type      TEXT NOT NULL CHECK (sender_type IN ('admin', 'client')),
  content          TEXT NOT NULL,
  read_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 13. DOCUMENTS
-- ============================================================
CREATE TABLE documents (
  id               TEXT PRIMARY KEY,
  tenant_id        TEXT NOT NULL REFERENCES tenants(id),
  type             TEXT NOT NULL CHECK (type IN ('lease_contract', 'receipt', 'notice', 'invoice', 'other')),
  title            TEXT NOT NULL,
  description      TEXT NOT NULL,
  file_url         TEXT NOT NULL,
  file_size        INTEGER NOT NULL,
  uploaded_by      TEXT NOT NULL REFERENCES admins(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================
ALTER TABLE admins               ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants              ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases               ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents            ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents            ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PERMISSIVE "ALLOW ALL" POLICIES FOR ANON ROLE
-- (Development only -- tighten for production)
-- ============================================================
CREATE POLICY "Allow all for anon" ON admins               FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON buildings            FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON apartments           FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON tenants              FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON leases               FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON incidents            FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON pending_applications FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON payments             FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON points_transactions  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON loyalty_profiles     FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON conversations        FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON messages             FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON documents            FOR ALL TO anon USING (true) WITH CHECK (true);

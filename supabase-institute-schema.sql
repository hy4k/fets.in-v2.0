-- ─── Institute + Admin Schema Additions ────────────────────────────────────────
-- Run this in your Supabase SQL editor.
-- Safe to re-run — all statements use IF NOT EXISTS / DROP IF EXISTS.

-- ── coaching_centers: add missing columns ──────────────────────────────────────
ALTER TABLE coaching_centers ADD COLUMN IF NOT EXISTS email        TEXT;
ALTER TABLE coaching_centers ADD COLUMN IF NOT EXISTS contact_name TEXT;

-- Allow public self-registration of institutes
DROP POLICY IF EXISTS "Public can register coaching center" ON coaching_centers;
CREATE POLICY "Public can register coaching center"
  ON coaching_centers FOR INSERT WITH CHECK (true);

-- Allow anon to read coaching_centers (access code verification + admin panel)
DROP POLICY IF EXISTS "Public can read coaching centers" ON coaching_centers;
CREATE POLICY "Public can read coaching centers"
  ON coaching_centers FOR SELECT USING (true);

-- ── cma_mock_bookings ──────────────────────────────────────────────────────────
-- Add columns that may be missing if table was created before the full schema
ALTER TABLE cma_mock_bookings ADD COLUMN IF NOT EXISTS confirmation_code TEXT;
ALTER TABLE cma_mock_bookings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Update any NULL status values to 'pending'
UPDATE cma_mock_bookings SET status = 'pending' WHERE status IS NULL;

-- Allow anon to read all cma_mock_bookings (admin panel + institute dashboard)
DROP POLICY IF EXISTS "Public can read institutional cma bookings" ON cma_mock_bookings;
DROP POLICY IF EXISTS "Public can read cma bookings" ON cma_mock_bookings;
CREATE POLICY "Public can read cma bookings"
  ON cma_mock_bookings FOR SELECT USING (true);

-- ── cma_mock_students ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public can read cma students for institutes" ON cma_mock_students;
CREATE POLICY "Public can read cma students for institutes"
  ON cma_mock_students FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert cma students" ON cma_mock_students;
CREATE POLICY "Public can insert cma students"
  ON cma_mock_students FOR INSERT WITH CHECK (true);

-- ── early_access_leads: allow admin panel to read ─────────────────────────────
DROP POLICY IF EXISTS "Public can read early access leads" ON early_access_leads;
CREATE POLICY "Public can read early access leads"
  ON early_access_leads FOR SELECT USING (true);

-- ── mock_exam_bookings (slot-based): allow admin panel to read ─────────────────
DROP POLICY IF EXISTS "Public can read mock exam bookings" ON mock_exam_bookings;
CREATE POLICY "Public can read mock exam bookings"
  ON mock_exam_bookings FOR SELECT USING (true);

-- ── exam_results table ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exam_results (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coaching_center_id UUID REFERENCES coaching_centers(id) ON DELETE CASCADE,
  booking_id         UUID REFERENCES cma_mock_bookings(id) ON DELETE SET NULL,
  student_name       TEXT NOT NULL,
  exam_part          TEXT,
  exam_date          DATE,
  score              NUMERIC,
  result_status      TEXT DEFAULT 'pending' CHECK (result_status IN ('pass', 'fail', 'pending')),
  uploaded_at        TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Institutes can insert exam results" ON exam_results;
CREATE POLICY "Institutes can insert exam results"
  ON exam_results FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Institutes can read their exam results" ON exam_results;
CREATE POLICY "Institutes can read their exam results"
  ON exam_results FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_exam_results_center ON exam_results(coaching_center_id);
ALTER TABLE exam_results ADD COLUMN IF NOT EXISTS candidate_email TEXT;
CREATE INDEX IF NOT EXISTS idx_exam_results_email ON exam_results(candidate_email);

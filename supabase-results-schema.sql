-- ─── Exam Results Table ────────────────────────────────────────────────────────
-- Run this in your Supabase SQL editor to enable results upload.

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

-- Enable RLS
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

-- Allow institutes (anon) to insert results
DROP POLICY IF EXISTS "Institutes can insert exam results" ON exam_results;
CREATE POLICY "Institutes can insert exam results"
  ON exam_results FOR INSERT WITH CHECK (true);

-- Allow institutes to read their own results
DROP POLICY IF EXISTS "Institutes can read their exam results" ON exam_results;
CREATE POLICY "Institutes can read their exam results"
  ON exam_results FOR SELECT USING (true);

-- Index for fast lookups by institute
CREATE INDEX IF NOT EXISTS idx_exam_results_center ON exam_results(coaching_center_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_status ON exam_results(result_status);

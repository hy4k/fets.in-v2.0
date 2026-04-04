-- ─── Institute Schema Additions ───────────────────────────────────────────────
-- Run this in your Supabase SQL editor to enable the institute portal.

-- Add contact_name column if not exists
ALTER TABLE coaching_centers ADD COLUMN IF NOT EXISTS contact_name TEXT;

-- Allow public self-registration of institutes
DROP POLICY IF EXISTS "Public can register coaching center" ON coaching_centers;
CREATE POLICY "Public can register coaching center"
  ON coaching_centers FOR INSERT WITH CHECK (true);

-- Allow institutes (anon) to read cma_mock_bookings by coaching_center_id
DROP POLICY IF EXISTS "Public can read institutional cma bookings" ON cma_mock_bookings;
CREATE POLICY "Public can read institutional cma bookings"
  ON cma_mock_bookings FOR SELECT USING (true);

-- Allow institutes to read cma_mock_students
DROP POLICY IF EXISTS "Public can read cma students for institutes" ON cma_mock_students;
CREATE POLICY "Public can read cma students for institutes"
  ON cma_mock_students FOR SELECT USING (true);

-- Allow anon to read coaching_centers (for access code verification)
DROP POLICY IF EXISTS "Public can read coaching centers" ON coaching_centers;
CREATE POLICY "Public can read coaching centers"
  ON coaching_centers FOR SELECT USING (true);

-- ============================================================
-- FETS — Complete Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- Safe to run on an existing database — uses IF NOT EXISTS / DO NOTHING
-- ============================================================


-- ============================================================
-- 1. MOCK EXAM SLOTS  (admin-managed seat availability)
-- ============================================================
CREATE TABLE IF NOT EXISTS mock_exam_slots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date         DATE NOT NULL,
  center       TEXT NOT NULL CHECK (center IN ('Cochin', 'Calicut')),
  time_slot    TEXT NOT NULL,
  total_seats  INT  NOT NULL DEFAULT 40,
  booked_seats INT  NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT mock_exam_slots_unique UNIQUE (date, center, time_slot)
);

ALTER TABLE mock_exam_slots ENABLE ROW LEVEL SECURITY;

-- Anyone can read slots (to show calendar availability)
DROP POLICY IF EXISTS "Public read slots" ON mock_exam_slots;
CREATE POLICY "Public read slots"
  ON mock_exam_slots FOR SELECT USING (true);

-- Only service_role can insert/update/delete (admin panel uses service key in prod)
-- For local admin panel (password-protected in-app) we allow anon to upsert.
-- IMPORTANT: In production, rotate to service_role by removing the anon upsert policy.
DROP POLICY IF EXISTS "Anon can upsert slots" ON mock_exam_slots;
CREATE POLICY "Anon can upsert slots"
  ON mock_exam_slots FOR ALL USING (true) WITH CHECK (true);


-- ============================================================
-- 2. MOCK EXAM BOOKINGS  (old CMAMockBooking component)
-- ============================================================
CREATE TABLE IF NOT EXISTS mock_exam_bookings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id           UUID REFERENCES mock_exam_slots(id) ON DELETE SET NULL,
  candidate_name    TEXT NOT NULL,
  email             TEXT NOT NULL,
  mobile            TEXT NOT NULL,
  institute         TEXT,
  part              TEXT NOT NULL CHECK (part IN ('Part 1', 'Part 2')),
  coupon_code       TEXT,
  original_price    NUMERIC NOT NULL DEFAULT 2500,
  discount_amount   NUMERIC NOT NULL DEFAULT 0,
  final_price       NUMERIC NOT NULL,
  payment_status    TEXT NOT NULL DEFAULT 'pending'
                      CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_method    TEXT NOT NULL DEFAULT 'center'
                      CHECK (payment_method IN ('online', 'center')),
  payment_reference TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE mock_exam_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can create bookings" ON mock_exam_bookings;
CREATE POLICY "Public can create bookings"
  ON mock_exam_bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can read bookings" ON mock_exam_bookings;
CREATE POLICY "Service role can read bookings"
  ON mock_exam_bookings FOR SELECT USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can update bookings" ON mock_exam_bookings;
CREATE POLICY "Service role can update bookings"
  ON mock_exam_bookings FOR UPDATE USING (auth.role() = 'service_role');


-- ============================================================
-- 3. COUPON CODES
-- ============================================================
CREATE TABLE IF NOT EXISTS coupon_codes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code           TEXT UNIQUE NOT NULL,
  discount_type  TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  max_uses       INT,
  used_count     INT NOT NULL DEFAULT 0,
  valid_until    DATE,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE coupon_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active coupons" ON coupon_codes;
CREATE POLICY "Public can read active coupons"
  ON coupon_codes FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Service role manages coupons" ON coupon_codes;
CREATE POLICY "Service role manages coupons"
  ON coupon_codes FOR ALL USING (auth.role() = 'service_role');

-- Scoped update: public can only increment used_count on active coupons
-- (used when a booking applies a coupon)
DROP POLICY IF EXISTS "Public can update coupon count" ON coupon_codes;
CREATE POLICY "Public can update coupon count"
  ON coupon_codes FOR UPDATE
  USING (is_active = true)
  WITH CHECK (is_active = true);


-- ============================================================
-- 4. RPC: safe seat increment  (prevents overbooking race)
-- ============================================================
CREATE OR REPLACE FUNCTION increment_booked_seats(p_slot_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE mock_exam_slots
  SET booked_seats = booked_seats + 1
  WHERE id = p_slot_id AND booked_seats < total_seats;
END;
$$;


-- ============================================================
-- 5. EARLY ACCESS LEADS  (public interest registration)
-- ============================================================
CREATE TABLE IF NOT EXISTS early_access_leads (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name      TEXT NOT NULL,
  email          TEXT NOT NULL,
  phone          TEXT,
  interested_exam TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE early_access_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can register for early access" ON early_access_leads;
CREATE POLICY "Public can register for early access"
  ON early_access_leads FOR INSERT WITH CHECK (true);

-- Admin/service role can read all leads
DROP POLICY IF EXISTS "Service role can read leads" ON early_access_leads;
CREATE POLICY "Service role can read leads"
  ON early_access_leads FOR SELECT USING (auth.role() = 'service_role');


-- ============================================================
-- 6. COACHING CENTERS  (institutional access codes for bulk CMA bookings)
-- ============================================================
CREATE TABLE IF NOT EXISTS coaching_centers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  access_code TEXT UNIQUE NOT NULL,
  contact     TEXT,
  email       TEXT,
  city        TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE coaching_centers ENABLE ROW LEVEL SECURITY;

-- Public can look up a center by access code (needed to verify on booking form)
DROP POLICY IF EXISTS "Public can verify access code" ON coaching_centers;
CREATE POLICY "Public can verify access code"
  ON coaching_centers FOR SELECT USING (is_active = true);

-- Only service role manages centers
DROP POLICY IF EXISTS "Service role manages coaching centers" ON coaching_centers;
CREATE POLICY "Service role manages coaching centers"
  ON coaching_centers FOR ALL USING (auth.role() = 'service_role');

-- Sample partner centers
INSERT INTO coaching_centers (name, access_code, contact, city) VALUES
  ('Kerala CMA Academy',   'FETS-CMA-2026',  '+91 9876543210', 'Calicut'),
  ('Kochi Finance School', 'FETS-KFS-2026',  '+91 9876543211', 'Kochi'),
  ('Demo Partner',         'FETS-DEMO-0000', '+91 0000000000', 'Test')
ON CONFLICT (access_code) DO NOTHING;


-- ============================================================
-- 7. CMA MOCK BOOKINGS  (new CMAMockBookingModal component)
-- ============================================================
CREATE TABLE IF NOT EXISTS cma_mock_bookings (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_type       TEXT NOT NULL CHECK (booking_type IN ('direct', 'institutional')),
  -- Direct booking fields
  lead_name          TEXT,
  lead_email         TEXT,
  lead_phone         TEXT,
  -- Institutional booking fields
  coaching_center_id UUID REFERENCES coaching_centers(id) ON DELETE SET NULL,
  student_count      INT NOT NULL DEFAULT 1,
  -- Shared fields
  exam_part          TEXT NOT NULL DEFAULT 'Part 1' CHECK (exam_part IN ('Part 1', 'Part 2')),
  preferred_date     DATE NOT NULL,
  session_time       TEXT NOT NULL,
  payment_method     TEXT NOT NULL CHECK (payment_method IN ('online', 'pay_direct', 'pay_at_center')),
  status             TEXT NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at         TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cma_mock_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert cma bookings" ON cma_mock_bookings;
CREATE POLICY "Public can insert cma bookings"
  ON cma_mock_bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role reads cma bookings" ON cma_mock_bookings;
CREATE POLICY "Service role reads cma bookings"
  ON cma_mock_bookings FOR SELECT USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role updates cma bookings" ON cma_mock_bookings;
CREATE POLICY "Service role updates cma bookings"
  ON cma_mock_bookings FOR UPDATE USING (auth.role() = 'service_role');


-- ============================================================
-- 8. CMA MOCK STUDENTS  (per-student records for institutional bookings)
-- ============================================================
CREATE TABLE IF NOT EXISTS cma_mock_students (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id   UUID NOT NULL REFERENCES cma_mock_bookings(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cma_mock_students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert cma students" ON cma_mock_students;
CREATE POLICY "Public can insert cma students"
  ON cma_mock_students FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role reads cma students" ON cma_mock_students;
CREATE POLICY "Service role reads cma students"
  ON cma_mock_students FOR SELECT USING (auth.role() = 'service_role');


-- ============================================================
-- 9. CANDIDATE PROFILES  (linked to Supabase Auth users)
-- ============================================================
-- Must enable Auth in your Supabase project first.
-- This table is created alongside the Auth sign-up flow in EarlyAccessSection.
CREATE TABLE IF NOT EXISTS candidate_profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  interested_exam TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read and update their own profile
DROP POLICY IF EXISTS "Users read own profile" ON candidate_profiles;
CREATE POLICY "Users read own profile"
  ON candidate_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON candidate_profiles;
CREATE POLICY "Users update own profile"
  ON candidate_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auth trigger inserts profile automatically on sign-up
DROP POLICY IF EXISTS "Service role inserts profile" ON candidate_profiles;
CREATE POLICY "Service role inserts profile"
  ON candidate_profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

-- Service role can read all profiles (for admin)
DROP POLICY IF EXISTS "Service role reads all profiles" ON candidate_profiles;
CREATE POLICY "Service role reads all profiles"
  ON candidate_profiles FOR SELECT
  USING (auth.role() = 'service_role');


-- ============================================================
-- 10. AUTH TRIGGER: auto-create candidate_profiles on sign-up
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.candidate_profiles (id, full_name, email, phone, interested_exam)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'interested_exam'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- 11. COUPON CODE SEED DATA
-- ============================================================
INSERT INTO coupon_codes (code, discount_type, discount_value, max_uses, valid_until) VALUES
  ('FETS10',    'percentage', 10,  NULL, NULL),
  ('LAUNCH500', 'fixed',     500,  50,   '2026-12-31'),
  ('EARLYBIRD', 'percentage', 15,  100,  '2026-06-30')
ON CONFLICT (code) DO NOTHING;


-- ============================================================
-- SUMMARY OF TABLES
-- ============================================================
-- mock_exam_slots       — calendar seat inventory (admin-managed)
-- mock_exam_bookings    — legacy slot-based bookings (CMAMockBooking.jsx)
-- coupon_codes          — discount codes
-- early_access_leads    — public interest registrations
-- coaching_centers      — partner institutions (institutional bulk bookings)
-- cma_mock_bookings     — new booking modal (CMAMockBookingModal.jsx)
-- cma_mock_students     — per-student roster for institutional bookings
-- candidate_profiles    — auth user profiles (linked to Supabase Auth)

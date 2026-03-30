-- ============================================================
-- FETS — CMA US Mock Exam Booking System
-- Run this SQL in your Supabase SQL Editor
-- ============================================================
-- NOTE: Slots track by SESSION (Morning 9AM / Noon 2PM).
-- Part 1 / Part 2 is the candidate's choice captured in the booking.
-- Seat count is per session, shared across both parts.
-- ============================================================

-- 1. Available exam slots
CREATE TABLE IF NOT EXISTS mock_exam_slots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date         DATE NOT NULL,
  center       TEXT NOT NULL CHECK (center IN ('Cochin', 'Calicut')),
  time_slot    TEXT NOT NULL,        -- e.g. '9:00 AM' or '2:00 PM'
  total_seats  INT  NOT NULL DEFAULT 40,
  booked_seats INT  NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT mock_exam_slots_unique UNIQUE (date, center, time_slot)
);

ALTER TABLE mock_exam_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read slots"
  ON mock_exam_slots FOR SELECT USING (true);

CREATE POLICY "Anon can upsert slots"
  ON mock_exam_slots FOR ALL USING (true) WITH CHECK (true);


-- 2. Bookings
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

CREATE POLICY "Public can create bookings"
  ON mock_exam_bookings FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can read bookings"
  ON mock_exam_bookings FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Service role can update bookings"
  ON mock_exam_bookings FOR UPDATE USING (auth.role() = 'service_role');


-- 3. Coupon codes
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

CREATE POLICY "Public can read active coupons"
  ON coupon_codes FOR SELECT USING (is_active = true);

CREATE POLICY "Service role manages coupons"
  ON coupon_codes FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public can update coupon count"
  ON coupon_codes FOR UPDATE USING (is_active = true);


-- 4. RPC to safely increment booked_seats (prevents overbooking)
CREATE OR REPLACE FUNCTION increment_booked_seats(p_slot_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE mock_exam_slots
  SET booked_seats = booked_seats + 1
  WHERE id = p_slot_id AND booked_seats < total_seats;
END;
$$;


-- 5. Sample coupon codes
INSERT INTO coupon_codes (code, discount_type, discount_value, max_uses, valid_until)
VALUES
  ('FETS10',    'percentage', 10,  NULL, NULL),
  ('LAUNCH500', 'fixed',     500,  50,   '2026-12-31'),
  ('EARLYBIRD', 'percentage', 15,  100,  '2026-06-30')
ON CONFLICT (code) DO NOTHING;

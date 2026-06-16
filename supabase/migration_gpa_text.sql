-- ============================================================
-- NAthlete — GPA column type fix
--
-- Changes the gpa column from numeric to text so that values
-- like "4.0" are stored and returned exactly as entered
-- instead of being rounded to "4" by the database numeric type.
--
-- HOW TO RUN:
--   Supabase Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

ALTER TABLE athletes
  ALTER COLUMN gpa TYPE text USING gpa::text;

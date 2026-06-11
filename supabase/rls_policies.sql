-- ============================================================
-- NAthlete — Row Level Security (RLS) Policies
--
-- HOW TO RUN:
--   Supabase Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

-- 0. Link athlete profiles to authenticated users
ALTER TABLE athletes
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- 1. Enable RLS on the athletes table
--    Without this, ALL rows are accessible to anyone with the anon key.
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;

-- Drop old policies from the previous (auth-less) version of this file,
-- so this script can be re-run safely.
DROP POLICY IF EXISTS "athletes_insert_public" ON athletes;
DROP POLICY IF EXISTS "athletes_select_public" ON athletes;
DROP POLICY IF EXISTS "athletes_insert_own" ON athletes;
DROP POLICY IF EXISTS "athletes_update_own" ON athletes;
DROP POLICY IF EXISTS "athletes_delete_own" ON athletes;

-- 2. SELECT: anyone can view public athlete profiles (anon + authenticated)
CREATE POLICY "athletes_select_public"
  ON athletes
  FOR SELECT
  USING (true);

-- 3. INSERT: only authenticated users can create a profile, and only
--    for themselves
CREATE POLICY "athletes_insert_own"
  ON athletes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 4. UPDATE: users can only update their own profile
CREATE POLICY "athletes_update_own"
  ON athletes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. DELETE: users can only delete their own profile
CREATE POLICY "athletes_delete_own"
  ON athletes
  FOR DELETE
  USING (auth.uid() = user_id);

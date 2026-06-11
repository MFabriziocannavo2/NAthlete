-- ============================================================
-- NAthlete — Fix infinite recursion between athletes/follows RLS
--
-- The athletes_select policy checks the follows table, and the
-- follows_select/update/delete policies check the athletes table.
-- Postgres evaluates these policies recursively, causing
-- "infinite recursion detected in policy for relation athletes".
--
-- Fix: move the cross-table checks into SECURITY DEFINER helper
-- functions, which bypass RLS and break the recursive cycle.
--
-- HOW TO RUN:
--   Supabase Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

CREATE OR REPLACE FUNCTION is_athlete_owner(p_athlete_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM athletes WHERE id = p_athlete_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION has_accepted_follow(p_athlete_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM follows
    WHERE athlete_id = p_athlete_id
      AND follower_id = auth.uid()
      AND status = 'accepted'
  );
$$;

GRANT EXECUTE ON FUNCTION is_athlete_owner(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION has_accepted_follow(uuid) TO anon, authenticated;

-- Re-create athletes_select using the helper function instead of a
-- direct subquery on follows.
DROP POLICY IF EXISTS "athletes_select" ON athletes;
CREATE POLICY "athletes_select"
  ON athletes
  FOR SELECT
  USING (
    is_private = false
    OR auth.uid() = user_id
    OR has_accepted_follow(id)
  );

-- Re-create follows policies using the helper function instead of a
-- direct subquery on athletes.
DROP POLICY IF EXISTS "follows_select" ON follows;
CREATE POLICY "follows_select"
  ON follows
  FOR SELECT
  USING (
    follower_id = auth.uid()
    OR is_athlete_owner(athlete_id)
  );

DROP POLICY IF EXISTS "follows_update" ON follows;
CREATE POLICY "follows_update"
  ON follows
  FOR UPDATE
  USING (is_athlete_owner(athlete_id))
  WITH CHECK (is_athlete_owner(athlete_id));

DROP POLICY IF EXISTS "follows_delete" ON follows;
CREATE POLICY "follows_delete"
  ON follows
  FOR DELETE
  USING (
    follower_id = auth.uid()
    OR is_athlete_owner(athlete_id)
  );

-- ============================================================
-- NAthlete — Privacy & Follow Requests migration
--
-- Adds:
--   - athletes.is_private (public/private profile toggle)
--   - follows table (Instagram-style follow / follow-request system)
--   - RLS so private profiles are only fully visible to their
--     owner and accepted followers
--   - get_athlete_preview*() RPCs returning a small public-safe
--     preview (name, photo, sport, position, privacy flag) for
--     locked/private profiles, so the UI can render a
--     "this account is private" gate with a follow button.
--
-- HOW TO RUN:
--   Supabase Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

-- 1. Privacy flag -------------------------------------------------
ALTER TABLE athletes
  ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT false;

-- 2. Follows table --------------------------------------------------
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  athlete_id uuid NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, athlete_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "follows_select" ON follows;
DROP POLICY IF EXISTS "follows_insert" ON follows;
DROP POLICY IF EXISTS "follows_update" ON follows;
DROP POLICY IF EXISTS "follows_delete" ON follows;

-- A follower can see their own follow rows; an athlete owner can see
-- the follow rows that target their profile (e.g. follow requests).
CREATE POLICY "follows_select"
  ON follows
  FOR SELECT
  USING (
    follower_id = auth.uid()
    OR athlete_id IN (SELECT id FROM athletes WHERE user_id = auth.uid())
  );

-- Authenticated users can create a follow/request as themselves.
CREATE POLICY "follows_insert"
  ON follows
  FOR INSERT
  TO authenticated
  WITH CHECK (follower_id = auth.uid());

-- Only the targeted athlete's owner can update a follow row
-- (e.g. accept a pending follow request).
CREATE POLICY "follows_update"
  ON follows
  FOR UPDATE
  USING (athlete_id IN (SELECT id FROM athletes WHERE user_id = auth.uid()))
  WITH CHECK (athlete_id IN (SELECT id FROM athletes WHERE user_id = auth.uid()));

-- A follower can remove their own follow/request (unfollow / cancel),
-- and the athlete owner can remove a follower or decline a request.
CREATE POLICY "follows_delete"
  ON follows
  FOR DELETE
  USING (
    follower_id = auth.uid()
    OR athlete_id IN (SELECT id FROM athletes WHERE user_id = auth.uid())
  );

-- 3. Restrict full athlete rows to: public profiles, the owner,
--    and accepted followers of private profiles. -------------------
DROP POLICY IF EXISTS "athletes_select_public" ON athletes;

CREATE POLICY "athletes_select"
  ON athletes
  FOR SELECT
  USING (
    is_private = false
    OR auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM follows f
      WHERE f.athlete_id = athletes.id
        AND f.follower_id = auth.uid()
        AND f.status = 'accepted'
    )
  );

-- 4. Public-safe preview RPCs ---------------------------------------
-- These bypass RLS (SECURITY DEFINER) to return a minimal preview
-- for ANY athlete (including private ones), so the profile page can
-- show a "this account is private" gate with basic info + a
-- follow/request button instead of a blank "not found" page.
CREATE OR REPLACE FUNCTION get_athlete_preview(p_username text)
RETURNS TABLE (
  id uuid,
  username text,
  name text,
  profile_photo_url text,
  sport text,
  "position" text,
  is_private boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, username, name, profile_photo_url, sport, "position", is_private
  FROM athletes
  WHERE username = p_username;
$$;

CREATE OR REPLACE FUNCTION get_athlete_preview_by_id(p_id uuid)
RETURNS TABLE (
  id uuid,
  username text,
  name text,
  profile_photo_url text,
  sport text,
  "position" text,
  is_private boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, username, name, profile_photo_url, sport, "position", is_private
  FROM athletes
  WHERE id = p_id;
$$;

GRANT EXECUTE ON FUNCTION get_athlete_preview(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_athlete_preview_by_id(uuid) TO anon, authenticated;

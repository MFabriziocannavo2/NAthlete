-- ============================================================
-- NAthlete — Security hardening v6
--
-- Fixes:
--   1. "follows" INSERT policy let any authenticated user create
--      a follow row with status = 'accepted' for a PRIVATE profile
--      directly (bypassing the pending-approval flow), which then
--      satisfied has_accepted_follow() and unlocked the private
--      profile's full row, career timeline, and verified documents
--      via athletes_select / can_view_athlete.
--   2. Storage buckets had no server-side file size / mime type
--      limits — only enforced client-side in lib/documents.ts and
--      AvatarUpload.tsx, which can be bypassed by calling the
--      Supabase Storage API directly.
--
-- HOW TO RUN:
--   Supabase Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

-- 1. Helper: is this athlete's profile private? -----------------------------

CREATE OR REPLACE FUNCTION is_athlete_private(p_athlete_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT is_private FROM athletes WHERE id = p_athlete_id;
$$;

GRANT EXECUTE ON FUNCTION is_athlete_private(uuid) TO anon, authenticated;

-- 2. Tighten follows INSERT: a user may only self-create an
--    'accepted' follow for a PUBLIC profile (instant follow).
--    Follows on private profiles must start as 'pending' and can
--    only become 'accepted' via follows_update (owner-only,
--    already enforced by is_athlete_owner). -------------------------

DROP POLICY IF EXISTS "follows_insert" ON follows;

CREATE POLICY "follows_insert"
  ON follows
  FOR INSERT
  TO authenticated
  WITH CHECK (
    follower_id = auth.uid()
    AND (
      status = 'pending'
      OR (status = 'accepted' AND NOT is_athlete_private(athlete_id))
    )
  );

-- 3. Server-side limits on storage buckets, mirroring the
--    client-side checks in lib/documents.ts / AvatarUpload.tsx. ----------

UPDATE storage.buckets
SET file_size_limit = 10485760, -- 10MB
    allowed_mime_types = ARRAY[
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
WHERE id = 'documents';

UPDATE storage.buckets
SET file_size_limit = 5242880, -- 5MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'avatars';

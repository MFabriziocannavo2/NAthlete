-- ============================================================
-- NAthlete — Profile v4 migration
--
-- Adds:
--   - recruiting_status to athletes (Recruiting Snapshot)
--   - timeline_entries table (Career Timeline)
--   - verified_documents table + private "documents" storage
--     bucket (Verified Documents)
--
-- HOW TO RUN:
--   Supabase Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

-- 1. Recruiting Snapshot ----------------------------------------------------

ALTER TABLE athletes
  ADD COLUMN IF NOT EXISTS recruiting_status text;

-- 2. Shared visibility helper -----------------------------------------------
-- Mirrors the visibility rules of athletes_select: a profile's related
-- records (timeline entries, documents) are visible to anyone if the
-- profile is public, to the owner always, and to accepted followers of
-- private profiles.

CREATE OR REPLACE FUNCTION can_view_athlete(p_athlete_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM athletes
    WHERE id = p_athlete_id
      AND (
        is_private = false
        OR user_id = auth.uid()
        OR has_accepted_follow(p_athlete_id)
      )
  );
$$;

GRANT EXECUTE ON FUNCTION can_view_athlete(uuid) TO anon, authenticated;

-- 3. Career Timeline ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS timeline_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  entry_date text,
  category text NOT NULL DEFAULT 'Athletic Achievement',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE timeline_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "timeline_select" ON timeline_entries;
DROP POLICY IF EXISTS "timeline_insert" ON timeline_entries;
DROP POLICY IF EXISTS "timeline_update" ON timeline_entries;
DROP POLICY IF EXISTS "timeline_delete" ON timeline_entries;

CREATE POLICY "timeline_select"
  ON timeline_entries
  FOR SELECT
  USING (can_view_athlete(athlete_id));

CREATE POLICY "timeline_insert"
  ON timeline_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (is_athlete_owner(athlete_id));

CREATE POLICY "timeline_update"
  ON timeline_entries
  FOR UPDATE
  USING (is_athlete_owner(athlete_id))
  WITH CHECK (is_athlete_owner(athlete_id));

CREATE POLICY "timeline_delete"
  ON timeline_entries
  FOR DELETE
  USING (is_athlete_owner(athlete_id));

-- 4. Verified Documents -------------------------------------------------------

CREATE TABLE IF NOT EXISTS verified_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE verified_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "documents_select" ON verified_documents;
DROP POLICY IF EXISTS "documents_insert" ON verified_documents;
DROP POLICY IF EXISTS "documents_update" ON verified_documents;
DROP POLICY IF EXISTS "documents_delete" ON verified_documents;

CREATE POLICY "documents_select"
  ON verified_documents
  FOR SELECT
  USING (can_view_athlete(athlete_id));

CREATE POLICY "documents_insert"
  ON verified_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (is_athlete_owner(athlete_id));

CREATE POLICY "documents_update"
  ON verified_documents
  FOR UPDATE
  USING (is_athlete_owner(athlete_id))
  WITH CHECK (is_athlete_owner(athlete_id));

CREATE POLICY "documents_delete"
  ON verified_documents
  FOR DELETE
  USING (is_athlete_owner(athlete_id));

-- 5. Documents storage bucket --------------------------------------------------
-- Private bucket: files are served via short-lived signed URLs, gated by
-- the same visibility rules as the rest of the profile.

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "documents_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "documents_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "documents_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "documents_storage_delete" ON storage.objects;

CREATE POLICY "documents_storage_select"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'documents'
    AND can_view_athlete(((storage.foldername(name))[1])::uuid)
  );

CREATE POLICY "documents_storage_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND is_athlete_owner(((storage.foldername(name))[1])::uuid)
  );

CREATE POLICY "documents_storage_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND is_athlete_owner(((storage.foldername(name))[1])::uuid)
  );

CREATE POLICY "documents_storage_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND is_athlete_owner(((storage.foldername(name))[1])::uuid)
  );

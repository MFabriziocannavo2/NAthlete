-- ============================================================
-- NAthlete — Profile v3 migration
--
-- Adds the additional fields needed for the redesigned,
-- recruiting-focused athlete profile:
--   - structured achievements (achievements_json)
--   - academic awards
--   - physiological / performance metrics
--   - team & roster info
--   - contact + social links
--
-- HOW TO RUN:
--   Supabase Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

ALTER TABLE athletes
  ADD COLUMN IF NOT EXISTS achievements_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS academic_awards text,
  ADD COLUMN IF NOT EXISTS vertical_jump text,
  ADD COLUMN IF NOT EXISTS sprint_time text,
  ADD COLUMN IF NOT EXISTS vo2_max text,
  ADD COLUMN IF NOT EXISTS dominant_foot text,
  ADD COLUMN IF NOT EXISTS body_fat text,
  ADD COLUMN IF NOT EXISTS resting_hr text,
  ADD COLUMN IF NOT EXISTS preferred_positions text,
  ADD COLUMN IF NOT EXISTS jersey_number text,
  ADD COLUMN IF NOT EXISTS current_team text,
  ADD COLUMN IF NOT EXISTS team_type text,
  ADD COLUMN IF NOT EXISTS agent_contact text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS twitter_url text,
  ADD COLUMN IF NOT EXISTS linkedin_url text;

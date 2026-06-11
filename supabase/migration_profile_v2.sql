-- ============================================================
-- NAthlete — Profile v2 migration
-- Adds: unique usernames (friendly public URLs), profile photo,
-- athletic achievements, and media gallery.
--
-- HOW TO RUN:
--   Supabase Dashboard → SQL Editor → New query → paste → Run
--
-- This migration is additive and backwards compatible:
-- existing profiles keep working via /athlete/[id] until they
-- set a username, after which /[username] becomes available too.
-- ============================================================

ALTER TABLE athletes
  ADD COLUMN IF NOT EXISTS username text UNIQUE,
  ADD COLUMN IF NOT EXISTS profile_photo_url text,
  ADD COLUMN IF NOT EXISTS achievements text,
  ADD COLUMN IF NOT EXISTS media_gallery text;

-- Enforce a simple, URL-safe username format (lowercase letters,
-- numbers, hyphens and underscores, 3-30 chars). NULL is allowed
-- so existing rows without a username remain valid.
ALTER TABLE athletes
  DROP CONSTRAINT IF EXISTS athletes_username_format;

ALTER TABLE athletes
  ADD CONSTRAINT athletes_username_format
  CHECK (username IS NULL OR username ~ '^[a-z0-9_-]{3,30}$');

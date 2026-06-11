-- Profile sharing v5: prevent reserved usernames from being claimed.
-- Mirrors RESERVED_USERNAMES in lib/profile.ts so reserved routes
-- (login, signup, discover, etc.) never collide with /[username].

ALTER TABLE athletes
  DROP CONSTRAINT IF EXISTS athletes_username_not_reserved;

ALTER TABLE athletes
  ADD CONSTRAINT athletes_username_not_reserved
  CHECK (
    username IS NULL OR username NOT IN (
      'login',
      'signup',
      'discover',
      'profile',
      'admin',
      'api',
      'settings',
      'athletes',
      'athlete',
      'my-profile',
      'create-profile',
      'edit-profile',
      'logout'
    )
  );

# NAthlete — Production Deployment Checklist (Vercel)

## 1. Environment variables

The app uses 3 env vars, all read via `process.env`. Set the first two as
**required** in Vercel (Project Settings → Environment Variables, for both
Production and Preview):

| Variable | Required | Current value (local) | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | `https://wezkvdybzyfemrwlupxb.supabase.co` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | `sb_publishable_...` | Supabase anon/publishable key |
| `NEXT_PUBLIC_SITE_URL` | No (optional) | not set | Only set this if you want to **force** a specific canonical domain (e.g. `https://nathlete.com`) for share links / OG metadata. Leave unset and the app will automatically use whatever domain serves the request (Vercel preview URL, custom domain, etc.) |

`.env.local` is correctly gitignored (`.env*` in `.gitignore`) — credentials
are not committed. ✅

## 2. Localhost references — audit result

- No hardcoded `localhost` URLs exist in app code.
- `lib/site.ts` only checks for `localhost`/`127.0.0.1` to decide `http` vs
  `https` for the protocol — this is correct and required for local dev, and
  has no effect in production (any other host gets `https`).
- `README.md` mentions `http://localhost:3000` only in the standard
  "Getting Started" dev instructions — no change needed.

✅ No action required here.

## 3. Production URLs / share links

`lib/site.ts` (`getSiteUrl` / `getServerSiteUrl`) derives the canonical
origin from the browser origin (client) or the request's `Host` header
(server). This means:

- Locally: links read `http://localhost:3000/<username>`
- On Vercel preview/production: links automatically read
  `https://<your-vercel-domain>/<username>` or `https://nathlete.com/<username>`
  once a custom domain is attached — **no code change needed**.

If you want share links/OG metadata to always show `nathlete.com` even
before the custom domain is fully cut over, set
`NEXT_PUBLIC_SITE_URL=https://nathlete.com`. Otherwise leave it unset.

## 4. Routes — build verification

`npx next build` completes successfully. All routes compile:

```
○ /                          (static)
○ /_not-found                (static)
ƒ /[username]                (dynamic — SSR, generates metadata)
ƒ /[username]/opengraph-image (dynamic — edge, OG image)
ƒ /athlete/[id]               (dynamic — legacy profile route)
○ /athletes                   (static — Discover)
○ /create-profile             (static)
○ /edit-profile                (static)
○ /login                       (static)
○ /my-profile                  (static)
○ /signup                      (static)
```

✅ No build errors, no TypeScript errors, ESLint clean.

## 5. Username routing — collision check

Reserved usernames (`lib/profile.ts` `RESERVED_USERNAMES`) cover every
existing route folder under `app/`:
`login, signup, athletes, athlete, my-profile, create-profile, edit-profile`,
plus future-proofing entries (`discover, profile, admin, api, settings,
logout`). Next.js resolves static routes before the `/[username]` catch-all,
so there's no runtime collision — the reserved list exists purely to stop
users from *claiming* one of these as their `username`.

`supabase/migration_profile_v5.sql` adds a matching DB-level CHECK
constraint so reserved usernames can never be saved even if the app-level
check is bypassed.

⚠️ **Confirm `migration_profile_v5.sql` has been run against the production
Supabase project** (it adds `athletes_username_not_reserved`). If not yet
run, run it via Supabase Dashboard → SQL Editor before launch.

## 6. Supabase — production configuration checklist

- [ ] All migrations applied to the **production** Supabase project, in order:
  - `rls_policies.sql`
  - `migration_avatar_storage.sql`
  - `migration_profile_v2.sql`
  - `migration_profile_v3.sql`
  - `migration_privacy_follows.sql`
  - `migration_fix_recursion.sql`
  - `migration_profile_v4.sql`
  - `migration_profile_v5.sql` ⚠️ (newest — added this session)
- [ ] RLS is enabled on `athletes`, `follows`, `timeline_entries`,
      `verified_documents` (all confirmed in migration files ✅)
- [ ] Storage buckets exist: `avatars` (public), `documents` (private)
- [ ] **Auth → URL Configuration** in Supabase Dashboard: update **Site URL**
      and **Redirect URLs** from the default `http://localhost:3000` to your
      production domain (e.g. `https://nathlete.com`). This affects the
      links sent in signup confirmation emails (`supabase.auth.signUp` in
      `app/signup/page.tsx` doesn't pass an explicit `emailRedirectTo`, so it
      relies on this dashboard setting).
- [ ] Confirm `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` in
      Vercel point at the **production** Supabase project (not a dev/test
      project), if they differ.

## 7. Vercel deployment steps

1. Push this repo to GitHub (if not already) and import it in Vercel.
2. Framework preset: Next.js (auto-detected).
3. Add the env vars from section 1 (Production + Preview environments).
4. Deploy.
5. Attach custom domain (e.g. `nathlete.com`) under Project Settings →
   Domains, and update DNS records as instructed by Vercel.
6. Once the domain is live, update Supabase Auth Site URL/Redirect URLs
   (section 6) to match.

## 8. Known non-blockers

- `app/[username]/opengraph-image.tsx` runs on the Edge runtime, which
  disables static generation for that route (expected, shown as a build
  warning) — this is normal for dynamic OG images and not an issue.
- `app/athlete/[id]` remains as a legacy fallback route for athletes without
  a username yet (`profilePath()` in `lib/profile.ts`); both routes are
  fully functional.

## 9. Pre-launch blockers summary

1. ⚠️ Run `supabase/migration_profile_v5.sql` on production DB if not done.
2. ⚠️ Set `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel.
3. ⚠️ Update Supabase Auth Site URL/Redirect URLs to the production domain.
4. Optional: set `NEXT_PUBLIC_SITE_URL` if you want to force `nathlete.com`
   branding before DNS cutover is complete.

Everything else (routing, build, OG/SEO, RLS policies) is verified working.

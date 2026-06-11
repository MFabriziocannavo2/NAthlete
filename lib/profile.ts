import type { Athlete } from "@/lib/types"

/**
 * Returns the canonical public profile path for an athlete:
 * a friendly /[username] URL when available, falling back to
 * the legacy /athlete/[id] route for profiles without one yet.
 */
export function profilePath(athlete: Pick<Athlete, "id" | "username">): string {
  return athlete.username ? `/${athlete.username}` : `/athlete/${athlete.id}`
}

/**
 * Computes age in years from a date of birth string.
 * Returns null if the date is missing or invalid.
 */
export function getAge(dateOfBirth?: string | null): number | null {
  if (!dateOfBirth) return null

  const dob = new Date(dateOfBirth)
  if (Number.isNaN(dob.getTime())) return null

  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate())

  if (!hasHadBirthdayThisYear) age -= 1

  return age
}

/**
 * Splits a multiline textarea value into a list of trimmed,
 * non-empty lines.
 */
export function parseLines(value?: string | null): string[] {
  if (!value) return []
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

/** Username format: lowercase letters, numbers, hyphens, underscores, 3-30 chars. */
export const USERNAME_PATTERN = /^[a-z0-9_-]{3,30}$/

/**
 * Usernames that collide with app routes or are otherwise reserved
 * and must not be claimable as athlete profile URLs.
 */
export const RESERVED_USERNAMES = [
  "login",
  "signup",
  "discover",
  "profile",
  "admin",
  "api",
  "settings",
  "athletes",
  "athlete",
  "my-profile",
  "create-profile",
  "edit-profile",
  "logout",
] as const

/** Returns true if the username is reserved and cannot be claimed. */
export function isReservedUsername(username: string): boolean {
  return (RESERVED_USERNAMES as readonly string[]).includes(username.toLowerCase())
}

/**
 * Validates a username for format and reserved-word collisions.
 * Returns an error message, or null if the username is valid (or empty).
 */
export function validateUsername(username: string): string | null {
  if (!username) return null

  if (!USERNAME_PATTERN.test(username)) {
    return "Username must be 3-30 characters and can only contain lowercase letters, numbers, hyphens and underscores."
  }

  if (isReservedUsername(username)) {
    return "That username is reserved. Please choose another one."
  }

  return null
}

/**
 * Replaces empty-string values with null so optional numeric/text
 * columns (height, gpa, vo2_max, etc.) don't fail with
 * "invalid input syntax for type numeric" when left blank.
 */
export function sanitizeForDb<T extends Record<string, unknown>>(values: T): T {
  const result = { ...values }
  for (const key of Object.keys(result)) {
    const value = result[key]
    if (typeof value === "string" && value.trim() === "") {
      ;(result as Record<string, unknown>)[key] = null
    }
  }
  return result
}

import { profilePath } from "@/lib/profile"
import type { Athlete } from "@/lib/types"

const FALLBACK_SITE_URL = "https://nathlete.app"

/**
 * Canonical site origin for client-side use (e.g. building a shareable
 * profile link). Uses the actual browser origin so links work in every
 * environment (localhost during development, the real domain in prod),
 * unless NEXT_PUBLIC_SITE_URL is set to force a specific domain.
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
  }
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  return FALLBACK_SITE_URL
}

/** Builds the canonical, shareable profile URL for an athlete (client-side). */
export function getProfileUrl(athlete: Pick<Athlete, "id" | "username">): string {
  return `${getSiteUrl()}${profilePath(athlete)}`
}

/**
 * Server-side equivalent of getSiteUrl(): derives the origin from the
 * incoming request's Host header so generated metadata/OG images point
 * at whichever domain is actually serving the app.
 */
export async function getServerSiteUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
  }

  const { headers } = await import("next/headers")
  const requestHeaders = await headers()
  const host = requestHeaders.get("host")

  if (!host) return FALLBACK_SITE_URL

  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https"
  return `${protocol}://${host}`
}

/** Server-side equivalent of getProfileUrl(). */
export async function getServerProfileUrl(
  athlete: Pick<Athlete, "id" | "username">
): Promise<string> {
  return `${await getServerSiteUrl()}${profilePath(athlete)}`
}

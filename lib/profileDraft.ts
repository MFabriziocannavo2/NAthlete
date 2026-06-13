import type { AthleteFormValues } from "@/lib/types"

const DRAFT_KEY_PREFIX = "nathlete:create-profile-draft:"

function draftKey(userId: string): string {
  return `${DRAFT_KEY_PREFIX}${userId}`
}

/** Persists in-progress "Create Profile" form data so the athlete can finish later. */
export function saveProfileDraft(userId: string, values: AthleteFormValues): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(draftKey(userId), JSON.stringify(values))
  } catch {
    // localStorage may be unavailable (e.g. private browsing) — fail silently
  }
}

export function loadProfileDraft(userId: string): AthleteFormValues | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(draftKey(userId))
    if (!raw) return null
    return JSON.parse(raw) as AthleteFormValues
  } catch {
    return null
  }
}

export function clearProfileDraft(userId: string): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(draftKey(userId))
  } catch {
    // ignore
  }
}

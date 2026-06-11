import { supabase } from "@/lib/supabase"
import type { Follow, FollowStatus } from "@/lib/types"

/** Returns the current user's follow relationship to an athlete, or null if none exists. */
export async function getFollow(
  athleteId: string,
  userId: string
): Promise<Follow | null> {
  const { data, error } = await supabase
    .from("follows")
    .select("*")
    .eq("athlete_id", athleteId)
    .eq("follower_id", userId)
    .maybeSingle()

  if (error) {
    console.error("Failed to fetch follow status:", error.message)
    return null
  }

  return data
}

/**
 * Creates a follow relationship. Public profiles are followed
 * immediately ("accepted"); private profiles require a request
 * ("pending") that the owner must approve.
 */
export async function createFollow(
  athleteId: string,
  userId: string,
  status: FollowStatus
): Promise<Follow | null> {
  const { data, error } = await supabase
    .from("follows")
    .insert([{ athlete_id: athleteId, follower_id: userId, status }])
    .select()
    .single()

  if (error) {
    console.error("Failed to create follow:", error.message)
    return null
  }

  return data
}

/** Removes a follow relationship (unfollow, cancel request, or remove follower). */
export async function removeFollow(followId: string): Promise<boolean> {
  const { error } = await supabase.from("follows").delete().eq("id", followId)

  if (error) {
    console.error("Failed to remove follow:", error.message)
    return false
  }

  return true
}

/** Accepts a pending follow request (owner-only, enforced by RLS). */
export async function acceptFollow(followId: string): Promise<boolean> {
  const { error } = await supabase
    .from("follows")
    .update({ status: "accepted" })
    .eq("id", followId)

  if (error) {
    console.error("Failed to accept follow request:", error.message)
    return false
  }

  return true
}

/** Counts accepted followers for an athlete. */
export async function countFollowers(athleteId: string): Promise<number> {
  const { count, error } = await supabase
    .from("follows")
    .select("id", { count: "exact", head: true })
    .eq("athlete_id", athleteId)
    .eq("status", "accepted")

  if (error) {
    console.error("Failed to count followers:", error.message)
    return 0
  }

  return count ?? 0
}

/** Lists pending follow requests for an athlete (owner-only, enforced by RLS). */
export async function listPendingRequests(athleteId: string): Promise<Follow[]> {
  const { data, error } = await supabase
    .from("follows")
    .select("*")
    .eq("athlete_id", athleteId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to list follow requests:", error.message)
    return []
  }

  return data ?? []
}

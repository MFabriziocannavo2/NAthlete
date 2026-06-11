import { supabase } from "@/lib/supabase"
import { withSessionRetry } from "@/lib/supabaseRetry"
import type { TimelineEntry } from "@/lib/types"

/** Lists an athlete's career timeline entries, most recent first. */
export async function listTimelineEntries(
  athleteId: string
): Promise<{ data: TimelineEntry[]; error: boolean }> {
  const { data, error } = await withSessionRetry(() =>
    supabase
      .from("timeline_entries")
      .select("*")
      .eq("athlete_id", athleteId)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false })
  )

  if (error) {
    console.error("Failed to list timeline entries:", error.message)
    return { data: [], error: true }
  }

  return { data: data ?? [], error: false }
}

export async function createTimelineEntry(
  entry: Omit<TimelineEntry, "id" | "created_at">
): Promise<TimelineEntry | null> {
  const { data, error } = await supabase
    .from("timeline_entries")
    .insert([entry])
    .select()
    .single()

  if (error) {
    console.error("Failed to create timeline entry:", error.message)
    return null
  }

  return data
}

export async function updateTimelineEntry(
  id: string,
  patch: Partial<Pick<TimelineEntry, "title" | "description" | "entry_date" | "category">>
): Promise<boolean> {
  const { error } = await supabase.from("timeline_entries").update(patch).eq("id", id)

  if (error) {
    console.error("Failed to update timeline entry:", error.message)
    return false
  }

  return true
}

export async function deleteTimelineEntry(id: string): Promise<boolean> {
  const { error } = await supabase.from("timeline_entries").delete().eq("id", id)

  if (error) {
    console.error("Failed to delete timeline entry:", error.message)
    return false
  }

  return true
}

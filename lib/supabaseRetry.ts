import { supabase } from "@/lib/supabase"

/**
 * Runs a Supabase query and retries it once after refreshing the session
 * if the access token had expired. Handles the case where a page is
 * opened directly (e.g. via a shared profile link) before the client's
 * auto-refresh has had a chance to run.
 */
export async function withSessionRetry<T>(
  query: () => PromiseLike<{ data: T; error: { message: string } | null }>
): Promise<{ data: T; error: { message: string } | null }> {
  let result = await query()

  if (result.error?.message?.includes("JWT expired")) {
    await supabase.auth.refreshSession()
    result = await query()
  }

  return result
}

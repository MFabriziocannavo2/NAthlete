import { supabase } from "@/lib/supabase"
import { getSiteUrl } from "@/lib/site"

/** Resends the signup confirmation email for the given address. */
export async function resendConfirmationEmail(email: string): Promise<{ error?: string }> {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${getSiteUrl()}/login` },
  })

  if (error) return { error: error.message }
  return {}
}

/**
 * Maps a raw Supabase login error message to a clearer, user-facing
 * message. `unconfirmed` is true when the account exists but the email
 * has not been verified yet, so the UI can offer to resend it.
 */
export function getLoginErrorMessage(message: string): { message: string; unconfirmed: boolean } {
  const normalized = message.toLowerCase()

  if (normalized.includes("email not confirmed")) {
    return {
      message:
        "Please verify your email before logging in. Check your inbox for the confirmation link, or resend it below.",
      unconfirmed: true,
    }
  }

  if (normalized.includes("invalid login credentials")) {
    return {
      message:
        "We couldn't find an account with that email and password. Double-check your details, or sign up if you don't have an account yet.",
      unconfirmed: false,
    }
  }

  return { message, unconfirmed: false }
}

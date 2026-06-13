import { supabase } from "@/lib/supabase"

const BUCKET = "avatars"
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

/** Validates an avatar file before upload. Returns an error message, or null if valid. */
export function validateAvatarFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return "Image is too large. Maximum size is 5MB."
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Unsupported image type. Please upload a JPEG, PNG, WEBP, or GIF."
  }
  return null
}

/** Uploads a new avatar image and saves its public URL on the athlete's profile. */
export async function uploadAvatar(
  userId: string,
  athleteId: string,
  file: File
): Promise<{ url?: string; error?: string }> {
  const validationError = validateAvatarFile(file)
  if (validationError) return { error: validationError }

  const ext = file.name.split(".").pop()
  const path = `${userId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true })

  if (uploadError) return { error: uploadError.message }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)

  const { error: updateError } = await supabase
    .from("athletes")
    .update({ profile_photo_url: data.publicUrl })
    .eq("id", athleteId)

  if (updateError) return { error: updateError.message }

  return { url: data.publicUrl }
}

/** Removes the athlete's profile photo (clears the field, keeps storage history). */
export async function removeAvatar(athleteId: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("athletes")
    .update({ profile_photo_url: null })
    .eq("id", athleteId)

  if (error) return { error: error.message }

  return {}
}

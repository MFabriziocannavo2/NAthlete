import { supabase } from "@/lib/supabase"

const BUCKET = "avatars"
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
export const ACCEPTED_FORMATS_LABEL = "JPG, JPEG, PNG, or WEBP"

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

/** Validates an avatar file before upload. Returns an error message, or null if valid. */
export function validateAvatarFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Unsupported image type. Please upload a ${ACCEPTED_FORMATS_LABEL} image.`
  }
  if (file.size > MAX_FILE_SIZE) {
    return "This image is too large. Maximum size is 10MB."
  }
  return null
}

/** Uploads an avatar image (or cropped Blob) to storage and returns its public URL. */
export async function uploadAvatarFile(
  userId: string,
  file: File | Blob
): Promise<{ url?: string; error?: string }> {
  if (file.size > MAX_FILE_SIZE) {
    return { error: "This image is too large. Maximum size is 10MB." }
  }

  const ext = EXTENSION_BY_TYPE[file.type] ?? "jpg"
  const path = `${userId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" })

  if (uploadError) return { error: uploadError.message }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { url: data.publicUrl }
}

/** Uploads a new avatar image (or cropped Blob) and saves its public URL on the athlete's profile. */
export async function uploadAvatar(
  userId: string,
  athleteId: string,
  file: File | Blob
): Promise<{ url?: string; error?: string }> {
  const { url, error } = await uploadAvatarFile(userId, file)
  if (error) return { error }

  const { error: updateError } = await supabase
    .from("athletes")
    .update({ profile_photo_url: url })
    .eq("id", athleteId)

  if (updateError) return { error: updateError.message }

  return { url }
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

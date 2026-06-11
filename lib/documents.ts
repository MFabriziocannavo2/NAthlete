import { supabase } from "@/lib/supabase"
import { withSessionRetry } from "@/lib/supabaseRetry"
import type { VerifiedDocument } from "@/lib/types"

const BUCKET = "documents"
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

/** Lists an athlete's verified documents, most recently uploaded first. */
export async function listDocuments(
  athleteId: string
): Promise<{ data: VerifiedDocument[]; error: boolean }> {
  const { data, error } = await withSessionRetry(() =>
    supabase
      .from("verified_documents")
      .select("*")
      .eq("athlete_id", athleteId)
      .order("uploaded_at", { ascending: false })
  )

  if (error) {
    console.error("Failed to list documents:", error.message)
    return { data: [], error: true }
  }

  return { data: data ?? [], error: false }
}

/** Validates a file before upload. Returns an error message, or null if valid. */
export function validateDocumentFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return "File is too large. Maximum size is 10MB."
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Unsupported file type. Please upload a PDF, Word document, or image."
  }
  return null
}

/** Uploads a document to storage and records its metadata. */
export async function uploadDocument(
  athleteId: string,
  documentType: string,
  file: File
): Promise<{ document?: VerifiedDocument; error?: string }> {
  const validationError = validateDocumentFile(file)
  if (validationError) return { error: validationError }

  const path = `${athleteId}/${Date.now()}_${file.name}`

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file)

  if (uploadError) return { error: uploadError.message }

  const { data, error } = await supabase
    .from("verified_documents")
    .insert([
      {
        athlete_id: athleteId,
        document_type: documentType,
        file_name: file.name,
        file_path: path,
      },
    ])
    .select()
    .single()

  if (error) {
    await supabase.storage.from(BUCKET).remove([path])
    return { error: error.message }
  }

  return { document: data }
}

/** Returns a short-lived signed URL for viewing/downloading a document. */
export async function getDocumentUrl(filePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, 60)

  if (error) {
    console.error("Failed to create signed URL:", error.message)
    return null
  }

  return data.signedUrl
}

/** Deletes a document's file and metadata. */
export async function deleteDocument(doc: VerifiedDocument): Promise<boolean> {
  const { error: storageError } = await supabase.storage.from(BUCKET).remove([doc.file_path])

  if (storageError) {
    console.error("Failed to delete document file:", storageError.message)
    return false
  }

  const { error } = await supabase.from("verified_documents").delete().eq("id", doc.id)

  if (error) {
    console.error("Failed to delete document record:", error.message)
    return false
  }

  return true
}

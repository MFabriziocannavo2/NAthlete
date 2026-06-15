import { useState } from "react"
import { ACCEPTED_FORMATS_LABEL, ALLOWED_TYPES, MAX_FILE_SIZE, validateAvatarFile } from "@/lib/avatar"
import { compressImageFile } from "@/lib/imageProcessing"

export type AvatarUploadStatus = "idle" | "cropping" | "uploading" | "success" | "error"

/**
 * Shared file-select → compress → crop → upload flow for profile photos.
 * `upload` performs the actual storage upload of the final cropped blob.
 */
export function useAvatarUpload(upload: (blob: Blob) => Promise<{ url?: string; error?: string }>) {
  const [status, setStatus] = useState<AvatarUploadStatus>("idle")
  const [message, setMessage] = useState<string | null>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)

  const handleFileSelect = async (file: File) => {
    setMessage(null)

    if (!ALLOWED_TYPES.includes(file.type)) {
      setStatus("error")
      setMessage(`Unsupported image type. Please upload a ${ACCEPTED_FORMATS_LABEL} image.`)
      return
    }

    let workingFile = file
    if (workingFile.size > MAX_FILE_SIZE) {
      workingFile = await compressImageFile(workingFile, MAX_FILE_SIZE)
    }

    const validationError = validateAvatarFile(workingFile)
    if (validationError) {
      setStatus("error")
      setMessage(validationError)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setCropSrc(reader.result as string)
      setStatus("cropping")
    }
    reader.readAsDataURL(workingFile)
  }

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    setStatus("idle")
  }

  const handleCropSave = async (blob: Blob) => {
    setCropSrc(null)
    setStatus("uploading")
    setMessage("Uploading photo…")

    let finalBlob: Blob = blob
    if (finalBlob.size > MAX_FILE_SIZE) {
      const file = new File([finalBlob], "avatar.jpg", { type: finalBlob.type })
      finalBlob = await compressImageFile(file, MAX_FILE_SIZE)
    }

    if (finalBlob.size > MAX_FILE_SIZE) {
      setStatus("error")
      setMessage("This image is too large. Maximum size is 10MB.")
      return null
    }

    const { url, error } = await upload(finalBlob)

    if (error) {
      setStatus("error")
      setMessage(error)
      return null
    }

    setStatus("success")
    setMessage("Photo uploaded successfully.")
    return url ?? null
  }

  return {
    status,
    message,
    cropSrc,
    handleFileSelect,
    handleCropCancel,
    handleCropSave,
  }
}

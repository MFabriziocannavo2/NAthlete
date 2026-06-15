"use client"

import { useRef } from "react"
import { CameraIcon, TrashIcon } from "@heroicons/react/24/outline"
import { useAuth } from "@/lib/AuthContext"
import { ACCEPTED_FORMATS_LABEL, uploadAvatarFile } from "@/lib/avatar"
import { useAvatarUpload } from "@/lib/useAvatarUpload"
import ImageCropModal from "@/components/ImageCropModal"

export default function AvatarUpload({
  name,
  photoUrl,
  onChange,
}: {
  name: string
  photoUrl: string
  onChange: (url: string) => void
}) {
  const { user } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)

  const { status, message, cropSrc, handleFileSelect, handleCropCancel, handleCropSave } =
    useAvatarUpload((blob) => {
      if (!user) return Promise.resolve({ error: "You must be signed in to upload a photo." })
      return uploadAvatarFile(user.id, blob)
    })

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    handleFileSelect(file)
  }

  const onCropSave = async (blob: Blob) => {
    const url = await handleCropSave(blob)
    if (url) onChange(url)
  }

  const uploading = status === "uploading"

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24 sm:w-28 sm:h-28">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="relative group w-full h-full rounded-full overflow-hidden border-2 border-white/10 block"
          aria-label={photoUrl ? "Change profile photo" : "Upload profile photo"}
        >
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={name || "Profile photo"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-3xl font-bold text-white">
              {name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}

          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
            <CameraIcon className="w-7 h-7 text-white" />
          </div>
        </button>

        {photoUrl && !uploading && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Remove profile photo"
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gray-900 border border-white/10 flex items-center justify-center text-gray-300 hover:text-red-400 hover:border-red-400/50 transition"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onFileChange}
      />

      <p className="text-xs text-gray-400 text-center">
        {uploading
          ? "Uploading photo…"
          : status === "success"
            ? "Photo uploaded successfully."
            : "Click photo to change"}
      </p>
      <p className="text-xs text-gray-500 text-center">
        Accepted formats: {ACCEPTED_FORMATS_LABEL} (max 10MB)
      </p>
      {status === "error" && message && (
        <p className="text-xs text-red-400 text-center">{message}</p>
      )}

      {cropSrc && (
        <ImageCropModal imageSrc={cropSrc} onCancel={handleCropCancel} onSave={onCropSave} />
      )}
    </div>
  )
}

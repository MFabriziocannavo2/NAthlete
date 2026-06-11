"use client"

import { useRef, useState } from "react"
import { CameraIcon } from "@heroicons/react/24/outline"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/AuthContext"

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
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file || !user) return

    setUploading(true)
    setError(null)

    const ext = file.name.split(".").pop()
    const path = `${user.id}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path)
    onChange(data.publicUrl)
    setUploading(false)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white/10 shrink-0"
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

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      <p className="text-xs text-gray-400">
        {uploading ? "Uploading..." : "Click photo to change"}
      </p>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

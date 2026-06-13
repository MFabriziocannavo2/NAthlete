"use client";

import { useRef, useState } from "react";
import { CameraIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/lib/AuthContext";
import { removeAvatar, uploadAvatar } from "@/lib/avatar";

export default function ProfileAvatar({
  athleteId,
  name,
  photoUrl,
  isOwner,
  onPhotoChange,
}: {
  athleteId: string;
  name: string;
  photoUrl?: string | null;
  isOwner: boolean;
  onPhotoChange: (url: string | null) => void;
}) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;

    setUploading(true);
    setError(null);

    const { url, error: uploadError } = await uploadAvatar(user.id, athleteId, file);

    if (uploadError) {
      setError(uploadError);
    } else if (url) {
      onPhotoChange(url);
    }

    setUploading(false);
  };

  const handleRemove = async () => {
    setUploading(true);
    setError(null);

    const { error: removeError } = await removeAvatar(athleteId);

    if (removeError) {
      setError(removeError);
    } else {
      onPhotoChange(null);
    }

    setUploading(false);
  };

  const avatar = photoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoUrl}
      alt={name}
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-3xl font-bold text-white">
      {name?.charAt(0)?.toUpperCase()}
    </div>
  );

  if (!isOwner) {
    return (
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white/10 shrink-0">
        {avatar}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div className="relative w-24 h-24 sm:w-28 sm:h-28">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="relative group w-full h-full rounded-full overflow-hidden border-2 border-white/10 block"
          aria-label={photoUrl ? "Change profile photo" : "Upload profile photo"}
        >
          {avatar}

          <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition opacity-0 group-hover:opacity-100">
            {uploading ? (
              <span className="text-xs text-white">Uploading...</span>
            ) : (
              <CameraIcon className="w-7 h-7 text-white" />
            )}
          </div>
        </button>

        {photoUrl && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
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
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />

      {error && <p className="text-xs text-red-400 text-center max-w-[7rem]">{error}</p>}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { CameraIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/lib/AuthContext";
import { ACCEPTED_FORMATS_LABEL, removeAvatar, uploadAvatar } from "@/lib/avatar";
import { useAvatarUpload } from "@/lib/useAvatarUpload";
import ImageCropModal from "@/components/ImageCropModal";

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
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const { status, message, cropSrc, handleFileSelect, handleCropCancel, handleCropSave } =
    useAvatarUpload((blob) => {
      if (!user) return Promise.resolve({ error: "You must be signed in to upload a photo." });
      return uploadAvatar(user.id, athleteId, blob);
    });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    handleFileSelect(file);
  };

  const onCropSave = async (blob: Blob) => {
    const url = await handleCropSave(blob);
    if (url) onPhotoChange(url);
  };

  const handleRemove = async () => {
    setRemoving(true);
    setRemoveError(null);

    const { error } = await removeAvatar(athleteId);

    if (error) {
      setRemoveError(error);
    } else {
      onPhotoChange(null);
    }

    setRemoving(false);
  };

  const uploading = status === "uploading";
  const busy = uploading || removing;

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
          disabled={busy}
          className="relative group w-full h-full rounded-full overflow-hidden border-2 border-white/10 block"
          aria-label={photoUrl ? "Change profile photo" : "Upload profile photo"}
        >
          {avatar}

          <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition opacity-0 group-hover:opacity-100">
            {uploading ? (
              <span className="text-xs text-white text-center px-1">Uploading photo…</span>
            ) : (
              <CameraIcon className="w-7 h-7 text-white" />
            )}
          </div>
        </button>

        {photoUrl && !busy && (
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
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />

      <p className="text-xs text-gray-500 text-center max-w-[7rem]">
        {ACCEPTED_FORMATS_LABEL} (max 10MB)
      </p>

      {status === "success" && (
        <p className="text-xs text-green-400 text-center max-w-[7rem]">Photo uploaded successfully.</p>
      )}
      {status === "error" && message && (
        <p className="text-xs text-red-400 text-center max-w-[7rem]">{message}</p>
      )}
      {removeError && <p className="text-xs text-red-400 text-center max-w-[7rem]">{removeError}</p>}

      {cropSrc && (
        <ImageCropModal imageSrc={cropSrc} onCancel={handleCropCancel} onSave={onCropSave} />
      )}
    </div>
  );
}

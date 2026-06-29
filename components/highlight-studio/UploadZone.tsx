"use client";

import { useRef, useState } from "react";
import { CloudArrowUpIcon, VideoCameraIcon } from "@heroicons/react/24/outline";

interface Props {
  onFiles: (files: File[]) => void;
  loading: boolean;
}

export default function UploadZone({ onFiles, loading }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("video/")
    );
    if (files.length) onFiles(files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onFiles(files);
    e.target.value = "";
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !loading && inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-4 p-8 sm:p-12 rounded-2xl border-2 border-dashed transition cursor-pointer select-none ${
        dragging
          ? "border-orange-500 bg-orange-500/10"
          : "border-white/20 bg-white/5 hover:border-orange-400 hover:bg-white/10"
      } ${loading ? "pointer-events-none opacity-60" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={handleChange}
      />

      {loading ? (
        <>
          <div className="w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
          <p className="text-gray-300 font-medium">Processing clips…</p>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
            <CloudArrowUpIcon className="w-8 h-8 text-orange-400" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-lg">
              Drop video files here
            </p>
            <p className="text-gray-400 text-sm mt-1">
              or tap to browse — MP4, MOV, WebM supported
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <VideoCameraIcon className="w-4 h-4" />
            Multiple files allowed
          </div>
        </>
      )}
    </div>
  );
}

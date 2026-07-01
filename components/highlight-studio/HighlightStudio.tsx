"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import {
  ArrowUpTrayIcon,
  EyeIcon,
  FilmIcon,
} from "@heroicons/react/24/outline";
import { generateThumbnail, getVideoDuration } from "@/lib/videoUtils";
import UploadZone from "./UploadZone";
import ClipTimeline from "./ClipTimeline";
import TrimPanel from "./TrimPanel";
import PreviewPlayer from "./PreviewPlayer";
import ExportModal from "./ExportModal";
import type { Clip, EditorSettings } from "./types";

let _clipIdCounter = 0;
function nextClipId() { return `clip-${++_clipIdCounter}`; }

const DEFAULT_SETTINGS: EditorSettings = {
  title: "",
  muteAudio: false,
  fadeIn: false,
  fadeOut: false,
  backgroundMusicVolume: 0.3,
  outputResolution: "720p",
};

export default function HighlightStudio() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [settings, setSettings] = useState<EditorSettings>(DEFAULT_SETTINGS);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // Revoke object URLs on unmount to free memory
  useEffect(() => {
    const urls = clips.map((c) => c.src);
    return () => { urls.forEach((u) => URL.revokeObjectURL(u)); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on unmount

  // Warn before leaving if clips exist
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (clips.length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [clips.length]);

  const addFiles = useCallback(async (files: File[]) => {
    setUploading(true);
    const newClips: Clip[] = [];

    for (const file of files) {
      const src = URL.createObjectURL(file);
      try {
        const [duration, thumbnail] = await Promise.all([
          getVideoDuration(src),
          generateThumbnail(src),
        ]);
        newClips.push({
          id: nextClipId(),
          src,
          file,
          name: file.name.replace(/\.[^.]+$/, ""),
          duration,
          trimStart: 0,
          trimEnd: duration,
          thumbnail,
          speed: 1,
        });
      } catch {
        URL.revokeObjectURL(src);
        // Skip unreadable files
      }
    }

    setClips((prev) => [...prev, ...newClips]);
    setUploading(false);
  }, []);

  const handleReorder = (activeId: string, overId: string) => {
    setClips((prev) => {
      const oldIndex = prev.findIndex((c) => c.id === activeId);
      const newIndex = prev.findIndex((c) => c.id === overId);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleDelete = (id: string) => {
    setClips((prev) => {
      const clip = prev.find((c) => c.id === id);
      if (clip) URL.revokeObjectURL(clip.src);
      return prev.filter((c) => c.id !== id);
    });
    if (selectedId === id) setSelectedId(null);
  };

  const handleTrimChange = (id: string, trimStart: number, trimEnd: number) => {
    setClips((prev) =>
      prev.map((c) => (c.id === id ? { ...c, trimStart, trimEnd } : c))
    );
  };

  const handleSpeedChange = (id: string, speed: number) => {
    setClips((prev) => prev.map((c) => (c.id === id ? { ...c, speed } : c)));
  };

  const handleSplit = (id: string, splitAt: number) => {
    setClips((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx === -1) return prev;
      const original = prev[idx];
      const a: Clip = {
        ...original,
        id: nextClipId(),
        name: `${original.name} (1)`,
        trimEnd: splitAt,
        speed: original.speed,
      };
      const b: Clip = {
        ...original,
        id: nextClipId(),
        name: `${original.name} (2)`,
        trimStart: splitAt,
        speed: original.speed,
        src: URL.createObjectURL(original.file),
      };
      const next = [...prev];
      next.splice(idx, 1, a, b);
      return next;
    });
    setSelectedId(null);
  };

  const selectedClip = clips.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      {/* Upload zone — always visible when no clips; add-more button when clips exist */}
      {clips.length === 0 ? (
        <UploadZone onFiles={addFiles} loading={uploading} />
      ) : (
        <input
          ref={uploadInputRef}
          type="file"
          accept="video/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) addFiles(files);
            e.target.value = "";
          }}
        />
      )}

      {/* Timeline */}
      {clips.length > 0 && (
        <>
          <ClipTimeline
            clips={clips}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(id === selectedId ? null : id)}
            onDelete={handleDelete}
            onSplit={(id) => setSelectedId(id)} // open trim panel so user can set split point
            onReorder={handleReorder}
            onAddMore={() => uploadInputRef.current?.click()}
          />

          {/* Trim panel for selected clip */}
          {selectedClip && (
            <TrimPanel
              clip={selectedClip}
              onTrimChange={handleTrimChange}
              onSpeedChange={handleSpeedChange}
              onSplitApply={handleSplit}
              onClose={() => setSelectedId(null)}
            />
          )}

          {/* Action bar */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/20 text-gray-300 hover:bg-white/10 hover:text-white transition font-medium"
            >
              <EyeIcon className="w-5 h-5" />
              Preview Reel
            </button>
            <button
              type="button"
              onClick={() => setShowExport(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold hover:from-orange-500 hover:to-amber-400 transition shadow-lg"
            >
              <ArrowUpTrayIcon className="w-5 h-5" />
              Export & Save
            </button>
          </div>
        </>
      )}

      {/* Empty state tip */}
      {clips.length === 0 && !uploading && (
        <div className="flex flex-col items-center gap-2 text-center py-4">
          <FilmIcon className="w-8 h-8 text-gray-600" />
          <p className="text-gray-500 text-sm max-w-xs">
            Upload your raw video clips above. You can reorder, trim, and combine them into a
            single highlight reel.
          </p>
        </div>
      )}

      {/* Modals */}
      {showPreview && clips.length > 0 && (
        <PreviewPlayer clips={clips} onClose={() => setShowPreview(false)} />
      )}
      {showExport && (
        <ExportModal
          clips={clips}
          settings={settings}
          onSettingsChange={(patch) => setSettings((s) => ({ ...s, ...patch }))}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}

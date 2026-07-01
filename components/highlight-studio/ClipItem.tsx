"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Bars3Icon,
  PlayIcon,
  ScissorsIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { formatDuration } from "@/lib/videoUtils";
import type { Clip } from "./types";

interface Props {
  clip: Clip;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onSplit: () => void;
}

export default function ClipItem({
  clip,
  isSelected,
  onSelect,
  onDelete,
  onSplit,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: clip.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const trimmedDuration = clip.trimEnd - clip.trimStart;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? "border-orange-500 bg-orange-500/10"
          : "border-white/10 bg-white/5 hover:border-white/20"
      }`}
      onClick={onSelect}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="shrink-0 text-gray-500 hover:text-gray-300 touch-none cursor-grab active:cursor-grabbing p-1"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <Bars3Icon className="w-5 h-5" />
      </button>

      {/* Thumbnail */}
      <div className="shrink-0 w-16 h-9 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
        {clip.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={clip.thumbnail} alt="" className="w-full h-full object-cover" />
        ) : (
          <PlayIcon className="w-4 h-4 text-gray-500" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{clip.name}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-orange-400 font-mono">
            {formatDuration(trimmedDuration)}
          </span>
          {(clip.trimStart > 0 || clip.trimEnd < clip.duration) && (
            <span className="text-xs text-gray-500">trimmed</span>
          )}
          {clip.speed !== 1 && (
            <span className="text-xs text-amber-400 font-mono">{clip.speed}×</span>
          )}
          {(clip.colorGrade.brightness !== 1 || clip.colorGrade.contrast !== 1 ||
            clip.colorGrade.saturation !== 1 || clip.colorGrade.hueRotate !== 0) && (
            <span className="text-xs text-purple-400">color</span>
          )}
          {clip.textOverlays.length > 0 && (
            <span className="text-xs text-sky-400">T×{clip.textOverlays.length}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onSplit}
          className="p-1.5 rounded-lg text-gray-400 hover:text-orange-300 hover:bg-white/10 transition"
          aria-label="Split clip"
          title="Split"
        >
          <ScissorsIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
          aria-label="Delete clip"
          title="Delete"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { ScissorsIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { formatDuration } from "@/lib/videoUtils";
import type { Clip } from "./types";

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.5, 2] as const;
type SpeedValue = typeof SPEED_OPTIONS[number];

interface Props {
  clip: Clip;
  onTrimChange: (id: string, trimStart: number, trimEnd: number) => void;
  onSpeedChange: (id: string, speed: number) => void;
  onSplitApply: (id: string, splitAt: number) => void;
  onClose: () => void;
}

export default function TrimPanel({ clip, onTrimChange, onSpeedChange, onSplitApply, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [splitMode, setSplitMode] = useState(false);
  const [splitAt, setSplitAt] = useState(
    (clip.trimStart + clip.trimEnd) / 2
  );

  // Keep video in sync with trim sliders
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = clip.src;
      videoRef.current.currentTime = clip.trimStart;
    }
  }, [clip.src, clip.trimStart]);

  const previewTime = (t: number) => {
    if (videoRef.current) videoRef.current.currentTime = t;
  };

  const trimDuration = clip.trimEnd - clip.trimStart;

  return (
    <div className="rounded-2xl border border-orange-500/40 bg-gray-900 p-5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white truncate max-w-[180px]">{clip.name}</p>
          <p className="text-xs text-orange-400 font-mono mt-0.5">
            {formatDuration(trimDuration)} selected
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
          aria-label="Close trim panel"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Video preview */}
      <video
        ref={videoRef}
        src={clip.src}
        className="w-full rounded-xl bg-black aspect-video object-contain"
        controls
        muted
        playsInline
        preload="metadata"
      />

      {!splitMode ? (
        <>
          {/* Trim Start */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Trim Start</span>
              <span className="text-white font-mono">{clip.trimStart.toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min={0}
              max={clip.duration}
              step={0.1}
              value={clip.trimStart}
              className="w-full accent-orange-500"
              onChange={(e) => {
                const val = Math.min(Number(e.target.value), clip.trimEnd - 0.5);
                onTrimChange(clip.id, val, clip.trimEnd);
                previewTime(val);
              }}
            />
          </div>

          {/* Trim End */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Trim End</span>
              <span className="text-white font-mono">{clip.trimEnd.toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min={0}
              max={clip.duration}
              step={0.1}
              value={clip.trimEnd}
              className="w-full accent-orange-500"
              onChange={(e) => {
                const val = Math.max(Number(e.target.value), clip.trimStart + 0.5);
                onTrimChange(clip.id, clip.trimStart, val);
                previewTime(val);
              }}
            />
          </div>

          {/* Duration indicator */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">
              Original: <span className="text-white font-mono">{formatDuration(clip.duration)}</span>
            </span>
            <span className="text-gray-400">
              Trimmed: <span className="text-orange-400 font-mono">{formatDuration(trimDuration)}</span>
            </span>
          </div>

          {/* Speed */}
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-gray-400">Playback Speed</p>
            <div className="flex gap-1.5 flex-wrap">
              {SPEED_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSpeedChange(clip.id, s)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition ${
                    (clip.speed ?? 1) === s
                      ? "bg-orange-500 text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {s === 1 ? "1× Normal" : `${s}×`}
                </button>
              ))}
            </div>
          </div>

          {/* Split button */}
          <button
            type="button"
            onClick={() => { setSplitMode(true); setSplitAt((clip.trimStart + clip.trimEnd) / 2); }}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-orange-400 transition text-sm font-medium"
          >
            <ScissorsIcon className="w-4 h-4" />
            Split Clip
          </button>
        </>
      ) : (
        <>
          {/* Split mode */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Split at</span>
              <span className="text-white font-mono">{splitAt.toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min={clip.trimStart + 0.5}
              max={clip.trimEnd - 0.5}
              step={0.1}
              value={splitAt}
              className="w-full accent-orange-500"
              onChange={(e) => {
                const val = Number(e.target.value);
                setSplitAt(val);
                previewTime(val);
              }}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { onSplitApply(clip.id, splitAt); setSplitMode(false); }}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-semibold text-sm hover:from-orange-500 hover:to-amber-400 transition"
            >
              Apply Split
            </button>
            <button
              type="button"
              onClick={() => setSplitMode(false)}
              className="flex-1 py-2 rounded-xl border border-white/20 text-gray-300 hover:bg-white/10 transition text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

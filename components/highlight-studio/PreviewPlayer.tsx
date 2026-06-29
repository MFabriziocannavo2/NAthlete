"use client";

import { useEffect, useRef, useState } from "react";
import {
  PauseIcon,
  PlayIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { formatDuration } from "@/lib/videoUtils";
import type { Clip } from "./types";

interface Props {
  clips: Clip[];
  onClose: () => void;
}

export default function PreviewPlayer({ clips, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const currentClip = clips[currentIndex];

  // Load clip when index changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentClip) return;

    video.src = currentClip.src;
    video.currentTime = currentClip.trimStart;

    if (playing) {
      video.play().catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, currentClip?.src]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !currentClip) return;

    setCurrentTime(video.currentTime);

    // Advance to next clip when trimEnd is reached
    if (video.currentTime >= currentClip.trimEnd - 0.1) {
      if (currentIndex < clips.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        video.pause();
        setPlaying(false);
        setCurrentIndex(0);
      }
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (playing) {
      video.pause();
      setPlaying(false);
    } else {
      if (!currentClip) return;
      video.src = currentClip.src;
      video.currentTime = currentClip.trimStart;
      video.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const elapsed = currentTime - (currentClip?.trimStart ?? 0);
  const totalDuration = clips.reduce((s, c) => s + (c.trimEnd - c.trimStart), 0);
  const previousDuration = clips
    .slice(0, currentIndex)
    .reduce((s, c) => s + (c.trimEnd - c.trimStart), 0);
  const overallElapsed = previousDuration + Math.max(0, elapsed);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold">Preview</h3>
            <p className="text-xs text-gray-400">
              Clip {currentIndex + 1} of {clips.length} — {currentClip?.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 transition"
            aria-label="Close preview"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Video */}
        <video
          ref={videoRef}
          className="w-full rounded-2xl bg-black aspect-video object-contain"
          muted={false}
          playsInline
          onTimeUpdate={handleTimeUpdate}
        />

        {/* Overall progress bar */}
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all"
            style={{ width: `${(overallElapsed / Math.max(1, totalDuration)) * 100}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-mono">
            {formatDuration(overallElapsed)} / {formatDuration(totalDuration)}
          </span>
          <button
            type="button"
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 flex items-center justify-center shadow-lg hover:from-orange-500 hover:to-amber-400 transition"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <PauseIcon className="w-6 h-6 text-white" />
            ) : (
              <PlayIcon className="w-6 h-6 text-white ml-0.5" />
            )}
          </button>
          <span className="text-xs text-gray-400">
            {clips.length} clip{clips.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

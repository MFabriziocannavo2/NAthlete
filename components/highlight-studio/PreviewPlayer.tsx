"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { formatDuration } from "@/lib/videoUtils";
import type { Clip } from "./types";

interface Props {
  clips: Clip[];
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Double-buffer gapless preview player
//
// Two <video> elements share a single canvas overlay.
// While buffer A plays, buffer B preloads the next clip.
// On transition: show B, start preloading next into A, swap roles.
// ─────────────────────────────────────────────────────────────────────────────

export default function PreviewPlayer({ clips, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying]           = useState(false);
  const [elapsed, setElapsed]           = useState(0); // seconds into current clip (trimmed)
  const [activeBuffer, setActiveBuffer] = useState<0 | 1>(0);

  // Two video elements — one active, one preloading
  const videoA = useRef<HTMLVideoElement>(null);
  const videoB = useRef<HTMLVideoElement>(null);

  const getVideo = useCallback(
    (buf: 0 | 1) => (buf === 0 ? videoA : videoB).current,
    [],
  );

  const currentClip   = clips[currentIndex];
  const totalDuration = clips.reduce((s, c) => s + (c.trimEnd - c.trimStart) / (c.speed || 1), 0);
  const prevDuration  = clips
    .slice(0, currentIndex)
    .reduce((s, c) => s + (c.trimEnd - c.trimStart) / (c.speed || 1), 0);

  // CSS filter from color grade
  const cssFilterFor = (clip: Clip | undefined) => {
    if (!clip) return undefined;
    const { brightness = 1, contrast = 1, saturation = 1, hueRotate = 0 } = clip.colorGrade ?? {};
    if (brightness === 1 && contrast === 1 && saturation === 1 && hueRotate === 0) return undefined;
    return `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) hue-rotate(${hueRotate}deg)`;
  };

  // ── Preload a clip into a buffer video ──────────────────────────────────
  const preloadInto = useCallback(
    (buf: 0 | 1, clip: Clip | undefined) => {
      const v = getVideo(buf);
      if (!v || !clip) return;
      if (v.src !== clip.src) {
        v.src = clip.src;
        v.load();
      }
      v.playbackRate = clip.speed || 1;
      v.currentTime  = Math.max(0, clip.trimStart);
    },
    [getVideo],
  );

  // ── Load clip index into the active buffer, preload next into idle buffer ─
  const loadClip = useCallback(
    (index: number, buf: 0 | 1, shouldPlay: boolean) => {
      const clip = clips[index];
      if (!clip) return;

      const v = getVideo(buf);
      if (!v) return;

      v.src = clip.src;
      v.playbackRate = clip.speed || 1;
      v.currentTime  = Math.max(0, clip.trimStart);

      if (shouldPlay) {
        v.play().catch(() => {});
      }

      // Preload next clip into the idle buffer
      const nextClip = clips[index + 1];
      const idleBuf  = buf === 0 ? 1 : 0;
      preloadInto(idleBuf, nextClip);
    },
    [clips, getVideo, preloadInto],
  );

  // ── Time update handler ─────────────────────────────────────────────────
  const makeTimeUpdate = useCallback(
    (buf: 0 | 1, index: number) => () => {
      if (buf !== activeBuffer) return; // stale event from idle buffer
      const v      = getVideo(buf);
      const clip   = clips[index];
      if (!v || !clip) return;

      const clipElapsed = (v.currentTime - clip.trimStart) / (clip.speed || 1);
      setElapsed(clipElapsed);

      // Advance when clip trimEnd is reached
      if (v.currentTime >= clip.trimEnd - 0.08) {
        const nextIndex = index + 1;
        if (nextIndex < clips.length) {
          const nextBuf = buf === 0 ? 1 : 0;
          const nextV   = getVideo(nextBuf);
          // nextV is already preloaded — just play it
          nextV?.play().catch(() => {});
          setCurrentIndex(nextIndex);
          setActiveBuffer(nextBuf);
          setElapsed(0);
          // Preload the clip after next into the now-idle buf
          preloadInto(buf, clips[nextIndex + 1]);
        } else {
          // End of reel
          v.pause();
          setPlaying(false);
          setCurrentIndex(0);
          setElapsed(0);
          loadClip(0, buf, false);
          setActiveBuffer(buf);
        }
      }
    },
    [activeBuffer, clips, getVideo, loadClip, preloadInto],
  );

  // ── Attach timeupdate listeners when index or buffer changes ───────────
  useEffect(() => {
    const v = getVideo(activeBuffer);
    if (!v) return;
    const handler = makeTimeUpdate(activeBuffer, currentIndex);
    v.addEventListener("timeupdate", handler);
    return () => v.removeEventListener("timeupdate", handler);
  }, [activeBuffer, currentIndex, getVideo, makeTimeUpdate]);

  // ── Initial load ────────────────────────────────────────────────────────
  useEffect(() => {
    loadClip(0, 0, false);
    setActiveBuffer(0);
    setCurrentIndex(0);
    setElapsed(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only once on mount

  // ── Play / Pause ────────────────────────────────────────────────────────
  const togglePlay = () => {
    const v = getVideo(activeBuffer);
    if (!v) return;
    if (playing) {
      v.pause();
      setPlaying(false);
    } else {
      // Ensure correct position
      const clip = clips[currentIndex];
      if (clip && v.currentTime < clip.trimStart) {
        v.currentTime = clip.trimStart;
      }
      v.play()
        .then(() => setPlaying(true))
        .catch(() => {});
    }
  };

  const overallElapsed = prevDuration + Math.max(0, elapsed);
  const totalDur       = Math.max(1, totalDuration);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold">Preview</h3>
            <p className="text-xs text-gray-400">
              Clip {currentIndex + 1} / {clips.length} — {currentClip?.name}
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

        {/* Double-buffer video pair */}
        <div className="relative w-full rounded-2xl overflow-hidden bg-black aspect-video">
          <video
            ref={videoA}
            className="absolute inset-0 w-full h-full object-contain transition-opacity duration-100"
            style={{
              opacity: activeBuffer === 0 ? 1 : 0,
              filter: cssFilterFor(activeBuffer === 0 ? currentClip : clips[currentIndex + 1]) ?? "none",
              zIndex: activeBuffer === 0 ? 1 : 0,
            }}
            muted={false}
            playsInline
            preload="auto"
          />
          <video
            ref={videoB}
            className="absolute inset-0 w-full h-full object-contain transition-opacity duration-100"
            style={{
              opacity: activeBuffer === 1 ? 1 : 0,
              filter: cssFilterFor(activeBuffer === 1 ? currentClip : clips[currentIndex + 1]) ?? "none",
              zIndex: activeBuffer === 1 ? 1 : 0,
            }}
            muted={false}
            playsInline
            preload="auto"
          />
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all"
            style={{ width: `${(overallElapsed / totalDur) * 100}%` }}
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
            {playing
              ? <PauseIcon className="w-6 h-6 text-white" />
              : <PlayIcon  className="w-6 h-6 text-white ml-0.5" />}
          </button>
          <span className="text-xs text-gray-400">
            {clips.length} clip{clips.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

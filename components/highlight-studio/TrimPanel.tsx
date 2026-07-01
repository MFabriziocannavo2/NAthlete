"use client";

import { useEffect, useRef, useState } from "react";
import { ScissorsIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { formatDuration } from "@/lib/videoUtils";
import type { Clip, ColorGrade, TextOverlay } from "./types";
import { DEFAULT_COLOR_GRADE } from "./types";

// ── Constants ─────────────────────────────────────────────────────────────────

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.5, 2] as const;

const COLOR_PRESETS: { label: string; grade: ColorGrade }[] = [
  { label: "Normal",    grade: { brightness: 1,    contrast: 1,   saturation: 1,    hueRotate: 0   } },
  { label: "Vivid",     grade: { brightness: 1.05, contrast: 1.2, saturation: 1.5,  hueRotate: 0   } },
  { label: "Cinematic", grade: { brightness: 0.9,  contrast: 1.3, saturation: 0.75, hueRotate: 0   } },
  { label: "B&W",       grade: { brightness: 1,    contrast: 1.1, saturation: 0,    hueRotate: 0   } },
  { label: "Warm",      grade: { brightness: 1.05, contrast: 1,   saturation: 1.1,  hueRotate: 20  } },
  { label: "Cool",      grade: { brightness: 1,    contrast: 1.05,saturation: 1,    hueRotate: 195 } },
];

// 3×3 position grid — arrow symbols map to spatial positions
const POSITIONS: { label: string; x: number; y: number; align: CanvasTextAlign }[] = [
  { label: "↖", x: 0.05, y: 0.07, align: "left"   },
  { label: "↑", x: 0.5,  y: 0.07, align: "center" },
  { label: "↗", x: 0.95, y: 0.07, align: "right"  },
  { label: "←", x: 0.05, y: 0.5,  align: "left"   },
  { label: "•", x: 0.5,  y: 0.5,  align: "center" },
  { label: "→", x: 0.95, y: 0.5,  align: "right"  },
  { label: "↙", x: 0.05, y: 0.93, align: "left"   },
  { label: "↓", x: 0.5,  y: 0.93, align: "center" },
  { label: "↘", x: 0.95, y: 0.93, align: "right"  },
];

const TEXT_COLORS = [
  { label: "White",  value: "#FFFFFF" },
  { label: "Yellow", value: "#FACC15" },
  { label: "Orange", value: "#F97316" },
  { label: "Red",    value: "#EF4444" },
  { label: "Green",  value: "#22C55E" },
  { label: "Cyan",   value: "#06B6D4" },
  { label: "Black",  value: "#111111" },
];

const FONT_SIZES = [
  { label: "S", value: 40 },
  { label: "M", value: 64 },
  { label: "L", value: 96 },
];

type Tab = "trim" | "color" | "text";

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  clip: Clip;
  onTrimChange: (id: string, trimStart: number, trimEnd: number) => void;
  onSpeedChange: (id: string, speed: number) => void;
  onColorGradeChange: (id: string, grade: ColorGrade) => void;
  onAddOverlay: (id: string, overlay: TextOverlay) => void;
  onDeleteOverlay: (id: string, overlayId: string) => void;
  onSplitApply: (id: string, splitAt: number) => void;
  onClose: () => void;
}

export default function TrimPanel({
  clip,
  onTrimChange,
  onSpeedChange,
  onColorGradeChange,
  onAddOverlay,
  onDeleteOverlay,
  onSplitApply,
  onClose,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>("trim");
  const [splitMode, setSplitMode] = useState(false);
  const [splitAt, setSplitAt] = useState((clip.trimStart + clip.trimEnd) / 2);

  // Text overlay form state
  const [newText, setNewText] = useState("");
  const [selectedPos, setSelectedPos] = useState(7); // bottom-center by default
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const [selectedSize, setSelectedSize] = useState(64);

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

  // CSS filter string for live preview on <video> element
  const { brightness, contrast, saturation, hueRotate } = clip.colorGrade;
  const isDefaultGrade =
    brightness === 1 && contrast === 1 && saturation === 1 && hueRotate === 0;
  const cssFilter = isDefaultGrade
    ? undefined
    : `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) hue-rotate(${hueRotate}deg)`;

  const addOverlay = () => {
    const text = newText.trim();
    if (!text) return;
    const pos = POSITIONS[selectedPos];
    onAddOverlay(clip.id, {
      id: `ov-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text,
      x: pos.x,
      y: pos.y,
      fontSize: selectedSize,
      color: selectedColor,
      align: pos.align,
    });
    setNewText("");
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "trim",  label: "Trim & Speed" },
    { id: "color", label: "Color" },
    { id: "text",  label: clip.textOverlays.length > 0 ? `Text (${clip.textOverlays.length})` : "Text" },
  ];

  return (
    <div className="rounded-2xl border border-orange-500/40 bg-gray-900 p-5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white truncate max-w-[200px]">{clip.name}</p>
          <p className="text-xs text-orange-400 font-mono mt-0.5">{formatDuration(trimDuration)} selected</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
          aria-label="Close"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-white/10 -mx-5 px-5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => { setActiveTab(tab.id); setSplitMode(false); }}
            className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition ${
              activeTab === tab.id
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Video preview — always visible, color-graded live */}
      <video
        ref={videoRef}
        src={clip.src}
        className="w-full rounded-xl bg-black aspect-video object-contain"
        style={cssFilter ? { filter: cssFilter } : undefined}
        controls
        muted
        playsInline
        preload="metadata"
      />

      {/* ── Trim & Speed tab ─────────────────────────────────── */}
      {activeTab === "trim" && !splitMode && (
        <>
          {/* Trim Start */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Trim Start</span>
              <span className="text-white font-mono">{clip.trimStart.toFixed(1)}s</span>
            </div>
            <input
              type="range" min={0} max={clip.duration} step={0.1} value={clip.trimStart}
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
              type="range" min={0} max={clip.duration} step={0.1} value={clip.trimEnd}
              className="w-full accent-orange-500"
              onChange={(e) => {
                const val = Math.max(Number(e.target.value), clip.trimStart + 0.5);
                onTrimChange(clip.id, clip.trimStart, val);
                previewTime(val);
              }}
            />
          </div>

          {/* Duration summary */}
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
                    clip.speed === s
                      ? "bg-orange-500 text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {s === 1 ? "1× Normal" : `${s}×`}
                </button>
              ))}
            </div>
          </div>

          {/* Split */}
          <button
            type="button"
            onClick={() => { setSplitMode(true); setSplitAt((clip.trimStart + clip.trimEnd) / 2); }}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-orange-400 transition text-sm font-medium"
          >
            <ScissorsIcon className="w-4 h-4" />
            Split Clip
          </button>
        </>
      )}

      {activeTab === "trim" && splitMode && (
        <>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Split at</span>
              <span className="text-white font-mono">{splitAt.toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min={clip.trimStart + 0.5} max={clip.trimEnd - 0.5} step={0.1} value={splitAt}
              className="w-full accent-orange-500"
              onChange={(e) => { const val = Number(e.target.value); setSplitAt(val); previewTime(val); }}
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

      {/* ── Color tab ────────────────────────────────────────── */}
      {activeTab === "color" && (
        <>
          {/* Presets */}
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-400 font-medium">Presets</p>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_PRESETS.map((p) => {
                const isActive = JSON.stringify(clip.colorGrade) === JSON.stringify(p.grade);
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => onColorGradeChange(clip.id, p.grade)}
                    className={`py-1.5 rounded-lg text-xs font-medium transition ${
                      isActive
                        ? "bg-orange-500 text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manual sliders */}
          {(
            [
              { key: "brightness" as const, label: "Brightness", min: 0.5,  max: 2,   step: 0.05 },
              { key: "contrast"   as const, label: "Contrast",   min: 0.5,  max: 2,   step: 0.05 },
              { key: "saturation" as const, label: "Saturation", min: 0,    max: 2,   step: 0.05 },
              { key: "hueRotate"  as const, label: "Hue Rotate", min: 0,    max: 360, step: 1    },
            ] as const
          ).map(({ key, label, min, max, step }) => (
            <div key={key} className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>{label}</span>
                <span className="text-white font-mono">
                  {key === "hueRotate"
                    ? `${clip.colorGrade[key]}°`
                    : clip.colorGrade[key].toFixed(2)}
                </span>
              </div>
              <input
                type="range" min={min} max={max} step={step} value={clip.colorGrade[key]}
                className="w-full accent-orange-500"
                onChange={(e) =>
                  onColorGradeChange(clip.id, { ...clip.colorGrade, [key]: Number(e.target.value) })
                }
              />
            </div>
          ))}

          {!isDefaultGrade && (
            <button
              type="button"
              onClick={() => onColorGradeChange(clip.id, DEFAULT_COLOR_GRADE)}
              className="text-xs text-gray-500 hover:text-gray-300 transition text-center"
            >
              Reset to Normal
            </button>
          )}
        </>
      )}

      {/* ── Text tab ─────────────────────────────────────────── */}
      {activeTab === "text" && (
        <>
          {/* Existing overlays */}
          {clip.textOverlays.length > 0 && (
            <div className="flex flex-col gap-2">
              {clip.textOverlays.map((ov) => (
                <div
                  key={ov.id}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10"
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                    style={{ background: ov.color }}
                  />
                  <span className="text-sm text-white flex-1 truncate">{ov.text}</span>
                  <span className="text-xs text-gray-500 font-mono shrink-0">{ov.fontSize}px</span>
                  <button
                    type="button"
                    onClick={() => onDeleteOverlay(clip.id, ov.id)}
                    className="text-gray-500 hover:text-red-400 transition shrink-0"
                    aria-label="Remove overlay"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add overlay form */}
          <div className="flex flex-col gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addOverlay(); }}
              placeholder="Enter text…"
              maxLength={80}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />

            {/* Position grid */}
            <div className="flex flex-col gap-1">
              <p className="text-xs text-gray-500">Position</p>
              <div className="grid grid-cols-3 gap-1">
                {POSITIONS.map((pos, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPos(idx)}
                    className={`py-1.5 rounded-lg text-sm transition ${
                      selectedPos === idx
                        ? "bg-orange-500 text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color swatches */}
            <div className="flex flex-col gap-1">
              <p className="text-xs text-gray-500">Color</p>
              <div className="flex gap-2 flex-wrap">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setSelectedColor(c.value)}
                    title={c.label}
                    className={`w-6 h-6 rounded-full transition border-2 ${
                      selectedColor === c.value
                        ? "border-orange-400 scale-110"
                        : "border-white/10 hover:scale-105"
                    }`}
                    style={{ background: c.value }}
                  />
                ))}
              </div>
            </div>

            {/* Font size */}
            <div className="flex flex-col gap-1">
              <p className="text-xs text-gray-500">Size</p>
              <div className="flex gap-2">
                {FONT_SIZES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setSelectedSize(s.value)}
                    className={`flex-1 py-1 rounded-lg text-xs font-semibold transition ${
                      selectedSize === s.value
                        ? "bg-orange-500 text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={addOverlay}
              disabled={!newText.trim()}
              className="w-full py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add Text
            </button>
          </div>
        </>
      )}
    </div>
  );
}

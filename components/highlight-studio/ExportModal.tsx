"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  DevicePhoneMobileIcon,
  ExclamationTriangleIcon,
  MusicalNoteIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { exportClips, detectExportCapability } from "@/lib/videoExport";
import type { Clip, EditorSettings, ExportState, OutputResolution } from "./types";

interface Props {
  clips: Clip[];
  settings: EditorSettings;
  onSettingsChange: (s: Partial<EditorSettings>) => void;
  onClose: () => void;
}

const RESOLUTIONS: { value: OutputResolution; label: string; hint: string }[] = [
  { value: "720p",     label: "720p",     hint: "Fast, good quality" },
  { value: "1080p",    label: "1080p",    hint: "Recommended" },
  { value: "original", label: "Original", hint: "Native resolution" },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function ExportModal({ clips, settings, onSettingsChange, onClose }: Props) {
  const { user } = useAuth();
  const [state, setState] = useState<ExportState>({ status: "idle", progress: 0 });
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [profileUpdated, setProfileUpdated] = useState(false);

  const outputUrlRef  = useRef<string | null>(null);
  const abortRef      = useRef<AbortController | null>(null);
  const startTimeRef  = useRef<number>(0);
  const [eta, setEta] = useState<string>("");

  const cap = detectExportCapability();

  // Estimate time remaining
  useEffect(() => {
    if (state.status !== "processing" || state.progress < 3) { setEta(""); return; }
    const elapsed   = (Date.now() - startTimeRef.current) / 1000;
    const remaining = (elapsed / state.progress) * (100 - state.progress);
    if (remaining < 5)   { setEta("Almost done…"); return; }
    if (remaining < 60)  { setEta(`~${Math.ceil(remaining)}s remaining`); return; }
    setEta(`~${Math.ceil(remaining / 60)}m remaining`);
  }, [state.status, state.progress]);

  // Revoke blob URL on unmount
  useEffect(() => {
    return () => { if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current); };
  }, []);

  const handleExport = async () => {
    if (!cap.canRecord) return;
    abortRef.current = new AbortController();
    startTimeRef.current = Date.now();
    setState({ status: "processing", progress: 0 });

    try {
      const blob = await exportClips(
        clips,
        settings,
        (p) => setState((prev) => ({ ...prev, progress: Math.round(p) })),
        abortRef.current.signal,
      );
      const url = URL.createObjectURL(blob);
      outputUrlRef.current = url;
      setState({ status: "done", progress: 100, outputUrl: url, outputBlob: blob });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setState({ status: "idle", progress: 0 });
        return;
      }
      setState({
        status: "error",
        progress: 0,
        error: err instanceof Error ? err.message : "Export failed",
      });
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
  };

  const handleDownload = () => {
    if (!state.outputUrl) return;
    const a = document.createElement("a");
    a.href     = state.outputUrl;
    a.download = `${settings.title || "highlight"}.${cap.fileExtension}`;
    a.click();
  };

  // iOS: download each original clip file
  const handleDownloadClip = (clip: Clip, index: number) => {
    const a = document.createElement("a");
    a.href     = clip.src;
    a.download = `${clip.name || `clip-${index + 1}`}.mp4`;
    a.click();
  };

  const handleUpdateProfile = async () => {
    if (!state.outputBlob || !user) return;
    setUploadingProfile(true);
    try {
      const ext      = cap.fileExtension;
      const fileName = `${user.id}/${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from("highlight-videos")
        .upload(fileName, state.outputBlob, {
          contentType: cap.mimeType || "video/webm",
          upsert: true,
        });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("highlight-videos").getPublicUrl(data.path);
      await supabase.from("athletes").update({ highlight_video: urlData.publicUrl }).eq("user_id", user.id);
      setProfileUpdated(true);
    } catch {
      alert("Could not update profile. Make sure the 'highlight-videos' storage bucket exists.");
    } finally {
      setUploadingProfile(false);
    }
  };

  const totalSecs = clips.reduce((s, c) => s + (c.trimEnd - c.trimStart) / (c.speed ?? 1), 0);

  // ── iOS / unsupported fallback ──────────────────────────────────────────────
  if (!cap.canRecord) {
    const isFallback = cap.isIOS || cap.isSafari;
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-900 rounded-2xl border border-white/10 shadow-2xl p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-lg">Export Highlight</h3>
            <button type="button" onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <DevicePhoneMobileIcon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 font-semibold text-sm">
                {isFallback ? "Full export not available on this device" : "Browser not supported"}
              </p>
              <p className="text-amber-200/70 text-xs mt-1">
                {isFallback
                  ? "Video recording is not supported on iPhone, iPad, or Safari. For the full export experience, open NAthlete on Chrome or Firefox on a computer."
                  : cap.reason}
              </p>
            </div>
          </div>

          {isFallback && clips.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-gray-400 font-medium">
                Download your original clips individually:
              </p>
              {clips.map((clip, i) => (
                <button
                  key={clip.id}
                  type="button"
                  onClick={() => handleDownloadClip(clip, i)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/40 hover:bg-orange-500/5 transition text-left"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 text-orange-400 shrink-0" />
                  <span className="text-sm text-white truncate flex-1">{clip.name}</span>
                  <span className="text-xs text-gray-500 font-mono shrink-0">
                    {(clip.trimEnd - clip.trimStart).toFixed(1)}s
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Standard export UI ──────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl border border-white/10 shadow-2xl p-6 flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-lg">Export Highlight</h3>
          {state.status !== "processing" && (
            <button type="button" onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition">
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* ── Idle / Settings ──────────────────────────────────── */}
        {state.status === "idle" && (
          <>
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400">Video Title</label>
              <input
                type="text"
                value={settings.title}
                onChange={(e) => onSettingsChange({ title: e.target.value })}
                placeholder="My Highlight Reel"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Resolution */}
            <div className="flex flex-col gap-1.5">
              <p className="text-xs text-gray-400 font-medium">Quality</p>
              <div className="flex gap-2">
                {RESOLUTIONS.map(({ value, label, hint }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onSettingsChange({ outputResolution: value })}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition flex flex-col items-center gap-0.5 ${
                      settings.outputResolution === value
                        ? "bg-orange-500 text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>{label}</span>
                    <span className={`text-[10px] font-normal ${settings.outputResolution === value ? "text-orange-100" : "text-gray-600"}`}>{hint}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Background music */}
            <div className="flex flex-col gap-2">
              <p className="text-xs text-gray-400 font-medium">Background Music</p>
              {settings.backgroundMusicFile ? (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <MusicalNoteIcon className="w-4 h-4 text-orange-400 shrink-0" />
                  <span className="text-xs text-white truncate flex-1">{settings.backgroundMusicFile.name}</span>
                  <button type="button"
                    onClick={() => {
                      if (settings.backgroundMusicUrl) URL.revokeObjectURL(settings.backgroundMusicUrl);
                      onSettingsChange({ backgroundMusicFile: undefined, backgroundMusicUrl: undefined });
                    }}
                    className="text-gray-500 hover:text-red-400 transition" aria-label="Remove music">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-dashed border-white/20 hover:border-orange-400 hover:bg-white/10 transition cursor-pointer">
                  <MusicalNoteIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-400">Add audio file (MP3, AAC, WAV…)</span>
                  <input type="file" accept="audio/*" className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      if (settings.backgroundMusicUrl) URL.revokeObjectURL(settings.backgroundMusicUrl);
                      onSettingsChange({ backgroundMusicFile: f, backgroundMusicUrl: URL.createObjectURL(f) });
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
              {settings.backgroundMusicFile && (
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Volume</span>
                    <span className="font-mono">{Math.round(settings.backgroundMusicVolume * 100)}%</span>
                  </div>
                  <input type="range" min={0} max={1} step={0.05}
                    value={settings.backgroundMusicVolume} className="w-full accent-orange-500"
                    onChange={(e) => onSettingsChange({ backgroundMusicVolume: Number(e.target.value) })}
                  />
                </div>
              )}
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3">
              <p className="text-xs text-gray-400 font-medium">Options</p>
              {[
                { key: "muteAudio" as const, label: "Mute original clip audio" },
                { key: "fadeIn"    as const, label: "Fade in (first clip)" },
                { key: "fadeOut"   as const, label: "Fade out (last clip)" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox"
                    checked={settings[key] as boolean}
                    onChange={(e) => onSettingsChange({ [key]: e.target.checked })}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <span className="text-sm text-gray-300">{label}</span>
                </label>
              ))}
            </div>

            {/* Summary */}
            <div className="text-xs text-gray-500 bg-white/5 rounded-xl p-3">
              {settings.outputResolution === "original" ? "Original" : settings.outputResolution} · {clips.length} clip{clips.length !== 1 ? "s" : ""} · {totalSecs.toFixed(1)}s total
            </div>

            <button type="button" onClick={handleExport}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-orange-600 to-amber-500 text-white hover:from-orange-500 hover:to-amber-400 transition">
              Export Video
            </button>
          </>
        )}

        {/* ── Processing ──────────────────────────────────────── */}
        {state.status === "processing" && (
          <div className="flex flex-col items-center gap-5 py-4">
            {/* Animated ring */}
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                <circle
                  cx="32" cy="32" r="28" fill="none"
                  stroke="url(#exportGrad)" strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - state.progress / 100)}`}
                  className="transition-all duration-300"
                />
                <defs>
                  <linearGradient id="exportGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#ea580c" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                {state.progress}%
              </span>
            </div>

            {/* Bar */}
            <div className="w-full">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>Exporting…</span>
                <span className="text-gray-500">{eta}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
                  style={{ width: `${state.progress}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Keep this tab visible for best results
            </p>

            <button type="button" onClick={handleCancel}
              className="px-6 py-2 rounded-xl border border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition text-sm font-medium">
              Cancel
            </button>
          </div>
        )}

        {/* ── Done ───────────────────────────────────────────── */}
        {state.status === "done" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              <CheckCircleIcon className="w-6 h-6 text-green-400 shrink-0" />
              <div>
                <p className="text-green-300 font-semibold text-sm">Export complete!</p>
                <p className="text-green-200/70 text-xs mt-0.5">Your highlight reel is ready.</p>
              </div>
            </div>

            <button type="button" onClick={handleDownload}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold hover:from-orange-500 hover:to-amber-400 transition">
              <ArrowDownTrayIcon className="w-5 h-5" />
              Download to Device
            </button>

            {user && (
              profileUpdated ? (
                <div className="flex items-center gap-2 justify-center text-green-400 text-sm">
                  <CheckCircleIcon className="w-4 h-4" />
                  Profile highlight updated!
                </div>
              ) : (
                <button type="button" onClick={handleUpdateProfile} disabled={uploadingProfile}
                  className="w-full py-2.5 rounded-xl border border-white/20 text-gray-300 hover:bg-white/10 transition text-sm font-medium disabled:opacity-60">
                  {uploadingProfile ? "Updating profile…" : "Replace Profile Highlight Video"}
                </button>
              )
            )}

            <button type="button"
              onClick={() => setState({ status: "idle", progress: 0 })}
              className="text-center text-sm text-gray-500 hover:text-gray-300 transition">
              Export again with different settings
            </button>
          </div>
        )}

        {/* ── Error ──────────────────────────────────────────── */}
        {state.status === "error" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 font-semibold text-sm">Export failed</p>
                <p className="text-red-200/70 text-xs mt-1">{state.error}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Keep the tab visible and active while exporting.
            </p>
            <button type="button"
              onClick={() => setState({ status: "idle", progress: 0 })}
              className="w-full py-2.5 rounded-xl border border-white/20 text-gray-300 hover:bg-white/10 transition text-sm font-medium">
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

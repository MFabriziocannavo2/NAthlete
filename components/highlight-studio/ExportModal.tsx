"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { exportClips, checkExportSupport } from "@/lib/videoExport";
import type { Clip, EditorSettings, ExportState } from "./types";

interface Props {
  clips: Clip[];
  settings: EditorSettings;
  onSettingsChange: (s: Partial<EditorSettings>) => void;
  onClose: () => void;
}

export default function ExportModal({ clips, settings, onSettingsChange, onClose }: Props) {
  const { user } = useAuth();
  const [state, setState] = useState<ExportState>({ status: "idle", progress: 0 });
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [profileUpdated, setProfileUpdated] = useState(false);
  const support = checkExportSupport();
  const outputUrlRef = useRef<string | null>(null);

  // Revoke blob URL on unmount
  useEffect(() => {
    return () => { if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current); };
  }, []);

  const handleExport = async () => {
    if (!support.supported) return;
    setState({ status: "processing", progress: 0 });

    try {
      const blob = await exportClips(clips, settings, (p) =>
        setState((prev) => ({ ...prev, progress: Math.round(p) }))
      );
      const url = URL.createObjectURL(blob);
      outputUrlRef.current = url;
      setState({ status: "done", progress: 100, outputUrl: url, outputBlob: blob });
    } catch (err) {
      setState({
        status: "error",
        progress: 0,
        error: err instanceof Error ? err.message : "Export failed",
      });
    }
  };

  const handleDownload = () => {
    if (!state.outputUrl) return;
    const a = document.createElement("a");
    a.href = state.outputUrl;
    a.download = `${settings.title || "highlight"}.webm`;
    a.click();
  };

  const handleUpdateProfile = async () => {
    if (!state.outputBlob || !user) return;
    setUploadingProfile(true);
    try {
      const fileName = `${user.id}/${Date.now()}.webm`;
      const { data, error } = await supabase.storage
        .from("highlight-videos")
        .upload(fileName, state.outputBlob, { contentType: "video/webm", upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from("highlight-videos").getPublicUrl(data.path);
      await supabase
        .from("athletes")
        .update({ highlight_video: urlData.publicUrl })
        .eq("user_id", user.id);

      setProfileUpdated(true);
    } catch {
      alert("Could not update profile. Make sure the 'highlight-videos' storage bucket exists in Supabase.");
    } finally {
      setUploadingProfile(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl border border-white/10 shadow-2xl p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-lg">Export Highlight</h3>
          {state.status !== "processing" && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Browser not supported */}
        {!support.supported && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-300 font-medium text-sm">Export not available</p>
              <p className="text-yellow-200/70 text-xs mt-1">{support.reason}</p>
              <p className="text-gray-400 text-xs mt-2">
                Use Chrome or Firefox on desktop for full export support.
              </p>
            </div>
          </div>
        )}

        {/* Settings */}
        {state.status === "idle" && support.supported && (
          <>
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

            <div className="flex flex-col gap-3">
              <p className="text-xs text-gray-400 font-medium">Options</p>
              {[
                { key: "muteAudio", label: "Mute original audio" },
                { key: "fadeIn", label: "Fade in (first clip)" },
                { key: "fadeOut", label: "Fade out (last clip)" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[key as keyof EditorSettings] as boolean}
                    onChange={(e) => onSettingsChange({ [key]: e.target.checked })}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <span className="text-sm text-gray-300">{label}</span>
                </label>
              ))}
            </div>

            <div className="text-xs text-gray-500 bg-white/5 rounded-xl p-3">
              Output: 1280×720 WebM · {clips.length} clip{clips.length !== 1 ? "s" : ""} ·{" "}
              {clips.reduce((s, c) => s + (c.trimEnd - c.trimStart), 0).toFixed(1)}s total
            </div>

            <button
              type="button"
              onClick={handleExport}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-orange-600 to-amber-500 text-white hover:from-orange-500 hover:to-amber-400 transition"
            >
              Export Video
            </button>
          </>
        )}

        {/* Processing */}
        {state.status === "processing" && (
          <div className="flex flex-col items-center gap-5 py-4">
            <div className="w-14 h-14 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
            <div className="w-full">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>Exporting…</span>
                <span>{state.progress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
                  style={{ width: `${state.progress}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Keep this tab active for best results
            </p>
          </div>
        )}

        {/* Done */}
        {state.status === "done" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              <CheckCircleIcon className="w-6 h-6 text-green-400 shrink-0" />
              <div>
                <p className="text-green-300 font-semibold text-sm">Export complete!</p>
                <p className="text-green-200/70 text-xs mt-0.5">Your highlight reel is ready.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold hover:from-orange-500 hover:to-amber-400 transition"
            >
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
                <button
                  type="button"
                  onClick={handleUpdateProfile}
                  disabled={uploadingProfile}
                  className="w-full py-2.5 rounded-xl border border-white/20 text-gray-300 hover:bg-white/10 transition text-sm font-medium disabled:opacity-60"
                >
                  {uploadingProfile ? "Updating profile…" : "Replace Profile Highlight Video"}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => setState({ status: "idle", progress: 0 })}
              className="text-center text-sm text-gray-500 hover:text-gray-300 transition"
            >
              Export again with different settings
            </button>
          </div>
        )}

        {/* Error */}
        {state.status === "error" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 font-semibold text-sm">Export failed</p>
                <p className="text-red-200/70 text-xs mt-1">{state.error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setState({ status: "idle", progress: 0 })}
              className="w-full py-2.5 rounded-xl border border-white/20 text-gray-300 hover:bg-white/10 transition text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

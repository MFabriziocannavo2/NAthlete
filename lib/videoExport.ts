import type {
  Clip,
  EditorSettings,
  ExportSupport,
  OutputResolution,
  TextOverlay,
} from "@/components/highlight-studio/types";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ExportCapability extends ExportSupport {
  mimeType: string;
  canRecord: boolean;
  isIOS: boolean;
  isSafari: boolean;
  fileExtension: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Browser detection
// ─────────────────────────────────────────────────────────────────────────────

function detectIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function detectSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

function chooseMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4;codecs=avc1",
    "video/mp4",
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

export function detectExportCapability(): ExportCapability {
  const isIOS = detectIOS();
  const isSafari = detectSafari();

  if (typeof window === "undefined") {
    return { supported: false, reason: "Server environment", mimeType: "", canRecord: false, isIOS, isSafari, fileExtension: "webm" };
  }

  // iOS / Safari without MediaRecorder → offer per-clip download fallback
  if (isIOS) {
    return { supported: true, mimeType: "", canRecord: false, isIOS, isSafari, fileExtension: "webm" };
  }

  if (typeof MediaRecorder === "undefined") {
    return {
      supported: false,
      reason: "MediaRecorder is not available. Use Chrome, Firefox, or Edge for export.",
      mimeType: "", canRecord: false, isIOS, isSafari, fileExtension: "webm",
    };
  }

  const canvas = document.createElement("canvas");
  if (!canvas.captureStream) {
    return {
      supported: false,
      reason: "canvas.captureStream is not supported in this browser.",
      mimeType: "", canRecord: false, isIOS, isSafari, fileExtension: "webm",
    };
  }

  const mime = chooseMimeType();
  if (!mime) {
    // Safari desktop with no video MIME support → fallback
    if (isSafari) {
      return { supported: true, mimeType: "", canRecord: false, isIOS, isSafari, fileExtension: "webm" };
    }
    return {
      supported: false,
      reason: "No supported video recording format found. Use Chrome or Firefox.",
      mimeType: "", canRecord: false, isIOS, isSafari, fileExtension: "webm",
    };
  }

  const ext = mime.includes("mp4") ? "mp4" : "webm";
  return { supported: true, mimeType: mime, canRecord: true, isIOS, isSafari, fileExtension: ext };
}

/** Backward-compat shim used by ExportModal before the capability refactor. */
export function checkExportSupport(): ExportSupport {
  const cap = detectExportCapability();
  return { supported: cap.supported && cap.canRecord, reason: cap.reason };
}

// ─────────────────────────────────────────────────────────────────────────────
// Canvas helpers
// ─────────────────────────────────────────────────────────────────────────────

function drawLetterboxed(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  W: number,
  H: number,
) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  if (!video.videoWidth || !video.videoHeight) return;
  const scale = Math.min(W / video.videoWidth, H / video.videoHeight);
  const w = video.videoWidth * scale;
  const h = video.videoHeight * scale;
  ctx.drawImage(video, (W - w) / 2, (H - h) / 2, w, h);
}

function applyFadeOverlay(
  ctx: CanvasRenderingContext2D,
  alpha: number,
  W: number,
  H: number,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, Math.max(0, alpha));
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function drawTextOverlays(
  ctx: CanvasRenderingContext2D,
  overlays: TextOverlay[],
  W: number,
  H: number,
) {
  const scale = W / 1280;
  for (const ov of overlays) {
    ctx.save();
    ctx.font = `bold ${Math.round(ov.fontSize * scale)}px system-ui, Arial, sans-serif`;
    ctx.fillStyle = ov.color;
    ctx.textAlign = ov.align;
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.85)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillText(ov.text, ov.x * W, ov.y * H);
    ctx.restore();
  }
}

/** Keep the MediaRecorder fed with solid-black frames during the gap between clips. */
function holdBlackFrames(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, ms: number): Promise<void> {
  return new Promise((resolve) => {
    const end = performance.now() + ms;
    const draw = () => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (performance.now() < end) requestAnimationFrame(draw);
      else resolve();
    };
    requestAnimationFrame(draw);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Resolution
// ─────────────────────────────────────────────────────────────────────────────

const RESOLUTION_MAP: Record<Exclude<OutputResolution, "original">, { w: number; h: number }> = {
  "480p": { w: 854,  h: 480  },
  "720p": { w: 1280, h: 720  },
  "1080p": { w: 1920, h: 1080 },
};

async function resolveOutputSize(
  clips: Clip[],
  resolution: OutputResolution,
): Promise<{ w: number; h: number }> {
  if (resolution !== "original") return RESOLUTION_MAP[resolution];
  // Detect from the first clip's native dimensions
  return new Promise((resolve) => {
    const v = document.createElement("video");
    v.src = clips[0].src;
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      const w = v.videoWidth  || 1280;
      const h = v.videoHeight || 720;
      v.src = "";
      resolve({ w, h });
    };
    v.onerror = () => resolve({ w: 1280, h: 720 });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-clip renderer
// ─────────────────────────────────────────────────────────────────────────────

const TRANSITION_SECS = 0.25;

type VideoFrameCallback = (now: DOMHighResTimeStamp, metadata: { mediaTime: number }) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VideoElementEx = HTMLVideoElement & Record<string, any>;

function scheduleVideoFrame(video: VideoElementEx, cb: VideoFrameCallback): number {
  if (typeof video.requestVideoFrameCallback === "function") {
    return video.requestVideoFrameCallback(cb) as number;
  }
  return 0;
}

function cancelVideoFrame(video: VideoElementEx, id: number) {
  if (id && typeof video.cancelVideoFrameCallback === "function") {
    video.cancelVideoFrameCallback(id);
  }
}

function supportsVFC(video: VideoElementEx): boolean {
  return typeof video.requestVideoFrameCallback === "function";
}

async function renderClip(
  clip: Clip,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  audioCtx: AudioContext,
  audioDest: MediaStreamAudioDestinationNode,
  settings: EditorSettings,
  clipIndex: number,
  totalClips: number,
  onProgress: (p: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Export cancelled", "AbortError"));
      return;
    }

    const video = document.createElement("video") as VideoElementEx;
    video.src = clip.src;
    video.muted = true;
    video.preload = "auto";

    // Color grade
    const { brightness = 1, contrast = 1, saturation = 1, hueRotate = 0 } = clip.colorGrade ?? {};
    const overlays = clip.textOverlays ?? [];
    const isGraded = brightness !== 1 || contrast !== 1 || saturation !== 1 || hueRotate !== 0;
    const gradeFilter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) hue-rotate(${hueRotate}deg)`;

    const speed = clip.speed || 1;
    const clipDuration = (clip.trimEnd - clip.trimStart) / speed; // wall-clock seconds
    const W = canvas.width;
    const H = canvas.height;

    let rafId = 0;
    let vfcbId = 0;
    let resolved = false;

    // Audio routing
    let audioSource: MediaElementAudioSourceNode | null = null;
    if (!settings.muteAudio) {
      try {
        audioSource = audioCtx.createMediaElementSource(video);
        audioSource.connect(audioDest);
      } catch { /* not available */ }
    }

    // ── watchdog timer ──────────────────────────────────────────
    // If the clip takes >2× its expected duration + 15s, abort with an error.
    const watchdogMs = Math.max(30_000, clipDuration * 2_000 + 15_000);
    let watchdogTimer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
      if (!resolved) {
        cleanup();
        reject(new Error(
          `Clip "${clip.name}" timed out during export. ` +
          "Keep the browser tab visible and focused while exporting."
        ));
      }
    }, watchdogMs);

    const cleanup = () => {
      cancelAnimationFrame(rafId);
      cancelVideoFrame(video, vfcbId);
      if (watchdogTimer) { clearTimeout(watchdogTimer); watchdogTimer = null; }
      video.pause();
      try { audioSource?.disconnect(); } catch { /* ignore */ }
      signal?.removeEventListener("abort", onAbort);
      // Delay src clear so the last frame stays on canvas
      setTimeout(() => { video.src = ""; }, 60);
    };

    const finish = () => {
      if (resolved) return;
      resolved = true;
      // Paint final frame
      if (isGraded) ctx.filter = gradeFilter;
      drawLetterboxed(ctx, video, W, H);
      ctx.filter = "none";
      drawTextOverlays(ctx, overlays, W, H);
      cleanup();
      onProgress(((clipIndex + 1) / totalClips) * 100);
      resolve();
    };

    // ── per-frame draw ──────────────────────────────────────────
    const drawFrame = () => {
      if (resolved) return;

      const elapsed = (video.currentTime - clip.trimStart) / speed;

      if (
        elapsed >= clipDuration - 0.05 ||
        video.ended ||
        video.currentTime >= clip.trimEnd - 0.05
      ) {
        finish();
        return;
      }

      // Draw video frame with optional color grade
      if (isGraded) ctx.filter = gradeFilter;
      drawLetterboxed(ctx, video, W, H);
      ctx.filter = "none";

      // Fade in
      if (clipIndex === 0 && settings.fadeIn && elapsed < 1) {
        applyFadeOverlay(ctx, 1 - elapsed, W, H);
      } else if (clipIndex > 0 && elapsed < TRANSITION_SECS) {
        applyFadeOverlay(ctx, 1 - elapsed / TRANSITION_SECS, W, H);
      }

      // Fade out
      if (clipIndex === totalClips - 1 && settings.fadeOut && elapsed > clipDuration - 1) {
        applyFadeOverlay(ctx, elapsed - (clipDuration - 1), W, H);
      } else if (clipIndex < totalClips - 1 && elapsed > clipDuration - TRANSITION_SECS) {
        applyFadeOverlay(
          ctx,
          (elapsed - (clipDuration - TRANSITION_SECS)) / TRANSITION_SECS,
          W, H,
        );
      }

      drawTextOverlays(ctx, overlays, W, H);
      onProgress(((clipIndex + elapsed / clipDuration) / totalClips) * 100);

      // Prefer requestVideoFrameCallback (Chrome 83+) for perfect decoder sync;
      // fall back to rAF on Firefox/Edge.
      if (supportsVFC(video)) {
        vfcbId = scheduleVideoFrame(video, () => drawFrame());
      } else {
        rafId = requestAnimationFrame(drawFrame);
      }
    };

    // ── abort support ───────────────────────────────────────────
    const onAbort = () => {
      cleanup();
      reject(new DOMException("Export cancelled", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort);

    // ── ontimeupdate fallback ───────────────────────────────────
    // Fires ~4× per second even in background tabs — catches clip end
    // even when rAF / requestVideoFrameCallback are throttled.
    video.ontimeupdate = () => {
      if (resolved) return;
      if (video.currentTime >= clip.trimEnd - 0.1 || video.ended) {
        finish();
      }
      // Keep progress moving even when rAF is paused
      const elapsed = (video.currentTime - clip.trimStart) / speed;
      if (elapsed > 0) {
        onProgress(((clipIndex + Math.min(1, elapsed / clipDuration)) / totalClips) * 100);
      }
    };

    video.onended = finish;
    video.onerror = () => {
      cleanup();
      reject(new Error(`Cannot load clip: ${clip.name}`));
    };

    // ── start playback once ─────────────────────────────────────
    let playStarted = false;
    const startPlayback = () => {
      if (playStarted || resolved) return;
      playStarted = true;
      video.playbackRate = speed;
      video
        .play()
        .then(() => {
          if (supportsVFC(video)) {
            vfcbId = scheduleVideoFrame(video, () => drawFrame());
          } else {
            rafId = requestAnimationFrame(drawFrame);
          }
        })
        .catch((e) => { cleanup(); reject(e); });
    };

    video.onloadedmetadata = () => {
      video.playbackRate = speed;
      video.currentTime = Math.max(0, clip.trimStart);
    };
    video.onseeked = startPlayback;
    video.oncanplay = startPlayback; // fallback when trimStart = 0 (no seek fires)
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export entry point
// ─────────────────────────────────────────────────────────────────────────────

export async function exportClips(
  clips: Clip[],
  settings: EditorSettings,
  onProgress: (progress: number) => void,
  signal?: AbortSignal,
): Promise<Blob> {
  if (clips.length === 0) throw new Error("No clips to export.");

  const { w: WIDTH, h: HEIGHT } = await resolveOutputSize(clips, settings.outputResolution);
  const FPS = 30;

  // ── canvas ────────────────────────────────────────────────────
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // ── audio graph ───────────────────────────────────────────────
  const AudioCtxClass =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioCtxClass();
  await audioCtx.resume(); // browsers start suspended
  const audioDest = audioCtx.createMediaStreamDestination();

  // ── recorder ──────────────────────────────────────────────────
  const cap = detectExportCapability();
  if (!cap.canRecord) throw new Error("Video recording is not supported in this browser.");

  const canvasStream = canvas.captureStream(FPS);
  if (!settings.muteAudio) {
    const audioTrack = audioDest.stream.getAudioTracks()[0];
    if (audioTrack) canvasStream.addTrack(audioTrack);
  }

  // Background music
  let bgAudio: HTMLAudioElement | null = null;
  let bgSource: MediaElementAudioSourceNode | null = null;
  if (!settings.muteAudio && settings.backgroundMusicUrl) {
    try {
      bgAudio = new Audio(settings.backgroundMusicUrl);
      bgAudio.loop = true;
      bgAudio.muted = true;
      bgSource = audioCtx.createMediaElementSource(bgAudio);
      const bgGain = audioCtx.createGain();
      bgGain.gain.value = settings.backgroundMusicVolume ?? 0.3;
      bgSource.connect(bgGain);
      bgGain.connect(audioDest);
    } catch {
      bgAudio = null;
    }
  }

  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(canvasStream, {
    mimeType: cap.mimeType,
    videoBitsPerSecond: WIDTH >= 1920 ? 12_000_000 : WIDTH >= 1280 ? 6_000_000 : 3_000_000,
  });
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  recorder.start(100); // collect data every 100ms for smoother progress
  bgAudio?.play().catch(() => {});
  onProgress(2); // immediate feedback that something started

  try {
    for (let i = 0; i < clips.length; i++) {
      if (signal?.aborted) throw new DOMException("Export cancelled", "AbortError");
      await renderClip(
        clips[i], canvas, ctx, audioCtx, audioDest,
        settings, i, clips.length, onProgress, signal,
      );
      // Bridge the loading gap between clips with solid black frames
      if (i < clips.length - 1) {
        await holdBlackFrames(canvas, ctx, 150);
      }
    }
  } finally {
    bgAudio?.pause();
    bgSource?.disconnect();
    await new Promise<void>((res) => {
      recorder.onstop = () => res();
      recorder.stop();
    });
    canvasStream.getTracks().forEach((t) => t.stop());
    audioCtx.close();
  }

  return new Blob(chunks, { type: cap.mimeType });
}

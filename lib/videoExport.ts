import type { Clip, EditorSettings, ExportSupport, OutputResolution, TextOverlay } from "@/components/highlight-studio/types";

const TRANSITION_SECS = 0.25; // crossfade duration between clips

/** Returns whether the browser can export video via canvas + MediaRecorder. */
export function checkExportSupport(): ExportSupport {
  if (typeof window === "undefined") {
    return { supported: false, reason: "Server environment" };
  }
  if (!("MediaRecorder" in window)) {
    return { supported: false, reason: "MediaRecorder is not supported in this browser. Try Chrome or Firefox." };
  }
  const canvas = document.createElement("canvas");
  if (!canvas.captureStream) {
    return { supported: false, reason: "canvas.captureStream is not supported in this browser." };
  }
  return { supported: true };
}

/** Pick the best supported MIME type for the MediaRecorder. */
function chooseMimeType(): string {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? "video/webm";
}

/** Letterbox a video frame onto a canvas. */
function drawLetterboxed(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  canvasW: number,
  canvasH: number
) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvasW, canvasH);
  if (!video.videoWidth || !video.videoHeight) return;
  const scale = Math.min(canvasW / video.videoWidth, canvasH / video.videoHeight);
  const w = video.videoWidth * scale;
  const h = video.videoHeight * scale;
  ctx.drawImage(video, (canvasW - w) / 2, (canvasH - h) / 2, w, h);
}

/** Overlay a black rect with given alpha (0 = transparent, 1 = fully black). */
function applyFadeOverlay(
  ctx: CanvasRenderingContext2D,
  alpha: number,
  canvasW: number,
  canvasH: number
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, Math.max(0, alpha));
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvasW, canvasH);
  ctx.restore();
}

/** Burn text overlays onto the canvas at their normalized positions. */
function drawTextOverlays(
  ctx: CanvasRenderingContext2D,
  overlays: TextOverlay[],
  canvasW: number,
  canvasH: number
) {
  for (const ov of overlays) {
    ctx.save();
    const scale = canvasW / 1280;
    ctx.font = `bold ${Math.round(ov.fontSize * scale)}px system-ui, Arial, sans-serif`;
    ctx.fillStyle = ov.color;
    ctx.textAlign = ov.align;
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.85)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillText(ov.text, ov.x * canvasW, ov.y * canvasH);
    ctx.restore();
  }
}

/**
 * Draw solid black frames for `durationMs` milliseconds.
 * Keeps the rAF loop alive during the loading gap between clips.
 */
function holdBlackFrames(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  durationMs: number
): Promise<void> {
  return new Promise((resolve) => {
    const end = performance.now() + durationMs;
    const draw = () => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (performance.now() < end) requestAnimationFrame(draw);
      else resolve();
    };
    requestAnimationFrame(draw);
  });
}

/** Render one clip to the canvas while the recorder is running. */
async function renderClip(
  clip: Clip,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  audioCtx: AudioContext,
  audioDest: MediaStreamAudioDestinationNode,
  settings: EditorSettings,
  clipIndex: number,
  totalClips: number,
  onProgress: (p: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = clip.src;
    video.muted = true;
    video.preload = "auto";

    let audioSource: MediaElementAudioSourceNode | null = null;
    if (!settings.muteAudio) {
      try {
        audioSource = audioCtx.createMediaElementSource(video);
        audioSource.connect(audioDest);
      } catch {
        // audio capture unavailable — skip
      }
    }

    let rafId: number;
    let playStarted = false;
    const clipDuration = clip.trimEnd - clip.trimStart;
    const targetStart = Math.max(0, clip.trimStart);

    // Defensive defaults
    const { brightness = 1, contrast = 1, saturation = 1, hueRotate = 0 } = clip.colorGrade ?? {};
    const overlays = clip.textOverlays ?? [];
    const isGraded = brightness !== 1 || contrast !== 1 || saturation !== 1 || hueRotate !== 0;
    const gradeFilter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) hue-rotate(${hueRotate}deg)`;

    const cleanup = () => {
      cancelAnimationFrame(rafId);
      video.pause();
      try { audioSource?.disconnect(); } catch { /* ignore */ }
      // Delay src clear so the last frame stays on canvas for a moment
      setTimeout(() => { video.src = ""; }, 50);
    };

    const drawFrame = () => {
      const elapsed = video.currentTime - clip.trimStart;

      if (video.currentTime >= clip.trimEnd - 0.05 || video.ended) {
        // Draw final frame
        if (isGraded) ctx.filter = gradeFilter;
        drawLetterboxed(ctx, video, canvas.width, canvas.height);
        ctx.filter = "none";
        drawTextOverlays(ctx, overlays, canvas.width, canvas.height);
        cleanup();
        onProgress(((clipIndex + 1) / totalClips) * 100);
        resolve();
        return;
      }

      // Draw frame with color grade
      if (isGraded) ctx.filter = gradeFilter;
      drawLetterboxed(ctx, video, canvas.width, canvas.height);
      ctx.filter = "none";

      // — Fade in —
      if (clipIndex === 0 && settings.fadeIn && elapsed < 1) {
        // User-controlled fade for the very first clip
        applyFadeOverlay(ctx, 1 - elapsed, canvas.width, canvas.height);
      } else if (clipIndex > 0 && elapsed < TRANSITION_SECS) {
        // Auto crossfade from black at the start of every non-first clip
        applyFadeOverlay(ctx, 1 - elapsed / TRANSITION_SECS, canvas.width, canvas.height);
      }

      // — Fade out —
      if (clipIndex === totalClips - 1 && settings.fadeOut && elapsed > clipDuration - 1) {
        // User-controlled fade for the very last clip
        applyFadeOverlay(ctx, elapsed - (clipDuration - 1), canvas.width, canvas.height);
      } else if (clipIndex < totalClips - 1 && elapsed > clipDuration - TRANSITION_SECS) {
        // Auto crossfade to black at the end of every non-last clip
        applyFadeOverlay(
          ctx,
          (elapsed - (clipDuration - TRANSITION_SECS)) / TRANSITION_SECS,
          canvas.width,
          canvas.height
        );
      }

      drawTextOverlays(ctx, overlays, canvas.width, canvas.height);
      onProgress(((clipIndex + elapsed / clipDuration) / totalClips) * 100);
      rafId = requestAnimationFrame(drawFrame);
    };

    // Guard: start playback exactly once regardless of which event fires first
    const startPlayback = () => {
      if (playStarted) return;
      playStarted = true;
      video.playbackRate = clip.speed ?? 1;
      video
        .play()
        .then(() => { rafId = requestAnimationFrame(drawFrame); })
        .catch((e) => { cleanup(); reject(e); });
    };

    video.onloadedmetadata = () => {
      video.playbackRate = clip.speed ?? 1;
      video.currentTime = targetStart;
      // If trimStart=0, currentTime is already 0 and onseeked may not fire.
      // oncanplay serves as the fallback trigger.
    };

    // onseeked fires after a successful seek (trimStart > 0 case)
    video.onseeked = startPlayback;

    // oncanplay fires once enough data is ready — fallback for trimStart=0
    video.oncanplay = startPlayback;

    video.onerror = () => {
      cleanup();
      reject(new Error(`Cannot load clip: ${clip.name}`));
    };
  });
}

const RESOLUTION: Record<OutputResolution, { w: number; h: number }> = {
  "480p":  { w: 854,  h: 480  },
  "720p":  { w: 1280, h: 720  },
  "1080p": { w: 1920, h: 1080 },
};

/**
 * Export an array of trimmed clips to a single WebM video Blob.
 * Runs entirely in the browser via canvas + MediaRecorder.
 */
export async function exportClips(
  clips: Clip[],
  settings: EditorSettings,
  onProgress: (progress: number) => void
): Promise<Blob> {
  if (clips.length === 0) throw new Error("No clips to export.");

  const { w: WIDTH, h: HEIGHT } = RESOLUTION[settings.outputResolution];
  const FPS = 30;

  // Canvas
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Audio routing
  const AudioCtxClass =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioCtxClass();
  // Resume in case browser starts the context suspended
  await audioCtx.resume();
  const audioDest = audioCtx.createMediaStreamDestination();

  // Recorder
  const mimeType = chooseMimeType();
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
    mimeType,
    videoBitsPerSecond: 6_000_000,
  });
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.start(250);
  bgAudio?.play().catch(() => {});

  try {
    for (let i = 0; i < clips.length; i++) {
      await renderClip(
        clips[i],
        canvas,
        ctx,
        audioCtx,
        audioDest,
        settings,
        i,
        clips.length,
        onProgress
      );
      // Hold black frames between clips to cover the loading gap.
      // The clip already fades to black at the end, so this bridges cleanly.
      if (i < clips.length - 1) {
        await holdBlackFrames(canvas, ctx, 120);
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

  return new Blob(chunks, { type: mimeType });
}

import type { Clip, EditorSettings, ExportSupport, OutputResolution } from "@/components/highlight-studio/types";

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

/** Overlay a fade (black rect with alpha) on the canvas. */
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
    video.muted = true; // prevent speaker feedback; audio goes via AudioContext
    video.preload = "auto";

    let audioSource: MediaElementAudioSourceNode | null = null;

    if (!settings.muteAudio) {
      try {
        audioSource = audioCtx.createMediaElementSource(video);
        audioSource.connect(audioDest);
      } catch {
        // Audio capture unavailable for this element — skip audio
      }
    }

    let rafId: number;
    const clipDuration = clip.trimEnd - clip.trimStart;

    const cleanup = () => {
      cancelAnimationFrame(rafId);
      video.pause();
      try { audioSource?.disconnect(); } catch { /* ignore */ }
      video.src = "";
    };

    const drawFrame = () => {
      const elapsed = video.currentTime - clip.trimStart;

      if (video.currentTime >= clip.trimEnd - 0.05 || video.ended) {
        drawLetterboxed(ctx, video, canvas.width, canvas.height);
        cleanup();
        onProgress(((clipIndex + 1) / totalClips) * 100);
        resolve();
        return;
      }

      drawLetterboxed(ctx, video, canvas.width, canvas.height);

      // Fade in — first clip
      if (settings.fadeIn && clipIndex === 0 && elapsed < 1) {
        applyFadeOverlay(ctx, 1 - elapsed, canvas.width, canvas.height);
      }
      // Fade out — last clip
      if (settings.fadeOut && clipIndex === totalClips - 1 && elapsed > clipDuration - 1) {
        applyFadeOverlay(ctx, elapsed - (clipDuration - 1), canvas.width, canvas.height);
      }

      onProgress(((clipIndex + elapsed / clipDuration) / totalClips) * 100);
      rafId = requestAnimationFrame(drawFrame);
    };

    video.onloadedmetadata = () => {
      video.playbackRate = clip.speed ?? 1;
      video.currentTime = Math.max(0, clip.trimStart);
    };

    video.onseeked = () => {
      video.playbackRate = clip.speed ?? 1;
      video
        .play()
        .then(() => { rafId = requestAnimationFrame(drawFrame); })
        .catch((e) => { cleanup(); reject(e); });
    };

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
  const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioCtx();
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
  let bgGain: GainNode | null = null;
  if (!settings.muteAudio && settings.backgroundMusicUrl) {
    try {
      bgAudio = new Audio(settings.backgroundMusicUrl);
      bgAudio.loop = true;
      bgAudio.muted = true;
      bgSource = audioCtx.createMediaElementSource(bgAudio);
      bgGain = audioCtx.createGain();
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
    }
  } finally {
    bgAudio?.pause();
    bgSource?.disconnect();
    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      recorder.stop();
    });
    canvasStream.getTracks().forEach((t) => t.stop());
    audioCtx.close();
  }

  return new Blob(chunks, { type: mimeType });
}

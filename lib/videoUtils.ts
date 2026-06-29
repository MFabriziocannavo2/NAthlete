/** Generate a thumbnail data-URL from a video object-URL. */
export async function generateThumbnail(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = src;
    video.muted = true;
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(0.5, video.duration * 0.1);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 192;
        canvas.height = 108;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, 192, 108);
        const scale = Math.min(192 / video.videoWidth, 108 / video.videoHeight);
        const w = video.videoWidth * scale;
        const h = video.videoHeight * scale;
        ctx.drawImage(video, (192 - w) / 2, (108 - h) / 2, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      } catch {
        resolve(""); // tainted canvas (CORS) — no thumbnail
      }
    };

    video.onerror = () => reject(new Error("Could not load video"));
  });
}

/** Get the duration of a video object-URL in seconds. */
export async function getVideoDuration(src: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = src;
    video.preload = "metadata";
    video.onloadedmetadata = () => resolve(video.duration);
    video.onerror = () => reject(new Error("Could not load video"));
  });
}

/** Format seconds → "m:ss" or "h:mm:ss" */
export function formatDuration(seconds: number): string {
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

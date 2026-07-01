export interface TextOverlay {
  id: string;
  text: string;
  x: number;          // 0–1 normalized (0 = left, 1 = right)
  y: number;          // 0–1 normalized (0 = top,  1 = bottom)
  fontSize: number;   // px at 1280-wide reference canvas
  color: string;      // CSS hex color
  align: CanvasTextAlign;
}

export interface ColorGrade {
  brightness: number; // 0.5–2, default 1
  contrast: number;   // 0.5–2, default 1
  saturation: number; // 0–2,   default 1
  hueRotate: number;  // 0–360 degrees, default 0
}

export const DEFAULT_COLOR_GRADE: ColorGrade = {
  brightness: 1,
  contrast: 1,
  saturation: 1,
  hueRotate: 0,
};

export type OutputResolution = "480p" | "720p" | "1080p";

export interface Clip {
  id: string;
  src: string;          // Object URL from local file
  file: File;
  name: string;
  duration: number;     // total seconds
  trimStart: number;    // seconds
  trimEnd: number;      // seconds
  thumbnail?: string;   // base64 data URL
  speed: number;        // playback rate: 0.25 | 0.5 | 0.75 | 1 | 1.5 | 2
  textOverlays: TextOverlay[];
  colorGrade: ColorGrade;
}

export interface EditorSettings {
  title: string;
  muteAudio: boolean;
  fadeIn: boolean;
  fadeOut: boolean;
  backgroundMusicFile?: File;
  backgroundMusicUrl?: string;
  backgroundMusicVolume: number;
  outputResolution: OutputResolution;
}

export type ExportStatus = "idle" | "processing" | "done" | "error";

export interface ExportState {
  status: ExportStatus;
  progress: number; // 0–100
  outputUrl?: string;
  outputBlob?: Blob;
  error?: string;
}

export interface ExportSupport {
  supported: boolean;
  reason?: string;
}

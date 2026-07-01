export interface Clip {
  id: string;
  src: string;        // Object URL from local file
  file: File;
  name: string;
  duration: number;   // total seconds
  trimStart: number;  // seconds
  trimEnd: number;    // seconds
  thumbnail?: string; // base64 data URL
  speed: number;      // playback rate: 0.25 | 0.5 | 0.75 | 1 | 1.5 | 2
}

export type OutputResolution = "480p" | "720p" | "1080p";

export interface EditorSettings {
  title: string;
  muteAudio: boolean;
  fadeIn: boolean;
  fadeOut: boolean;
  backgroundMusicFile?: File;   // local audio file chosen by user
  backgroundMusicUrl?: string;  // object URL derived from backgroundMusicFile
  backgroundMusicVolume: number; // 0–1
  outputResolution: OutputResolution;
}

export type ExportStatus = 'idle' | 'processing' | 'done' | 'error';

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

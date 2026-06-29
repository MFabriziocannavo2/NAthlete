export interface Clip {
  id: string;
  src: string;        // Object URL from local file
  file: File;
  name: string;
  duration: number;   // total seconds
  trimStart: number;  // seconds
  trimEnd: number;    // seconds
  thumbnail?: string; // base64 data URL

  // Future extension points (not yet implemented):
  // speed?: number;
  // textOverlays?: TextOverlay[];
  // colorGrade?: ColorGrade;
  // slowMotionSegments?: TimeRange[];
}

export interface EditorSettings {
  title: string;
  muteAudio: boolean;
  fadeIn: boolean;
  fadeOut: boolean;
  // Future:
  // backgroundMusicUrl?: string;
  // backgroundMusicVolume?: number;
  // outputResolution?: '480p' | '720p' | '1080p';
  // coachComments?: CoachComment[];
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

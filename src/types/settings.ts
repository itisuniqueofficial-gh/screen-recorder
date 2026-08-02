import type { ThemeMode } from './media';

/** A persisted recording stored in IndexedDB. */
export interface RecordingRecord {
  id: string;
  name: string;
  blob: Blob;
  mimeType: string;
  sizeBytes: number;
  durationMs: number;
  createdAt: number;
  updatedAt: number;
  width: number;
  height: number;
  fps: number;
  bitrate: number;
  codec: string;
  sourceType: string;
  audio: string;
  favorite: boolean;
}

/** Metadata-only representation of a recording (no blob). */
export interface RecordingMeta {
  id: string;
  name: string;
  sizeBytes: number;
  durationMs: number;
  createdAt: number;
  updatedAt: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
  mimeType: string;
  sourceType: string;
  audio: string;
  favorite: boolean;
}

/** A draft/crash-recovery session that may not be a complete recording yet. */
export interface RecoveryDraft {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  durationMs: number;
  createdAt: number;
  updatedAt: number;
  width: number;
  height: number;
  sourceType: string;
  audio: string;
  partial: boolean;
}

/** Application settings persisted to localStorage. */
export interface AppSettings {
  theme: ThemeMode;
  locale: string;
  countdown: number;
  defaultBitrateKbps: number;
  defaultFps: 24 | 30 | 60;
  defaultResolution: '720p' | '1080p' | '1440p' | '4k';
  defaultCodec: 'vp8' | 'vp9' | 'h264' | 'av1';
  defaultSource: 'screen' | 'window' | 'tab' | 'webcam';
  defaultAudio: 'microphone' | 'system' | 'tab' | 'mixed' | 'none';
  recordCursor: boolean;
  clickHighlight: boolean;
  watermark: boolean;
  watermarkText: string;
  autoName: boolean;
  autoDownload: boolean;
  showConfirmDialog: boolean;
  keyboardShortcutsEnabled: boolean;
  pictureInPicture: boolean;
  audioProcessing: {
    echoCancellation: boolean;
    noiseSuppression: boolean;
    autoGainControl: boolean;
  };
  outputFormat: 'webm' | 'mp4';
  gifFps: number;
  trimEnabled: boolean;
  storage: {
    maxDrafts: number;
    keepDrafts: boolean;
  };
}

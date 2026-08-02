/**
 * Media / recording type definitions shared across the application.
 */

export type RecordingSourceType = 'screen' | 'window' | 'tab' | 'webcam';

export type AudioSourceType = 'microphone' | 'system' | 'tab' | 'mixed' | 'none';

export type RecordingStatus =
  | 'idle'
  | 'acquiring'
  | 'ready'
  | 'countdown'
  | 'recording'
  | 'paused'
  | 'stopping'
  | 'processing'
  | 'error';

export type RecordStatus = 'idle' | 'active';

export type FpsOption = 24 | 30 | 60;

export type ResolutionOption = '720p' | '1080p' | '1440p' | '4k';

export type VideoCodec = 'vp8' | 'vp9' | 'h264' | 'av1';

export type ContainerFormat = 'webm' | 'mp4' | 'gif' | 'opus' | 'mp3' | 'wav';

export type ThemeMode = 'light' | 'dark' | 'system';

export type CursorMode = 'always' | 'auto' | 'hidden';

export interface ResolutionSpec {
  label: string;
  width: number;
  height: number;
}

export interface RecorderStats {
  elapsedMs: number;
  recordedBytes: number;
  droppedFrames: number;
  audioLevel: number;
  mimeType: string;
  bitrate: number;
  frameRate: number;
}

export interface RecorderOptions {
  sourceType: RecordingSourceType;
  audio: AudioSourceType;
  fps: FpsOption;
  resolution: ResolutionOption;
  bitrate: number;
  codec: VideoCodec;
  recordCursor: boolean;
  clickHighlight: boolean;
  watermark: boolean;
  watermarkText: string;
  countdown: number;
  captureSystemAudio: boolean;
  tabAudio: boolean;
  audioProcessing: {
    echoCancellation: boolean;
    noiseSuppression: boolean;
    autoGainControl: boolean;
  };
}

export type TrackKind = 'video' | 'audio';

export interface CapturedStreams {
  display: MediaStream | null;
  microphone: MediaStream | null;
  systemAudio: MediaStream | null;
  combined: MediaStream;
}

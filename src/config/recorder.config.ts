import type { AppSettings } from '@/types/settings';
import type {
  FpsOption,
  ResolutionOption,
  VideoCodec,
  RecordingSourceType,
  AudioSourceType,
} from '@/types/media';

export interface RecorderConfig {
  defaultBitrateKbps: number;
  defaultFps: FpsOption;
  defaultResolution: ResolutionOption;
  defaultCodec: VideoCodec;
  defaultSource: RecordingSourceType;
  defaultAudio: AudioSourceType;
  countdown: number;
}

export interface PerfSample {
  cpuPercent: number;
  memoryMb: number;
  droppedFrames: number;
  timestamp: number;
}

export type WorkerRequest =
  | {
      type: 'init';
      coreUrl?: string;
    }
  | {
      type: 'convert';
      input: ArrayBuffer;
      inputMime: string;
      args: string[];
    }
  | {
      type: 'progress';
      progress: number;
    }
  | {
      type: 'ping';
    };

export type WorkerResponse =
  | {
      type: 'ready';
    }
  | {
      type: 'converted';
      output: ArrayBuffer;
      mime: string;
    }
  | {
      type: 'progress';
      progress: number;
    }
  | {
      type: 'error';
      message: string;
    }
  | {
      type: 'pong';
    };

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  locale: 'en',
  countdown: 3,
  defaultBitrateKbps: 5000,
  defaultFps: 30,
  defaultResolution: '1080p',
  defaultCodec: 'vp9',
  defaultSource: 'screen',
  defaultAudio: 'microphone',
  recordCursor: true,
  clickHighlight: true,
  watermark: false,
  watermarkText: 'screenrecorder.local',
  autoName: true,
  autoDownload: false,
  showConfirmDialog: true,
  keyboardShortcutsEnabled: true,
  pictureInPicture: false,
  audioProcessing: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  outputFormat: 'webm',
  gifFps: 15,
  trimEnabled: false,
  storage: {
    maxDrafts: 10,
    keepDrafts: true,
  },
};

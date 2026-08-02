import { create } from 'zustand';
import type { RecorderOptions, RecorderStats, RecordingStatus } from '@/types/media';
import { useSettingsStore } from '@/store/settingsStore';
import { RecorderEngine, type RecordingResult } from '@/lib/recorder/RecorderEngine';
import { useHistoryStore } from '@/store/historyStore';

const DEFAULT_STATS: RecorderStats = {
  elapsedMs: 0,
  recordedBytes: 0,
  droppedFrames: 0,
  audioLevel: 0,
  mimeType: '',
  bitrate: 0,
  frameRate: 0,
};

interface RecorderStore {
  status: RecordingStatus;
  stats: RecorderStats;
  error: string | null;
  countdownRemaining: number;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<void>;
  cancel: () => void;
  clearError: () => void;
}

let engine: RecorderEngine | null = null;
let countdownTimer: ReturnType<typeof setInterval> | null = null;

function clearCountdownTimer(): void {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

function optionsFromSettings(): RecorderOptions {
  const { settings } = useSettingsStore.getState();
  return {
    sourceType: settings.defaultSource,
    audio: settings.defaultAudio,
    fps: settings.defaultFps,
    resolution: settings.defaultResolution,
    bitrate: settings.defaultBitrateKbps,
    codec: settings.defaultCodec,
    recordCursor: settings.recordCursor,
    clickHighlight: settings.clickHighlight,
    watermark: settings.watermark,
    watermarkText: settings.watermarkText,
    countdown: settings.countdown,
    captureSystemAudio: settings.defaultAudio === 'system' || settings.defaultAudio === 'mixed',
    tabAudio: settings.defaultAudio === 'tab' || settings.defaultAudio === 'mixed',
    audioProcessing: settings.audioProcessing,
  };
}

function beginCountdown(options: RecorderOptions): void {
  if (options.countdown <= 0) return;
  clearCountdownTimer();
  const startedAt = Date.now();
  setCountdown(options.countdown);
  countdownTimer = setInterval(() => {
    const remaining = Math.max(0, options.countdown - (Date.now() - startedAt) / 1000);
    const ceil = Math.ceil(remaining);
    if (ceil <= 0) {
      clearCountdownTimer();
    }
    useRecorderStore.setState((state) => ({
      countdownRemaining: ceil,
      status:
        state.status === 'countdown' || state.status === 'recording'
          ? ceil > 0
            ? 'countdown'
            : 'recording'
          : state.status,
    }));
  }, 200);
}

function setCountdown(value: number): void {
  useRecorderStore.setState({ countdownRemaining: value, status: 'countdown' });
}

export const useRecorderStore = create<RecorderStore>((set, get) => ({
  status: 'idle',
  stats: DEFAULT_STATS,
  error: null,
  countdownRemaining: 0,

  start: async () => {
    const current = get().status;
    if (current !== 'idle' && current !== 'error') return;
    set({ error: null, stats: DEFAULT_STATS });

    const next = new RecorderEngine({
      onStatus: (status) => {
        set((state) => ({
          status: status === 'recording' && state.countdownRemaining > 0 ? 'countdown' : status,
        }));
        if (status === 'idle' || status === 'error') clearCountdownTimer();
      },
      onStats: (stats) => set({ stats }),
    });

    engine = next;

    const options = optionsFromSettings();
    try {
      await next.start(options);
      if (options.countdown > 0) beginCountdown(options);
      else set({ status: 'recording' });
    } catch (error) {
      engine = null;
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to start recording',
      });
    }
  },

  pause: () => {
    if (get().status !== 'recording') return;
    clearCountdownTimer();
    engine?.pause();
    set({ status: 'paused' });
  },

  resume: () => {
    if (get().status !== 'paused') return;
    engine?.resume();
    set({ status: 'recording', countdownRemaining: 0 });
  },

  stop: async () => {
    const current = engine;
    if (!current) return;
    clearCountdownTimer();
    set({ status: 'stopping' });
    try {
      const result = await current.stop();
      if (result) {
        await useHistoryStore.getState().addResult(result);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to finalize recording' });
    } finally {
      engine = null;
      set({ status: 'idle', countdownRemaining: 0, stats: DEFAULT_STATS });
    }
  },

  cancel: () => {
    clearCountdownTimer();
    engine?.cancel();
    engine = null;
    set({ status: 'idle', countdownRemaining: 0, error: null, stats: DEFAULT_STATS });
  },

  clearError: () => set({ error: null }),
}));

export type { RecordingResult };

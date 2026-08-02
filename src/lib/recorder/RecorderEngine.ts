import type {
  AudioSourceType,
  RecorderStats,
  RecordingSourceType,
  RecorderOptions,
} from '@/types/media';
import { RESOLUTIONS } from '@/constants/media';
import { MAX_RECORDING_DURATION_MS } from '@/constants';
import { captureStreams, toCaptureConstraints } from '@/lib/capture';
import { createAudioMeter } from '@/lib/audio';
import { createProcessingStream } from '@/lib/processing';
import { combineStreams, getVideoTrack, stopStream } from '@/lib/stream';
import { mimeCandidatesForCodec, pickSupportedMimeType } from '@/utils/mime';
import { toRecorderError, RecordingFailedError } from '@/lib/errors';
import { generateRecordingName } from '@/utils/id';

export type EngineStatus = 'idle' | 'acquiring' | 'recording' | 'paused' | 'stopping' | 'error';

export interface RecordingResult {
  blob: Blob;
  name: string;
  mimeType: string;
  durationMs: number;
  sizeBytes: number;
  width: number;
  height: number;
  fps: number;
  bitrate: number;
  codec: string;
  audio: AudioSourceType;
  sourceType: RecordingSourceType;
  startedAt: number;
  endedAt: number;
}

export interface RecorderEngineEvents {
  onStatus: (status: EngineStatus, error?: string) => void;
  onStats: (stats: RecorderStats) => void;
}

const STATS_INTERVAL_MS = 500;

/**
 * Orchestrates a single recording session: acquisition, optional canvas
 * processing (scaling, watermark, cursor, click highlight) and MediaRecorder.
 * The engine is deliberately UI-agnostic; the store binds it to React state.
 */
export class RecorderEngine {
  private options: RecorderOptions | null = null;
  private streams: {
    display: MediaStream | null;
    microphone: MediaStream | null;
    systemAudio: MediaStream | null;
  } | null = null;
  private processingStop: (() => void) | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private meter: ReturnType<typeof createAudioMeter> = null;
  private startTime = 0;
  private pausedTotalMs = 0;
  private pauseStartedAt = 0;
  private status: EngineStatus = 'idle';
  private stopped = false;
  private width = 0;
  private height = 0;
  private statsTimer: ReturnType<typeof setInterval> | null = null;
  private recordedBytes = 0;

  constructor(private events: RecorderEngineEvents) {}

  getStatus(): EngineStatus {
    return this.status;
  }

  isActive(): boolean {
    return this.status === 'recording' || this.status === 'paused';
  }

  private setStatus(status: EngineStatus, error?: string): void {
    this.status = status;
    this.events.onStatus(status, error);
  }

  private get elapsedMs(): number {
    if (this.startTime === 0) return 0;
    const base = Date.now() - this.startTime;
    if (this.status === 'paused' && this.pauseStartedAt > 0) {
      return base - (Date.now() - this.pauseStartedAt) - this.pausedTotalMs;
    }
    return base - this.pausedTotalMs;
  }

  async start(options: RecorderOptions): Promise<void> {
    if (this.status !== 'idle' && this.status !== 'error') {
      throw new Error('Recording session is already active');
    }
    this.options = options;
    this.chunks = [];
    this.recordedBytes = 0;
    this.pausedTotalMs = 0;
    this.stopped = false;
    this.setStatus('acquiring');

    try {
      const constraints = toCaptureConstraints(
        options.sourceType,
        options.audio,
        { frameRate: options.fps },
        options.audioProcessing
      );
      const { streams } = await captureStreams(constraints);
      this.streams = {
        display: streams.display,
        microphone: streams.microphone,
        systemAudio: streams.systemAudio,
      };

      const recordStream = this.buildRecordStream(options);
      const mimeType = pickSupportedMimeType(mimeCandidatesForCodec(options.codec));
      const recorder = new MediaRecorder(recordStream, {
        mimeType,
        videoBitsPerSecond: options.bitrate * 1000,
      });

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
          this.recordedBytes += event.data.size;
        }
      };
      recorder.onerror = () => {
        this.setStatus('error', 'MediaRecorder encountered an error');
      };
      recorder.onstop = () => {
        this.finishRecording();
      };

      this.recorder = recorder;
      recorder.start(STATS_INTERVAL_MS);

      this.meter = createAudioMeter(recordStream);
      this.startTime = Date.now();
      this.statsTimer = setInterval(() => this.emitStats(), STATS_INTERVAL_MS);
      this.setStatus('recording');
    } catch (error) {
      this.cleanupTracks();
      this.setStatus('error', error instanceof Error ? error.message : 'Failed to start recording');
      throw toRecorderError(error);
    }
  }

  private buildRecordStream(options: RecorderOptions): MediaStream {
    const streams = this.streams;
    if (!streams) throw new Error('No streams available');

    const source = streams.display ?? combineStreams([streams.microphone, streams.systemAudio]);
    const videoTrack = getVideoTrack(source);
    if (!videoTrack) throw new Error('No video track available for recording');

    const target = RESOLUTIONS[options.resolution];
    const settings = videoTrack.getSettings();
    const nativeWidth = settings.width || target.width;
    const nativeHeight = settings.height || target.height;

    const wantsPipeline =
      options.watermark ||
      options.clickHighlight ||
      options.recordCursor ||
      nativeWidth > target.width ||
      nativeHeight > target.height;

    if (wantsPipeline) {
      const pipeline = createProcessingStream(videoTrack, {
        width: target.width,
        height: target.height,
        fps: options.fps,
        watermark: options.watermark,
        watermarkText: options.watermarkText,
        cursorMode: options.recordCursor ? 'always' : 'auto',
        clickHighlight: options.clickHighlight,
      });
      this.processingStop = pipeline.stop;
      this.width = target.width;
      this.height = target.height;
      return combineStreams([pipeline.stream, streams.microphone, streams.systemAudio]);
    }

    this.width = nativeWidth;
    this.height = nativeHeight;
    return combineStreams([streams.display, streams.microphone, streams.systemAudio]);
  }

  private emitStats(): void {
    if (!this.recorder || this.startTime === 0) return;
    this.events.onStats({
      elapsedMs: this.elapsedMs,
      recordedBytes: this.recordedBytes,
      droppedFrames: 0,
      audioLevel: this.meter?.getLevel() ?? 0,
      mimeType: this.recorder.mimeType,
      bitrate: this.options?.bitrate ?? 0,
      frameRate: this.options?.fps ?? 0,
    });
  }

  pause(): void {
    if (!this.recorder || this.status !== 'recording') return;
    if (this.recorder.state === 'recording') this.recorder.pause();
    this.pauseStartedAt = Date.now();
    this.setStatus('paused');
  }

  resume(): void {
    if (!this.recorder || this.status !== 'paused') return;
    if (this.recorder.state === 'paused') this.recorder.resume();
    if (this.pauseStartedAt > 0) {
      this.pausedTotalMs += Date.now() - this.pauseStartedAt;
      this.pauseStartedAt = 0;
    }
    this.setStatus('recording');
  }

  /** Stops the session and produces a finished recording. */
  stop(): Promise<RecordingResult | null> {
    return new Promise((resolve, reject) => {
      if (!this.recorder || this.stopped) {
        this.cleanupTracks();
        resolve(null);
        return;
      }
      if (this.recorder.state !== 'recording' && this.recorder.state !== 'paused') {
        this.cleanupTracks();
        resolve(null);
        return;
      }

      const startedAt = this.startTime;
      const durationMs = this.elapsedMs;
      this.stopped = true;
      this.setStatus('stopping');

      const finalize = () => {
        this.stopStatsLoop();
        const blob =
          this.chunks.length > 0
            ? new Blob(this.chunks, { type: this.recorder?.mimeType })
            : new Blob([], { type: this.recorder?.mimeType ?? 'video/webm' });
        this.cleanupTracks();
        this.setStatus('idle');

        const result: RecordingResult = {
          blob,
          name: generateRecordingName(this.options?.sourceType ?? 'screen'),
          mimeType: this.recorder?.mimeType ?? blob.type,
          durationMs: Math.max(durationMs, 0),
          sizeBytes: blob.size,
          width: this.width,
          height: this.height,
          fps: this.options?.fps ?? 30,
          bitrate: this.options?.bitrate ?? 0,
          codec: this.options?.codec ?? 'vp9',
          audio: this.options?.audio ?? 'none',
          sourceType: this.options?.sourceType ?? 'screen',
          startedAt,
          endedAt: Date.now(),
        };
        resolve(result);
      };

      if (this.recorder.onstop) {
        const prev = this.recorder.onstop;
        this.recorder.onstop = (event) => {
          prev?.call(this.recorder as MediaRecorder, event);
          finalize();
        };
      } else {
        this.recorder.onstop = finalize;
      }

      try {
        this.recorder.stop();
      } catch (error) {
        reject(toRecorderError(error));
      }
    });
  }

  private finishRecording(): void {
    this.stopStatsLoop();
  }

  private stopStatsLoop(): void {
    if (this.statsTimer) {
      clearInterval(this.statsTimer);
      this.statsTimer = null;
    }
  }

  private cleanupTracks(): void {
    this.stopStatsLoop();
    this.processingStop?.();
    this.processingStop = null;
    this.meter?.dispose();
    this.meter = null;
    const streams = this.streams;
    this.streams = null;
    stopStream(streams?.display);
    stopStream(streams?.microphone);
    stopStream(streams?.systemAudio);
  }

  /** Interrupts and discards the session without producing a recording. */
  cancel(): void {
    this.stopped = true;
    this.stopStatsLoop();
    if (this.recorder && this.recorder.state !== 'inactive') {
      try {
        this.recorder.onstop = null;
        this.recorder.stop();
      } catch {
        /* already inactive */
      }
    }
    this.recorder = null;
    this.cleanupTracks();
    this.setStatus('idle');
  }

  /** Releases all resources. Safe to call multiple times. */
  dispose(): void {
    this.cancel();
  }
}

export function assertMaxDuration(durationMs: number): void {
  if (durationMs > MAX_RECORDING_DURATION_MS) {
    throw new RecordingFailedError('Recording exceeded the maximum allowed duration');
  }
}

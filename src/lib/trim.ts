import type { RecordingRecord } from '@/types/settings';
import { exportVideo, type FfmpegProgressCallback } from '@/lib/ffmpeg/ffmpegClient';

export interface TrimRange {
  startMs: number;
  endMs: number;
}

export interface TrimResult {
  blob: Blob;
  mimeType: string;
  sizeBytes: number;
  durationMs: number;
}

/** Extracts a sub-range of a recording by re-encoding with FFmpeg. */
export async function trimRecording(
  record: Pick<RecordingRecord, 'blob' | 'mimeType' | 'durationMs' | 'fps' | 'codec'>,
  range: TrimRange,
  onProgress?: FfmpegProgressCallback
): Promise<TrimResult> {
  const startMs = Math.max(0, Math.min(range.startMs, range.endMs));
  const endMs = Math.max(startMs, Math.min(range.endMs, record.durationMs));
  const durationMs = endMs - startMs;
  if (durationMs <= 0) {
    throw new Error('The selected trim range is empty.');
  }

  const format = record.mimeType.includes('mp4') ? 'mp4' : 'webm';
  const { blob, mimeType } = await exportVideo(record.blob, {
    format,
    startTimeMs: startMs,
    durationMs,
    fps: record.fps || 30,
    codec: record.codec === 'h264' || record.codec === 'av1' ? record.codec : undefined,
    onProgress,
  });

  return { blob, mimeType, sizeBytes: blob.size, durationMs };
}

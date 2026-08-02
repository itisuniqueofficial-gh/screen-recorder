import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { logger } from '@/lib/logger';
import type { ContainerFormat, VideoCodec } from '@/types/media';

/**
 * Fetches a (possibly gzip-compressed) asset and wraps it in a blob URL of the
 * given MIME type. The ffmpeg wasm core is stored gzip-compressed to stay
 * under the Cloudflare Pages 25 MiB per-file limit; the original bytes are
 * recovered here before handing the blob URL to the FFmpeg loader.
 */
async function toWasmBlobURL(url: string, type: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  let buffer = new Uint8Array(await response.arrayBuffer());
  if (buffer[0] === 0x1f && buffer[1] === 0x8b) {
    const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'));
    buffer = new Uint8Array(await new Response(stream).arrayBuffer());
  }
  return URL.createObjectURL(new Blob([buffer], { type }));
}

/**
 * Thin wrapper around FFmpeg.wasm. The core runs inside its own Web Worker
 * (created by @ffmpeg/ffmpeg), keeping the main thread responsive. All wasm
 * assets are self-hosted under /ffmpeg and pre-cached by the service worker.
 */

const CORE_URL = `${import.meta.env.BASE_URL}ffmpeg/core-ffmpeg-core.js`;
const WASM_URL = `${import.meta.env.BASE_URL}ffmpeg/core-ffmpeg-core.wasm.gz`;

let instance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

export type FfmpegProgressCallback = (ratio: number) => void;

export interface VideoExportOptions {
  format: Extract<ContainerFormat, 'mp4' | 'webm' | 'gif'>;
  startTimeMs?: number;
  durationMs?: number;
  scaleWidth?: number;
  fps?: number;
  videoBitrateKbps?: number;
  codec?: VideoCodec;
  removeAudio?: boolean;
  onProgress?: FfmpegProgressCallback;
}

export interface AudioExportOptions {
  format: Extract<ContainerFormat, 'mp3' | 'wav' | 'opus'>;
  startTimeMs?: number;
  durationMs?: number;
  bitrateKbps?: number;
  onProgress?: FfmpegProgressCallback;
}

export interface FfmpegOutput {
  blob: Blob;
  mimeType: string;
  sizeBytes: number;
}

/** True when the environment supports SharedArrayBuffer (COOP/COEP enabled). */
export function isFfmpegSupported(): boolean {
  return typeof SharedArrayBuffer !== 'undefined';
}

export async function isFfmpegReady(): Promise<boolean> {
  if (instance) return true;
  if (!isFfmpegSupported()) return false;
  try {
    await getFfmpeg();
    return true;
  } catch (error) {
    logger.warn('ffmpeg', 'FFmpeg failed to load', error);
    return false;
  }
}

export async function preloadFfmpeg(): Promise<boolean> {
  return isFfmpegReady();
}

export function getFfmpeg(): Promise<FFmpeg> {
  if (instance) return Promise.resolve(instance);
  if (!loadPromise) loadPromise = loadFfmpeg();
  return loadPromise;
}

async function loadFfmpeg(): Promise<FFmpeg> {
  if (!isFfmpegSupported()) {
    throw new Error(
      'This browser does not support the shared memory features FFmpeg requires. Please use a recent version of Chrome, Edge, or Firefox.'
    );
  }

  const ffmpeg = new FFmpeg();
  ffmpeg.on('log', ({ type, message }) => {
    if (type === 'error') logger.warn('ffmpeg', message);
  });

  try {
    const [coreURL, wasmURL] = await Promise.all([
      toBlobURL(CORE_URL, 'text/javascript'),
      toWasmBlobURL(WASM_URL, 'application/wasm'),
    ]);
    await ffmpeg.load({ coreURL, wasmURL });
  } catch (error) {
    loadPromise = null;
    instance = null;
    throw new Error('Failed to load the FFmpeg engine.', { cause: error });
  }

  instance = ffmpeg;
  return ffmpeg;
}

async function exec(
  ffmpeg: FFmpeg,
  args: string[],
  onProgress?: FfmpegProgressCallback
): Promise<void> {
  const progressListener = ({ progress }: { progress: number }) => {
    if (onProgress && typeof progress === 'number' && progress > 0) {
      onProgress(progress);
    }
  };
  ffmpeg.on('progress', progressListener);
  try {
    await ffmpeg.exec(args);
  } finally {
    ffmpeg.off('progress', progressListener);
  }
}

async function writeInput(ffmpeg: FFmpeg, input: Blob): Promise<string> {
  const fileName = `input.${extensionForMime(input.type)}`;
  const data = await fetchFile(input);
  await ffmpeg.writeFile(fileName, data);
  return fileName;
}

function extensionForMime(mimeType: string): string {
  if (!mimeType) return 'webm';
  if (mimeType.includes('mp4')) return 'mp4';
  if (mimeType.includes('ogg')) return 'ogv';
  return 'webm';
}

const VIDEO_CODECS: Record<VideoCodec, string> = {
  vp8: 'libvpx',
  vp9: 'libvpx-vp9',
  h264: 'libx264',
  av1: 'libaom-av1',
};

function encodeVideoArgs(input: string, opts: VideoExportOptions): string[] {
  const args = ['-i', input, '-map', '0:v:0'];
  if (!opts.removeAudio) {
    args.push('-map', '0:a:0?');
  }
  if (typeof opts.startTimeMs === 'number' && opts.startTimeMs > 0) {
    args.push('-ss', String(opts.startTimeMs / 1000));
  }
  if (typeof opts.durationMs === 'number' && opts.durationMs > 0) {
    args.push('-t', String(opts.durationMs / 1000));
  }
  if (opts.format !== 'gif') {
    args.push(
      '-c:v',
      opts.codec && VIDEO_CODECS[opts.codec] ? VIDEO_CODECS[opts.codec] : 'libvpx-vp9'
    );
    if (opts.videoBitrateKbps) args.push('-b:v', `${opts.videoBitrateKbps}k`);
    if (opts.fps) args.push('-r', String(opts.fps));
    if (opts.format === 'mp4') {
      args.push('-movflags', '+faststart');
      if (!opts.codec || opts.codec === 'h264') args.push('-pix_fmt', 'yuv420p');
    }
  }
  return args;
}

/** Re-encodes (and optionally trims/resizes) a video blob into the target format. */
export async function exportVideo(input: Blob, opts: VideoExportOptions): Promise<FfmpegOutput> {
  const ffmpeg = await getFfmpeg();
  const inputName = await writeInput(ffmpeg, input);
  const outputName = `output.${opts.format}`;

  try {
    if (opts.format === 'gif') {
      const fps = opts.fps ?? 15;
      const scale = opts.scaleWidth
        ? `scale=${opts.scaleWidth}:-1:flags=lanczos`
        : 'scale=iw:-1:flags=lanczos';
      const base = ['-i', inputName, '-map', '0:v:0'];
      if (typeof opts.startTimeMs === 'number' && opts.startTimeMs > 0)
        base.push('-ss', String(opts.startTimeMs / 1000));
      if (typeof opts.durationMs === 'number' && opts.durationMs > 0)
        base.push('-t', String(opts.durationMs / 1000));
      const filter = `fps=${fps},${scale}`;

      await exec(
        ffmpeg,
        [...base, '-vf', `${filter},palettegen`, '-y', 'palette.png'],
        opts.onProgress
      );
      const gifArgs = [
        '-i',
        inputName,
        '-i',
        'palette.png',
        '-lavfi',
        `${filter}[x];[x][1:v]paletteuse`,
        '-loop',
        '0',
      ];
      if (typeof opts.startTimeMs === 'number' && opts.startTimeMs > 0)
        gifArgs.push('-ss', String(opts.startTimeMs / 1000));
      if (typeof opts.durationMs === 'number' && opts.durationMs > 0)
        gifArgs.push('-t', String(opts.durationMs / 1000));
      gifArgs.push('-y', outputName);
      await exec(ffmpeg, gifArgs, opts.onProgress);
    } else {
      const args = encodeVideoArgs(inputName, opts);
      args.push('-y', outputName);
      await exec(ffmpeg, args, opts.onProgress);
    }

    const data = await ffmpeg.readFile(outputName);
    const blob = new Blob([data as Uint8Array], { type: mimeForFormat(opts.format) });
    return { blob, mimeType: blob.type, sizeBytes: blob.size };
  } finally {
    try {
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
      await ffmpeg.deleteFile('palette.png').catch(() => undefined);
    } catch {
      // best-effort cleanup
    }
  }
}

/** Extracts the audio track of a recording into the requested format. */
export async function exportAudio(input: Blob, opts: AudioExportOptions): Promise<FfmpegOutput> {
  const ffmpeg = await getFfmpeg();
  const inputName = await writeInput(ffmpeg, input);
  const outputName = `output.${opts.format}`;

  try {
    const args = ['-i', inputName, '-map', '0:a:0?', '-vn'];
    if (typeof opts.startTimeMs === 'number' && opts.startTimeMs > 0)
      args.push('-ss', String(opts.startTimeMs / 1000));
    if (typeof opts.durationMs === 'number' && opts.durationMs > 0)
      args.push('-t', String(opts.durationMs / 1000));
    if (opts.format === 'mp3') {
      args.push('-c:a', 'libmp3lame', '-b:a', `${opts.bitrateKbps ?? 192}k`);
    } else if (opts.format === 'opus') {
      args.push('-c:a', 'libopus', '-b:a', `${opts.bitrateKbps ?? 128}k`);
    }
    args.push('-y', outputName);

    await exec(ffmpeg, args, opts.onProgress);

    const data = await ffmpeg.readFile(outputName);
    const blob = new Blob([data as Uint8Array], { type: mimeForFormat(opts.format) });
    return { blob, mimeType: blob.type, sizeBytes: blob.size };
  } finally {
    try {
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch {
      // best-effort cleanup
    }
  }
}

export function mimeForFormat(format: ContainerFormat): string {
  switch (format) {
    case 'mp4':
      return 'video/mp4';
    case 'webm':
      return 'video/webm';
    case 'gif':
      return 'image/gif';
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'opus':
      return 'audio/ogg';
  }
}

export function extensionForFormat(format: ContainerFormat): string {
  return format;
}

export function filenameForExport(name: string, format: ContainerFormat): string {
  const base = name.replace(/\.(webm|mp4|gif|mp3|wav|ogg)$/i, '');
  return `${base}.${format}`;
}

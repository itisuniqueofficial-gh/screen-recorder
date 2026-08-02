import { MIME_EXTENSION_MAP } from '../constants/media';

/** Returns the file extension for a given MIME type, defaulting to `bin`. */
export function extensionForMime(mimeType: string): string {
  const normalized = mimeType.split(';')[0]?.trim() ?? '';
  return MIME_EXTENSION_MAP[normalized] ?? 'bin';
}

/** Returns the MIME type for a file extension, defaulting to `application/octet-stream`. */
export function mimeForExtension(extension: string): string {
  const normalized = extension.toLowerCase().replace(/^\./, '');
  const entry = Object.entries(MIME_EXTENSION_MAP).find(([, ext]) => ext === normalized);
  return entry?.[0] ?? 'application/octet-stream';
}

/** Whether the given MIME type is video. */
export function isVideoMime(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}

/** Whether the given MIME type is audio. */
export function isAudioMime(mimeType: string): boolean {
  return mimeType.startsWith('audio/');
}

/** Whether the given MIME type is an image (e.g. GIF). */
export function isImageMime(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/** Picks the first MIME type from a candidate list that `MediaRecorder.isTypeSupported` accepts. */
export function pickSupportedMimeType(candidates: string[]): string {
  if (typeof MediaRecorder === 'undefined') return 'video/webm';
  for (const candidate of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(candidate)) return candidate;
    } catch {
      // ignore malformed candidates
    }
  }
  return 'video/webm';
}

/** Builds a standard MIME candidate list for a given codec. */
export function mimeCandidatesForCodec(codec: string): string[] {
  switch (codec) {
    case 'h264':
      return ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1', 'video/webm'];
    case 'av1':
      return ['video/webm;codecs=av01', 'video/webm'];
    case 'vp8':
      return ['video/webm;codecs=vp8,opus', 'video/webm;codecs=vp8', 'video/webm'];
    case 'vp9':
    default:
      return ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp9', 'video/webm'];
  }
}

import type { ResolutionOption, ResolutionSpec } from '../types/media';

export const RESOLUTIONS: Record<ResolutionOption, ResolutionSpec> = {
  '720p': { label: '720p (HD)', width: 1280, height: 720 },
  '1080p': { label: '1080p (Full HD)', width: 1920, height: 1080 },
  '1440p': { label: '1440p (2K)', width: 2560, height: 1440 },
  '4k': { label: '4K (UHD)', width: 3840, height: 2160 },
};

export const FPS_OPTIONS = [24, 30, 60] as const;

export const CODEC_OPTIONS = [
  { value: 'vp8', label: 'VP8', mime: 'video/webm;codecs=vp8' },
  { value: 'vp9', label: 'VP9', mime: 'video/webm;codecs=vp9' },
  { value: 'h264', label: 'H.264', mime: 'video/mp4;codecs=avc1' },
  { value: 'av1', label: 'AV1', mime: 'video/webm;codecs=av01' },
] as const;

export const DEFAULT_MIME = 'video/webm';
export const DEFAULT_EXTENSION = 'webm';

export const MIME_EXTENSION_MAP: Record<string, string> = {
  'video/webm': 'webm',
  'video/mp4': 'mp4',
  'video/ogg': 'ogv',
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'image/gif': 'gif',
};

export const SUPPORTED_BROWSERS = [
  {
    name: 'Chrome',
    versions: '114+',
    note: 'Full support including system audio via tab capture.',
  },
  {
    name: 'Edge',
    versions: '114+',
    note: 'Full support (Chromium).',
  },
  {
    name: 'Firefox',
    versions: '128+',
    note: 'Screen + mic supported. System audio not available.',
  },
  {
    name: 'Safari',
    versions: '17+',
    note: 'Screen + mic supported on macOS 14+. No system audio.',
  },
] as const;

import { describe, expect, it } from 'vitest';
import {
  extensionForMime,
  isAudioMime,
  isImageMime,
  isVideoMime,
  mimeCandidatesForCodec,
  mimeForExtension,
  pickSupportedMimeType,
} from '@/utils/mime';

describe('extensionForMime', () => {
  it('maps known MIME types to their extensions', () => {
    expect(extensionForMime('video/webm')).toBe('webm');
    expect(extensionForMime('video/mp4')).toBe('mp4');
    expect(extensionForMime('audio/mpeg')).toBe('mp3');
    expect(extensionForMime('image/gif')).toBe('gif');
  });

  it('ignores codec parameters when normalizing', () => {
    expect(extensionForMime('video/webm;codecs=vp9,opus')).toBe('webm');
    expect(extensionForMime('video/mp4;codecs=avc1')).toBe('mp4');
  });

  it('defaults to bin for unknown MIME types', () => {
    expect(extensionForMime('application/json')).toBe('bin');
    expect(extensionForMime('')).toBe('bin');
  });
});

describe('mimeForExtension', () => {
  it('is case-insensitive and strips leading dots', () => {
    expect(mimeForExtension('WEBM')).toBe('video/webm');
    expect(mimeForExtension('.mp4')).toBe('video/mp4');
  });

  it('maps audio and video extensions correctly', () => {
    expect(mimeForExtension('ogg')).toBe('audio/ogg');
    expect(mimeForExtension('m4a')).toBe('audio/mp4');
    expect(mimeForExtension('ogv')).toBe('video/ogg');
  });

  it('defaults to application/octet-stream for unknown extensions', () => {
    expect(mimeForExtension('xyz')).toBe('application/octet-stream');
  });
});

describe('mime family predicates', () => {
  it('detects video MIME types', () => {
    expect(isVideoMime('video/webm')).toBe(true);
    expect(isVideoMime('audio/webm')).toBe(false);
    expect(isVideoMime('image/gif')).toBe(false);
  });

  it('detects audio MIME types', () => {
    expect(isAudioMime('audio/ogg')).toBe(true);
    expect(isAudioMime('video/ogg')).toBe(false);
  });

  it('detects image MIME types', () => {
    expect(isImageMime('image/gif')).toBe(true);
    expect(isImageMime('video/gif')).toBe(false);
  });
});

describe('pickSupportedMimeType', () => {
  it('falls back to video/webm without MediaRecorder', () => {
    expect(typeof MediaRecorder).toBe('undefined');
    expect(pickSupportedMimeType(['video/mp4', 'video/webm'])).toBe('video/webm');
  });
});

describe('mimeCandidatesForCodec', () => {
  it('builds an h264 candidate list', () => {
    expect(mimeCandidatesForCodec('h264')).toEqual([
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4;codecs=avc1',
      'video/webm',
    ]);
  });

  it('builds VP8, VP9 and AV1 candidate lists', () => {
    expect(mimeCandidatesForCodec('vp8')).toContain('video/webm;codecs=vp8');
    expect(mimeCandidatesForCodec('vp9')).toContain('video/webm;codecs=vp9,opus');
    expect(mimeCandidatesForCodec('av1')).toEqual(['video/webm;codecs=av01', 'video/webm']);
  });

  it('defaults to VP9 for unknown codecs', () => {
    expect(mimeCandidatesForCodec('weird')).toContain('video/webm;codecs=vp9');
  });
});

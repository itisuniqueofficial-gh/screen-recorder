import { describe, expect, it } from 'vitest';
import { createId, createSessionId, generateRecordingName, sanitizeFilename } from '@/utils/id';

describe('createId', () => {
  it('produces ids with the given prefix', () => {
    expect(createId('rec')).toMatch(/^rec_/);
    expect(createId('sess')).toMatch(/^sess_/);
    expect(createId()).toMatch(/^rec_/);
  });

  it('produces unique ids across calls', () => {
    const ids = new Set(Array.from({ length: 100 }, () => createId()));
    expect(ids.size).toBe(100);
  });
});

describe('createSessionId', () => {
  it('prefixes with sess', () => {
    expect(createSessionId()).toMatch(/^sess_/);
  });
});

describe('generateRecordingName', () => {
  it('capitalizes the source type and embeds a timestamp', () => {
    const name = generateRecordingName('screen');
    expect(name).toMatch(/^Recording_Screen_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/);
  });

  it('handles arbitrary source types', () => {
    expect(generateRecordingName('tab')).toMatch(/^Recording_Tab_/);
    expect(generateRecordingName('webcam')).toMatch(/^Recording_Webcam_/);
  });
});

describe('sanitizeFilename', () => {
  it('replaces invalid filename characters with dashes', () => {
    expect(sanitizeFilename('a/b\\c:d*e?f"g<h>i|j')).toBe('a-b-c-d-e-f-g-h-i-j');
  });

  it('collapses whitespace and trims', () => {
    expect(sanitizeFilename('  hello   world  ')).toBe('hello world');
  });

  it('passes through clean names', () => {
    expect(sanitizeFilename('Recording_Screen_2024-01-01T00-00-00')).toBe(
      'Recording_Screen_2024-01-01T00-00-00'
    );
  });
});

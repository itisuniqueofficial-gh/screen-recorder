import { describe, expect, it } from 'vitest';
import {
  clamp,
  formatBitrate,
  formatBytes,
  formatDuration,
  formatMilliseconds,
  formatNumber,
  percentage,
  roundTo,
  toDateKey,
} from '@/utils/format';

describe('formatDuration', () => {
  it('formats durations under an hour as mm:ss', () => {
    expect(formatDuration(0)).toBe('00:00');
    expect(formatDuration(1000)).toBe('00:01');
    expect(formatDuration(61_000)).toBe('01:01');
    expect(formatDuration(3599_000)).toBe('59:59');
  });

  it('formats durations of an hour or more as h:mm:ss', () => {
    expect(formatDuration(3600_000)).toBe('1:00:00');
    expect(formatDuration(3723_000)).toBe('1:02:03');
  });

  it('clamps negative and non-finite inputs to zero', () => {
    expect(formatDuration(-5)).toBe('00:00');
    expect(formatDuration(Number.NaN)).toBe('00:00');
    expect(formatDuration(Number.POSITIVE_INFINITY)).toBe('00:00');
  });
});

describe('formatMilliseconds', () => {
  it('renders human-friendly compound units', () => {
    expect(formatMilliseconds(0)).toBe('0s');
    expect(formatMilliseconds(1500)).toBe('1s');
    expect(formatMilliseconds(90_000)).toBe('1m 30s');
    expect(formatMilliseconds(3_661_000)).toBe('1h 1m 1s');
    expect(formatMilliseconds(86_400_000)).toBe('1d');
    expect(formatMilliseconds(87_123_000)).toBe('1d 12m 3s');
  });
});

describe('formatBytes', () => {
  it('renders zero and byte values', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1)).toBe('1 B');
    expect(formatBytes(999)).toBe('999 B');
  });

  it('renders SI units with appropriate precision', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
    expect(formatBytes(100 * 1024 * 1024)).toBe('100 MB');
    expect(formatBytes(1024 ** 3)).toBe('1.0 GB');
  });

  it('clamps negative and non-finite inputs', () => {
    expect(formatBytes(-10)).toBe('0 B');
    expect(formatBytes(Number.NaN)).toBe('0 B');
  });
});

describe('formatBitrate', () => {
  it('renders Kbps below one megabit', () => {
    expect(formatBitrate(0)).toBe('0 Kbps');
    expect(formatBitrate(500)).toBe('500 Kbps');
    expect(formatBitrate(999)).toBe('999 Kbps');
  });

  it('renders Mbps above one megabit', () => {
    expect(formatBitrate(1000)).toBe('1 Mbps');
    expect(formatBitrate(1500)).toBe('1.5 Mbps');
  });
});

describe('formatNumber', () => {
  it('uses en-US grouping', () => {
    expect(formatNumber(1234)).toBe('1,234');
    expect(formatNumber(1000000)).toBe('1,000,000');
  });
});

describe('clamp', () => {
  it('bounds values within the range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });
});

describe('roundTo', () => {
  it('rounds to the requested number of decimals', () => {
    expect(roundTo(1.23456, 2)).toBe(1.23);
    expect(roundTo(123.456, 2)).toBe(123.46);
    expect(roundTo(3.14159, 0)).toBe(3);
  });
});

describe('percentage', () => {
  it('computes a clamped 0-100 percentage', () => {
    expect(percentage(50, 100)).toBe(50);
    expect(percentage(0, 100)).toBe(0);
    expect(percentage(100, 100)).toBe(100);
    expect(percentage(200, 100)).toBe(100);
    expect(percentage(10, 0)).toBe(0);
  });
});

describe('toDateKey', () => {
  it('formats a timestamp as YYYY-MM-DD', () => {
    expect(toDateKey(new Date(2024, 0, 5).getTime())).toBe('2024-01-05');
    expect(toDateKey(new Date(2024, 11, 31).getTime())).toBe('2024-12-31');
  });
});

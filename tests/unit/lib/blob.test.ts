import { describe, expect, it, vi } from 'vitest';
import {
  blobToArrayBuffer,
  blobToDataUrl,
  blobToObjectUrl,
  isBlobLikelyEmpty,
  revokeObjectUrl,
} from '@/lib/blob';

const decoder = new TextDecoder();

function bytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

describe('blobToArrayBuffer', () => {
  it('reads blob contents into an ArrayBuffer', async () => {
    const buffer = await blobToArrayBuffer(new Blob([bytes('hello')]));
    expect(decoder.decode(new Uint8Array(buffer))).toBe('hello');
  });
});

describe('blobToDataUrl', () => {
  it('produces a data URL', async () => {
    const url = await blobToDataUrl(new Blob(['x'], { type: 'text/plain' }));
    expect(url).toMatch(/^data:text\/plain;base64,/);
  });
});

describe('object URLs', () => {
  const create = vi.fn().mockReturnValue('blob:mock');
  const revoke = vi.fn();

  beforeAll(() => {
    URL.createObjectURL = create as typeof URL.createObjectURL;
    URL.revokeObjectURL = revoke as typeof URL.revokeObjectURL;
  });

  afterAll(() => {
    delete (URL as { createObjectURL?: unknown }).createObjectURL;
    delete (URL as { revokeObjectURL?: unknown }).revokeObjectURL;
  });

  beforeEach(() => {
    create.mockClear();
    revoke.mockClear();
  });

  it('creates and revokes object URLs', () => {
    expect(blobToObjectUrl(new Blob(['x']))).toBe('blob:mock');
    expect(create).toHaveBeenCalledTimes(1);

    revokeObjectUrl('blob:mock');
    expect(revoke).toHaveBeenCalledWith('blob:mock');
  });

  it('skips revoking empty values', () => {
    revokeObjectUrl(undefined);
    revokeObjectUrl(null);
    revokeObjectUrl('');
    expect(revoke).not.toHaveBeenCalled();
  });
});

describe('isBlobLikelyEmpty', () => {
  it('treats zero-size blobs as empty', () => {
    expect(isBlobLikelyEmpty(new Blob())).toBe(true);
    expect(isBlobLikelyEmpty(new Blob([]))).toBe(true);
    expect(isBlobLikelyEmpty(new Blob(['x']))).toBe(false);
  });
});

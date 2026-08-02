/** Blob reading and size helpers. */

export async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  if (blob.arrayBuffer) return blob.arrayBuffer();
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read blob'));
    reader.readAsArrayBuffer(blob);
  });
}

export async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read blob'));
    reader.readAsDataURL(blob);
  });
}

export function blobToObjectUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function revokeObjectUrl(url: string | null | undefined): void {
  if (url) URL.revokeObjectURL(url);
}

export function isBlobLikelyEmpty(blob: Blob): boolean {
  return blob.size === 0;
}

export async function blobDuration(blob: Blob): Promise<number> {
  return new Promise<number>((resolve) => {
    const url = URL.createObjectURL(blob);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(video.duration) ? video.duration * 1000 : 0);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    video.src = url;
  });
}

import { logger } from '@/lib/logger';
import type { ContainerFormat } from '@/types/media';
import { filenameForExport } from '@/lib/ffmpeg/ffmpegClient';

/** Downloads a blob to the user's disk as a file. */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Defer revocation so the download completes first.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Attempts to copy a blob to the system clipboard. */
export async function copyBlobToClipboard(blob: Blob, mimeType?: string): Promise<void> {
  const type = mimeType ?? blob.type;
  if (typeof ClipboardItem === 'undefined') {
    throw new Error('Clipboard copying is not supported in this browser.');
  }
  const item = new ClipboardItem({ [type]: blob });
  await navigator.clipboard.write([item]);
}

/** Shares a blob through the native share sheet when available. */
export async function shareBlob(blob: Blob, fileName: string): Promise<void> {
  const files = [new File([blob], fileName, { type: blob.type })];
  if (!navigator.share || !navigator.canShare || !navigator.canShare({ files })) {
    throw new Error('Sharing files is not supported in this browser.');
  }
  await navigator.share({ files, title: fileName });
}

export interface ExportTarget {
  blob: Blob;
  fileName: string;
  format: ContainerFormat;
}

/** Exports a blob as a file download with the correct extension. */
export function exportToFile({ blob, fileName, format }: ExportTarget): void {
  downloadBlob(blob, filenameForExport(fileName, format));
  logger.info('export', `Exported ${fileName} (${blob.size} bytes)`);
}

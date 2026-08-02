import { IDB_DATABASE_NAME, IDB_DATABASE_VERSION, IDB_RECORDINGS_STORE } from '../constants';
import { CorruptedDataError, QuotaExceededError, toRecorderError } from './errors';
import { logger } from './logger';
import type { RecordingMeta, RecordingRecord, RecoveryDraft } from '../types/settings';

export interface IndexedDbStats {
  /** Approximate bytes used by stored blobs. */
  bytesUsed: number;
  /** Number of recording records. */
  recordingCount: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

export function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(IDB_DATABASE_NAME, IDB_DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_RECORDINGS_STORE)) {
        db.createObjectStore(IDB_RECORDINGS_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(toRecorderError(request.error));
  });
  return dbPromise;
}

function tx(mode: IDBTransactionMode): Promise<IDBObjectStore> {
  return openDatabase().then((db) =>
    db.transaction(IDB_RECORDINGS_STORE, mode).objectStore(IDB_RECORDINGS_STORE)
  );
}

function requestToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(toRecorderError(req.error));
  });
}

export async function saveRecording(record: RecordingRecord): Promise<void> {
  try {
    const store = await tx('readwrite');
    await requestToPromise(store.put(record));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new QuotaExceededError();
    }
    throw error;
  }
}

export async function getAllRecordings(): Promise<RecordingMeta[]> {
  try {
    const store = await tx('readonly');
    const records = (await requestToPromise(store.getAll())) as RecordingRecord[];
    return records.map(toMeta);
  } catch (error) {
    throw new CorruptedDataError('Unable to read the recording history.', error);
  }
}

export async function getRecording(id: string): Promise<RecordingRecord | null> {
  const store = await tx('readonly');
  const record = (await requestToPromise(store.get(id))) as RecordingRecord | undefined;
  return record ?? null;
}

export async function getRecordingBlob(id: string): Promise<Blob | null> {
  const record = await getRecording(id);
  return record?.blob ?? null;
}

export async function deleteRecording(id: string): Promise<void> {
  const store = await tx('readwrite');
  await requestToPromise(store.delete(id));
}

export async function clearRecordings(): Promise<void> {
  const store = await tx('readwrite');
  await requestToPromise(store.clear());
}

export async function renameRecording(id: string, name: string): Promise<void> {
  const record = await getRecording(id);
  if (!record) return;
  record.name = name;
  record.updatedAt = Date.now();
  const store = await tx('readwrite');
  await requestToPromise(store.put(record));
}

export async function toggleFavorite(id: string, favorite: boolean): Promise<void> {
  const record = await getRecording(id);
  if (!record) return;
  record.favorite = favorite;
  record.updatedAt = Date.now();
  const store = await tx('readwrite');
  await requestToPromise(store.put(record));
}

export async function getDatabaseStats(): Promise<IndexedDbStats> {
  const store = await tx('readonly');
  const records = (await requestToPromise(store.getAll())) as RecordingRecord[];
  const bytesUsed = records.reduce((acc, r) => acc + (r.blob?.size ?? 0), 0);
  return { bytesUsed, recordingCount: records.length };
}

export async function estimateQuotaUsage(): Promise<{ used: number; quota: number }> {
  try {
    if ('storage' in navigator && navigator.storage?.estimate) {
      const { usage, quota } = await navigator.storage.estimate();
      return { used: usage ?? 0, quota: quota ?? 0 };
    }
  } catch (error) {
    logger.warn('storage', 'estimate() failed', error);
  }
  return { used: 0, quota: 0 };
}

export function toMeta(record: RecordingRecord): RecordingMeta {
  return {
    id: record.id,
    name: record.name,
    sizeBytes: record.blob?.size ?? record.sizeBytes,
    durationMs: record.durationMs,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    width: record.width,
    height: record.height,
    fps: record.fps,
    codec: record.codec,
    mimeType: record.mimeType,
    sourceType: record.sourceType,
    audio: record.audio,
    favorite: record.favorite,
  };
}

/** Persists a crash-recovery draft as a lightweight record (kept in the same store). */
export async function saveDraft(draft: RecoveryDraft): Promise<void> {
  try {
    const store = await tx('readwrite');
    await requestToPromise(store.put({ ...draft, id: `draft_${draft.id}`, blob: undefined }));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new QuotaExceededError();
    }
    throw error;
  }
}

export async function listDrafts(): Promise<RecoveryDraft[]> {
  try {
    const store = await tx('readonly');
    const records = (await requestToPromise(store.getAll())) as (
      RecordingRecord | (RecoveryDraft & { id: string })
    )[];
    return records
      .filter((r) => r.id.startsWith('draft_'))
      .map((r) => ({ ...(r as RecoveryDraft), id: r.id.replace(/^draft_/, '') }));
  } catch (error) {
    throw new CorruptedDataError('Unable to read recovery drafts.', error);
  }
}

export async function deleteDraft(draftId: string): Promise<void> {
  const store = await tx('readwrite');
  await requestToPromise(store.delete(`draft_${draftId}`));
}

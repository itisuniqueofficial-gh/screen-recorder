import { create } from 'zustand';
import type { RecordingRecord, RecordingMeta } from '@/types/settings';
import type { RecordingResult } from '@/lib/recorder/RecorderEngine';
import * as idb from '@/lib/indexeddb';
import { useSettingsStore } from '@/store/settingsStore';
import { logger } from '@/lib/logger';
import { createId } from '@/utils/id';

interface HistoryStore {
  records: RecordingRecord[];
  loading: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addResult: (result: RecordingResult) => Promise<RecordingRecord>;
  remove: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  rename: (id: string, name: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  replaceBlob: (
    id: string,
    blob: Blob,
    meta: Partial<
      Pick<
        RecordingRecord,
        'name' | 'mimeType' | 'sizeBytes' | 'durationMs' | 'width' | 'height' | 'fps' | 'codec'
      >
    >
  ) => Promise<void>;
  getById: (id: string) => RecordingRecord | undefined;
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  records: [],
  loading: false,
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated || get().loading) return;
    set({ loading: true });
    try {
      const records = await idb.getAllRecordings();
      const { settings } = useSettingsStore.getState();
      let sorted = records as unknown as RecordingRecord[];
      if (settings.storage.maxDrafts > 0 && settings.storage.keepDrafts) {
        const cap = settings.storage.maxDrafts;
        if (sorted.length > cap) {
          const excess = sorted.slice(cap);
          await Promise.all(excess.map((r) => idb.deleteRecording(r.id)));
          sorted = sorted.slice(0, cap);
        }
      }
      const withBlobs = await Promise.all(sorted.map((record) => recordWithBlob(record)));
      sorted = withBlobs.filter((record): record is RecordingRecord => record !== null);
      set({ records: sorted, hydrated: true });
    } catch (error) {
      logger.warn('history', 'Failed to hydrate recording history', error);
      set({ hydrated: true });
    } finally {
      set({ loading: false });
    }
  },

  addResult: async (result) => {
    const record: RecordingRecord = {
      id: createId('rec'),
      name: result.name,
      blob: result.blob,
      mimeType: result.mimeType,
      sizeBytes: result.sizeBytes,
      durationMs: result.durationMs,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      width: result.width,
      height: result.height,
      fps: result.fps,
      bitrate: result.bitrate,
      codec: result.codec,
      sourceType: result.sourceType,
      audio: result.audio,
      favorite: false,
    };
    await idb.saveRecording(record);
    set((state) => ({ records: [record, ...state.records] }));
    return record;
  },

  remove: async (id) => {
    await idb.deleteRecording(id);
    set((state) => ({ records: state.records.filter((r) => r.id !== id) }));
  },

  clearAll: async () => {
    await idb.clearRecordings();
    set({ records: [] });
  },

  rename: async (id, name) => {
    await idb.renameRecording(id, name);
    set((state) => ({
      records: state.records.map((r) => (r.id === id ? { ...r, name, updatedAt: Date.now() } : r)),
    }));
  },

  toggleFavorite: async (id) => {
    const record = get().records.find((r) => r.id === id);
    if (!record) return;
    const favorite = !record.favorite;
    await idb.toggleFavorite(id, favorite);
    set((state) => ({
      records: state.records.map((r) =>
        r.id === id ? { ...r, favorite, updatedAt: Date.now() } : r
      ),
    }));
  },

  replaceBlob: async (id, blob, meta) => {
    const record = get().records.find((r) => r.id === id);
    if (!record) return;
    const next: RecordingRecord = {
      ...record,
      ...meta,
      blob,
      mimeType: meta.mimeType ?? record.mimeType,
      sizeBytes: blob.size,
      updatedAt: Date.now(),
    };
    await idb.saveRecording(next);
    set((state) => ({
      records: state.records.map((r) => (r.id === id ? next : r)),
    }));
  },

  getById: (id) => get().records.find((r) => r.id === id),
}));

function recordWithBlob(record: RecordingMeta): Promise<RecordingRecord | null> {
  return idb
    .getRecording(record.id)
    .then((full) => full)
    .catch(() => null);
}

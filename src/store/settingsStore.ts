import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_SETTINGS } from '@/config/recorder.config';
import type { AppSettings } from '@/types/settings';
import { STORAGE_KEYS } from '@/constants';

interface SettingsState {
  settings: AppSettings;
  setSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  setAudioProcessing: (key: keyof AppSettings['audioProcessing'], value: boolean) => void;
  setStorageSetting: (key: keyof AppSettings['storage'], value: number | boolean) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      setSetting: (key, value) =>
        set((state) => ({
          settings: { ...state.settings, [key]: value },
        })),
      setAudioProcessing: (key, value) =>
        set((state) => ({
          settings: {
            ...state.settings,
            audioProcessing: { ...state.settings.audioProcessing, [key]: value },
          },
        })),
      setStorageSetting: (key, value) =>
        set((state) => ({
          settings: {
            ...state.settings,
            storage: { ...state.settings.storage, [key]: value },
          },
        })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: STORAGE_KEYS.settings,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);

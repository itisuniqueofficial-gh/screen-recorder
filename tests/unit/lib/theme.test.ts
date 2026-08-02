import { beforeEach, describe, expect, it } from 'vitest';
import {
  applyTheme,
  currentTheme,
  initTheme,
  readThemeMode,
  resolveTheme,
  systemPrefersDark,
  writeThemeMode,
} from '@/lib/theme';
import { STORAGE_KEYS } from '@/constants';

describe('theme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = '';
  });

  describe('resolveTheme', () => {
    it('returns explicit modes unchanged', () => {
      expect(resolveTheme('light')).toBe('light');
      expect(resolveTheme('dark')).toBe('dark');
    });

    it('resolves system mode against the OS preference', () => {
      expect(resolveTheme('system')).toBe('dark');
    });
  });

  describe('systemPrefersDark', () => {
    it('reflects the mock matchMedia dark query', () => {
      expect(systemPrefersDark()).toBe(true);
    });
  });

  describe('applyTheme', () => {
    it('toggles the dark class and colorScheme', () => {
      applyTheme('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.style.colorScheme).toBe('dark');
      expect(currentTheme()).toBe('dark');
    });

    it('removes the dark class for light', () => {
      applyTheme('dark');
      applyTheme('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.documentElement.style.colorScheme).toBe('light');
      expect(currentTheme()).toBe('light');
    });
  });

  describe('theme mode persistence', () => {
    it('defaults to system', () => {
      expect(readThemeMode()).toBe('system');
    });

    it('round-trips a stored mode', () => {
      writeThemeMode('dark');
      expect(readThemeMode()).toBe('dark');
      expect(localStorage.getItem(STORAGE_KEYS.theme)).toBe('dark');
    });

    it('ignores invalid stored values', () => {
      localStorage.setItem(STORAGE_KEYS.theme, 'neon');
      expect(readThemeMode()).toBe('system');
    });
  });

  describe('initTheme', () => {
    it('applies a stored theme', () => {
      writeThemeMode('light');
      initTheme();
      expect(currentTheme()).toBe('light');
    });

    it('resolves system mode to dark via the mock', () => {
      initTheme();
      expect(currentTheme()).toBe('dark');
    });
  });
});

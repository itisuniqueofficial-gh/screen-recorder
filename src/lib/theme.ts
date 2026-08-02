import type { ThemeMode } from '@/types/media';
import { STORAGE_KEYS } from '@/constants';

export type ResolvedTheme = 'light' | 'dark';

/** Resolves a ThemeMode to a concrete theme, honoring the OS preference. */
export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

export function systemPrefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

/** Applies a resolved theme to the document. */
export function applyTheme(theme: ResolvedTheme): void {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
}

export function currentTheme(): ResolvedTheme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/** Bootstraps the theme before first paint to avoid a flash. */
export function initTheme(): void {
  const stored = readThemeMode();
  applyTheme(resolveTheme(stored));

  if (stored === 'system') {
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (event) => applyTheme(event.matches ? 'dark' : 'light'));
  }
}

export function readThemeMode(): ThemeMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.theme);
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  } catch {
    /* ignore */
  }
  return 'system';
}

export function writeThemeMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.theme, mode);
  } catch {
    /* ignore */
  }
}

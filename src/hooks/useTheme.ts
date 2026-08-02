import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { applyTheme, resolveTheme, type ResolvedTheme } from '@/lib/theme';

export interface ThemeController {
  mode: 'light' | 'dark' | 'system';
  resolved: ResolvedTheme;
  setMode: (mode: 'light' | 'dark' | 'system') => void;
}

export function useTheme(): ThemeController {
  const theme = useSettingsStore((state) => state.settings.theme);
  const setSetting = useSettingsStore((state) => state.setSetting);

  useEffect(() => {
    applyTheme(resolveTheme(theme));

    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const onChange = (event: MediaQueryListEvent) => applyTheme(event.matches ? 'dark' : 'light');
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    }
  }, [theme]);

  return {
    mode: theme,
    resolved: resolveTheme(theme),
    setMode: (mode) => setSetting('theme', mode),
  };
}

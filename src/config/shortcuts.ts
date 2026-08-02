export interface ShortcutDefinition {
  id: string;
  label: string;
  description: string;
  keys: string[];
}

export const SHORTCUTS: ShortcutDefinition[] = [
  {
    id: 'record-toggle',
    label: 'Start / stop recording',
    description: 'Begin or end a recording using the current settings.',
    keys: ['mod', 'shift', 'r'],
  },
  {
    id: 'pause-resume',
    label: 'Pause / resume',
    description: 'Toggle pausing while recording.',
    keys: ['mod', 'shift', 'p'],
  },
  {
    id: 'cancel',
    label: 'Cancel recording',
    description: 'Discard the active recording without saving.',
    keys: ['mod', 'shift', 'x'],
  },
];

export function formatShortcutKeys(keys: string[]): string {
  return keys
    .map((key) => {
      if (key === 'mod') return isMac() ? '⌘' : 'Ctrl';
      if (key === 'shift') return 'Shift';
      return key.toUpperCase();
    })
    .join(' + ');
}

export function isMac(): boolean {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
}

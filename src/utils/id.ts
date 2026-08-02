/** Unique identifier and slug helpers. */

export function createId(prefix = 'rec'): string {
  const random =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}_${random}`;
}

export function createSessionId(): string {
  return createId('sess');
}

/** Generates a clean, filesystem-safe recording name. */
export function generateRecordingName(sourceType: string): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const source = sourceType.charAt(0).toUpperCase() + sourceType.slice(1);
  return `Recording_${source}_${stamp}`;
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

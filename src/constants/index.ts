export const APP_NAME = 'Screen Recorder';
export const APP_DESCRIPTION =
  'Professional privacy-first browser-based screen recorder. Everything runs locally in your browser.';
export const APP_VERSION = '1.0.0';
export const APP_REPO = 'https://github.com/itisuniqueofficial-gh/screen-recorder';
export const APP_BASE_URL = 'https://screen-recorder.pages.dev';
export const APP_KEYWORDS = [
  'screen recorder',
  'screen capture',
  'webcam',
  'microphone',
  'system audio',
  'mp4',
  'gif',
  'privacy-first',
];

export const STORAGE_KEYS = {
  settings: 'screen-recorder.settings.v1',
  theme: 'screen-recorder.theme.v1',
  drafts: 'screen-recorder.drafts.v1',
  acceptedPermissions: 'screen-recorder.permissions.v1',
} as const;

export const IDB_DATABASE_NAME = 'screen-recorder';
export const IDB_DATABASE_VERSION = 1;
export const IDB_RECORDINGS_STORE = 'recordings';
export const IDB_DRAFTS_STORE = 'drafts';

export const MAX_RECORDING_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours safety cap
export const MAX_DRAFT_SIZE_BYTES = 1024 * 1024 * 1024; // 1 GB safety cap

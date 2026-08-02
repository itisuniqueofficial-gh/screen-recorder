export interface BrowserInfo {
  name: string;
  version: string;
  isChromium: boolean;
  isFirefox: boolean;
  isSafari: boolean;
  isMobile: boolean;
}

const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';

function detectName(): string {
  if (/Edg\//.test(userAgent)) return 'Edge';
  if (/OPR\//.test(userAgent) || /Opera/.test(userAgent)) return 'Opera';
  if (/Chrome\//.test(userAgent) && !/Edg\//.test(userAgent)) return 'Chrome';
  if (/Firefox\//.test(userAgent)) return 'Firefox';
  if (/Safari\//.test(userAgent)) return 'Safari';
  return 'Unknown';
}

export function getBrowserInfo(): BrowserInfo {
  const name = detectName();
  const versionMatch = userAgent.match(/(?:Chrome|Firefox|Safari|Edg|OPR)\/(\d+)/);
  return {
    name,
    version: versionMatch?.[1] ?? 'unknown',
    isChromium: name === 'Chrome' || name === 'Edge' || name === 'Opera',
    isFirefox: name === 'Firefox',
    isSafari: name === 'Safari',
    isMobile:
      /Android|iPhone|iPad|iPod/i.test(userAgent) ||
      (typeof navigator !== 'undefined' &&
        'maxTouchPoints' in navigator &&
        navigator.maxTouchPoints > 0),
  };
}

export function supportsScreenCapture(): boolean {
  if (typeof navigator === 'undefined') return false;
  const md = navigator.mediaDevices;
  return Boolean(md && 'getDisplayMedia' in md);
}

export function supportsMicrophone(): boolean {
  if (typeof navigator === 'undefined') return false;
  const md = navigator.mediaDevices;
  return Boolean(md && 'getUserMedia' in md);
}

export function supportsMediaRecorder(): boolean {
  return typeof MediaRecorder !== 'undefined';
}

export function supportsWebCodecs(): boolean {
  return typeof window !== 'undefined' && 'VideoEncoder' in window && 'AudioEncoder' in window;
}

export function supportsSystemAudio(): boolean {
  // System audio capture requires tab capture + AudioContext mixing, which is
  // only reliably available on Chromium browsers.
  const info = getBrowserInfo();
  return info.isChromium && supportsScreenCapture() && typeof AudioContext !== 'undefined';
}

export function supportsFileSystemAccess(): boolean {
  return typeof window !== 'undefined' && 'showSaveFilePicker' in window;
}

export function supportsPictureInPicture(): boolean {
  return typeof document !== 'undefined' && 'pictureInPictureEnabled' in document;
}

export function isSecureContext(): boolean {
  return typeof window !== 'undefined' && window.isSecureContext;
}

export function hasCamera(): Promise<boolean> {
  return enumerateDevices('videoinput');
}

export function hasMicrophone(): Promise<boolean> {
  return enumerateDevices('audioinput');
}

async function enumerateDevices(kind: string): Promise<boolean> {
  try {
    if (!navigator.mediaDevices?.enumerateDevices) return false;
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some((d) => d.kind === kind);
  } catch {
    return false;
  }
}

export function getCapabilitiesSummary(): Record<string, boolean> {
  return {
    screenCapture: supportsScreenCapture(),
    microphone: supportsMicrophone(),
    mediaRecorder: supportsMediaRecorder(),
    webCodecs: supportsWebCodecs(),
    systemAudio: supportsSystemAudio(),
    fileSystemAccess: supportsFileSystemAccess(),
    pictureInPicture: supportsPictureInPicture(),
    secureContext: isSecureContext(),
  };
}

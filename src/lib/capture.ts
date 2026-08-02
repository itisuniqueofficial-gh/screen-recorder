import type { AudioSourceType, CapturedStreams, RecordingSourceType } from '@/types/media';
import { buildCapturedStreams } from '@/lib/stream';

export interface CaptureConstraints {
  sourceType: RecordingSourceType;
  audio: AudioSourceType;
  video: MediaTrackConstraints;
  audioProcessing: {
    echoCancellation: boolean;
    noiseSuppression: boolean;
    autoGainControl: boolean;
  };
  preferTabAudio: boolean;
}

export interface CaptureResult {
  streams: CapturedStreams;
  devicesUsed: string[];
}

function audioProcessingConstraints(
  audioProcessing: CaptureConstraints['audioProcessing']
): MediaTrackConstraints {
  return {
    echoCancellation: audioProcessing.echoCancellation,
    noiseSuppression: audioProcessing.noiseSuppression,
    autoGainControl: audioProcessing.autoGainControl,
  };
}

const isChrome = typeof navigator !== 'undefined' && /chrome|chromium/i.test(navigator.userAgent);

async function acquireDisplayStream(
  video: MediaTrackConstraints,
  audioSource: AudioSourceType
): Promise<MediaStream> {
  const wantsSystemAudio = audioSource === 'system' || audioSource === 'mixed';
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { ...video, displaySurface: isChrome ? 'monitor' : undefined },
    audio: wantsSystemAudio
      ? ({ suppressLocalAudioPlayback: true } as MediaTrackConstraints)
      : undefined,
    preferCurrentTab: audioSource === 'tab' && isChrome,
    selfBrowserSurface: 'exclude',
    surfaceSwitching: isChrome ? 'include' : undefined,
    systemAudio: 'include',
    monitorTypeSurfaces: 'include',
  } as DisplayMediaStreamOptions);
  return stream;
}

async function acquireWebcamStream(
  video: MediaTrackConstraints,
  wantsMic: boolean,
  audioProcessing: CaptureConstraints['audioProcessing']
): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: video,
    audio: wantsMic ? audioProcessingConstraints(audioProcessing) : false,
  });
}

async function acquireMicrophoneStream(
  audioProcessing: CaptureConstraints['audioProcessing']
): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      ...audioProcessingConstraints(audioProcessing),
      channelCount: { ideal: 2 },
    },
    video: false,
  });
}

/**
 * Acquires all requested media streams for a recording session.
 * Display acquisition is grouped so the browser shows a single source picker.
 */
export async function captureStreams(constraints: CaptureConstraints): Promise<CaptureResult> {
  const devicesUsed: string[] = [];
  const wantsMic = constraints.audio === 'microphone' || constraints.audio === 'mixed';
  const isWebcam = constraints.sourceType === 'webcam';

  let display: MediaStream | null = null;
  let systemAudio: MediaStream | null = null;
  let microphone: MediaStream | null = null;

  if (isWebcam) {
    display = await acquireWebcamStream(constraints.video, wantsMic, constraints.audioProcessing);
  } else {
    display = await acquireDisplayStream(constraints.video, constraints.audio);
    const audioTracks = display.getAudioTracks();
    if (audioTracks.length > 0) {
      systemAudio = new MediaStream(audioTracks);
    }
    if (wantsMic) {
      microphone = await acquireMicrophoneStream(constraints.audioProcessing);
    }
  }

  const streams = buildCapturedStreams(display, microphone, systemAudio);
  for (const stream of [display, microphone, systemAudio]) {
    if (!stream) continue;
    for (const track of stream.getTracks()) {
      devicesUsed.push(`${track.kind}:${track.label}`);
    }
  }

  return { streams, devicesUsed };
}

/** Converts a RecordingSourceType + AudioSourceType into capture constraints. */
export function toCaptureConstraints(
  sourceType: RecordingSourceType,
  audio: AudioSourceType,
  video: MediaTrackConstraints,
  audioProcessing: CaptureConstraints['audioProcessing']
): CaptureConstraints {
  return {
    sourceType,
    audio,
    video,
    audioProcessing,
    preferTabAudio: audio === 'tab',
  };
}

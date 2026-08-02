import type { CapturedStreams } from '../types/media';

/** Combines an arbitrary set of MediaStreams into a single stream with unique track ids. */
export function combineStreams(streams: Array<MediaStream | null>): MediaStream {
  const combined = new MediaStream();
  const seen = new Set<string>();
  for (const stream of streams) {
    if (!stream) continue;
    for (const track of stream.getTracks()) {
      if (!seen.has(track.id)) {
        seen.add(track.id);
        combined.addTrack(track);
      }
    }
  }
  return combined;
}

/** Combines streams while remembering which came from the display vs microphone. */
export function buildCapturedStreams(
  display: MediaStream | null,
  microphone: MediaStream | null,
  systemAudio: MediaStream | null
): CapturedStreams {
  return {
    display,
    microphone,
    systemAudio,
    combined: combineStreams([display, microphone, systemAudio]),
  };
}

/** Stops every track of a stream. Safe to call on null. */
export function stopStream(stream: MediaStream | null | undefined): void {
  if (!stream) return;
  for (const track of stream.getTracks()) {
    track.stop();
  }
}

export function stopTrack(track: MediaStreamTrack | undefined): void {
  track?.stop();
}

/** Awaits a track to actually start delivering frames (used before recording). */
export function trackReady(track: MediaStreamTrack, timeoutMs = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (track.readyState === 'live') return resolve();
    const timeout = setTimeout(
      () => reject(new Error('Track did not become live in time')),
      timeoutMs
    );
    const check = () => {
      if (track.readyState === 'live') {
        clearTimeout(timeout);
        resolve();
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

/** Returns a cloned video track, or null if none exists. */
export function getVideoTrack(stream: MediaStream): MediaStreamTrack | null {
  return stream.getVideoTracks()[0] ?? null;
}

/** Returns the first audio track, or null if none exists. */
export function getAudioTrack(stream: MediaStream): MediaStreamTrack | null {
  return stream.getAudioTracks()[0] ?? null;
}

/** Sets audio output volume on a stream's audio tracks (0-1). */
export function setStreamVolume(stream: MediaStream | null, volume: number): void {
  if (!stream) return;
  const audio = new Audio();
  audio.srcObject = stream;
  audio.volume = Math.min(Math.max(volume, 0), 1);
  void audio;
}

export function hasAudioTracks(stream: MediaStream): boolean {
  return stream.getAudioTracks().length > 0;
}

export function hasVideoTracks(stream: MediaStream): boolean {
  return stream.getVideoTracks().length > 0;
}

export function trackSettingsSummary(stream: MediaStream | null): Record<string, unknown> {
  if (!stream) return {};
  const video = getVideoTrack(stream);
  const audio = getAudioTrack(stream);
  return {
    video: video ? video.getSettings() : null,
    audio: audio ? audio.getSettings() : null,
  };
}

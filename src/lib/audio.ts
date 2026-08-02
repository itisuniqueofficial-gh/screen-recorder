/** Audio analysis helpers for the live audio level meter. */

export interface AudioMeter {
  stream: MediaStream | null;
  analyser: AnalyserNode | null;
  dataArray: Uint8Array;
  source: MediaStreamAudioSourceNode | null;
  getLevel(): number;
  dispose(): void;
}

/** Creates an audio meter attached to a stream. Returns null if no audio present. */
export function createAudioMeter(stream: MediaStream | null, fftSize = 256): AudioMeter | null {
  if (!stream || stream.getAudioTracks().length === 0) return null;
  const AudioCtx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;

  const audioContext = new AudioCtx();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = fftSize;
  analyser.smoothingTimeConstant = 0.5;
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);
  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  return {
    stream,
    analyser,
    dataArray,
    source,
    getLevel() {
      if (!this.analyser) return 0;
      this.analyser.getByteTimeDomainData(this.dataArray);
      let sum = 0;
      for (let i = 0; i < this.dataArray.length; i += 1) {
        const value = ((this.dataArray[i] ?? 128) - 128) / 128;
        sum += value * value;
      }
      const rms = Math.sqrt(sum / this.dataArray.length);
      return Math.min(rms * 2, 1);
    },
    dispose() {
      this.source?.disconnect();
      this.analyser?.disconnect();
      void audioContext.close();
    },
  };
}

/** Simple muted-state checker. */
export function isStreamMuted(stream: MediaStream | null): boolean {
  return stream?.getAudioTracks().some((t) => t.enabled === false) ?? false;
}

export function setStreamMuted(stream: MediaStream | null, muted: boolean): void {
  stream?.getAudioTracks().forEach((t) => {
    t.enabled = !muted;
  });
}

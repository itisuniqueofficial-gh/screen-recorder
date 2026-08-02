import type { CursorMode } from '@/types/media';
import { drawWatermark } from '@/lib/canvas';
import { createId } from '@/utils/id';

export interface PipelineOptions {
  width: number;
  height: number;
  fps: number;
  watermark: boolean;
  watermarkText: string;
  cursorMode: CursorMode;
  clickHighlight: boolean;
}

export interface PointerSnapshot {
  x: number;
  y: number;
  visible: boolean;
}

export interface ClickBurst {
  x: number;
  y: number;
  bornAt: number;
  color: string;
}

const CURSOR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M4 3l7 17 2.6-6.4L20 11z" fill="#fff" stroke="#111" stroke-width="1.5"/></svg>`;
const CURSOR_DATA_URL = `data:image/svg+xml;base64,${btoa(CURSOR_SVG)}`;

export function createCursorImage(): HTMLImageElement {
  const img = new Image();
  img.src = CURSOR_DATA_URL;
  return img;
}

export interface CursorTracker {
  snapshot: PointerSnapshot;
  addClickListener: (onClick: (burst: ClickBurst) => void) => void;
  removeClickListener: (onClick: (burst: ClickBurst) => void) => void;
  dispose: () => void;
}

/**
 * Tracks the global pointer position and click bursts so they can be drawn
 * onto a recording canvas (Chrome's display capture does not include a cursor).
 */
export function createCursorTracker(): CursorTracker {
  const snapshot: PointerSnapshot = { x: 0, y: 0, visible: false };
  const listeners = new Set<(burst: ClickBurst) => void>();

  const onMove = (event: PointerEvent) => {
    snapshot.x = event.clientX + window.screenX;
    snapshot.y = event.clientY + window.screenY;
    snapshot.visible = true;
  };

  const onLeave = () => {
    snapshot.visible = false;
  };

  const onClick = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    const burst: ClickBurst = {
      x: event.clientX + window.screenX,
      y: event.clientY + window.screenY,
      bornAt: Date.now(),
      color: event.shiftKey ? '#f97316' : event.altKey ? '#eab308' : '#ef4444',
    };
    for (const listener of listeners) listener(burst);
  };

  window.addEventListener('pointermove', onMove);
  document.documentElement.addEventListener('pointerleave', onLeave);
  window.addEventListener('pointerdown', onClick);

  return {
    snapshot,
    addClickListener: (listener) => listeners.add(listener),
    removeClickListener: (listener) => listeners.delete(listener),
    dispose: () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerdown', onClick);
      listeners.clear();
    },
  };
}

/**
 * Renders a video track onto a canvas at a target resolution, optionally
 * layering a watermark, a synthetic cursor and click highlights on top.
 * Returns a MediaStream the MediaRecorder can consume.
 */
export function createProcessingStream(
  sourceTrack: MediaStreamTrack,
  options: PipelineOptions
): { stream: MediaStream; stop: () => void } {
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.autoplay = true;
  video.srcObject = new MediaStream([sourceTrack]);

  const canvas = document.createElement('canvas');
  canvas.width = options.width;
  canvas.height = options.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Unable to acquire 2D canvas context for processing pipeline');

  const stream = canvas.captureStream(options.fps);
  const track = stream.getVideoTracks()[0];
  if (track) track.contentHint = 'motion';

  const cursor = options.cursorMode !== 'hidden' ? createCursorImage() : null;
  const tracker = options.clickHighlight ? createCursorTracker() : null;
  const bursts: ClickBurst[] = [];

  const onBurst = (burst: ClickBurst) => {
    bursts.push(burst);
    while (bursts.length > 8) bursts.shift();
  };
  tracker?.addClickListener(onBurst);

  let raf = 0;
  const draw = () => {
    raf = requestAnimationFrame(draw);
    if (video.readyState < 2) return;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (options.watermark) {
      drawWatermark(canvas, ctx, {
        text: options.watermarkText,
        opacity: 0.55,
        fontFamily: 'sans-serif',
      });
    }

    if (tracker) {
      const now = Date.now();
      for (let i = bursts.length - 1; i >= 0; i -= 1) {
        const burst = bursts[i];
        if (!burst) continue;
        const age = now - burst.bornAt;
        if (age > 700) {
          bursts.splice(i, 1);
          continue;
        }
        const progress = age / 700;
        const radius = 6 + progress * 34;
        ctx.beginPath();
        ctx.arc(burst.x, burst.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = burst.color;
        ctx.globalAlpha = 1 - progress;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      if (cursor && tracker.snapshot.visible) {
        ctx.drawImage(cursor, tracker.snapshot.x, tracker.snapshot.y, 24, 24);
      }
    }
  };

  void video.play().catch(() => {
    /* playback will begin when the track delivers frames */
  });
  draw();

  return {
    stream,
    stop: () => {
      cancelAnimationFrame(raf);
      tracker?.dispose();
      track?.stop();
      video.srcObject = null;
    },
  };
}

/** Best-effort cursor image used by the processing pipeline. */
export const PIPELINE_CURSOR_IMG = CURSOR_DATA_URL;

export function pipelineId(): string {
  return createId('pipeline');
}

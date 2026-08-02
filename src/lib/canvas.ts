/** Canvas helpers used for the watermark overlay and cursor rendering. */

export interface WatermarkConfig {
  text: string;
  opacity: number;
  fontFamily: string;
}

export function drawWatermark(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  config: WatermarkConfig
): void {
  const fontSize = Math.max(16, Math.round(canvas.width * 0.02));
  ctx.save();
  ctx.font = `${fontSize}px ${config.fontFamily || 'sans-serif'}`;
  ctx.fillStyle = `rgba(255,255,255,${config.opacity})`;
  const metrics = ctx.measureText(config.text);
  ctx.globalAlpha = config.opacity;
  ctx.fillText(config.text, canvas.width - metrics.width - 16, canvas.height - 16);
  ctx.restore();
}

export function createWatermarkCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png'): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type));
}

export function canvasToDataUrl(
  canvas: HTMLCanvasElement,
  type = 'image/png',
  quality?: number
): string {
  return canvas.toDataURL(type, quality);
}

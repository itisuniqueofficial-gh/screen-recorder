// Generates the PWA/app icons plus a social share image under public/icons.
// Run: node scripts/generate-icons.mjs
import { PNG } from 'pngjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'public/icons');
mkdirSync(outDir, { recursive: true });

const BLUE = { r: 37, g: 99, b: 235, a: 255 };
const RED = { r: 239, g: 68, b: 68, a: 255 };
const WHITE = { r: 255, g: 255, b: 255, a: 255 };
const LIGHT = { r: 147, g: 197, b: 253, a: 255 };

const inRoundedRectShape = (px, py, sx, sy, sw, sh, radius) => {
  const r = Math.min(radius, sw / 2, sh / 2);
  if (px < sx || px >= sx + sw || py < sy || py >= sy + sh) return false;
  const cx = Math.max(sx + r, Math.min(px, sx + sw - r - 1));
  const cy = Math.max(sy + r, Math.min(py, sy + sh - r - 1));
  return (px - cx) ** 2 + (py - cy) ** 2 <= r * r;
};

const inCircle = (px, py, cx, cy, radius) => (px - cx) ** 2 + (py - cy) ** 2 <= radius * radius;

function create(size, { fullBleed = false } = {}) {
  const png = new PNG({ width: size, height: size });
  const radius = fullBleed ? 0 : size * 0.22;

  const s = size / 512;
  const camera = {
    x: 108 * s,
    y: 168 * s,
    w: 296 * s,
    h: 176 * s,
    radius: 28 * s,
  };

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const idx = (size * y + x) << 2;
      let color = BLUE;

      if (inRoundedRectShape(x, y, 0, 0, size, size, radius)) {
        if (inRoundedRectShape(x, y, camera.x, camera.y, camera.w, camera.h, camera.radius)) {
          color = WHITE;
          if (inCircle(x, y, 256 * s, 256 * s, 46 * s)) color = RED;
          if (inCircle(x, y, 340 * s, 214 * s, 18 * s)) color = LIGHT;
        }
      } else {
        color = { r: 0, g: 0, b: 0, a: 0 };
      }

      png.data[idx] = color.r;
      png.data[idx + 1] = color.g;
      png.data[idx + 2] = color.b;
      png.data[idx + 3] = color.a;
    }
  }
  return png;
}

function save(png, name) {
  const file = resolve(outDir, name);
  writeFileSync(file, PNG.sync.write(png));
  console.log(`[icons] ${name}`);
}

save(create(192), 'icon-192.png');
save(create(512), 'icon-512.png');
save(create(512, { fullBleed: true }), 'icon-512-maskable.png');
save(create(180, { fullBleed: true }), 'apple-touch-icon.png');

// Social share image (1200x630).
const OG_W = 1200;
const OG_H = 630;
const og = new PNG({ width: OG_W, height: OG_H });
const ogCamera = { x: 460, y: 227, w: 280, h: 176, radius: 28 };
for (let y = 0; y < OG_H; y += 1) {
  for (let x = 0; x < OG_W; x += 1) {
    const idx = (OG_W * y + x) << 2;
    og.data[idx] = BLUE.r;
    og.data[idx + 1] = BLUE.g;
    og.data[idx + 2] = BLUE.b;
    og.data[idx + 3] = 255;
  }
}
for (let y = 0; y < OG_H; y += 1) {
  for (let x = 0; x < OG_W; x += 1) {
    const idx = (OG_W * y + x) << 2;
    if (inRoundedRectShape(x, y, ogCamera.x, ogCamera.y, ogCamera.w, ogCamera.h, ogCamera.radius)) {
      og.data[idx] = WHITE.r;
      og.data[idx + 1] = WHITE.g;
      og.data[idx + 2] = WHITE.b;
      if (inCircle(x, y, 600, 315, 46)) {
        og.data[idx] = RED.r;
        og.data[idx + 1] = RED.g;
        og.data[idx + 2] = RED.b;
      }
    }
  }
}
writeFileSync(resolve(outDir, 'og.png'), PNG.sync.write(og));
console.log('[icons] og.png');

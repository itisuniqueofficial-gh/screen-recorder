/**
 * fetch-ffmpeg.mjs
 *
 * Copies FFmpeg.wasm core assets from the installed @ffmpeg/core package into
 * `public/ffmpeg` so the app is fully self-hosted and privacy-first (no CDN).
 *
 * Runs automatically after `pnpm install`. Exits successfully even if the
 * core package is not yet installed so the first install never fails.
 */
import { mkdir, copyFile, access } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const publicDir = join(root, 'public', 'ffmpeg');

const candidates = ['@ffmpeg/core', '@ffmpeg/core-mt'];

const files = ['ffmpeg-core.js', 'ffmpeg-core.wasm'];

async function copyCore() {
  const copied = [];
  for (const pkg of candidates) {
    const srcDir = join(root, 'node_modules', pkg, 'dist', 'esm');
    if (!existsSync(srcDir)) continue;
    for (const file of files) {
      const src = join(srcDir, file);
      try {
        await access(src);
      } catch {
        continue;
      }
      await mkdir(publicDir, { recursive: true });
      const dest = join(publicDir, `${pkg.replace('@ffmpeg/', '').replace('-mt', '')}-${file}`);
      await copyFile(src, dest);
      copied.push(dest.replace(`${root}/`, ''));
    }
  }

  if (copied.length > 0) {
    console.log(`[ffmpeg] copied core assets -> public/ffmpeg/`);
    for (const f of copied) console.log(`[ffmpeg]   ${f}`);
  } else {
    console.log(
      '[ffmpeg] core assets not found; run again after install to populate public/ffmpeg.'
    );
  }
}

copyCore().catch((err) => {
  console.error('[ffmpeg] failed to copy core assets:', err);
  process.exitCode = 0;
});

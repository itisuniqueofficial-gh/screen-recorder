# Architecture

## Overview

Screen Recorder is a fully client-side, offline-capable PWA. All media is
captured, encoded, and stored on the user's device. The app has no backend —
Cloudflare Pages only serves static assets.

```
┌──────────────────────────────────────────────────────┐
│                     Browser (PWA)                     │
│                                                        │
│  User ──▶ RecorderPanel ──▶ RecorderEngine             │
│                │                │                      │
│                │                ├─▶ MediaRecorder ─┐   │
│                │                │   (screen/audio) │   │
│                │                ├─▶ Canvas capture │   │
│                │                │   (webcam)       │   │
│                │                ▼                  │   │
│                │           Chunks ──▶ Blobs         │   │
│                │                        │           │   │
│                │                        ▼           │   │
│                │                 IndexedDB (Draft)   │   │
│                ▼                                    │   │
│            HistoryStore ──▶ Export ──▶ FFmpeg.wasm  │   │
│                                         (WASM)      │   │
│                        MP4 / GIF ────▶ Download     │   │
└──────────────────────────────────────────────────────┘
```

## Tech stack

| Layer | Choice |
| --- | --- |
| Language | TypeScript (strict) |
| Build | Vite |
| UI | React 19 + Tailwind CSS + `motion` |
| State | Zustand (`src/store/`) |
| Routing | React Router 7 (`src/App.tsx`) |
| Forms | React Hook Form + Zod validation |
| Encoding | FFmpeg.wasm (`@ffmpeg/ffmpeg` + `@ffmpeg/core`, loaded from `public/ffmpeg`) |
| Storage | IndexedDB (`src/lib/indexeddb.ts`) |
| PWA | Workbox (service worker in `dist/sw.js`, generated at build) |

## Data flow

### Recording

1. `RecorderEngine` (`src/lib/recorder/RecorderEngine.ts`) requests screen,
   camera, and/or microphone via the Media Capture API.
2. Captured tracks are combined into a stream and fed to `MediaRecorder`.
3. Recorded chunks are buffered as blobs (`src/lib/blob.ts`) and periodically
   persisted to IndexedDB so interrupted recordings can be recovered
   (`src/lib/export.ts` + draft recovery).
4. Timeline state lives in `recorderStore` (Zustand).

### Export / trim

1. Recordings and drafts are read from IndexedDB.
2. FFmpeg.wasm (`src/lib/ffmpeg/ffmpegClient.ts`) is loaded lazily from
   `public/ffmpeg` — this is why `_headers` allows `wasm-unsafe-eval` and
   blob workers.
3. The stream is muxed to **MP4** or transcoded to **GIF**
   (`src/lib/processing.ts`, `src/lib/trim.ts`).
4. The result is downloaded directly in the browser.

### State

Zustand stores in `src/store/`:

- `recorderStore` — live recording status, elapsed time, paused state.
- `historyStore` — past recordings metadata + draft recovery.
- `settingsStore` — user preferences (theme, defaults), persisted to
  `localStorage`.

## Persistence

- **IndexedDB** — recording blobs, drafts, and export history. Private to the
  origin and never transmitted.
- **localStorage** — lightweight settings.
- **Service worker** — precaches the app shell for offline use.

## Security posture

- Content-Security-Policy delivered via `public/_headers`
  (`frame-ancestors 'none'`, `object-src 'none'`, `default-src 'self'`).
- `Cross-Origin-Opener-Policy: same-origin` for process isolation.
- `Permissions-Policy` restricts camera/microphone/display-capture to `self`.
- No external network requests at runtime; FFmpeg assets are same-origin.
- No tracking, analytics, or telemetry.

## Deployment

Cloudflare Pages (`wrangler.toml`):

- `pages_build_output_dir = "dist"`
- `_redirects` implements SPA fallback (`/* → /index.html`).
- `_headers` sets caching + security headers per path group.
- `404.html` serves branded pages for missing non-HTML assets.

## Performance & budgets

- Lighthouse CI (`.github/workflows/nightly.yml`) enforces budgets from
  `lighthouserc.json` (a11y ≥ 0.95, best-practices ≥ 0.9, SEO ≥ 0.9,
  performance ≥ 0.8 warned).
- FFmpeg.wasm is lazy-loaded only when a recording is exported/trimmed, keeping
  the initial bundle lean.

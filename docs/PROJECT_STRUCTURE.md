# Project Structure

```
.
├── .github/                     # Community health files + CI/CD
│   ├── ISSUE_TEMPLATE/          # bug.yml, feature.yml, config.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── dependabot.yml
│   ├── CODEOWNERS
│   └── workflows/
│       ├── ci.yml               # lint, typecheck, unit tests, build
│       ├── e2e.yml              # Playwright end-to-end tests
│       ├── deploy.yml           # Cloudflare Pages on main
│       ├── release.yml          # GitHub release on tags
│       ├── nightly.yml          # audit + Lighthouse on schedule
│       ├── codeql.yml
│       ├── scorecard.yml
│       └── stale.yml
├── public/                      # Copied verbatim into dist/
│   ├── ffmpeg/                  # FFmpeg.wasm core + worker (bundled)
│   ├── icons/                   # Generated app icons
│   ├── _headers                 # Cloudflare Pages security headers
│   ├── _redirects               # SPA fallback (/* → /index.html)
│   ├── 404.html
│   ├── favicon.svg
│   └── robots.txt
├── scripts/
│   ├── fetch-ffmpeg.mjs         # Downloads FFmpeg.wasm assets
│   ├── generate-icons.mjs       # Generates public/icons
│   ├── version-bump.mjs         # SemVer bump (patch/minor/major/prerelease)
│   ├── changelog.mjs            # Keep-a-Changelog generator from git log
│   └── release.mjs              # Release orchestrator (bump → tag → push)
├── src/
│   ├── components/
│   │   ├── layout/              # AppShell
│   │   ├── recorder/            # RecorderPanel, RecordingDock, shortcuts
│   │   └── ui/                  # primitives + icons
│   ├── config/                  # recorder.config.ts, shortcuts.ts
│   ├── constants/               # App-wide constants (routes, media)
│   ├── hooks/                   # useTheme
│   ├── lib/
│   │   ├── recorder/            # RecorderEngine (core logic)
│   │   ├── ffmpeg/              # ffmpegClient (WASM encoder)
│   │   ├── audio.ts, canvas.ts, capture.ts, export.ts,
│   │   │   indexeddb.ts, processing.ts, stream.ts, trim.ts, ...
│   ├── pages/                   # Record, History, Settings, About, Shortcuts
│   ├── store/                   # Zustand stores (history, recorder, settings)
│   ├── styles/index.css         # Tailwind + design tokens
│   ├── types/                   # media.ts, settings.ts
│   ├── utils/                   # browser, format, id, mime
│   ├── App.tsx                  # Router (incl. catch-all → redirect)
│   └── main.tsx                 # Entry point
├── tests/
│   ├── smoke.e2e.ts             # Playwright end-to-end tests
│   └── unit/                    # Vitest unit tests (+ setup.ts)
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── SECURITY.md
├── commitlint.config.mjs
├── lighthouserc.json            # Lighthouse CI budget config
├── playwright.config.ts
├── postcss.config.js
├── tailwind.config.ts
├── vite.config.ts
└── wrangler.toml                # Cloudflare Pages deploy config
```

## Where things live

| Concern | Location |
| --- | --- |
| UI components | `src/components/` |
| Routes / pages | `src/pages/`, routed in `src/App.tsx` |
| Business logic | `src/lib/` |
| Global state | `src/store/` (Zustand) |
| Constants / config | `src/constants/`, `src/config/` |
| Static assets | `public/` |
| CI/CD | `.github/workflows/` |
| Release tooling | `scripts/` |

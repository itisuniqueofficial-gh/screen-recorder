# Screen Recorder

A professional, **privacy-first** browser-based screen recorder. Everything —
recording, encoding, trimming, and export — happens locally in your browser.
Your media never leaves your device.

## Features

- Record your screen, tab, or window, optionally with webcam and/or microphone.
- Trim recordings, export to **MP4** or **GIF**.
- On-device encoding via FFmpeg.wasm (WebAssembly, no server).
- Draft recovery for interrupted recordings.
- Keyboard shortcuts and a dark/light theme.
- Fully offline-capable Progressive Web App.
- No tracking, analytics, or telemetry — ever.

## Badges

|         |                                                                                                                                                                                                                         |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CI      | [![CI](https://github.com/itisuniqueofficial-gh/screen-recorder/actions/workflows/ci.yml/badge.svg)](https://github.com/itisuniqueofficial-gh/screen-recorder/actions/workflows/ci.yml)                                 |
| E2E     | [![E2E](https://github.com/itisuniqueofficial-gh/screen-recorder/actions/workflows/e2e.yml/badge.svg)](https://github.com/itisuniqueofficial-gh/screen-recorder/actions/workflows/e2e.yml)                              |
| CodeQL  | [![CodeQL](https://github.com/itisuniqueofficial-gh/screen-recorder/actions/workflows/codeql.yml/badge.svg)](https://github.com/itisuniqueofficial-gh/screen-recorder/actions/workflows/codeql.yml)                     |
| Release | [![Release](https://github.com/itisuniqueofficial-gh/screen-recorder/actions/workflows/release.yml/badge.svg)](https://github.com/itisuniqueofficial-gh/screen-recorder/actions/workflows/release.yml)                  |
| Deploy  | [![Deploy](https://github.com/itisuniqueofficial-gh/screen-recorder/actions/workflows/deploy.yml/badge.svg)](https://github.com/itisuniqueofficial-gh/screen-recorder/actions/workflows/deploy.yml)                     |
| License | [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)                                                                                                                                           |
| OpenSSF | [![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/itisuniqueofficial-gh/screen-recorder/badge)](https://securityscorecards.dev/viewer/?uri=github.com/itisuniqueofficial-gh/screen-recorder) |

## Getting started

Requirements: **Node.js ≥ 20** and **pnpm ≥ 9**.

```bash
pnpm install
pnpm dev
```

Production build and preview:

```bash
pnpm build
pnpm preview
```

## Development

```bash
pnpm lint        # ESLint
pnpm lint:css    # Stylelint
pnpm typecheck   # tsc
pnpm format      # Prettier (write)
pnpm test        # Vitest unit tests
pnpm e2e         # Playwright end-to-end tests
```

See [docs/TESTING.md](docs/TESTING.md) for the full quality pipeline and
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how the app is built.

## Contributing

We follow a **trunk-based, branch-per-feature** flow with
[Conventional Commits](https://www.conventionalcommits.org/). See
[CONTRIBUTING.md](CONTRIBUTING.md) and the [code of conduct](CODE_OF_CONDUCT.md).
Bug reports and security issues are welcome — see
[SECURITY.md](SECURITY.md) for the private disclosure process.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Project structure](docs/PROJECT_STRUCTURE.md)
- [Release process](docs/RELEASING.md)
- [Testing](docs/TESTING.md)
- [Security policy](SECURITY.md)
- [Changelog](CHANGELOG.md)

## License

Released under the [MIT License](LICENSE).

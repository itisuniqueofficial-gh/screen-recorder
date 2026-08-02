# Testing

The project runs four layers of quality checks. **All of them are enforced in
CI** (`.github/workflows/ci.yml` and `.github/workflows/e2e.yml`).

## Layer 1 — Static analysis

```bash
pnpm lint          # ESLint (eslint.config.js)
pnpm lint:css      # Stylelint (stylelint-config-standard)
pnpm typecheck     # tsc --noEmit (strict)
pnpm format:check  # Prettier in check mode
pnpm format        # Prettier (write mode)
```

Pre-commit, `lint-staged` formats and lints staged files; the `commit-msg` hook
runs commitlint.

## Layer 2 — Unit tests (Vitest)

```bash
pnpm test              # run once
pnpm test:watch        # watch mode
pnpm test:coverage     # run with coverage report
```

- Tests live in `tests/unit/` mirroring `src/` (e.g. `src/utils/format.ts` →
  `tests/unit/utils/format.test.ts`).
- Pure logic (formatting, ids, mimes, blob helpers, errors, theme) is the
  primary target.
- `tests/unit/setup.ts` configures the test environment.

## Layer 3 — End-to-end tests (Playwright)

```bash
pnpm e2e        # build + preview + run
pnpm e2e:headed # visible Chromium, for debugging
```

- Specs live in `tests/smoke.e2e.ts`.
- `playwright.config.ts` builds the app and serves it on
  `http://127.0.0.1:4173` before running.
- CI uses Chromium with 2 retries; the browser is installed in CI via
  `pnpm exec playwright install --with-deps chromium`.

## Layer 4 — Lighthouse CI (nightly)

`.github/workflows/nightly.yml` audits the live production site against
`lighthouserc.json`:

| Category | Threshold | Mode |
| --- | --- | --- |
| Accessibility | ≥ 0.95 | error |
| Best practices | ≥ 0.90 | error |
| SEO | ≥ 0.90 | error |
| Performance | ≥ 0.80 | warn |

## Adding a test

1. Unit: add `tests/unit/.../your-thing.test.ts` with a `describe` block and
   focused assertions. Keep it deterministic — no real timers or media APIs
   unless mocked.
2. E2E: extend `tests/smoke.e2e.ts` for user flows (route navigation, recorder
   UI states). Avoid depending on real capture hardware.
3. Run the full gate locally before pushing:

```bash
pnpm typecheck && pnpm lint && pnpm lint:css && pnpm format:check && pnpm test && pnpm build && pnpm e2e
```

## Coverage expectations

There is no hard coverage gate, but pure utility and helper modules should aim
for high branch coverage since they carry the correctness of the recording
pipeline.

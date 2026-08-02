# Contributing

Thanks for taking the time to contribute. Please read the
[code of conduct](CODE_OF_CONDUCT.md) and this guide before opening issues or
pull requests.

## Branch model

We use a lightweight git flow:

- `main` — production, always releasable. Protected; only merged via PRs.
- `develop` — integration branch. Protected; only merged via PRs.
- `feature/*` — your work. Branch from `develop`, merge back via PR.

```
main ────────────────────────────────▶ tagged releases
  └── develop ───────────▶ merge (squash) ──▶ main
        └── feature/my-change ──▶ PR into develop
```

## First steps

```bash
git checkout develop
git pull
git checkout -b feature/your-descriptive-name
pnpm install
```

## Committing

Commits must follow [Conventional Commits](https://www.conventionalcommits.org/).
A `commit-msg` hook (via [Husky](https://typicode.github.io/husky/)) validates
your message, and `lint-staged` formats and lints staged files.

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`,
`build`, `ci`, `chore`, `release`, `revert`.

Examples:

```text
feat: add webcam preview toggle
fix(export): retry failed MP4 muxing
docs: expand architecture diagram
chore(deps): update zustand to 5.0.3
```

## Quality gates

Before opening a PR, run the full suite locally — all must pass:

```bash
pnpm typecheck
pnpm lint
pnpm lint:css
pnpm format:check
pnpm test
pnpm build
pnpm e2e   # builds + serves the app in Chromium
```

CI runs every one of these on every push and pull request.

## Opening a pull request

1. Push your branch and open a PR against `develop`.
2. Fill in the PR template (summary, test plan, screenshots if applicable).
3. Wait for CI. Address all failing checks.
4. Request a review from a code owner.

## Code style

- TypeScript, strict mode. Prefer explicit types at module boundaries.
- Components live in `src/components/`, pages in `src/pages/`, business logic
  in `src/lib/` and `src/store/`.
- No magic strings in components — constants live in `src/constants/` or
  `src/config/`.
- Tests for every new pure function; end-to-end tests for new user flows.
- Never add runtime comments unless they explain non-obvious behavior.

## Dependencies

- `pnpm add <pkg>` for runtime deps, `pnpm add -D <pkg>` for dev deps.
- Dependabot opens weekly updates; keep your branch rebased on `develop`.

## Reporting issues

- Bugs: use the **Bug report** template and include repro steps.
- Features: use the **Feature request** template.
- Security: do **not** open a public issue — follow
  [SECURITY.md](SECURITY.md).

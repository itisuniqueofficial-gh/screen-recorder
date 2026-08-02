# Releasing

Releases follow [Semantic Versioning](https://semver.org/) and the
[Keep a Changelog](https://keepachangelog.com/) format, driven entirely by
[Conventional Commits](https://www.conventionalcommits.org/).

## Versioning rules

| Commit type | Effect |
| --- | --- |
| `feat:` | minor bump (`1.0.0` → `1.1.0`) |
| `fix:` / `perf:` | patch bump (`1.0.0` → `1.0.1`) |
| `breaking change` / `BREAKING CHANGE:` in body | major bump (`1.0.0` → `2.0.0`) |
| `docs:`, `test:`, `refactor:`, `style:`, `ci:`, `chore:` | no version change |

The commit type is detected from the git log since the last tag.

## Branch flow

```
feature/* ──▶ develop ──▶ (squash merge) ──▶ main ──▶ tag vX.Y.Z ──▶ release
```

1. Merge feature branches into `develop` via PR.
2. Merge `develop` into `main` via PR.
3. Run the release from `main` (see below). The tag triggers `release.yml`.

## Running a release

```bash
pnpm release patch    # or minor | major | prerelease | <explicit version>
```

`scripts/release.mjs` will:

1. **Guard** — abort if the working tree is dirty or you are not on `main`.
2. **Verify** — run `lint`, `typecheck`, `test`, and `build`; abort on failure.
3. **Bump** — compute the next version from git log via `scripts/version-bump.mjs`
   and update `package.json` (and lockfile).
4. **Changelog** — regenerate `CHANGELOG.md` from git log
   (`scripts/changelog.mjs`).
5. **Commit** — `chore(release): v<version>`.
6. **Tag** — `v<version>` (annotated).
7. **Push** — push the commit and the tag to `origin/main`.

## What the tag does

The pushed tag triggers `.github/workflows/release.yml`, which:

- Builds and uploads distribution archives.
- Generates an SBOM (CycloneDX).
- Writes `SHA256SUMS`.
- Creates a GitHub release with `softprops/action-gh-release`.

`deploy.yml` runs on every push to `main` and deploys to Cloudflare Pages, so
production is updated as soon as the release commit lands.

## Version reference

| Entry | Value |
| --- | --- |
| `package.json` `version` | bumped by the script |
| `CHANGELOG.md` | generated, tag-matching |
| Git tags | `v1.0.0`, `v1.1.0`, … |
| GitHub Releases | created from tags |

## Checklist before releasing

- [ ] `develop` is merged into `main`.
- [ ] `pnpm typecheck && pnpm lint && pnpm lint:css && pnpm format:check` pass.
- [ ] `pnpm test` and `pnpm e2e` pass.
- [ ] `pnpm build` succeeds.
- [ ] `CHANGELOG.md` is up to date after the release commit.

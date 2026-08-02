# Security Policy

## Reporting a Vulnerability

Please report security vulnerabilities privately through GitHub's
[Security Advisories](https://github.com/itisuniqueofficial-gh/screen-recorder/security/advisories)
for this repository. **Do not** open a public issue.

When you open an advisory, please include:

- A description of the vulnerability and the affected version(s).
- Steps to reproduce or a minimal proof of concept.
- Any suggested remediation, if known.

You should receive an acknowledgement within **72 hours**. We aim to triage and
respond with a fix plan within **7 days**. If the issue is confirmed, we will
coordinate a disclosure date and credit you in the advisory and changelog.

## Supported Versions

Only the latest release on the `main` branch receives security patches.
Older tagged releases are supported on a best-effort basis:

| Version          | Supported      |
| ---------------- | -------------- |
| main             | ✅ Yes         |
| Latest release   | ✅ Yes         |
| < latest release | ⚠️ Best effort |

## Security Model

This application is intentionally **privacy-first**:

- Recording, encoding, and processing happen **entirely in your browser**.
  Nothing is uploaded to any server.
- Media is stored in your local **IndexedDB** and never leaves the device.
- No tracking, analytics, or telemetry is included.
- `wasm-unsafe-eval` is required to run the bundled FFmpeg.wasm encoder, but
  all scripts and workers are served from the same origin.

## Reporting Scope

Issues in these areas are in scope:

- Cross-origin / same-origin isolation violations.
- Media handling that could leak data across recordings or tabs.
- Service worker or cache poisoning.
- Permission handling for camera, microphone, or display capture.

Out of scope:

- Vulnerabilities in third-party dependencies with a fixed upstream release
  (please still report them; we will upgrade promptly).
- Social engineering or phishing involving the site.

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const type = process.argv[2] ?? 'patch';

const run = (cmd) => execSync(cmd, { stdio: 'inherit', cwd: root });

try {
  run('git diff --quiet HEAD');
} catch {
  console.error('Working tree is not clean. Commit or stash your changes first.');
  process.exit(1);
}

console.log('==> Running quality gates...');
run('pnpm lint');
run('pnpm test');
run('pnpm build');

console.log(`==> Bumping version (${type})...`);
run(`node scripts/version-bump.mjs ${type}`);
run('node scripts/changelog.mjs');

const version = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).version;

console.log(`==> Committing release v${version}...`);
run('git add -A');
run(`git commit -m "chore(release): v${version}"`);
run(`git tag "v${version}"`);

console.log('==> Pushing...');
run('git push');
run('git push --tags');

console.log(`\nReleased v${version}. The Release workflow will publish the GitHub Release.`);

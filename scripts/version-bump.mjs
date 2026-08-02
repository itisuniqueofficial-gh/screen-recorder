import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const pkgPath = resolve(root, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

const release = process.argv[2] ?? 'patch';
const VALID = ['major', 'minor', 'patch', 'premajor', 'preminor', 'prepatch', 'prerelease'];

if (!VALID.includes(release)) {
  console.error(`Invalid release type "${release}". Use one of: ${VALID.join(', ')}`);
  process.exit(1);
}

const match = /^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/.exec(pkg.version);
if (!match) {
  console.error(`Cannot parse current version "${pkg.version}".`);
  process.exit(1);
}

const [, majorS, minorS, patchS, pre] = match;
const major = Number(majorS);
const minor = Number(minorS);
const patch = Number(patchS);

let next;
switch (release) {
  case 'major':
    next = `${major + 1}.0.0`;
    break;
  case 'minor':
    next = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
    next = `${major}.${minor}.${patch + 1}`;
    break;
  case 'premajor':
    next = `${major + 1}.0.0-0`;
    break;
  case 'preminor':
    next = `${major}.${minor + 1}.0-0`;
    break;
  case 'prepatch':
    next = `${major}.${minor}.${patch + 1}-0`;
    break;
  case 'prerelease': {
    if (pre) {
      const m = /^(.*?)(\d+)$/.exec(pre);
      next = m
        ? `${major}.${minor}.${patch}-${m[1]}${Number(m[2]) + 1}`
        : `${major}.${minor}.${patch}-${pre}.1`;
    } else {
      next = `${major}.${minor}.${patch}-1`;
    }
    break;
  }
}

pkg.version = next;
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

console.log(`Bumped version ${pkg.version} -> ${next}`);

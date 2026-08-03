import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const changelogPath = resolve(root, 'CHANGELOG.md');

const SECTION_MAP = {
  feat: 'Added',
  feature: 'Added',
  fix: 'Fixed',
  perf: 'Changed',
  revert: 'Fixed',
  docs: 'Documentation',
  deps: 'Dependency Updates',
  chore: 'Chores',
  build: 'Chores',
  ci: 'Chores',
  refactor: 'Chores',
  style: 'Chores',
  test: 'Chores',
};

const groups = new Map();

let from = null;
try {
  from = execSync('git describe --tags --abbrev=0', { cwd: root, encoding: 'utf8' }).trim();
} catch {
  from = null;
}

const range = from ? `${from}..HEAD` : '';
const log = execSync(`git log --format=%s --no-merges ${range}`, {
  cwd: root,
  encoding: 'utf8',
});

for (const line of log.split('\n')) {
  const subject = line.trim();
  if (!subject) continue;
  const m = /^([a-z]+)(?:\([^)]*\))?!?:\s*(.*)$/.exec(subject);
  if (m && SECTION_MAP[m[1]]) {
    const heading = SECTION_MAP[m[1]];
    const item = `- ${m[2]} (${m[1]})`;
    groups.set(heading, [...(groups.get(heading) ?? []), item]);
  } else if (m && m[1] === 'security') {
    groups.set('Security', [...(groups.get('Security') ?? []), `- ${m[2]}`]);
  } else {
    groups.set('Chores', [...(groups.get('Chores') ?? []), `- ${subject}`]);
  }
}

const ordered = [
  'Added',
  'Changed',
  'Fixed',
  'Removed',
  'Security',
  'Dependency Updates',
  'Documentation',
  'Chores',
];

const sectionLines = [`## [${pkg.version}] - ${new Date().toISOString().slice(0, 10)}`, ''];
for (const heading of ordered) {
  const items = groups.get(heading);
  if (!items?.length) continue;
  sectionLines.push(`### ${heading}`);
  for (const item of items) sectionLines.push(item);
  sectionLines.push('');
}
const section = sectionLines.join('\n').trimEnd();

const header = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
`;

let existing = '';
try {
  existing = readFileSync(changelogPath, 'utf8');
} catch {
  existing = '';
}
existing = existing.replace(/^# Changelog[\s\S]*?\n## \[Unreleased\]\n?/, '').trim();
const existingTrimmed = existing.replace(/\n{3,}/g, '\n\n').trim();

const content = `${header}\n## [Unreleased]\n\n${section}\n${existingTrimmed ? `\n\n${existingTrimmed}\n` : ''}`;

writeFileSync(changelogPath, content);
console.log(`Updated CHANGELOG.md for v${pkg.version}`);

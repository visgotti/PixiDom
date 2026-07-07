#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const README_PATH = path.join(ROOT, 'README.md');
const MARKDOWN_PATH = path.join(ROOT, 'test-results', 'snapshot-report.md');

const START_MARKER = '<!-- SNAPSHOT_REPORT_START -->';
const END_MARKER = '<!-- SNAPSHOT_REPORT_END -->';

if (!fs.existsSync(MARKDOWN_PATH)) {
  console.error(`Snapshot markdown not found at ${MARKDOWN_PATH}. Run \`npm run snapshot-report\` first.`);
  process.exit(1);
}

const readme = fs.readFileSync(README_PATH, 'utf-8');
const snapshot = fs.readFileSync(MARKDOWN_PATH, 'utf-8').trim();

const startIdx = readme.indexOf(START_MARKER);
const endIdx = readme.indexOf(END_MARKER);

if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
  console.error(
    `Could not find markers in README.md.\nExpected:\n  ${START_MARKER}\n  ${END_MARKER}`
  );
  process.exit(1);
}

const before = readme.slice(0, startIdx + START_MARKER.length);
const after = readme.slice(endIdx);

const replaced = `${before}\n\n${snapshot}\n\n${after}`;

fs.writeFileSync(README_PATH, replaced, 'utf-8');
console.log(`Injected snapshot report into ${README_PATH}`);

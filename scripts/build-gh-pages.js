#!/usr/bin/env node

/**
 * Build script for the GitHub Pages demo site.
 *
 * Layout produced under `gh-pages/`:
 *   index.html, styles.css, demo-styles.css     (from demo/)
 *   demos/<component>/index.html                 (from demo/demos)
 *   shared/, lib/, fonts/                        (from demo/)
 *   pixidom.js                                   (overridden by latest dist/)
 *   docs/                                        (typedoc output)
 *   snapshot-report.html, tests/e2e/.../*.png    (visual parity report)
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const demoDir = path.join(rootDir, 'demo');
const outDir = path.join(rootDir, 'gh-pages');
const distDir = path.join(rootDir, 'dist');
const docsDir = path.join(rootDir, 'docs');
const snapshotsRoot = path.join(rootDir, 'tests', 'e2e');
const snapshotReportHtml = path.join(rootDir, 'test-results', 'snapshot-report.html');

function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}

function copyDir(src, dest) {
    ensureDir(dest);
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function copyFile(src, dest) {
    ensureDir(path.dirname(dest));
    fs.copyFileSync(src, dest);
}

console.log('Building GitHub Pages site -> ' + outDir);

if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
}
ensureDir(outDir);

console.log('  - Copying demo source files');
copyDir(demoDir, outDir);

// Local dev paths point at `dist/` (so any static server from the repo root works
// without copying/symlinking). In the flattened gh-pages layout `dist/` doesn't
// exist alongside the demo, so rewrite to the published location at the site root.
const loaderPath = path.join(outDir, 'shared', 'demo-loader.js');
if (fs.existsSync(loaderPath)) {
    const loaderSrc = fs.readFileSync(loaderPath, 'utf8')
        .replace("'../../../dist/pixidom.js'", "'../../pixidom.js'");
    fs.writeFileSync(loaderPath, loaderSrc);
}
const indexPath = path.join(outDir, 'index.html');
if (fs.existsSync(indexPath)) {
    const indexSrc = fs.readFileSync(indexPath, 'utf8')
        .replace('"../dist/pixidom.js"', '"./pixidom.js"');
    fs.writeFileSync(indexPath, indexSrc);
}

console.log('  - Copying built library (dist/pixidom.js)');
const pixidomBundle = path.join(distDir, 'pixidom.js');
if (fs.existsSync(pixidomBundle)) {
    copyFile(pixidomBundle, path.join(outDir, 'pixidom.js'));
} else {
    console.warn('    ! pixidom.js not found. Run `npm run build` first.');
}

console.log('  - Copying typedoc documentation');
if (fs.existsSync(docsDir)) {
    copyDir(docsDir, path.join(outDir, 'docs'));
} else {
    console.warn('    ! docs/ not found. Run `npm run docs` first.');
}

console.log('  - Copying snapshot report');
if (fs.existsSync(snapshotReportHtml)) {
    copyFile(snapshotReportHtml, path.join(outDir, 'snapshot-report.html'));
    if (fs.existsSync(snapshotsRoot)) {
        copyDir(snapshotsRoot, path.join(outDir, 'tests', 'e2e'));
    }
} else {
    console.warn('    ! snapshot-report.html not found. Run `npm run snapshot-report` first.');
}

// previews/<component>.png are captured by scripts/capture-demo-previews.js,
// which is run after this script in `npm run build:demo`.
console.log('Done.');

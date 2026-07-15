#!/usr/bin/env node

/**
 * Post-build type-declaration fixups so the published package types resolve
 * cleanly for consumers under every module-resolution mode.
 *
 * vite-plugin-dts emits per-file .d.ts under dist/ but:
 *   1. It does not emit the ambient `declare global { namespace PIXI }` from
 *      src/global.d.ts. Without it every component (all extend PIXI.Container)
 *      loses its inherited Pixi API in consumer types and strict builds fail
 *      with "Cannot find namespace 'PIXI'".
 *   2. The single dist/index.d.ts is served under both the `import` and
 *      `require` export conditions. When imported from ESM it "masquerades as
 *      CJS" (are-the-types-wrong / publint), producing wrong default-interop.
 *
 * This script:
 *   - copies src/global.d.ts -> dist/global.d.ts and makes dist/index.d.ts
 *     reference it (triple-slash), so the global PIXI namespace ships and is
 *     auto-loaded whenever the package types are used.
 *   - writes dist/index.d.mts (ESM) and dist/index.d.cts (CJS) thin wrappers
 *     that re-export the canonical declarations, so each export condition gets
 *     a declaration file with the matching module format.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const srcGlobal = path.join(rootDir, 'src', 'global.d.ts');
const distDir = path.join(rootDir, 'dist');
const distIndex = path.join(distDir, 'index.d.ts');

const REFERENCE = '/// <reference path="./global.d.ts" />';

function fail(msg) {
    console.error(`postbuild-types: ${msg}`);
    process.exit(1);
}

if (!fs.existsSync(distIndex)) {
    fail('dist/index.d.ts not found - run `vite build` first.');
}
if (!fs.existsSync(srcGlobal)) {
    fail('src/global.d.ts not found.');
}

// 1. Ship the ambient global PIXI namespace alongside the declarations.
fs.copyFileSync(srcGlobal, path.join(distDir, 'global.d.ts'));

// 2. Reference it from the canonical entry so consumers auto-load the namespace.
let indexSrc = fs.readFileSync(distIndex, 'utf8');
if (!indexSrc.includes(REFERENCE)) {
    indexSrc = `${REFERENCE}\n${indexSrc}`;
    fs.writeFileSync(distIndex, indexSrc);
}

// 3. Emit ESM (.d.mts) and CJS (.d.cts) wrappers pointing at the canonical
//    entry. Re-exporting `./index.js` resolves to dist/index.d.ts under both
//    module systems while giving each export condition a format-correct file.
const wrapper = `${REFERENCE}\nexport * from './index.js';\n`;
fs.writeFileSync(path.join(distDir, 'index.d.mts'), wrapper);
fs.writeFileSync(path.join(distDir, 'index.d.cts'), wrapper);

console.log('postbuild-types: shipped global.d.ts + emitted index.d.mts/index.d.cts');

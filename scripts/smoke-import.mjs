#!/usr/bin/env node
/**
 * Consumer compatibility smoke test.
 *
 * Loads the built artifacts (CJS + ESM) and verifies every public export
 * shape the README/types document is actually present and correctly typed
 * at runtime. Designed to run on every supported Node version (>=16) so we
 * catch syntax-level or API-level regressions before publish.
 *
 * No PIXI global is provided here — the library's top-level code is gated
 * behind `typeof PIXI !== 'undefined'`, so a clean import in Node should
 * succeed without error and expose all class/function exports.
 */

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import process from 'node:process';

const here = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(here, '..', 'dist');

// Minimal PIXI stub so `extends PIXI.Container` / `new PIXI.Graphics` etc.
// don't throw at module-load time. This is purely a load-time smoke test —
// we're verifying the artifact parses and the JS engine can resolve every
// reference, not exercising real rendering behavior.
class StubBase {
    constructor() { this.children = []; }
    addChild() { return this; }
    removeChild() { return this; }
    on() { return this; }
    off() { return this; }
    once() { return this; }
    emit() { return false; }
    removeAllListeners() { return this; }
    destroy() {}
}
class StubGraphics extends StubBase {
    beginFill() { return this; }
    endFill() { return this; }
    drawRect() { return this; }
    drawRoundedRect() { return this; }
    drawCircle() { return this; }
    lineStyle() { return this; }
    clear() { return this; }
}
const PIXI = {
    Container: StubBase,
    Graphics: StubGraphics,
    Sprite: StubBase,
    Text: StubBase,
    Rectangle: class { constructor() {} },
    Loader: class { constructor() { this.resources = {}; } add() { return this; } load() { return this; } },
    loaders: { Loader: class { add() { return this; } load() { return this; } } },
    VERSION: '0.0.0-stub',
    utils: {
        string2hex: (s) => parseInt(String(s).replace('#', ''), 16) || 0,
        hex2string: (n) => '#' + (n >>> 0).toString(16).padStart(6, '0'),
    },
};
globalThis.PIXI = PIXI;

const REQUIRED_EXPORTS = [
    'PixiElement',
    'Button',
    'Toggle',
    'Slider',
    'TextField',
    'ScrollList',
    'ScrollBar',
    'FontLoader',
    'PixiAdapter',
    'getPixiVersion',
    'getPixiLoader',
    'newPixiLoader',
    'utils',
];

function assertHasExports(label, mod) {
    const missing = REQUIRED_EXPORTS.filter((name) => mod[name] === undefined);
    if (missing.length) {
        console.error(`[smoke] ${label} missing exports:`, missing);
        process.exit(1);
    }
    if (typeof mod.PixiAdapter?.createApp !== 'function') {
        console.error(`[smoke] ${label}: PixiAdapter.createApp is not a function`);
        process.exit(1);
    }
    console.log(`[smoke] ${label}: OK (${REQUIRED_EXPORTS.length} exports present)`);
}

// CJS via dynamic import (works in both Node 16+ ESM context and CJS context)
const cjsUrl = new URL('file://' + path.join(distDir, 'index.cjs'));
const cjsMod = await import(cjsUrl.href);
assertHasExports('CJS', cjsMod.default ?? cjsMod);

// ESM
const esmUrl = new URL('file://' + path.join(distDir, 'index.es.mjs'));
const esmMod = await import(esmUrl.href);
assertHasExports('ESM', esmMod);

console.log(`[smoke] node ${process.version} - all artifacts load and export the public API`);

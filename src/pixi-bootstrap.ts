import * as PIXIModule from 'pixi.js';

const globalScope: any =
    typeof globalThis !== 'undefined' ? globalThis
    : typeof window !== 'undefined' ? window
    : null;

if (globalScope && !globalScope.PIXI) {
    globalScope.PIXI = { ...PIXIModule };
}

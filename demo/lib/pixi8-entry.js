import * as PIXI from 'pixi.js';
import 'pixi.js/browser';
import 'pixi.js/app';
import 'pixi.js/events';
import 'pixi.js/lib/scene/index.js';
import 'pixi.js/graphics';
import 'pixi.js/mesh';
import 'pixi.js/text';
import 'pixi.js/text-bitmap';
import 'pixi.js/sprite-tiling';
import 'pixi.js/sprite-nine-slice';
import 'pixi.js/math-extras';
import 'pixi.js/advanced-blend-modes';
import 'pixi.js/prepare';
import 'pixi.js/unsafe-eval';

if (typeof window !== 'undefined') {
  window.PIXI = PIXI;
}

export default PIXI;

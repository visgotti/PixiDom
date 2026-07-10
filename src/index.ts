import './pixi-bootstrap';

import { TextField } from './Components/TextInput/TextField';
export * from './Components/TextInput/TextField';

import { TextArea } from './Components/TextArea';
export * from './Components/TextArea';

export * from './text-layout';

export * from "./Element";
import { PixiElement } from "./Element";

export * from "./Components/ScrollList/ScrollList";
import { ScrollList } from "./Components/ScrollList/ScrollList";

import { ScrollBar } from "./Components/ScrollList/ScrollBar";
export * from "./Components/ScrollList/ScrollBar";

import { Toggle } from './Components/Toggle';
export * from './Components/Toggle';

import { Button } from './Components/Button';
export * from './Components/Button';

import { Slider } from './Components/Slider';
export * from './Components/Slider';

import FontLoader from './FontLoader';
export { FontLoader };

import { PixiAdapter } from './PixiAdapter';
export { PixiAdapter };
export type { CreateAppOptions } from './PixiAdapter';

export {
    ensurePixiCanvasFallback,
    configureRendererView,
    createBitmapText,
    getPixiLoader,
    getPixiVersion,
    newPixiLoader,
    renderContainer,
    resolvePixiRenderer,
    ensurePixiGraphicsCompatibility,
    setBitmapTextTint,
    getRendererCanvas,
    getRendererResolution,
    getRendererScreenSize,
    getRendererPointerScale,
    clientToStageCoords,
    registerPixiRenderer,
    findRendererForCanvas,
    findCanvasFromEvent,
} from './pixi-adapter-utils';
export type { RendererPointerScale } from './pixi-adapter-utils';

import { string2hex, centerPixiObject } from "./utils";
import { ensurePixiGraphicsCompatibility } from './pixi-adapter-utils';
import { normalizeColor, colorToInt, normalizeColorOr, safeColorInt } from './color';

const utils = {
    centerPixiObject,
    string2hex,
    normalizeColor,
    colorToInt,
    normalizeColorOr,
    safeColorInt,
}
export { utils }
export { normalizeColor, colorToInt, colorToHexString, normalizeColorOr, safeColorInt } from './color';
export type { Color, RGBColor, RGBTuple, RGBATuple, NormalizedColor } from './color';
export type { BeforeInputEvent, InputType, HistoryInputType, IKeyboardBase } from './mixins/KeyboardHandlers';

export * from './types';

const populatePixiGlobalObj = (pixiAny: any) => {
  pixiAny['Slider'] = pixiAny['Slider'] || Slider;
  pixiAny['Toggle'] = pixiAny['Toggle'] || Toggle;
  pixiAny['TextField'] = pixiAny['TextField'] || TextField;
  pixiAny['TextArea'] = pixiAny['TextArea'] || TextArea;
  pixiAny['Element'] = pixiAny['Element'] || PixiElement;
  pixiAny['ScrollBar'] = pixiAny['ScrollBar'] || ScrollBar;
  pixiAny['ScrollList'] = pixiAny['ScrollList'] || ScrollList;
  pixiAny['Button'] = pixiAny['Button'] || Button;
  pixiAny['FontLoader'] = pixiAny['FontLoader'] || FontLoader;
  pixiAny['PixiAdapter'] = pixiAny['PixiAdapter'] || PixiAdapter;
  const pixiUtils = pixiAny.utils || (pixiAny.utils = {});

  if (typeof pixiUtils.string2hex !== 'function') {
      pixiUtils.string2hex = string2hex;
  }

  if (typeof pixiUtils.hex2string !== 'function') {
      pixiUtils.hex2string = (value: number) => {
          const hex = safeColorInt(value).toString(16);
          const padded = `000000${hex}`.slice(-6);
          return `#${padded}`;
      };
  }

  if (typeof pixiUtils.centerObject !== 'function') {
      pixiUtils.centerObject = centerPixiObject;
  }
}

const __pixiGlobalScope: any =
    typeof globalThis !== 'undefined' ? globalThis
    : typeof window !== 'undefined' ? window
    : null;

if (__pixiGlobalScope?.PIXI) {
    ensurePixiGraphicsCompatibility();
    populatePixiGlobalObj(__pixiGlobalScope.PIXI);
}

let enforceWebgpu = false;

export const enforceWebGPU = () => {
  
}


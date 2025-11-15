import { TextField } from './Components/TextInput/TextField';
export * from './Components/TextInput/TextField';

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
} from './pixi-adapter-utils';

import { string2hex, centerPixiObject } from "./utils";
import { ensurePixiGraphicsCompatibility } from './pixi-adapter-utils';

const utils = {
    centerPixiObject,
    string2hex
}
export { utils }

export * from './types';

if (typeof PIXI !== 'undefined') {
    ensurePixiGraphicsCompatibility();
    const pixiAny = PIXI as any;

    pixiAny['Slider'] = pixiAny['Slider'] || Slider;
    pixiAny['Toggle'] = pixiAny['Toggle'] || Toggle;
    pixiAny['TextField'] = pixiAny['TextField'] || TextField;
    pixiAny['Element'] = pixiAny['Element'] || PixiElement;
    pixiAny['ScrollBar'] = pixiAny['ScrollBar'] || ScrollBar;
    pixiAny['ScrollList'] = pixiAny['ScrollList'] || ScrollList;
    pixiAny['Button'] = pixiAny['Button'] || Button;
    pixiAny['FontLoader'] = pixiAny['FontLoader'] || FontLoader;

    const pixiUtils = pixiAny.utils || (pixiAny.utils = {});

    if (typeof pixiUtils.string2hex !== 'function') {
        pixiUtils.string2hex = string2hex;
    }

    if (typeof pixiUtils.hex2string !== 'function') {
        pixiUtils.hex2string = (value: number) => {
            const numeric = (typeof value === 'number' && isFinite(value) ? value : 0) >>> 0;
            const hex = (numeric & 0xffffff).toString(16);
            const padded = `000000${hex}`.slice(-6);
            return `#${padded}`;
        };
    }

    if (typeof pixiUtils.centerObject !== 'function') {
        pixiUtils.centerObject = centerPixiObject;
    }
}


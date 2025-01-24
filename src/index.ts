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

import { string2hex, centerPixiObject } from "./utils";

const utils = {
    centerPixiObject,
    string2hex
}
export { utils }

export * from './types';

if(PIXI !== undefined) {
    PIXI['Slider'] = PIXI['Slider'] || Slider;
    PIXI['Toggle'] = PIXI['Toggle'] || Toggle;
    PIXI['TextField'] = PIXI['TextField'] || TextField;
    PIXI['Element'] = PIXI['Element'] || PixiElement;
    PIXI['ScrollBar'] = PIXI['ScrollBar'] || ScrollBar;
    PIXI['ScrollList'] = PIXI['ScrollList'] || ScrollList;
    PIXI['Button'] = PIXI['Button']|| Button;
    if(PIXI.utils && !PIXI.utils['string2hex']) {
        PIXI.utils['string2hex'] = string2hex;
    }
    PIXI.utils['centerObject'] = centerPixiObject;
}


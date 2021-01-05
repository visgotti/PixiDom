import TextField from './Components/TextInput/TextField';
export { TextField };

import { PixiElement } from "./Element";
export { PixiElement };

import { ScrollList } from "./Components/ScrollList/ScrollList";
export { ScrollList };

import { ScrollBar } from "./Components/ScrollList/ScrollBar";
export { ScrollBar }

import { Toggle } from './Components/Toggle';
export { Toggle };

import { Button } from './Components/Button';
export { Button };

import { string2hex } from "./utils";

if(PIXI !== undefined) {
    PIXI['Toggle'] = PIXI['Toggle'] || Toggle;
    PIXI['TextField'] = PIXI['TextField'] || TextField;
    PIXI['Element'] = PIXI['Element'] || PixiElement;
    PIXI['ScrollBar'] = PIXI['ScrollBar'] || ScrollBar;
    PIXI['ScrollList'] = PIXI['ScrollList'] || ScrollList;
    PIXI['Button'] = PIXI['Button']|| Button;
    if(PIXI.utils && !PIXI.utils['string2hex']) {
        PIXI.utils['string2hex'] = string2hex;
    }
}


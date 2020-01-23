import TextField from './Components/TextInput/TextField';
export { TextField };
import { PixiElement } from "./Element";
export { PixiElement };

import { ScrollList } from "./Components/ScrollList/ScrollList";
export { ScrollList };
import { ScrollBar } from "./Components/ScrollList/ScrollBar";
export { ScrollBar }
import { Toggle } from './Components/Toggle';
import { Button } from './Components/Button';

import { string2hex } from "./utils";

if(PIXI !== undefined) {
    if(PIXI['Toggle']) {
        throw new Error('PIXI.Toggle was already defined')
    }
    PIXI['Toggle'] = Toggle;
    PIXI['TextField'] = TextField;
    PIXI['Element'] = PixiElement;
    PIXI['ScrollBar'] = ScrollBar;
    PIXI['ScrollList'] = ScrollList;
    PIXI['Button'] = Button;
    if(PIXI.utils && !PIXI.utils['string2hex']) {
        PIXI.utils['string2hex'] = string2hex;
    }
}

export { Toggle };
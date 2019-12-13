import TextField from './Components/TextInput/TextField';
export { TextField };
import { PixiElement } from "./Element";
export { PixiElement };

import { Toggle } from './Components/Toggle';
if(PIXI !== undefined) {
    if(PIXI['Toggle']) {
        throw new Error('PIXI.Toggle was already defined')
    }
    PIXI['Toggle'] = Toggle;
    PIXI['TextField'] = TextField;
    PIXI['Element'] = PixiElement;
}

export { Toggle };
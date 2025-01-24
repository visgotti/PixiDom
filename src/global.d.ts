import 'pixi.js';
import type { TextField } from './Components/TextInput/TextField';
import type { PixiElement } from './Element';
import type { ScrollList } from './Components/ScrollList/ScrollList';
import type { ScrollBar } from './Components/ScrollList/ScrollBar';
import type { Toggle } from './Components/Toggle';
import type { Button } from './Components/Button';
import type { Slider, SliderOptions } from './Components/Slider';
import { string2hex, centerPixiObject } from './utils';

declare global {
  namespace PIXI {
    interface Slider {
      new (t: SliderOptions): typeof Slider;
    }
    /*
    interface Toggle {
      new (): Toggle;
    }

    interface TextField {
      new (t: any): TextField;
    }

    interface Element {
      new (): PixiElement;
    }

    interface ScrollBar {
      new (t: any): ScrollBar;
    }

    interface ScrollList {
      new (t: any): ScrollList;
    }

    interface Button {
      new (text: string, styleOptions: any): Button;
    }*/

    // Extend PIXI utils
    interface utils {
      string2hex: typeof string2hex;
      centerObject: typeof centerPixiObject;
    }
  }
}

export {};

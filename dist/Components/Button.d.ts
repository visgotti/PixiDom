import { PixiElement } from '../Element';
export interface ButtonStyleStateOptions {
    width?: number;
    height?: number;
    textColor?: number;
    backgroundTexture?: PIXI.Texture;
    backgroundOpacity?: number;
    backgroundColor?: number;
    borderColor?: number;
    borderWidth?: number;
    borderOpacity?: number;
    borderRadius?: number;
}
export interface ButtonStyleOptions {
    useBitmapText: boolean;
    fontSize?: number;
    defaultStyle: ButtonStyleStateOptions;
    hoverStyle?: ButtonStyleStateOptions;
    pressedStyle?: ButtonStyleStateOptions;
    font: string;
}
export declare class Button extends PixiElement {
    private _text;
    private bitmapTxtSprite;
    private txtSprite;
    private bgGraphic;
    private bgSprite;
    private styleOptions;
    private _currentStyleState;
    private _btnState;
    constructor(text: string, styleOptions: ButtonStyleOptions);
    set btnState(newState: any);
    set text(value: any);
    updateStyle(styleOptions: ButtonStyleOptions): void;
    redraw(): void;
    redrawText(): void;
    get textSpriteUtilized(): PIXI.extras.BitmapText | PIXI.Text;
    redrawBg(): void;
    private clear;
    get currentStyleState(): ButtonStyleStateOptions;
}
//# sourceMappingURL=Button.d.ts.map
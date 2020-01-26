/// <reference types="pixi.js" />
import { PixiElement } from "../Element";
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
    defaultStyle: ButtonStyleStateOptions;
    hoverStyle?: ButtonStyleStateOptions;
    pressedStyle?: ButtonStyleStateOptions;
    font: string;
}
export declare class Button extends PixiElement {
    private _text;
    private txtSprite;
    private bgGraphic;
    private bgSprite;
    private styleOptions;
    private _currentStyleState;
    private _btnState;
    constructor(text: string, styleOptions: ButtonStyleOptions);
    btnState: any;
    text: any;
    updateStyle(styleOptions: ButtonStyleOptions): void;
    redraw(): void;
    redrawText(): void;
    redrawBg(): void;
    private clear;
    readonly currentStyleState: ButtonStyleStateOptions;
}
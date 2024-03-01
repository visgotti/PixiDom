/// <reference types="pixi.js" />
import { ToggleOptions } from "../types";
export declare class Toggle extends PIXI.Container {
    private _toggled;
    private backgroundGraphic;
    private circleGraphic;
    private options;
    private circleRadius;
    private computedBorderRadius;
    private onText;
    private offText;
    private usingLabels;
    private updateToggle;
    private _activeBackgroundColor;
    private _inactiveBackgroundColor;
    private _activeCircleColor;
    private _inactiveCircleColor;
    private _travelToX;
    private tween;
    private backgroundColorsArrayIndex;
    private circleColorsArrayIndex;
    private toggleCircleTravelDistance;
    constructor(options: ToggleOptions, isToggled?: boolean);
    get activeBackgroundColor(): number;
    get inactiveBackgroundColor(): number;
    get activeCircleColor(): number;
    get inactiveCircleColor(): number;
    get activeTextLabel(): PIXI.extras.BitmapText;
    get inactiveTextLabel(): PIXI.extras.BitmapText;
    get travelToX(): number;
    set toggled(val: boolean);
    get toggled(): boolean;
    onToggle(callback: any): void;
    private animateToggle;
    private midAnimationToggleUpdate;
    private animatedToggleUpdate;
    private staticToggleUpdate;
    private _showOnText;
    private _showOffText;
}

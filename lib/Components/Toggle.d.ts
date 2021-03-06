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
    readonly activeBackgroundColor: number;
    readonly inactiveBackgroundColor: number;
    readonly activeCircleColor: number;
    readonly inactiveCircleColor: number;
    readonly activeTextLabel: PIXI.extras.BitmapText;
    readonly inactiveTextLabel: PIXI.extras.BitmapText;
    readonly travelToX: number;
    toggled: any;
    onToggle(callback: any): void;
    private animateToggle;
    private midAnimationToggleUpdate;
    private animatedToggleUpdate;
    private staticToggleUpdate;
    private _showOnText;
    private _showOffText;
}

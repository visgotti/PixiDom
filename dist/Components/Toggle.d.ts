import { ToggleOptions } from '../types';
import { BitmapTextLike } from '../pixi-adapter-utils';
/**
 * Animated toggle switch component with customizable colors and optional labels.
 * Supports smooth color transitions between on/off states.
 *
 * @example
 * ```typescript
 * const toggle = new Toggle({
 *   width: 60,
 *   height: 30,
 *   borderRadius: 50,
 *   onBackgroundColor: 0x4cd964,
 *   offBackgroundColor: 0xe5e5e5,
 *   onCircleColor: 0xffffff,
 *   offCircleColor: 0xffffff,
 *   animationOptions: {
 *     type: AnimationType.LINEAR,
 *     duration: 200,
 *   },
 * }, true);
 *
 * toggle.onToggle((isOn) => console.log('Toggle state:', isOn));
 * stage.addChild(toggle);
 * ```
 *
 * @extends PIXI.Container
 */
export declare class Toggle extends PIXI.Container {
    private _toggled;
    private backgroundGraphic;
    private circleGraphic;
    private options;
    private circleRadius;
    private circleDiameter;
    private computedBorderRadius;
    private onText;
    private offText;
    private usingLabels;
    private updateToggle;
    private tween;
    private backgroundColorsArrayIndex;
    private circleColorsArrayIndex;
    private toggleCircleTravelDistance;
    private resolvedColors;
    /**
     * Creates a new Toggle instance.
     * @param options - Configuration options for the toggle appearance and behavior
     * @param isToggled - Initial toggle state (default: false). Prefer using options.startingValue instead.
     */
    constructor(options: ToggleOptions, isToggled?: boolean);
    get activeBackgroundColor(): number;
    get inactiveBackgroundColor(): number;
    get activeCircleColor(): number;
    get inactiveCircleColor(): number;
    get activeTextLabel(): BitmapTextLike | null;
    get inactiveTextLabel(): BitmapTextLike | null;
    get travelToX(): number;
    set toggled(val: boolean);
    /** Gets the current toggle state */
    get toggled(): boolean;
    /**
     * Registers a callback to be invoked when the toggle state changes.
     * @param callback - Function to call with the new toggle state (boolean)
     */
    onToggle(callback: (toggled: boolean) => void): void;
    private animateToggle;
    private midAnimationToggleUpdate;
    private animatedToggleUpdate;
    private staticToggleUpdate;
    private setCircleColor;
    private getCircleCenter;
    private _showOnText;
    private _showOffText;
}
//# sourceMappingURL=Toggle.d.ts.map
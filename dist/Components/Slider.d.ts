import { Color } from '../color';
/**
 * Configuration options for creating a Slider component.
 */
type SliderOptions = {
    /** Starting value of the slider */
    startingValue?: number;
    /** Minimum value of the slider */
    minValue?: number;
    /** Maximum value of the slider */
    maxValue?: number;
    /** Width of the track in pixels */
    width: number;
    /** Height of the track in pixels */
    height: number;
    /** Radius of the handle circle (alias: handleRadius) */
    circleRadius?: number;
    /** Alias for circleRadius */
    handleRadius?: number;
    preventScaleAdjustment?: boolean;
    circleOpacity?: number;
    down?: {
        circleOpacity?: number;
        circleRadius?: number;
        handleRadius?: number;
        /** Accepts any {@link Color} format. */
        circleColor?: Color;
        /** Accepts any {@link Color} format. */
        handleColor?: Color;
        circleOutlineWidth?: number;
        /** Accepts any {@link Color} format. */
        circleOutlineColor?: Color;
        circleOutlineOpacity?: number;
    };
    hover?: {
        circleOpacity?: number;
        circleRadius?: number;
        handleRadius?: number;
        /** Accepts any {@link Color} format. */
        circleColor?: Color;
        /** Accepts any {@link Color} format. */
        handleColor?: Color;
        circleOutlineWidth?: number;
        /** Accepts any {@link Color} format. */
        circleOutlineColor?: Color;
        circleOutlineOpacity?: number;
    };
    /** Color of the active (filled) portion of the track. Accepts any {@link Color} format. */
    activeColor?: Color;
    /** Color of the inactive portion of the track (alias: trackColor). Accepts any {@link Color} format. */
    inactiveColor?: Color;
    /** Alias for inactiveColor. Accepts any {@link Color} format. */
    trackColor?: Color;
    opacity?: number;
    /** Color of the handle circle (alias: handleColor). Accepts any {@link Color} format. */
    circleColor?: Color;
    /** Alias for circleColor. Accepts any {@link Color} format. */
    handleColor?: Color;
    circleOutlineWidth?: number;
    /** Outline color of the handle circle. Accepts any {@link Color} format. */
    circleOutlineColor?: Color;
    circleOutlineOpacity?: number;
    /** Alias for startingValue */
    value?: number;
    /** Alias for minValue */
    min?: number;
    /** Alias for maxValue */
    max?: number;
};
type ResolvedSliderOptions = SliderOptions & {
    startingValue: number;
    minValue: number;
    maxValue: number;
    circleRadius: number;
    activeColor: Color;
    inactiveColor: Color;
    circleColor: Color;
};
/**
 * Draggable slider component for selecting numeric values.
 * Features customizable handle appearance with state-specific styles for hover and pressed states.
 *
 * @example
 * ```typescript
 * const slider = new Slider({
 *   width: 200,
 *   height: 4,
 *   minValue: 0,
 *   maxValue: 100,
 *   startingValue: 50,
 *   activeColor: 0x4a90d9,
 *   inactiveColor: 0xcccccc,
 *   circleRadius: 8,
 *   circleColor: 0xffffff,
 * });
 *
 * slider.onChange((value) => console.log('Slider value:', value));
 * stage.addChild(slider);
 * ```
 *
 * @extends PIXI.Container
 */
declare class Slider extends PIXI.Container {
    /** Whether the slider handle is currently being dragged */
    isDragging: boolean;
    isHovered: boolean;
    curOutlineWidth: number;
    lastX: number;
    resolvedScale: {
        x: number;
        y: number;
    } | null;
    options: ResolvedSliderOptions;
    currentValue: number;
    backgroundGraphic: PIXI.Graphics;
    circleRadius: number;
    circleGraphic: PIXI.Graphics;
    private circleHandle;
    /**
     * Creates a new Slider instance.
     * @param options - Configuration options for the slider appearance and behavior
     */
    constructor(t: SliderOptions);
    resolveScale(): {
        x: number;
        y: number;
    };
    calculateValue(): number;
    redrawCircle(): void;
    redrawBar(): void;
    /**
     * Removes a previously registered change listener.
     * @param callback - The callback function to remove
     */
    offChange(t: (v: number) => void): void;
    /**
     * Registers a callback to be invoked when the slider value changes.
     * @param callback - Function to call with the new slider value
     */
    onChange(t: (v: number) => void): void;
}
export { Slider };
export type { SliderOptions };
//# sourceMappingURL=Slider.d.ts.map
/// <reference types="pixi.js" />
type SliderOptions = {
    startingValue: number;
    minValue: number;
    maxValue: number;
    width: number;
    height: number;
    circleRadius: number;
    preventScaleAdjustment?: boolean;
    circleOpacity?: number;
    down?: {
        circleOpacity?: number;
        circleRadius?: number;
        circleColor?: number;
        circleOutlineWidth?: number;
        circleOutlineColor?: number;
        circleOutlineOpacity?: number;
    };
    hover?: {
        circleOpacity?: number;
        circleRadius?: number;
        circleColor?: number;
        circleOutlineWidth?: number;
        circleOutlineColor?: number;
        circleOutlineOpacity?: number;
    };
    activeColor: number;
    inactiveColor: number;
    opacity?: number;
    circleColor?: number;
    circleOutlineWidth?: number;
    circleOutlineColor?: number;
    circleOutlineOpacity?: number;
};
declare class Slider extends PIXI.Container {
    isDragging: boolean;
    isHovered: boolean;
    curOutlineWidth: number;
    lastX: number;
    resolvedScale: {
        x: number;
        y: number;
    } | null;
    options: SliderOptions;
    currentValue: number;
    backgroundGraphic: PIXI.Graphics;
    circleRadius: number;
    circleGraphic: PIXI.Graphics;
    constructor(t: SliderOptions);
    resolveScale(): {
        x: number;
        y: number;
    };
    calculateValue(): number;
    redrawCircle(): void;
    redrawBar(): void;
    redraw(): void;
    offChange(t: (v: number) => void): void;
    onChange(t: (v: number) => void): void;
}
export { Slider, SliderOptions };

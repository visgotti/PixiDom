declare const easingFunctions: {
    readonly linear: (k: number) => number;
};
export type ColorTweenEasing = keyof typeof easingFunctions | string;
export interface ColorFrame {
    hex(): string;
}
type Updater = (frames: ColorFrame[], progress: number) => void;
type Ender = (frames: ColorFrame[], progress: number) => void;
export declare class ColorTween {
    private startColors;
    private endColors;
    private updater;
    private ender;
    private length;
    private startTime;
    private easingName;
    constructor(startColorStrings: string[], endColorStrings: string[]);
    onUpdate(fn: Updater): this;
    onEnd(fn: Ender): this;
    duration(ms: number): this;
    easing(name: ColorTweenEasing): this;
    start(cb?: () => void): this;
    update(): ColorFrame[] | null;
    stop(): this;
}
export default ColorTween;
//# sourceMappingURL=ColorTween.d.ts.map
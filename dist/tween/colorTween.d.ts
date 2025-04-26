import { default as Color } from './color';
export declare class ColorTween {
    private startColors;
    private endColors;
    private params;
    constructor(startColorStrings: string[], endColorStrings: string[]);
    onUpdate(callback: (colors: Color | Color[], progress: number) => void): ColorTween;
    onEnd(callback: (colors: Color | Color[]) => void): ColorTween;
    duration(length: number): ColorTween;
    easing(name: string): ColorTween;
    start(callback?: () => void): ColorTween;
    update(): boolean;
    private renderFrame;
    private done;
    stop(): ColorTween;
}
export default ColorTween;
//# sourceMappingURL=colorTween.d.ts.map
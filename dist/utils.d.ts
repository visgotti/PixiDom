import { ValidMeasurement } from './types';
type ParsedMeasurement = (ValidMeasurement & {
    valid: true;
}) | {
    valid: false;
    error: string;
};
export declare const parseLengthMeasurements: (measurement: unknown) => ParsedMeasurement;
export declare function clamp(num: number, min: number, max: number): number;
export declare function string2hex(input: string | number): number;
type PixiRectLike = {
    x: number;
    y: number;
    width: number;
    height: number;
    parent?: {
        width: number;
        height: number;
    } | null;
};
export declare function centerPixiObject(object: PixiRectLike, opts: {
    axis: 'y';
    parent?: {
        height: number;
    };
}): void;
export {};
//# sourceMappingURL=utils.d.ts.map
import { ParsedMeasurement, PixiRectLike, ValidMeasurement } from './types';
export declare const parseLengthMeasurements: (measurement: ValidMeasurement) => ParsedMeasurement;
export declare function clamp(num: any, min: any, max: any): any;
export declare function string2hex(string: string): number;
export declare function centerPixiObject(object: PixiRectLike, opts: {
    axis: 'y';
    parent?: {
        height: number;
    };
}): any;
export declare function centerPixiObject(object: PixiRectLike, opts: {
    axis: 'x';
    parent?: {
        width: number;
    };
}): any;
//# sourceMappingURL=utils.d.ts.map
type ParsedMeasurement = {
    valid: boolean;
    error?: string;
    value?: number;
    type?: string;
};
export declare const parseLengthMeasurements: (measurement: any) => ParsedMeasurement;
export declare function clamp(num: any, min: any, max: any): any;
export declare function string2hex(string: any): number;
type PixiRectLike = {
    x: number;
    y: number;
    width: number;
    height: number;
    parent?: {
        width: number;
        height: number;
    };
};
export declare function centerPixiObject(object: PixiRectLike, opts: {
    axis: 'y';
    parent?: {
        height: number;
    };
}): any;
export {};
//# sourceMappingURL=utils.d.ts.map
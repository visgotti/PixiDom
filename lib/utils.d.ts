type ParsedMeasurement = {
    valid: boolean;
    error?: string;
    value?: number;
    type?: string;
};
export declare const parseLengthMeasurements: (measurement: any) => ParsedMeasurement;
export declare function clamp(num: any, min: any, max: any): any;
export declare function string2hex(string: any): number;
export {};

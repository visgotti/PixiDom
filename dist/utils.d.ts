declare type ParsedMeasurement = {
    valid: boolean;
    error?: string;
    value?: number;
    type?: string;
};
export declare const parseLengthMeasurements: (measurement: any) => ParsedMeasurement;
export {};

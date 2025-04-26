export interface EasingFunction {
    (k: number): number;
    In?: (k: number) => number;
    Out?: (k: number) => number;
    InOut?: (k: number) => number;
}
export interface EasingFunctions {
    [key: string]: EasingFunction;
}
declare const processedEasingFunctions: EasingFunctions;
export default processedEasingFunctions;
//# sourceMappingURL=easingFunctions.d.ts.map
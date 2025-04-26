export declare class Color {
    private r;
    private g;
    private b;
    private a;
    constructor(value?: string | number | Color | number[]);
    private parseColorString;
    private parseHexString;
    private parseHex;
    private parseRgbString;
    rgb(): Color;
    array(): number[];
    hex(): string;
    private padZero;
    toString(): string;
    setRgb(values: number[]): Color;
    static rgb(values: number[]): Color;
}
export default Color;
//# sourceMappingURL=color.d.ts.map
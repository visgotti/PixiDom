/**
 * @packageDocumentation
 * Color type definitions and normalization utilities for PixiDom components.
 *
 * Every component option that accepts a color is typed as {@link Color},
 * which is a union of the four formats listed below. Pass whichever is
 * convenient — the component will normalize internally to the integer
 * + alpha pair that the underlying PIXI APIs expect.
 *
 * Accepted formats:
 *   - **Hex string:** `'#e7e7e7'`, `'#fff'`, `'#fff8'`, `'#e7e7e7ff'` (with or without `#`, 3/4/6/8 digits)
 *   - **Hex int:**    `0xe7e7e7` (any integer 0..0xffffff)
 *   - **RGB(A) object:** `{ r: 0-255, g: 0-255, b: 0-255, a?: 0-1 }`
 *   - **RGB(A) tuple:**  `[r, g, b]` or `[r, g, b, a]` with the same ranges
 *
 * Channel values outside their valid ranges are clamped (e.g. `r: 300` → `255`,
 * `a: 1.5` → `1`). Invalid inputs throw a `TypeError` so bugs surface loudly
 * during development rather than silently rendering the wrong color.
 */
/**
 * RGB color with optional alpha channel.
 * Channel ranges: r, g, b ∈ [0, 255]; a ∈ [0, 1] (defaults to 1).
 */
export type RGBColor = {
    r: number;
    g: number;
    b: number;
    a?: number;
};
/** RGB tuple — `[r, g, b]` (alpha defaults to 1). */
export type RGBTuple = readonly [number, number, number];
/** RGBA tuple — `[r, g, b, a]`. */
export type RGBATuple = readonly [number, number, number, number];
/**
 * Any color value accepted by PixiDom component options.
 *
 * @see {@link normalizeColor} for normalization details.
 */
export type Color = number | string | RGBColor | RGBTuple | RGBATuple;
/**
 * Result of {@link normalizeColor}.
 *
 * - `value` is the 24-bit RGB integer (0xRRGGBB) ready to pass to `beginFill`,
 *   `lineStyle`, `tint`, etc.
 * - `alpha` is in [0, 1]. When the input format had no alpha component
 *   (plain number, 6-digit hex, 3-digit hex, RGB object/tuple without `a`),
 *   alpha is `1`.
 */
export type NormalizedColor = {
    value: number;
    alpha: number;
};
/**
 * Coerce any input into a valid 24-bit RGB integer (`0x000000`..`0xffffff`).
 *
 * Non-finite or non-numeric values fall back to `0`. Negative or out-of-range
 * numbers are masked into 24 bits — `0xfffffff` (a 7-digit hex typo) becomes
 * `0xffffff` (white) instead of throwing in pixi 7+'s color validator.
 *
 * Pure: no side effects, no prototype patching. Use this at any boundary that
 * passes a raw number to PIXI Graphics / tint APIs.
 */
export declare const safeColorInt: (value: unknown) => number;
/**
 * Normalize any {@link Color} input to a `{ value, alpha }` pair suitable
 * for the underlying PIXI Graphics / TextStyle / tint APIs.
 *
 * Throws a `TypeError` on unrecognized or malformed inputs (e.g. `null`,
 * `'#zz'`, `{ r: 1 }` missing g/b). Out-of-range channel values are clamped.
 *
 * @example
 * ```ts
 * normalizeColor(0xff0000);              // { value: 0xff0000, alpha: 1 }
 * normalizeColor('#ff0000');             // { value: 0xff0000, alpha: 1 }
 * normalizeColor('#f00');                // { value: 0xff0000, alpha: 1 }
 * normalizeColor('#ff000080');           // { value: 0xff0000, alpha ≈ 0.5 }
 * normalizeColor({ r: 255, g: 0, b: 0 });        // { value: 0xff0000, alpha: 1 }
 * normalizeColor({ r: 255, g: 0, b: 0, a: 0.5 });// { value: 0xff0000, alpha: 0.5 }
 * normalizeColor([255, 0, 0]);                  // { value: 0xff0000, alpha: 1 }
 * normalizeColor([255, 0, 0, 0.25]);            // { value: 0xff0000, alpha: 0.25 }
 * ```
 */
export declare function normalizeColor(input: Color): NormalizedColor;
/**
 * Convenience helper that returns just the 24-bit RGB integer
 * (alpha component is discarded). Useful for APIs that only take a color
 * number, like `BitmapText.tint`.
 */
export declare function colorToInt(input: Color): number;
/**
 * Convert any {@link Color} to a css-style `#rrggbb` string (alpha discarded).
 * Version-independent replacement for `PIXI.utils.hex2string`, which was
 * removed in PIXI v8.
 */
export declare function colorToHexString(input: Color): string;
/**
 * Normalize a color when one is provided, otherwise return the fallback.
 * The fallback is also normalized so callers always get a valid result.
 */
export declare function normalizeColorOr(input: Color | undefined | null, fallback: Color): NormalizedColor;
//# sourceMappingURL=color.d.ts.map
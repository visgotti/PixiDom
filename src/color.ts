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
export type Color =
    | number
    | string
    | RGBColor
    | RGBTuple
    | RGBATuple;

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

const clampChannel = (n: number) => {
    if (!Number.isFinite(n)) return 0;
    if (n <= 0) return 0;
    if (n >= 255) return 255;
    return Math.round(n);
};

const clampAlpha = (n: number) => {
    if (!Number.isFinite(n)) return 1;
    if (n <= 0) return 0;
    if (n >= 1) return 1;
    return n;
};

const HEX_RE = /^[0-9a-fA-F]+$/;

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
export const safeColorInt = (value: unknown): number => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
    return (value >>> 0) & 0xffffff;
};

const fromRgb = (r: number, g: number, b: number, a?: number): NormalizedColor => {
    const value =
        (clampChannel(r) << 16) | (clampChannel(g) << 8) | clampChannel(b);
    return {
        value: value >>> 0,
        alpha: a === undefined ? 1 : clampAlpha(a),
    };
};

const fromHexString = (raw: string): NormalizedColor => {
    let s = raw.trim();
    if (!s.length) {
        throw new TypeError(`Invalid color string: ${JSON.stringify(raw)}`);
    }
    if (s.startsWith('#')) s = s.slice(1);
    if (s.startsWith('0x') || s.startsWith('0X')) s = s.slice(2);
    if (!HEX_RE.test(s)) {
        throw new TypeError(`Invalid hex color string: ${JSON.stringify(raw)}`);
    }
    let r: number;
    let g: number;
    let b: number;
    let a: number | undefined;
    switch (s.length) {
        case 3: {
            r = parseInt(s[0] + s[0], 16);
            g = parseInt(s[1] + s[1], 16);
            b = parseInt(s[2] + s[2], 16);
            break;
        }
        case 4: {
            r = parseInt(s[0] + s[0], 16);
            g = parseInt(s[1] + s[1], 16);
            b = parseInt(s[2] + s[2], 16);
            a = parseInt(s[3] + s[3], 16) / 255;
            break;
        }
        case 6: {
            r = parseInt(s.slice(0, 2), 16);
            g = parseInt(s.slice(2, 4), 16);
            b = parseInt(s.slice(4, 6), 16);
            break;
        }
        case 8: {
            r = parseInt(s.slice(0, 2), 16);
            g = parseInt(s.slice(2, 4), 16);
            b = parseInt(s.slice(4, 6), 16);
            a = parseInt(s.slice(6, 8), 16) / 255;
            break;
        }
        default:
            throw new TypeError(`Hex color must be 3, 4, 6, or 8 digits: ${JSON.stringify(raw)}`);
    }
    return fromRgb(r, g, b, a);
};

const fromNumber = (n: number): NormalizedColor => {
    if (!Number.isFinite(n)) {
        throw new TypeError(`Invalid color number: ${n}`);
    }
    return { value: safeColorInt(n), alpha: 1 };
};

const isRGBObject = (v: unknown): v is RGBColor => {
    if (!v || typeof v !== 'object') return false;
    const o = v as Record<string, unknown>;
    return typeof o.r === 'number' && typeof o.g === 'number' && typeof o.b === 'number';
};

const isRGBTuple = (v: unknown): v is RGBTuple | RGBATuple => {
    return Array.isArray(v) && (v.length === 3 || v.length === 4) && v.every((n) => typeof n === 'number');
};

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
export function normalizeColor(input: Color): NormalizedColor {
    if (typeof input === 'number') {
        return fromNumber(input);
    }
    if (typeof input === 'string') {
        return fromHexString(input);
    }
    if (isRGBObject(input)) {
        return fromRgb(input.r, input.g, input.b, input.a);
    }
    if (isRGBTuple(input)) {
        const [r, g, b, a] = input as RGBATuple;
        return fromRgb(r, g, b, input.length === 4 ? a : undefined);
    }
    throw new TypeError(`Unrecognized color input: ${JSON.stringify(input)}`);
}

/**
 * Convenience helper that returns just the 24-bit RGB integer
 * (alpha component is discarded). Useful for APIs that only take a color
 * number, like `BitmapText.tint`.
 */
export function colorToInt(input: Color): number {
    return normalizeColor(input).value;
}

/**
 * Normalize a color when one is provided, otherwise return the fallback.
 * The fallback is also normalized so callers always get a valid result.
 */
export function normalizeColorOr(input: Color | undefined | null, fallback: Color): NormalizedColor {
    if (input === undefined || input === null) {
        return normalizeColor(fallback);
    }
    return normalizeColor(input);
}

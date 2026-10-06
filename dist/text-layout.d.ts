/**
 * @packageDocumentation
 * Pure text-layout and caret/selection math shared by text components.
 *
 * Nothing in this module touches PIXI: glyph metrics come in through a
 * {@link MeasureGlyph} callback and everything else is plain data. This keeps
 * the same selection math reusable across TextField (single line), TextArea
 * (multi line with wrapping and scrolling), and any future text-bearing
 * component, and makes it fully unit-testable.
 *
 * Caret semantics: a caret index is a position BETWEEN characters, in
 * `0..text.length`. Every line exposes a `positions` table where
 * `positions[col]` is the caret x for column `col`, so mapping between
 * indices, columns, and pixels is table lookup rather than re-measuring.
 */
/**
 * Returns the horizontal advance for `char` when it follows `prevChar`
 * (`prevChar` is null at the start of a line — kerning-aware measures can
 * use it, fixed-width measures can ignore it).
 */
export type MeasureGlyph = (char: string, prevChar: string | null) => number;
export type LayoutOptions = {
    measure: MeasureGlyph;
    /** Vertical distance between line tops; also the height of a line box. */
    lineHeight: number;
    /** Wrap lines to this pixel width. Omit for no soft wrapping. */
    wrapWidth?: number;
};
export type LayoutLine = {
    /** Index into the source text of this line's first character. */
    start: number;
    /** The line's visible text (never contains the newline). */
    text: string;
    /** Top of the line box. */
    y: number;
    /**
     * Caret x positions for this line: `positions[col]` for
     * `col in 0..text.length` (so it always has `text.length + 1` entries).
     */
    positions: number[];
    /** Rendered width — `positions[text.length]`. */
    width: number;
    /** True when the line ends at a `\n` or the end of the text (not a soft wrap). */
    hardBreak: boolean;
};
export type TextLayout = {
    text: string;
    lines: LayoutLine[];
    lineHeight: number;
    /** Widest line width. */
    width: number;
    /** `lines.length * lineHeight`. */
    height: number;
};
export type CaretPosition = {
    line: number;
    col: number;
    x: number;
    y: number;
};
export type SelectionRect = {
    x: number;
    y: number;
    width: number;
    height: number;
};
/**
 * Lay out `text` into lines, breaking on `\n` and soft-wrapping to
 * `wrapWidth` when provided. Soft wraps prefer the last space on the line
 * (the space stays at the end of the wrapped line, as browsers do); words
 * wider than `wrapWidth` break mid-word, and a line always accepts at least
 * one character so layout cannot stall.
 */
export declare function layoutText(text: string, options: LayoutOptions): TextLayout;
/**
 * Half-glyph caret rule against a caret-positions table: clicking the left
 * half of a glyph places the caret before it, the right half after it.
 * Returns a column in `0..positions.length - 1`.
 */
export declare function caretColFromX(positions: number[], x: number): number;
/**
 * Build a caret-positions table from glyph boxes (anything with `x` and
 * `width`, e.g. PixiDom's virtual bitmap-text glyphs). `positions[0]` is 0;
 * interior entries are each glyph's left edge; the final entry is the right
 * edge of the last glyph.
 */
export declare function glyphsToCaretPositions(glyphs: Array<{
    x: number;
    width: number;
}>): number[];
/** Map a caret index to its line, column, and pixel position. */
export declare function caretFromIndex(layout: TextLayout, index: number): CaretPosition;
/**
 * Map a pixel point to a caret index. `y` selects the line (clamped to the
 * first/last line); `x` follows the half-glyph rule and clamps to the line's
 * visible end, so a click past the end of a line never lands beyond its
 * newline.
 */
export declare function indexFromPoint(layout: TextLayout, x: number, y: number): number;
/**
 * Move a caret up (`direction = -1`) or down (`+1`) one line, keeping the
 * horizontal position — pass `desiredX` to preserve a "sticky column" across
 * repeated vertical moves. Moving up from the first line goes to index 0;
 * moving down from the last goes to the end of the text (matching DOM
 * textarea behavior).
 */
export declare function moveCaretVertically(layout: TextLayout, index: number, direction: -1 | 1, desiredX?: number): number;
/**
 * Move a caret by `lineDelta` visual lines (negative = up), keeping the
 * horizontal position — pass `desiredX` to preserve a sticky column across
 * repeated moves. Unlike {@link moveCaretVertically}, overshooting the first
 * or last line clamps to that line (preserving the column) rather than
 * jumping to the very start/end of the text — the behavior wanted for
 * PageUp/PageDown.
 */
export declare function moveCaretByLines(layout: TextLayout, index: number, lineDelta: number, desiredX?: number): number;
/**
 * The `[start, end]` source indices spanning the visual line that contains
 * `index` — `start` is the line's first character, `end` is the caret
 * position at the end of its visible text (before any newline). Useful for
 * Home/End caret movement.
 */
export declare function lineBounds(layout: TextLayout, index: number): {
    start: number;
    end: number;
};
/**
 * Highlight rectangles for the selection `[start, end)` — one rect per line
 * the selection touches. Lines whose covered span is empty (e.g. only the
 * newline is selected) produce no rect.
 */
export declare function selectionRects(layout: TextLayout, start: number, end: number): SelectionRect[];
//# sourceMappingURL=text-layout.d.ts.map
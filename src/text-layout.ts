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

const clampIndex = (index: number, max: number) => {
    if (!Number.isFinite(index) || index < 0) return 0;
    if (index > max) return max;
    return Math.floor(index);
};

/**
 * Lay out `text` into lines, breaking on `\n` and soft-wrapping to
 * `wrapWidth` when provided. Soft wraps prefer the last space on the line
 * (the space stays at the end of the wrapped line, as browsers do); words
 * wider than `wrapWidth` break mid-word, and a line always accepts at least
 * one character so layout cannot stall.
 */
export function layoutText(text: string, options: LayoutOptions): TextLayout {
    const { measure, lineHeight, wrapWidth } = options;
    const lines: LayoutLine[] = [];

    const pushLine = (start: number, lineText: string, hardBreak: boolean) => {
        const positions: number[] = [0];
        let x = 0;
        let prev: string | null = null;
        for (const char of lineText) {
            x += measure(char, prev);
            positions.push(x);
            prev = char;
        }
        lines.push({
            start,
            text: lineText,
            y: lines.length * lineHeight,
            positions,
            width: x,
            hardBreak,
        });
    };

    const paragraphs = text.split('\n');
    let sourceIndex = 0;
    for (const paragraph of paragraphs) {
        if (wrapWidth === undefined || paragraph.length === 0) {
            pushLine(sourceIndex, paragraph, true);
        } else {
            let lineStart = 0;
            let x = 0;
            let prev: string | null = null;
            let lastSpace = -1; // index within paragraph of the last space on the current line
            for (let i = 0; i < paragraph.length; i++) {
                const char = paragraph[i];
                const advance = measure(char, prev);
                if (x + advance > wrapWidth && i > lineStart) {
                    const breakAt = lastSpace >= lineStart ? lastSpace + 1 : i;
                    pushLine(sourceIndex + lineStart, paragraph.slice(lineStart, breakAt), false);
                    lineStart = breakAt;
                    lastSpace = -1;
                    prev = null;
                    // Re-measure the pending chars of the new line (breakAt..i).
                    x = 0;
                    for (let j = lineStart; j < i; j++) {
                        x += measure(paragraph[j], prev);
                        prev = paragraph[j];
                    }
                    x += measure(char, prev);
                } else {
                    x += advance;
                }
                if (char === ' ') {
                    lastSpace = i;
                }
                prev = char;
            }
            pushLine(sourceIndex + lineStart, paragraph.slice(lineStart), true);
        }
        sourceIndex += paragraph.length + 1; // +1 skips the '\n'
    }

    return {
        text,
        lines,
        lineHeight,
        width: lines.reduce((max, line) => Math.max(max, line.width), 0),
        height: lines.length * lineHeight,
    };
}

/**
 * Half-glyph caret rule against a caret-positions table: clicking the left
 * half of a glyph places the caret before it, the right half after it.
 * Returns a column in `0..positions.length - 1`.
 */
export function caretColFromX(positions: number[], x: number): number {
    for (let col = 0; col < positions.length - 1; col++) {
        const midpoint = (positions[col] + positions[col + 1]) / 2;
        if (x < midpoint) {
            return col;
        }
    }
    return positions.length - 1;
}

/**
 * Build a caret-positions table from glyph boxes (anything with `x` and
 * `width`, e.g. PixiDom's virtual bitmap-text glyphs). `positions[0]` is 0;
 * interior entries are each glyph's left edge; the final entry is the right
 * edge of the last glyph.
 */
export function glyphsToCaretPositions(glyphs: Array<{ x: number; width: number }>): number[] {
    if (!glyphs.length) {
        return [0];
    }
    const positions = [0];
    for (let i = 1; i < glyphs.length; i++) {
        positions.push(glyphs[i].x);
    }
    const last = glyphs[glyphs.length - 1];
    positions.push(last.x + last.width);
    return positions;
}

const lineForIndex = (layout: TextLayout, index: number): number => {
    // The caret belongs to the LAST line whose start is <= index, which puts
    // soft-wrap boundary carets at the start of the wrapped line and
    // "after the newline" carets on the following line.
    let result = 0;
    for (let i = 0; i < layout.lines.length; i++) {
        if (layout.lines[i].start <= index) {
            result = i;
        } else {
            break;
        }
    }
    return result;
};

/** Map a caret index to its line, column, and pixel position. */
export function caretFromIndex(layout: TextLayout, index: number): CaretPosition {
    const clamped = clampIndex(index, layout.text.length);
    const lineIndex = lineForIndex(layout, clamped);
    const line = layout.lines[lineIndex];
    const col = Math.min(clamped - line.start, line.text.length);
    return {
        line: lineIndex,
        col,
        x: line.positions[col],
        y: line.y,
    };
}

/**
 * Map a pixel point to a caret index. `y` selects the line (clamped to the
 * first/last line); `x` follows the half-glyph rule and clamps to the line's
 * visible end, so a click past the end of a line never lands beyond its
 * newline.
 */
export function indexFromPoint(layout: TextLayout, x: number, y: number): number {
    const lineIndex = Math.max(
        0,
        Math.min(layout.lines.length - 1, Math.floor(y / layout.lineHeight)),
    );
    const line = layout.lines[lineIndex];
    return line.start + caretColFromX(line.positions, x);
}

/**
 * Move a caret up (`direction = -1`) or down (`+1`) one line, keeping the
 * horizontal position — pass `desiredX` to preserve a "sticky column" across
 * repeated vertical moves. Moving up from the first line goes to index 0;
 * moving down from the last goes to the end of the text (matching DOM
 * textarea behavior).
 */
export function moveCaretVertically(
    layout: TextLayout,
    index: number,
    direction: -1 | 1,
    desiredX?: number,
): number {
    const caret = caretFromIndex(layout, index);
    const targetLine = caret.line + direction;
    if (targetLine < 0) {
        return 0;
    }
    if (targetLine >= layout.lines.length) {
        return layout.text.length;
    }
    const line = layout.lines[targetLine];
    return line.start + caretColFromX(line.positions, desiredX ?? caret.x);
}

/**
 * Move a caret by `lineDelta` visual lines (negative = up), keeping the
 * horizontal position — pass `desiredX` to preserve a sticky column across
 * repeated moves. Unlike {@link moveCaretVertically}, overshooting the first
 * or last line clamps to that line (preserving the column) rather than
 * jumping to the very start/end of the text — the behavior wanted for
 * PageUp/PageDown.
 */
export function moveCaretByLines(
    layout: TextLayout,
    index: number,
    lineDelta: number,
    desiredX?: number,
): number {
    const caret = caretFromIndex(layout, index);
    const targetLine = Math.max(0, Math.min(layout.lines.length - 1, caret.line + lineDelta));
    const line = layout.lines[targetLine];
    return line.start + caretColFromX(line.positions, desiredX ?? caret.x);
}

/**
 * The `[start, end]` source indices spanning the visual line that contains
 * `index` — `start` is the line's first character, `end` is the caret
 * position at the end of its visible text (before any newline). Useful for
 * Home/End caret movement.
 */
export function lineBounds(layout: TextLayout, index: number): { start: number; end: number } {
    const caret = caretFromIndex(layout, index);
    const line = layout.lines[caret.line];
    return { start: line.start, end: line.start + line.text.length };
}

/**
 * Highlight rectangles for the selection `[start, end)` — one rect per line
 * the selection touches. Lines whose covered span is empty (e.g. only the
 * newline is selected) produce no rect.
 */
export function selectionRects(layout: TextLayout, start: number, end: number): SelectionRect[] {
    const from = clampIndex(Math.min(start, end), layout.text.length);
    const to = clampIndex(Math.max(start, end), layout.text.length);
    const rects: SelectionRect[] = [];
    if (from === to) {
        return rects;
    }
    for (const line of layout.lines) {
        const a = Math.max(0, Math.min(from - line.start, line.text.length));
        const b = Math.max(0, Math.min(to - line.start, line.text.length));
        if (b > a) {
            rects.push({
                x: line.positions[a],
                y: line.y,
                width: line.positions[b] - line.positions[a],
                height: layout.lineHeight,
            });
        }
    }
    return rects;
}

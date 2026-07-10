import { expect } from 'chai';
import {
    layoutText,
    caretFromIndex,
    indexFromPoint,
    moveCaretVertically,
    selectionRects,
    caretColFromX,
    glyphsToCaretPositions,
    type TextLayout,
} from '../src/text-layout';

// Monospace: every glyph advances 6px. Lines are 10px tall.
const mono = (width = 6) => ({ measure: () => width, lineHeight: 10 });

describe('layoutText', () => {
    it('lays out a single line with cumulative caret positions', () => {
        const layout = layoutText('abc', mono());
        expect(layout.lines).to.have.length(1);
        const [line] = layout.lines;
        expect(line.text).to.equal('abc');
        expect(line.start).to.equal(0);
        expect(line.y).to.equal(0);
        expect(line.positions).to.deep.equal([0, 6, 12, 18]);
        expect(layout.width).to.equal(18);
        expect(layout.height).to.equal(10);
    });

    it('splits hard line breaks and tracks source indices', () => {
        const layout = layoutText('ab\ncd', mono());
        expect(layout.lines.map((l) => l.text)).to.deep.equal(['ab', 'cd']);
        expect(layout.lines.map((l) => l.start)).to.deep.equal([0, 3]);
        expect(layout.lines.map((l) => l.y)).to.deep.equal([0, 10]);
        expect(layout.lines.map((l) => l.hardBreak)).to.deep.equal([true, true]);
        expect(layout.height).to.equal(20);
    });

    it('a trailing newline produces an empty final line', () => {
        const layout = layoutText('ab\n', mono());
        expect(layout.lines.map((l) => l.text)).to.deep.equal(['ab', '']);
        expect(layout.lines[1].start).to.equal(3);
    });

    it('empty text produces a single empty line', () => {
        const layout = layoutText('', mono());
        expect(layout.lines).to.have.length(1);
        expect(layout.lines[0].text).to.equal('');
        expect(layout.lines[0].positions).to.deep.equal([0]);
        expect(layout.height).to.equal(10);
    });

    it('soft-wraps at word boundaries within wrapWidth', () => {
        // 'hello world' at 6px/char with room for 8 chars (48px):
        // 'hello ' (6 chars) fits, 'world' (5 more) would overflow -> wrap after the space.
        const layout = layoutText('hello world', { ...mono(), wrapWidth: 48 });
        expect(layout.lines.map((l) => l.text)).to.deep.equal(['hello ', 'world']);
        expect(layout.lines.map((l) => l.start)).to.deep.equal([0, 6]);
        expect(layout.lines.map((l) => l.hardBreak)).to.deep.equal([false, true]);
    });

    it('breaks unbreakable words mid-word', () => {
        const layout = layoutText('abcdefgh', { ...mono(), wrapWidth: 18 }); // 3 chars per line
        expect(layout.lines.map((l) => l.text)).to.deep.equal(['abc', 'def', 'gh']);
        expect(layout.lines.map((l) => l.start)).to.deep.equal([0, 3, 6]);
    });
});

describe('caretFromIndex', () => {
    let layout: TextLayout;
    beforeEach(() => {
        layout = layoutText('ab\ncd', mono());
    });

    it('maps an index within a line', () => {
        expect(caretFromIndex(layout, 1)).to.deep.include({ line: 0, col: 1, x: 6, y: 0 });
    });

    it('index at the newline sits at the end of its line', () => {
        expect(caretFromIndex(layout, 2)).to.deep.include({ line: 0, col: 2, x: 12, y: 0 });
    });

    it('index after the newline sits at the start of the next line', () => {
        expect(caretFromIndex(layout, 3)).to.deep.include({ line: 1, col: 0, x: 0, y: 10 });
    });

    it('a soft-wrap boundary index sits at the start of the wrapped line', () => {
        const wrapped = layoutText('abcdef', { ...mono(), wrapWidth: 18 });
        expect(caretFromIndex(wrapped, 3)).to.deep.include({ line: 1, col: 0, x: 0, y: 10 });
    });

    it('clamps out-of-range indices', () => {
        expect(caretFromIndex(layout, -5).line).to.equal(0);
        expect(caretFromIndex(layout, 99)).to.deep.include({ line: 1, col: 2, x: 12 });
    });
});

describe('indexFromPoint', () => {
    let layout: TextLayout;
    beforeEach(() => {
        layout = layoutText('ab\ncd', mono());
    });

    it('uses the half-glyph rule horizontally', () => {
        expect(indexFromPoint(layout, 2, 5)).to.equal(0); // left half of 'a'
        expect(indexFromPoint(layout, 4, 5)).to.equal(1); // right half of 'a'
    });

    it('selects the line by y', () => {
        expect(indexFromPoint(layout, 2, 15)).to.equal(3); // left half of 'c' on line 1
    });

    it('clamps y above and below the content', () => {
        expect(indexFromPoint(layout, 2, -50)).to.equal(0);
        expect(indexFromPoint(layout, 2, 500)).to.equal(3);
    });

    it('clamps x past the end of a line to the line end (before the newline)', () => {
        expect(indexFromPoint(layout, 999, 5)).to.equal(2);
    });
});

describe('moveCaretVertically', () => {
    it('moves down keeping the column', () => {
        const layout = layoutText('abc\ndef', mono());
        expect(moveCaretVertically(layout, 1, 1)).to.equal(5); // 'a|bc' -> 'd|ef'
    });

    it('moves up keeping the column', () => {
        const layout = layoutText('abc\ndef', mono());
        expect(moveCaretVertically(layout, 5, -1)).to.equal(1);
    });

    it('honors a desiredX wider than the target line', () => {
        const layout = layoutText('abcdef\ngh', mono());
        expect(moveCaretVertically(layout, 5, 1, 30)).to.equal(9); // clamps to end of 'gh'
    });

    it('up from the first line goes to 0; down from the last goes to text end', () => {
        const layout = layoutText('abc\ndef', mono());
        expect(moveCaretVertically(layout, 2, -1)).to.equal(0);
        expect(moveCaretVertically(layout, 5, 1)).to.equal(7);
    });
});

describe('selectionRects', () => {
    it('returns a single rect for a same-line selection', () => {
        const layout = layoutText('abcd', mono());
        expect(selectionRects(layout, 1, 3)).to.deep.equal([
            { x: 6, y: 0, width: 12, height: 10 },
        ]);
    });

    it('returns one rect per line for a multi-line selection', () => {
        const layout = layoutText('abc\nde\nfgh', mono());
        // Select from 'b' (index 1) through 'g' (index 9 exclusive: 'fg').
        expect(selectionRects(layout, 1, 9)).to.deep.equal([
            { x: 6, y: 0, width: 12, height: 10 },  // 'bc'
            { x: 0, y: 10, width: 12, height: 10 }, // 'de'
            { x: 0, y: 20, width: 12, height: 10 }, // 'fg'
        ]);
    });

    it('returns no rects for an empty range', () => {
        const layout = layoutText('abc', mono());
        expect(selectionRects(layout, 2, 2)).to.deep.equal([]);
    });
});

describe('1-D caret primitives (shared with TextField)', () => {
    it('caretColFromX applies the half-glyph rule against a positions table', () => {
        const positions = [0, 6, 12, 18];
        expect(caretColFromX(positions, -5)).to.equal(0);
        expect(caretColFromX(positions, 2)).to.equal(0);
        expect(caretColFromX(positions, 4)).to.equal(1);
        expect(caretColFromX(positions, 14)).to.equal(2);
        expect(caretColFromX(positions, 16)).to.equal(3);
        expect(caretColFromX(positions, 100)).to.equal(3);
    });

    it('glyphsToCaretPositions converts glyph boxes into a positions table', () => {
        const glyphs = [
            { x: 0, width: 5 },
            { x: 6, width: 4 },
            { x: 12, width: 6 },
        ];
        expect(glyphsToCaretPositions(glyphs)).to.deep.equal([0, 6, 12, 18]);
    });
});

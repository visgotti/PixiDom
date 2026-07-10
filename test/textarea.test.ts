import { expect } from 'chai';
import { installFakePixi } from './helpers/fake-pixi';

installFakePixi();

const { TextArea } = require('../src/Components/TextArea') as typeof import('../src/Components/TextArea');

const keyPress = (keyCode: number, extra: Record<string, any> = {}) => ({
    keyCode,
    which: keyCode,
    key: String.fromCharCode(keyCode),
    code: `Key${String.fromCharCode(keyCode).toUpperCase()}`,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    preventDefault() {},
    ...extra,
});

const keyDown = (keyCode: number, code: string) => ({
    keyCode,
    which: keyCode,
    code,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    preventDefault() {},
});

// 6px monospace glyphs, 10px lines, no padding: geometry matches text-layout tests.
const makeArea = (opts: Record<string, any> = {}) =>
    new TextArea('TestFont', {
        width: '60px',
        height: '30px',
        lineHeight: 10,
        measureGlyph: () => 6,
        cursorWidth: 1,
        xPadding: 0,
        yPadding: 0,
        ...opts,
    });

describe('TextArea', () => {
    it('renders one line sprite per laid-out line', () => {
        const area = makeArea();
        area.text = 'ab\ncd';

        const sprites = (area as any).lineSprites;
        expect(sprites).to.have.length(2);
        expect(sprites.map((s: any) => s.text)).to.deep.equal(['ab', 'cd']);
        expect(sprites.map((s: any) => s.y)).to.deep.equal([0, 10]);
    });

    it('soft-wraps text to the inner box width', () => {
        const area = makeArea({ width: '48px' }); // 8 chars at 6px
        area.text = 'hello world';

        const sprites = (area as any).lineSprites;
        expect(sprites.map((s: any) => s.text)).to.deep.equal(['hello ', 'world']);
    });

    it('maps a local point to a caret index across lines', () => {
        const area = makeArea();
        area.text = 'ab\ncd';

        expect(area.caretIndexFromPoint(4, 5)).to.equal(1); // right half of 'a'
        expect(area.caretIndexFromPoint(2, 15)).to.equal(3); // left half of 'c', line 1
        expect(area.caretIndexFromPoint(999, 5)).to.equal(2); // end of line 0
    });

    it('draws one selection rect per selected line', () => {
        const area = makeArea();
        area.text = 'abc\nde\nfgh';
        area.setSelectedRange(1, 9);

        const rects = (area as any).selectionGraphic.calls.filter(
            (c: any) => c.method === 'drawRect',
        );
        expect(rects.map((c: any) => c.args)).to.deep.equal([
            [6, 0, 12, 10],
            [0, 10, 12, 10],
            [0, 20, 12, 10],
        ]);
    });

    it('scrolls to keep the caret visible', () => {
        const area = makeArea({ height: '20px' }); // 2 visible lines
        area.text = 'a\nb\nc\nd'; // 4 lines, 40px of content

        area.setCursor(area.text.length); // caret on the last line

        expect(area.scrollY).to.equal(20); // 40 - 20
        const sprites = (area as any).lineSprites;
        expect(sprites[3].y).to.equal(10); // 30 - scroll
    });

    it('typing Enter inserts a newline (Enter is not a submit key by default)', () => {
        const area = makeArea();
        area.focus();
        area.onKeyPress(keyPress(97)); // 'a'
        area.onKeyPress(keyPress(13, { key: 'Enter', code: 'Enter' }));
        area.onKeyPress(keyPress(98)); // 'b'

        expect(area.text).to.equal('a\nb');
        expect((area as any).lineSprites).to.have.length(2);
        area.blur();
    });

    it('arrow down moves the caret a line, keeping the column', () => {
        const area = makeArea();
        area.text = 'abc\ndef';
        area.setCursor(1);

        area.onKeyDown(keyDown(40, 'ArrowDown'));
        expect((area as any).cursorIndex).to.equal(5);

        area.onKeyDown(keyDown(38, 'ArrowUp'));
        expect((area as any).cursorIndex).to.equal(1);
    });

    it('keeps a sticky column across vertical moves through a short line', () => {
        const area = makeArea({ width: '600px' });
        area.text = 'abcdef\ngh\nijklmn';
        area.setCursor(5); // col 5 on line 0

        area.onKeyDown(keyDown(40, 'ArrowDown')); // 'gh' clamps to col 2 -> index 9
        expect((area as any).cursorIndex).to.equal(9);

        area.onKeyDown(keyDown(40, 'ArrowDown')); // back out to col 5 on 'ijklmn'
        expect((area as any).cursorIndex).to.equal(15);
    });

    it('emits change and enforces maxCharacterLength', () => {
        const area = new TextArea(
            'TestFont',
            { width: '60px', height: '30px', lineHeight: 10, measureGlyph: () => 6 },
            3,
        );
        const changes: string[] = [];
        area.onChange((value: string) => changes.push(value));

        expect(area.change('abc')).to.equal(true);
        expect(area.change('abcd')).to.equal(false);
        expect(area.text).to.equal('abc');
        expect(changes).to.deep.equal(['abc']);
    });
});

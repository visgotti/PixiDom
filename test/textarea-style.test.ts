import { expect } from 'chai';
import { installFakePixi } from './helpers/fake-pixi';

installFakePixi();

const { TextArea } = require('../src/Components/TextArea') as typeof import('../src/Components/TextArea');

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
    } as any);

const styleOf = (area: any) => area.styleOptions;

const callsOf = (graphics: any, method: string) =>
    graphics.calls.filter((c: any) => c.method === method);

const lastCall = (graphics: any, method: string) =>
    [...graphics.calls].reverse().find((c: any) => c.method === method);

describe('TextArea style colors', () => {
    describe('color option formats', () => {
        it('honors a numeric fontColor', () => {
            const area = makeArea({ fontColor: 0xff0000 });
            expect(styleOf(area).fontColor).to.deep.equal({ value: 0xff0000, alpha: 1 });
        });

        it('honors a hex-string fontColor', () => {
            const area = makeArea({ fontColor: '#00ff00' });
            expect(styleOf(area).fontColor).to.deep.equal({ value: 0x00ff00, alpha: 1 });
        });

        it('honors an rgb-object fontColor', () => {
            const area = makeArea({ fontColor: { r: 0, g: 0, b: 255 } });
            expect(styleOf(area).fontColor).to.deep.equal({ value: 0x0000ff, alpha: 1 });
        });

        it('honors an rgb-tuple fontColor with alpha', () => {
            const area = makeArea({ fontColor: [255, 0, 0, 0.5] });
            expect(styleOf(area).fontColor.value).to.equal(0xff0000);
            expect(styleOf(area).fontColor.alpha).to.be.closeTo(0.5, 0.01);
        });

        it('defaults fontColor to black and highlightedFontColor to white', () => {
            const area = makeArea();
            expect(styleOf(area).fontColor).to.deep.equal({ value: 0x000000, alpha: 1 });
            expect(styleOf(area).highlightedFontColor).to.deep.equal({ value: 0xffffff, alpha: 1 });
        });
    });

    describe('colors reach the draw calls', () => {
        it('tints line sprites with the configured fontColor', () => {
            const area = makeArea({ fontColor: 0xff0000 });
            area.text = 'hello';
            expect((area as any).lineSprites[0].tint).to.equal(0xff0000);
        });

        it('tints a selected line with highlightedFontColor', () => {
            const area = makeArea({ fontColor: 0xff0000, highlightedFontColor: 0x00ff00 });
            area.text = 'hello';
            (area as any).dragIndexStart = 0;
            (area as any).dragIndexEnd = 5;
            (area as any).redraw();
            expect((area as any).lineSprites[0].tint).to.equal(0x00ff00);
        });

        it('fills the background with backgroundColor', () => {
            const area = makeArea({ backgroundColor: 0xabcdef });
            expect(lastCall((area as any).backgroundGraphic, 'beginFill').args[0]).to.equal(0xabcdef);
        });

        it('strokes the border with borderColor', () => {
            const area = makeArea({ borderColor: 0x112233, borderWidth: 2 });
            expect(lastCall((area as any).backgroundGraphic, 'lineStyle').args[1]).to.equal(0x112233);
        });

        it('multiplies borderColor alpha by borderOpacity', () => {
            const area = makeArea({ borderColor: [0, 0, 0, 0.5], borderWidth: 2, borderOpacity: 0.5 });
            expect(lastCall((area as any).backgroundGraphic, 'lineStyle').args[2]).to.be.closeTo(0.25, 0.01);
        });

        it('fills the selection rect with highlightedBackgroundColor', () => {
            const area = makeArea({ highlightedBackgroundColor: 0x654321 });
            area.text = 'hello';
            (area as any).dragIndexStart = 0;
            (area as any).dragIndexEnd = 5;
            (area as any).redraw();
            expect(lastCall((area as any).selectionGraphic, 'beginFill').args[0]).to.equal(0x654321);
        });

        it('draws the cursor with cursorColor', () => {
            const area = makeArea({ cursorColor: 0xff00ff });
            area.focus();
            (area as any).redraw();
            expect(lastCall((area as any).cursorSprite, 'lineStyle').args[1]).to.equal(0xff00ff);
            area.blur();
        });
    });

    describe('updateStyle idempotence', () => {
        it('preserves colors across a later unrelated updateStyle call', () => {
            const area = makeArea({ fontColor: 0xff0000, backgroundColor: 0x00ff00 });
            area.updateStyle({ xPadding: 4 } as any);
            expect(styleOf(area).fontColor.value).to.equal(0xff0000);
            expect(styleOf(area).backgroundColor.value).to.equal(0x00ff00);
        });

        it('preserves every color across repeated updateStyle calls', () => {
            const area = makeArea({
                fontColor: 0x111111,
                highlightedFontColor: 0x222222,
                borderColor: 0x333333,
                cursorColor: 0x444444,
                backgroundColor: 0x555555,
                highlightedBackgroundColor: 0x666666,
            });
            area.updateStyle({ xPadding: 4 } as any);
            area.updateStyle({ yPadding: 4 } as any);
            const style = styleOf(area);
            expect(style.fontColor.value).to.equal(0x111111);
            expect(style.highlightedFontColor.value).to.equal(0x222222);
            expect(style.borderColor.value).to.equal(0x333333);
            expect(style.cursorColor.value).to.equal(0x444444);
            expect(style.backgroundColor.value).to.equal(0x555555);
            expect(style.highlightedBackgroundColor.value).to.equal(0x666666);
        });

        it('applies a new fontColor passed to updateStyle', () => {
            const area = makeArea({ fontColor: 0xff0000 });
            area.updateStyle({ fontColor: 0x00ff00 } as any);
            expect(styleOf(area).fontColor.value).to.equal(0x00ff00);
        });
    });
});

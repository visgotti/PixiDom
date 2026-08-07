import { expect } from 'chai';
import { installFakePixi } from './helpers/fake-pixi';

installFakePixi();

const { TextField } = require('../src/Components/TextInput/TextField') as
    typeof import('../src/Components/TextInput/TextField');

const makeField = (styleOptions: any = {}) =>
    new TextField('TestFont', { width: '100px', height: '20px', cursorWidth: 1, ...styleOptions });

const styleOf = (field: any) => field.styleOptions;

const lastCall = (graphics: any, method: string) =>
    [...graphics.calls].reverse().find((c: any) => c.method === method);

describe('TextField style colors', () => {
    describe('fontColor', () => {
        it('honors a numeric fontColor instead of falling back to black', () => {
            const field = makeField({ fontColor: 0xff0000 });
            expect(styleOf(field).fontColor).to.deep.equal({ value: 0xff0000, alpha: 1 });
        });

        it('honors a hex-string fontColor', () => {
            const field = makeField({ fontColor: '#00ff00' });
            expect(styleOf(field).fontColor).to.deep.equal({ value: 0x00ff00, alpha: 1 });
        });

        it('honors an rgb-object fontColor', () => {
            const field = makeField({ fontColor: { r: 0, g: 0, b: 255 } });
            expect(styleOf(field).fontColor).to.deep.equal({ value: 0x0000ff, alpha: 1 });
        });

        it('honors an rgb-tuple fontColor with alpha', () => {
            const field = makeField({ fontColor: [255, 0, 0, 0.5] });
            expect(styleOf(field).fontColor.value).to.equal(0xff0000);
            expect(styleOf(field).fontColor.alpha).to.be.closeTo(0.5, 0.01);
        });

        it('tints the text sprite with the configured fontColor', () => {
            const field = makeField({ fontColor: 0xff0000 });
            field.text = 'hello';
            expect((field as any).textSprite.tint).to.equal(0xff0000);
        });

        it('defaults fontColor to black when not provided', () => {
            const field = makeField();
            expect(styleOf(field).fontColor).to.deep.equal({ value: 0x000000, alpha: 1 });
        });
    });

    describe('highlightedFontColor', () => {
        it('honors a numeric highlightedFontColor instead of falling back to white', () => {
            const field = makeField({ highlightedFontColor: 0x123456 });
            expect(styleOf(field).highlightedFontColor).to.deep.equal({ value: 0x123456, alpha: 1 });
        });

        it('defaults highlightedFontColor to white when not provided', () => {
            const field = makeField();
            expect(styleOf(field).highlightedFontColor).to.deep.equal({ value: 0xffffff, alpha: 1 });
        });

        it('tints selected text with the configured highlightedFontColor', () => {
            const field = makeField({ fontColor: 0xff0000, highlightedFontColor: 0x00ff00 });
            field.text = 'hello';
            field.focus();
            (field as any).dragIndexStart = 0;
            (field as any).dragIndexEnd = 5;
            (field as any).redrawText();
            expect((field as any).textSprite.tint).to.equal(0x00ff00);
            field.blur();
        });
    });

    describe('other color options', () => {
        it('honors backgroundColor when filling the textbox', () => {
            const field = makeField({ backgroundColor: 0xabcdef });
            const beginFill = (field as any).textbox.calls.find((c: any) => c.method === 'beginFill');
            expect(beginFill.args[0]).to.equal(0xabcdef);
        });

        it('honors borderColor when stroking the textbox', () => {
            const field = makeField({ borderColor: 0x112233, borderWidth: 2 });
            const lineStyle = lastCall((field as any).textbox, 'lineStyle');
            expect(lineStyle.args[1]).to.equal(0x112233);
        });

        it('multiplies borderColor alpha by borderOpacity', () => {
            const field = makeField({ borderColor: [0, 0, 0, 0.5], borderWidth: 2, borderOpacity: 0.5 });
            const lineStyle = lastCall((field as any).textbox, 'lineStyle');
            expect(lineStyle.args[2]).to.be.closeTo(0.25, 0.01);
        });

        it('honors cursorColor when drawing the cursor', () => {
            const field = makeField({ cursorColor: 0xff00ff });
            field.focus();
            field.setCursor(0);
            const lineStyle = lastCall((field as any).cursorSprite, 'lineStyle');
            expect(lineStyle.args[1]).to.equal(0xff00ff);
            field.blur();
        });

        it('honors highlightedBackgroundColor when filling the selection rect', () => {
            const field = makeField({ highlightedBackgroundColor: 0x654321 });
            field.text = 'hello';
            (field as any).dragIndexStart = 0;
            (field as any).dragIndexEnd = 5;
            (field as any).redrawTextbox();
            const fills = (field as any).textbox.calls.filter((c: any) => c.method === 'beginFill');
            expect(fills[fills.length - 1].args[0]).to.equal(0x654321);
        });
    });

    describe('updateStyle idempotence', () => {
        it('preserves fontColor across a later unrelated updateStyle call', () => {
            const field = makeField({ fontColor: 0xff0000 });
            field.updateStyle({ width: '200px' } as any);
            expect(styleOf(field).fontColor).to.deep.equal({ value: 0xff0000, alpha: 1 });
        });

        it('preserves every color across repeated updateStyle calls', () => {
            const field = makeField({
                fontColor: 0x111111,
                highlightedFontColor: 0x222222,
                borderColor: 0x333333,
                cursorColor: 0x444444,
                backgroundColor: 0x555555,
                highlightedBackgroundColor: 0x666666,
            });
            field.updateStyle({ xPadding: 4 } as any);
            field.updateStyle({ yPadding: 4 } as any);
            const style = styleOf(field);
            expect(style.fontColor.value).to.equal(0x111111);
            expect(style.highlightedFontColor.value).to.equal(0x222222);
            expect(style.borderColor.value).to.equal(0x333333);
            expect(style.cursorColor.value).to.equal(0x444444);
            expect(style.backgroundColor.value).to.equal(0x555555);
            expect(style.highlightedBackgroundColor.value).to.equal(0x666666);
        });

        it('applies a new fontColor passed to updateStyle', () => {
            const field = makeField({ fontColor: 0xff0000 });
            field.updateStyle({ fontColor: 0x00ff00 } as any);
            expect(styleOf(field).fontColor).to.deep.equal({ value: 0x00ff00, alpha: 1 });
        });
    });
});

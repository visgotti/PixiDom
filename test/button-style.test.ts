import { expect } from 'chai';
import { installFakePixi } from './helpers/fake-pixi';

installFakePixi();

const { Button } = require('../src/Components/Button') as typeof import('../src/Components/Button');

const makeButton = (styleOptions: any = {}, text = 'Hi') =>
    new Button(text, {
        font: 'TestFont',
        useBitmapText: true,
        defaultStyle: { width: 100, height: 40 },
        ...styleOptions,
    });

const lastCall = (graphics: any, method: string) =>
    [...graphics.calls].reverse().find((c: any) => c.method === method);

describe('Button style', () => {
    describe('state resolution', () => {
        it('uses defaultStyle at rest', () => {
            const button = makeButton({
                defaultStyle: { width: 100, height: 40, backgroundColor: 0x111111 },
                hoverStyle: { backgroundColor: 0x222222 },
            });
            expect(button.currentStyleState.backgroundColor).to.equal(0x111111);
        });

        it('merges hoverStyle over defaultStyle on pointerover', () => {
            const button = makeButton({
                defaultStyle: { width: 100, height: 40, backgroundColor: 0x111111, textColor: 0xffffff },
                hoverStyle: { backgroundColor: 0x222222 },
            });
            button.emit('pointerover');
            // hover overrides background but inherits the default width/textColor
            expect(button.currentStyleState.backgroundColor).to.equal(0x222222);
            expect(button.currentStyleState.textColor).to.equal(0xffffff);
            expect(button.currentStyleState.width).to.equal(100);
        });

        it('merges pressedStyle over defaultStyle on pointerdown', () => {
            const button = makeButton({
                defaultStyle: { width: 100, height: 40, backgroundColor: 0x111111 },
                pressedStyle: { backgroundColor: 0x333333 },
            });
            button.emit('pointerdown');
            expect(button.currentStyleState.backgroundColor).to.equal(0x333333);
        });

        it('falls back to hoverStyle when pressed with no pressedStyle', () => {
            const button = makeButton({
                defaultStyle: { width: 100, height: 40, backgroundColor: 0x111111 },
                hoverStyle: { backgroundColor: 0x222222 },
            });
            button.emit('pointerdown');
            expect(button.currentStyleState.backgroundColor).to.equal(0x222222);
        });

        it('returns to defaultStyle on pointerout and pointerup', () => {
            const button = makeButton({
                defaultStyle: { width: 100, height: 40, backgroundColor: 0x111111 },
                hoverStyle: { backgroundColor: 0x222222 },
            });
            button.emit('pointerover');
            button.emit('pointerout');
            expect(button.currentStyleState.backgroundColor).to.equal(0x111111);
            button.emit('pointerdown');
            button.emit('pointerup');
            expect(button.currentStyleState.backgroundColor).to.equal(0x111111);
        });

        it('defaults width/height to 0 when unspecified', () => {
            const button = makeButton({ defaultStyle: {} });
            expect(button.currentStyleState.width).to.equal(0);
            expect(button.currentStyleState.height).to.equal(0);
        });
    });

    describe('background drawing', () => {
        it('fills the background with backgroundColor', () => {
            const button = makeButton({ defaultStyle: { width: 100, height: 40, backgroundColor: 0xabcdef } });
            expect(lastCall((button as any).bgGraphic, 'beginFill').args[0]).to.equal(0xabcdef);
        });

        it('accepts hex-string and rgb-object background colors', () => {
            const strButton = makeButton({ defaultStyle: { width: 10, height: 10, backgroundColor: '#ff0000' } });
            expect(lastCall((strButton as any).bgGraphic, 'beginFill').args[0]).to.equal(0xff0000);
            const rgbButton = makeButton({ defaultStyle: { width: 10, height: 10, backgroundColor: { r: 0, g: 0, b: 255 } } });
            expect(lastCall((rgbButton as any).bgGraphic, 'beginFill').args[0]).to.equal(0x0000ff);
        });

        it('multiplies background alpha by backgroundOpacity', () => {
            const button = makeButton({
                defaultStyle: { width: 100, height: 40, backgroundColor: [255, 0, 0, 0.5], backgroundOpacity: 0.5 },
            });
            expect(lastCall((button as any).bgGraphic, 'beginFill').args[1]).to.be.closeTo(0.25, 0.01);
        });

        it('strokes the border with borderColor/borderWidth', () => {
            const button = makeButton({
                defaultStyle: { width: 100, height: 40, backgroundColor: 0x000000, borderColor: 0x112233, borderWidth: 3 },
            });
            const lineStyle = lastCall((button as any).bgGraphic, 'lineStyle');
            expect(lineStyle.args[0]).to.equal(3);
            expect(lineStyle.args[1]).to.equal(0x112233);
        });

        it('multiplies border alpha by borderOpacity', () => {
            const button = makeButton({
                defaultStyle: {
                    width: 100, height: 40, backgroundColor: 0x000000,
                    borderColor: [0, 0, 0, 0.5], borderWidth: 2, borderOpacity: 0.5,
                },
            });
            expect(lastCall((button as any).bgGraphic, 'lineStyle').args[2]).to.be.closeTo(0.25, 0.01);
        });

        it('draws a rounded rect with borderRadius resolved as a percentage of height', () => {
            const button = makeButton({
                defaultStyle: { width: 100, height: 40, backgroundColor: 0x000000, borderRadius: 50 },
            });
            const rounded = lastCall((button as any).bgGraphic, 'drawRoundedRect');
            expect(rounded, 'expected a rounded rect').to.not.equal(undefined);
            expect(rounded.args[4]).to.equal(20); // 50% of 40
        });

        it('draws a plain rect when no borderRadius is set', () => {
            const button = makeButton({ defaultStyle: { width: 100, height: 40, backgroundColor: 0x000000 } });
            expect(lastCall((button as any).bgGraphic, 'drawRect')).to.not.equal(undefined);
            expect(lastCall((button as any).bgGraphic, 'drawRoundedRect')).to.equal(undefined);
        });

        it('creates no background graphic when backgroundColor is omitted', () => {
            const button = makeButton({ defaultStyle: { width: 100, height: 40 } });
            expect((button as any).bgGraphic).to.equal(null);
        });

        it('sets a hitArea matching the current state size', () => {
            const button = makeButton({ defaultStyle: { width: 120, height: 44 } });
            expect((button as any).hitArea.width).to.equal(120);
            expect((button as any).hitArea.height).to.equal(44);
        });

        it('redraws the background when the state changes', () => {
            const button = makeButton({
                defaultStyle: { width: 100, height: 40, backgroundColor: 0x111111 },
                hoverStyle: { backgroundColor: 0x222222 },
            });
            button.emit('pointerover');
            expect(lastCall((button as any).bgGraphic, 'beginFill').args[0]).to.equal(0x222222);
        });
    });

    describe('text', () => {
        it('tints bitmap text with textColor', () => {
            const button = makeButton({ defaultStyle: { width: 100, height: 40, textColor: 0xff0000 } });
            expect((button as any).bitmapTxtSprite.tint).to.equal(0xff0000);
        });

        it('applies the hover textColor when hovered', () => {
            const button = makeButton({
                defaultStyle: { width: 100, height: 40, textColor: 0xff0000 },
                hoverStyle: { textColor: 0x00ff00 },
            });
            button.emit('pointerover');
            expect((button as any).bitmapTxtSprite.tint).to.equal(0x00ff00);
        });

        it('sets style.fill on regular Text when useBitmapText is false', () => {
            const button = makeButton({
                useBitmapText: false,
                defaultStyle: { width: 100, height: 40, textColor: 0x00ff00 },
            });
            expect((button as any).txtSprite.style.fill).to.equal(0x00ff00);
        });

        it('applies fontSize to regular Text', () => {
            const button = makeButton({
                useBitmapText: false,
                fontSize: 22,
                defaultStyle: { width: 100, height: 40 },
            });
            expect((button as any).txtSprite.style.fontSize).to.equal(22);
        });

        it('updates the label via the text setter', () => {
            const button = makeButton();
            button.text = 'Updated';
            expect((button as any).bitmapTxtSprite.text).to.equal('Updated');
        });

        it('re-centers the label after the text changes', () => {
            const button = makeButton({ defaultStyle: { width: 100, height: 40 } });
            button.text = 'Longer label';
            const label = (button as any).bitmapTxtSprite;
            expect(label.x).to.equal(100 / 2 - label.width / 2);
        });

        it('textSpriteUtilized returns the sprite matching useBitmapText', () => {
            const bitmapButton = makeButton();
            expect(bitmapButton.textSpriteUtilized).to.equal((bitmapButton as any).bitmapTxtSprite);
            const textButton = makeButton({ useBitmapText: false });
            expect(textButton.textSpriteUtilized).to.equal((textButton as any).txtSprite);
        });
    });

    describe('updateStyle', () => {
        it('applies a new backgroundColor', () => {
            const button = makeButton({ defaultStyle: { width: 100, height: 40, backgroundColor: 0x111111 } });
            button.updateStyle({
                font: 'TestFont',
                useBitmapText: true,
                defaultStyle: { width: 100, height: 40, backgroundColor: 0x999999 },
            });
            expect(lastCall((button as any).bgGraphic, 'beginFill').args[0]).to.equal(0x999999);
        });

        it('swaps sprite types when useBitmapText flips', () => {
            const button = makeButton({ defaultStyle: { width: 100, height: 40 } });
            expect((button as any).bitmapTxtSprite).to.not.equal(null);
            button.updateStyle({
                font: 'TestFont',
                useBitmapText: false,
                defaultStyle: { width: 100, height: 40 },
            });
            expect((button as any).bitmapTxtSprite).to.equal(null);
            expect((button as any).txtSprite).to.not.equal(null);
        });
    });
});

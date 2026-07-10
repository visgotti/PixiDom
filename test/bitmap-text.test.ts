import { expect } from 'chai';
import { installFakePixi } from './helpers/fake-pixi';

installFakePixi(); // v8-style global: no PIXI.utils

const { createBitmapText, setBitmapTextTint } = require('../src/pixi-adapter-utils') as
    typeof import('../src/pixi-adapter-utils');

describe('setBitmapTextTint', () => {
    it('applies numeric tints', () => {
        const text = createBitmapText('hello', { font: 'TestFont' });
        setBitmapTextTint(text, 0x00ff00);
        expect((text as any).tint).to.equal(0x00ff00);
    });

    it('applies hex-string tints on PIXI v8 (no PIXI.utils.string2hex)', () => {
        const text = createBitmapText('hello', { font: 'TestFont' });
        setBitmapTextTint(text, '#ff0000');
        expect((text as any).tint).to.equal(0xff0000);
        expect((text as any).style.fill).to.equal('#ff0000');
    });

    it('ignores unparseable color strings without throwing', () => {
        const text = createBitmapText('hello', { font: 'TestFont' });
        setBitmapTextTint(text, 0x123456);
        expect(() => setBitmapTextTint(text, 'not-a-color')).to.not.throw();
        expect((text as any).tint).to.equal(0x123456);
    });
});

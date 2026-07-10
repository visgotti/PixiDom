import { expect } from 'chai';
import { installFakePixi } from './helpers/fake-pixi';

installFakePixi(); // v8-style global: no PIXI.utils

const { createBitmapText, setBitmapTextTint, imageBitmapToTexture, createBitmapFontMeasure } =
    require('../src/pixi-adapter-utils') as typeof import('../src/pixi-adapter-utils');

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

describe('createBitmapFontMeasure', () => {
    it('builds a kerning-aware measure scaled to the requested font size', () => {
        const pixi = (globalThis as any).PIXI;
        pixi.BitmapFont = {
            available: {
                MeasuredFont: {
                    fontSize: 10,
                    lineHeight: 12,
                    chars: {
                        a: { xAdvance: 5 },
                        b: { xAdvance: 7, kerning: { a: 1 } },
                    },
                },
            },
        };
        try {
            const metrics = createBitmapFontMeasure('MeasuredFont', 20)!;
            expect(metrics, 'metrics resolved from the font cache').to.exist;
            expect(metrics.lineHeight).to.equal(24); // 12 * (20/10)
            expect(metrics.measure('a', null)).to.equal(10); // 5 * 2
            expect(metrics.measure('b', 'a')).to.equal(16); // (7 + 1) * 2
        } finally {
            delete pixi.BitmapFont;
        }
    });

    it('returns null when the font is not registered', () => {
        expect(createBitmapFontMeasure('NoSuchFont')).to.equal(null);
    });
});

describe('imageBitmapToTexture (pixi v4 webgl path)', () => {
    it('returns a texture backed by the ImageBitmap it uploaded, not a canvas copy', () => {
        const pixi = (globalThis as any).PIXI;
        const prevVersion = pixi.VERSION;
        pixi.VERSION = '4.8.9';
        try {
            const imageBitmap = { width: 32, height: 16 } as any;
            let uploaded: any = null;
            const renderer = {
                textureManager: {
                    updateTexture: (baseTexture: any) => {
                        uploaded = baseTexture;
                    },
                },
            } as any;

            const texture = imageBitmapToTexture(imageBitmap, renderer, true) as any;

            expect(texture.baseTexture.source, 'texture source').to.equal(imageBitmap);
            expect(uploaded, 'uploaded base texture').to.equal(texture.baseTexture);
        } finally {
            pixi.VERSION = prevVersion;
        }
    });
});

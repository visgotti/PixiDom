import { expect } from 'chai';
import { installFakePixi } from './helpers/fake-pixi';

installFakePixi();

const { Button } = require('../src/Components/Button') as typeof import('../src/Components/Button');

describe('Button', () => {
    it('centers the background texture sprite using its size, stable across redraws', () => {
        const backgroundTexture = { width: 20, height: 10 } as any;
        const button = new Button('Hi', {
            font: 'TestFont',
            useBitmapText: true,
            defaultStyle: { width: 100, height: 40, backgroundTexture },
        });

        const bgSprite = (button as any).bgSprite;
        expect(bgSprite.x, 'x after construction').to.equal(100 / 2 - 20 / 2);
        expect(bgSprite.y, 'y after construction').to.equal(40 / 2 - 10 / 2);

        button.redraw();
        button.redraw();
        expect(bgSprite.x, 'x must not drift across redraws').to.equal(100 / 2 - 20 / 2);
        expect(bgSprite.y, 'y must not drift across redraws').to.equal(40 / 2 - 10 / 2);
    });

    it('centers the label using the width of the actual text, not the pre-update width', () => {
        // Fake BitmapText width = 6px per char, so 'Hi' is 12px wide.
        const button = new Button('Hi', {
            font: 'TestFont',
            useBitmapText: true,
            defaultStyle: { width: 100, height: 40 },
        });

        const label = (button as any).bitmapTxtSprite;
        expect(label.text).to.equal('Hi');
        expect(label.x).to.equal(100 / 2 - label.width / 2);
    });
});

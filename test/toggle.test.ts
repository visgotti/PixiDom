import { expect } from 'chai';
import { installFakePixi } from './helpers/fake-pixi';

installFakePixi(); // v8-style global: no PIXI.utils

// Required after the fake global is installed: these modules touch PIXI at import time.
const { Toggle } = require('../src/Components/Toggle') as typeof import('../src/Components/Toggle');
const { AnimationType } = require('../src/types') as typeof import('../src/types');

const baseOptions = () => ({
    width: 200,
    height: 40,
    borderRadius: 50,
    onBackgroundColor: 0x00ff00,
    offBackgroundColor: 0x333333,
    onCircleColor: 0xffffff,
    offCircleColor: 0xeeeeee,
});

describe('Toggle', () => {
    it('animated toggling works on PIXI v8 (no PIXI.utils.hex2string)', () => {
        const toggle = new Toggle(
            {
                ...baseOptions(),
                animationOptions: { type: AnimationType.LINEAR, duration: 1 },
            },
            true,
        );

        expect(() => {
            toggle.toggled = false;
        }).to.not.throw();

        expect((toggle as any).tween, 'a color tween should have been started').to.exist;
    });

    it('vertically centers the ON label using its own height, not the OFF label height', () => {
        // Fake BitmapText height = 8 + text.length, so 'ON' (10px) and 'OFF' (11px) differ.
        const toggle = new Toggle(
            {
                ...baseOptions(),
                labelOptions: {
                    fontName: 'TestFont',
                    onLabel: 'ON',
                    offLabel: 'OFF',
                    onColor: 0x000000,
                    offColor: 0x000000,
                },
            } as any,
            true,
        );

        const onText = (toggle as any).onText;
        const offText = (toggle as any).offText;
        expect(offText.y).to.equal((40 - offText.height) / 2);
        expect(onText.y).to.equal((40 - onText.height) / 2);
    });
});

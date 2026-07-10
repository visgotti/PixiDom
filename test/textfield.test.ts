import { expect } from 'chai';
import { installFakePixi } from './helpers/fake-pixi';

installFakePixi();

const { TextField } = require('../src/Components/TextInput/TextField') as
    typeof import('../src/Components/TextInput/TextField');

const lastCall = (graphics: any, method: string) =>
    [...graphics.calls].reverse().find((c: any) => c.method === method);

describe('TextField cursor', () => {
    const drawCursor = (cursorHeight: number | string) => {
        const field = new TextField('TestFont', {
            width: '100px',
            height: '20px',
            cursorHeight,
            cursorWidth: 1,
        });
        field.focus();
        field.setCursor(0);
        const cursorSprite = (field as any).cursorSprite;
        const moveTo = lastCall(cursorSprite, 'moveTo');
        const lineTo = lastCall(cursorSprite, 'lineTo');
        field.blur();
        field.hide();
        return { top: moveTo.args[1] as number, bottom: lineTo.args[1] as number };
    };

    it('draws a pixel cursorHeight at full height, centered in the textbox', () => {
        const { top, bottom } = drawCursor(16); // 20px box, 16px cursor
        expect(bottom - top, 'drawn cursor length').to.equal(16);
        expect(top).to.equal(2);
        expect(bottom).to.equal(18);
    });

    it('draws a percent cursorHeight relative to the textbox height, centered', () => {
        const { top, bottom } = drawCursor('50%'); // 50% of 20px = 10px
        expect(bottom - top, 'drawn cursor length').to.equal(10);
        expect(top).to.equal(5);
        expect(bottom).to.equal(15);
    });
});

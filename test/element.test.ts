import { expect } from 'chai';
import { installFakePixi } from './helpers/fake-pixi';

installFakePixi();

const { PixiElement } = require('../src/Element') as typeof import('../src/Element');

describe('PixiElement.addElement', () => {
    it('accepts another PixiElement', () => {
        const parent = new PixiElement();
        const child = new PixiElement();

        expect(() => parent.addElement(child as any)).to.not.throw();
    });

    it('rejects non-element objects', () => {
        const parent = new PixiElement();

        expect(() => parent.addElement({} as any)).to.throw(/non element/);
    });
});

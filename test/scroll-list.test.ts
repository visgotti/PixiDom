import { expect } from 'chai';
import { installFakePixi, FakeContainer } from './helpers/fake-pixi';

installFakePixi();

const { ScrollList } = require('../src/Components/ScrollList/ScrollList') as
    typeof import('../src/Components/ScrollList/ScrollList');

const makeItem = (height: number) => {
    const container = new FakeContainer();
    container.width = 50;
    container.height = height;
    return container as any;
};

describe('ScrollList scrolling bounds', () => {
    it('re-clamps currentScroll against the new content height after removing items', () => {
        const list = new ScrollList({ width: '100px', height: '100px' } as any, [
            { container: makeItem(100) },
            { container: makeItem(100) },
            { container: makeItem(100) },
        ]);

        list.currentScroll = 200; // scrolled to the bottom of 300px of content
        expect(list.currentScroll).to.equal(200);

        list.removeScrollItems(2); // content is now 200px, so max scroll is 100

        expect(list.currentScroll).to.equal(100);
    });

    it('clamps currentScroll to 0 when content is shorter than the viewport', () => {
        const list = new ScrollList({ width: '100px', height: '100px' } as any, [
            { container: makeItem(30) },
        ]);

        list.currentScroll = 50;

        expect(list.currentScroll).to.equal(0);
    });
});

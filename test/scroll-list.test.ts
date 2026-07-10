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

    it('throttles visibility recomputation until adjustVisibilityTime accumulates', () => {
        // Default performance options: visibilityBuffer 200, adjustVisibilityTime 130.
        const items = Array.from({ length: 10 }, () => makeItem(100));
        const list = new ScrollList(
            { width: '100px', height: '100px' } as any,
            items.map((container) => ({ container })),
        );

        // At scroll 0 the first item is visible and the sixth (y=500) is culled.
        expect(items[0].visible).to.equal(true);
        expect(items[5].visible).to.equal(false);

        list.currentScroll = 500;

        // Sub-threshold deltas must NOT recompute visibility yet.
        (list as any).adjustVisibility(50);
        (list as any).adjustVisibility(50);
        expect(items[0].visible, 'stale visibility kept below threshold').to.equal(true);
        expect(items[5].visible, 'stale visibility kept below threshold').to.equal(false);

        // Crossing the threshold must recompute.
        (list as any).adjustVisibility(50);
        expect(items[0].visible, 'recomputed once threshold reached').to.equal(false);
        expect(items[5].visible, 'recomputed once threshold reached').to.equal(true);
    });

    it('clamps currentScroll to 0 when content is shorter than the viewport', () => {
        const list = new ScrollList({ width: '100px', height: '100px' } as any, [
            { container: makeItem(30) },
        ]);

        list.currentScroll = 50;

        expect(list.currentScroll).to.equal(0);
    });
});

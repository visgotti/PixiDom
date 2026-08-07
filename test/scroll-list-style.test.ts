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

const makeList = (styleOptions: any = {}, items = [makeItem(100), makeItem(100), makeItem(100)]) =>
    new ScrollList(
        { width: '100px', height: '100px', ...styleOptions } as any,
        items.map((container) => ({ container })),
    );

const scrollBarOptions = (overrides: any = {}) => ({
    width: 10,
    height: 100,
    backgroundColor: 0x222222,
    scrollerOptions: { color: 0xff0000, hoverColor: 0x00ff00, mouseDownColor: 0x0000ff },
    ...overrides,
});

const lastCall = (graphics: any, method: string) =>
    [...graphics.calls].reverse().find((c: any) => c.method === method);

describe('ScrollList style', () => {
    describe('background color', () => {
        it('fills the background with the configured backgroundColor', () => {
            const list = makeList({ backgroundColor: 0xabcdef });
            expect((list as any).resolvedBackgroundColor).to.deep.equal({ value: 0xabcdef, alpha: 1 });
            expect(lastCall((list as any).backgroundRect, 'beginFill').args[0]).to.equal(0xabcdef);
        });

        it('accepts hex-string, rgb-object and rgb-tuple background colors', () => {
            expect((makeList({ backgroundColor: '#ff0000' }) as any).resolvedBackgroundColor.value).to.equal(0xff0000);
            expect((makeList({ backgroundColor: { r: 0, g: 255, b: 0 } }) as any).resolvedBackgroundColor.value).to.equal(0x00ff00);
            const tuple = (makeList({ backgroundColor: [0, 0, 255, 0.5] }) as any).resolvedBackgroundColor;
            expect(tuple.value).to.equal(0x0000ff);
            expect(tuple.alpha).to.be.closeTo(0.5, 0.01);
        });

        it('applies the default backgroundColor when none is given', () => {
            expect((makeList() as any).resolvedBackgroundColor.value).to.equal(0x1a1a1a);
        });
    });

    describe('scroll percent', () => {
        it('setScrollPercent(1) scrolls to the bottom of the utilized length', () => {
            const list = makeList();
            list.setScrollPercent(1);
            expect((list as any).currentScroll).to.equal(list.utilizedLength);
            expect(list.scrollPercent).to.equal(1);
        });

        it('setScrollPercent(0.5) scrolls to the midpoint', () => {
            const list = makeList();
            list.setScrollPercent(0.5);
            expect((list as any).currentScroll).to.equal(list.utilizedLength / 2);
        });

        it('clamps out-of-range scroll percentages', () => {
            const list = makeList();
            list.setScrollPercent(5);
            expect((list as any).currentScroll).to.equal(list.utilizedLength);
            list.setScrollPercent(-5);
            expect((list as any).currentScroll).to.equal(0);
        });
    });

    describe('freeze', () => {
        it('freeze()/unfreeze() flip freezeScroll', () => {
            const list = makeList();
            expect(list.freezeScroll).to.equal(false);
            list.freeze();
            expect(list.freezeScroll).to.equal(true);
            list.unfreeze();
            expect(list.freezeScroll).to.equal(false);
        });

        it('toggleFreezeScroll sets the flag explicitly', () => {
            const list = makeList();
            list.toggleFreezeScroll(true);
            expect(list.freezeScroll).to.equal(true);
        });
    });
});

describe('ScrollBar style', () => {
    it('is only created when scrollBarOptions are provided', () => {
        expect((makeList() as any).scrollBar).to.equal(undefined);
        expect((makeList({ scrollBarOptions: scrollBarOptions() }) as any).scrollBar).to.not.equal(undefined);
    });

    it('fills the track with the configured backgroundColor', () => {
        const list = makeList({ scrollBarOptions: scrollBarOptions({ backgroundColor: 0x123456 }) });
        const bar = (list as any).scrollBar;
        expect(lastCall(bar.bg, 'beginFill').args[0]).to.equal(0x123456);
    });

    it('defaults the track color when backgroundColor is omitted', () => {
        const list = makeList({ scrollBarOptions: scrollBarOptions({ backgroundColor: undefined }) });
        expect((list as any).scrollBar.resolvedBackgroundColor.value).to.equal(0xf7f7f7);
    });

    it('accepts hex-string track colors', () => {
        const list = makeList({ scrollBarOptions: scrollBarOptions({ backgroundColor: '#00ff00' }) });
        expect((list as any).scrollBar.resolvedBackgroundColor.value).to.equal(0x00ff00);
    });

    it('fills the scroller thumb with the configured scroller color', () => {
        const list = makeList({ scrollBarOptions: scrollBarOptions() });
        const scroller = (list as any).scrollBar.scroller;
        expect(scroller.resolvedColor.value).to.equal(0xff0000);
        expect(lastCall(scroller.rect, 'beginFill').args[0]).to.equal(0xff0000);
    });

    it('defaults the scroller thumb to black when no color is given', () => {
        const list = makeList({
            scrollBarOptions: scrollBarOptions({ scrollerOptions: {} }),
        });
        expect((list as any).scrollBar.scroller.resolvedColor.value).to.equal(0x000000);
    });

    it('setScrollPercent moves the thumb proportionally down the track', () => {
        const list = makeList({ scrollBarOptions: scrollBarOptions() });
        const bar = (list as any).scrollBar;
        const usable = bar.visibleLength - bar.scroller.height;
        bar.setScrollPercent(0.5);
        expect(bar.scroller.y).to.equal(usable * 0.5);
        bar.setScrollPercent(1);
        expect(bar.scroller.y).to.equal(usable);
    });
});

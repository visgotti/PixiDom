import { expect } from 'chai';
import { installFakePixi } from './helpers/fake-pixi';

installFakePixi();

const { Slider } = require('../src/Components/Slider') as
    typeof import('../src/Components/Slider');

const makeSlider = (options: any = {}) =>
    new Slider({ width: 200, height: 4, ...options });

const callsOf = (graphics: any, method: string) =>
    graphics.calls.filter((c: any) => c.method === method);

const lastCall = (graphics: any, method: string) =>
    [...graphics.calls].reverse().find((c: any) => c.method === method);

describe('Slider', () => {
    describe('option aliases', () => {
        it('resolves handleColor to circleColor', () => {
            const slider = makeSlider({ handleColor: 0xff0000 });
            expect(slider.options.circleColor).to.equal(0xff0000);
        });

        it('resolves trackColor to inactiveColor', () => {
            const slider = makeSlider({ trackColor: 0x111111 });
            expect(slider.options.inactiveColor).to.equal(0x111111);
        });

        it('resolves handleRadius to circleRadius', () => {
            const slider = makeSlider({ handleRadius: 15 });
            expect(slider.options.circleRadius).to.equal(15);
        });

        it('resolves value/min/max to startingValue/minValue/maxValue', () => {
            const slider = makeSlider({ value: 25, min: 10, max: 50 });
            expect(slider.options.startingValue).to.equal(25);
            expect(slider.options.minValue).to.equal(10);
            expect(slider.options.maxValue).to.equal(50);
        });

        it('prefers the canonical name over the alias when both are given', () => {
            const slider = makeSlider({ circleColor: 0xaaaaaa, handleColor: 0xbbbbbb });
            expect(slider.options.circleColor).to.equal(0xaaaaaa);
        });

        it('resolves nested hover/down handle aliases', () => {
            const slider = makeSlider({
                hover: { handleColor: 0x00ff00, handleRadius: 12 },
                down: { handleColor: 0x0000ff, handleRadius: 14 },
            });
            expect((slider.options.hover as any).circleColor).to.equal(0x00ff00);
            expect((slider.options.hover as any).circleRadius).to.equal(12);
            expect((slider.options.down as any).circleColor).to.equal(0x0000ff);
            expect((slider.options.down as any).circleRadius).to.equal(14);
        });
    });

    describe('defaults', () => {
        it('applies documented defaults when nothing is supplied', () => {
            const slider = makeSlider();
            expect(slider.options.startingValue).to.equal(0);
            expect(slider.options.minValue).to.equal(0);
            expect(slider.options.maxValue).to.equal(100);
            expect(slider.options.circleRadius).to.equal(10);
            expect(slider.options.activeColor).to.equal(0x4a90d9);
            expect(slider.options.inactiveColor).to.equal(0x666666);
            expect(slider.options.circleColor).to.equal(0xffffff);
        });
    });

    describe('value positioning', () => {
        it('positions the handle proportionally to startingValue', () => {
            const slider = makeSlider({ startingValue: 50, minValue: 0, maxValue: 100 });
            expect((slider as any).circleHandle.x).to.equal(100); // 50% of 200
        });

        it('positions the handle correctly for a non-zero minValue', () => {
            const slider = makeSlider({ startingValue: 30, minValue: 20, maxValue: 40 });
            expect((slider as any).circleHandle.x).to.equal(100); // (30-20)/(40-20) = 50%
        });

        it('seeds currentValue from startingValue', () => {
            const slider = makeSlider({ startingValue: 42 });
            expect(slider.currentValue).to.equal(42);
        });

        it('calculateValue inverts the handle position back to a value', () => {
            const slider = makeSlider({ minValue: 0, maxValue: 100 });
            (slider as any).circleHandle.x = 50; // 25% of 200
            expect(slider.calculateValue()).to.equal(25);
        });

        it('calculateValue respects a non-zero minValue', () => {
            const slider = makeSlider({ minValue: 20, maxValue: 40 });
            (slider as any).circleHandle.x = 100;
            expect(slider.calculateValue()).to.equal(30);
        });
    });

    describe('track colors', () => {
        it('fills the active portion with activeColor and the rest with inactiveColor', () => {
            const slider = makeSlider({
                startingValue: 50,
                activeColor: 0xff0000,
                inactiveColor: 0x0000ff,
            });
            const fills = callsOf(slider.backgroundGraphic, 'beginFill');
            const rects = callsOf(slider.backgroundGraphic, 'drawRect');
            expect(fills[0].args[0]).to.equal(0xff0000);
            expect(fills[1].args[0]).to.equal(0x0000ff);
            expect(rects[0].args[2], 'active width').to.equal(100);
            expect(rects[1].args[2], 'inactive width').to.equal(100);
        });

        it('accepts hex-string track colors', () => {
            const slider = makeSlider({ activeColor: '#ff0000', inactiveColor: '#00ff00' });
            const fills = callsOf(slider.backgroundGraphic, 'beginFill');
            expect(fills[0].args[0]).to.equal(0xff0000);
            expect(fills[1].args[0]).to.equal(0x00ff00);
        });

        it('multiplies track color alpha by the opacity option', () => {
            const slider = makeSlider({ activeColor: [255, 0, 0, 0.5], opacity: 0.5 });
            const fills = callsOf(slider.backgroundGraphic, 'beginFill');
            expect(fills[0].args[1]).to.be.closeTo(0.25, 0.01);
        });
    });

    describe('handle colors and states', () => {
        it('fills the handle with circleColor at rest', () => {
            const slider = makeSlider({ circleColor: 0xabcdef });
            expect(lastCall(slider.circleGraphic, 'beginFill').args[0]).to.equal(0xabcdef);
        });

        it('uses the hover circleColor while hovered', () => {
            const slider = makeSlider({ circleColor: 0x111111, hover: { circleColor: 0x222222 } });
            slider.isHovered = true;
            slider.redrawCircle();
            expect(lastCall(slider.circleGraphic, 'beginFill').args[0]).to.equal(0x222222);
        });

        it('uses the down circleColor while dragging, taking priority over hover', () => {
            const slider = makeSlider({
                circleColor: 0x111111,
                hover: { circleColor: 0x222222 },
                down: { circleColor: 0x333333 },
            });
            slider.isHovered = true;
            slider.isDragging = true;
            slider.redrawCircle();
            expect(lastCall(slider.circleGraphic, 'beginFill').args[0]).to.equal(0x333333);
        });

        it('uses the hover circleRadius while hovered', () => {
            const slider = makeSlider({ circleRadius: 10, hover: { circleRadius: 14 } });
            slider.isHovered = true;
            slider.redrawCircle();
            expect(lastCall(slider.circleGraphic, 'drawCircle').args[2]).to.equal(14);
        });

        it('strokes the handle outline with circleOutlineColor and width', () => {
            const slider = makeSlider({ circleOutlineColor: 0x654321, circleOutlineWidth: 3 });
            const lineStyle = lastCall(slider.circleGraphic, 'lineStyle');
            expect(lineStyle.args[0]).to.equal(3);
            expect(lineStyle.args[1]).to.equal(0x654321);
        });

        it('multiplies handle fill alpha by circleOpacity', () => {
            const slider = makeSlider({ circleColor: [255, 255, 255, 0.5], circleOpacity: 0.5 });
            expect(lastCall(slider.circleGraphic, 'beginFill').args[1]).to.be.closeTo(0.25, 0.01);
        });
    });

    describe('change events', () => {
        it('onChange registers a listener that receives the new value', () => {
            const slider = makeSlider();
            const seen: number[] = [];
            slider.onChange((v) => seen.push(v));
            (slider as any).emit('slider-change', 77);
            expect(seen).to.deep.equal([77]);
        });

        it('offChange removes a previously registered listener', () => {
            const slider = makeSlider();
            const seen: number[] = [];
            const handler = (v: number) => seen.push(v);
            slider.onChange(handler);
            slider.offChange(handler);
            (slider as any).emit('slider-change', 77);
            expect(seen).to.deep.equal([]);
        });
    });
});

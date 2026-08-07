import { expect } from 'chai';
import { installFakePixi } from './helpers/fake-pixi';

installFakePixi();

const { Toggle } = require('../src/Components/Toggle') as typeof import('../src/Components/Toggle');

const baseOptions = () => ({
    width: 200,
    height: 40,
    borderRadius: 50,
    onBackgroundColor: 0x00ff00,
    offBackgroundColor: 0x333333,
    onCircleColor: 0xffffff,
    offCircleColor: 0xeeeeee,
});

const makeToggle = (overrides: any = {}, isToggled?: boolean) =>
    new Toggle({ ...baseOptions(), ...overrides } as any, isToggled);

const lastCall = (graphics: any, method: string) =>
    [...graphics.calls].reverse().find((c: any) => c.method === method);

describe('Toggle style and state', () => {
    describe('initial state', () => {
        it('defaults to off when neither startingValue nor isToggled is given', () => {
            expect(makeToggle().toggled).to.equal(false);
        });

        it('honors the legacy isToggled constructor argument', () => {
            expect(makeToggle({}, true).toggled).to.equal(true);
        });

        it('honors options.startingValue', () => {
            expect(makeToggle({ startingValue: true }).toggled).to.equal(true);
        });

        it('prefers options.startingValue over the legacy argument', () => {
            expect(makeToggle({ startingValue: false }, true).toggled).to.equal(false);
        });
    });

    describe('color resolution', () => {
        it('resolves the onToggleColor/offToggleColor legacy aliases', () => {
            const toggle = makeToggle({
                onCircleColor: undefined,
                offCircleColor: undefined,
                onToggleColor: 0x123456,
                offToggleColor: 0x654321,
            });
            expect((toggle as any).resolvedColors.onCircle.value).to.equal(0x123456);
            expect((toggle as any).resolvedColors.offCircle.value).to.equal(0x654321);
        });

        it('accepts hex-string colors', () => {
            const toggle = makeToggle({ onBackgroundColor: '#ff0000', offBackgroundColor: '#0000ff' });
            expect((toggle as any).resolvedColors.onBackground.value).to.equal(0xff0000);
            expect((toggle as any).resolvedColors.offBackground.value).to.equal(0x0000ff);
        });

        it('accepts rgb-object and rgb-tuple colors', () => {
            const toggle = makeToggle({
                onBackgroundColor: { r: 255, g: 0, b: 0 },
                offCircleColor: [0, 0, 255],
            });
            expect((toggle as any).resolvedColors.onBackground.value).to.equal(0xff0000);
            expect((toggle as any).resolvedColors.offCircle.value).to.equal(0x0000ff);
        });

        it('reports active/inactive colors relative to the current state', () => {
            const toggle = makeToggle({}, true);
            expect(toggle.activeBackgroundColor).to.equal(0x00ff00);
            expect(toggle.inactiveBackgroundColor).to.equal(0x333333);
            expect(toggle.activeCircleColor).to.equal(0xffffff);
            expect(toggle.inactiveCircleColor).to.equal(0xeeeeee);
        });

        it('swaps active/inactive colors when toggled off', () => {
            const toggle = makeToggle({}, false);
            expect(toggle.activeBackgroundColor).to.equal(0x333333);
            expect(toggle.inactiveBackgroundColor).to.equal(0x00ff00);
            expect(toggle.activeCircleColor).to.equal(0xeeeeee);
            expect(toggle.inactiveCircleColor).to.equal(0xffffff);
        });
    });

    describe('static (non-animated) drawing', () => {
        it('fills the background with the on color when toggled on', () => {
            const toggle = makeToggle({}, true);
            expect(lastCall((toggle as any).backgroundGraphic, 'beginFill').args[0]).to.equal(0x00ff00);
        });

        it('fills the background with the off color when toggled off', () => {
            const toggle = makeToggle({}, false);
            expect(lastCall((toggle as any).backgroundGraphic, 'beginFill').args[0]).to.equal(0x333333);
        });

        it('fills the circle with the matching state color', () => {
            const on = makeToggle({}, true);
            expect(lastCall((on as any).circleGraphic, 'beginFill').args[0]).to.equal(0xffffff);
            const off = makeToggle({}, false);
            expect(lastCall((off as any).circleGraphic, 'beginFill').args[0]).to.equal(0xeeeeee);
        });

        it('repaints both graphics when toggled at runtime', () => {
            const toggle = makeToggle({}, false);
            toggle.toggled = true;
            expect(lastCall((toggle as any).backgroundGraphic, 'beginFill').args[0]).to.equal(0x00ff00);
            expect(lastCall((toggle as any).circleGraphic, 'beginFill').args[0]).to.equal(0xffffff);
        });

        it('parks the circle left when off and right when on', () => {
            const off = makeToggle({}, false);
            const on = makeToggle({}, true);
            expect((on as any).circleGraphic.x).to.be.greaterThan((off as any).circleGraphic.x);
        });

        it('computes borderRadius as a percentage of height', () => {
            const toggle = makeToggle({ borderRadius: 50, height: 40 });
            const rounded = lastCall((toggle as any).backgroundGraphic, 'drawRoundedRect');
            expect(rounded.args[4]).to.equal(20); // 50% of 40
        });

        it('defaults borderRadius to 50 when not supplied', () => {
            const toggle = makeToggle({ borderRadius: undefined, height: 40 });
            const rounded = lastCall((toggle as any).backgroundGraphic, 'drawRoundedRect');
            expect(rounded.args[4]).to.equal(20);
        });

        it('strokes the background outline when backgroundOutline is configured', () => {
            const toggle = makeToggle({ backgroundOutline: { width: 3, color: 0xff00ff } }, true);
            const lineStyle = lastCall((toggle as any).backgroundGraphic, 'lineStyle');
            expect(lineStyle.args[0]).to.equal(3);
            expect(lineStyle.args[1]).to.equal(0xff00ff);
        });
    });

    describe('onToggle callback', () => {
        it('invokes the callback with the new state', () => {
            const toggle = makeToggle({}, false);
            const seen: boolean[] = [];
            toggle.onToggle((v) => seen.push(v));
            toggle.toggled = true;
            toggle.toggled = false;
            expect(seen).to.deep.equal([true, false]);
        });

        it('does not fire for state set before the listener was registered', () => {
            const toggle = makeToggle({}, false);
            toggle.toggled = true;
            const seen: boolean[] = [];
            toggle.onToggle((v) => seen.push(v));
            expect(seen).to.deep.equal([]);
        });
    });

    describe('labels', () => {
        it('shows only the on label when toggled on', () => {
            const toggle = makeToggle({
                labelOptions: {
                    fontName: 'TestFont', onLabel: 'ON', offLabel: 'OFF',
                    onColor: 0x000000, offColor: 0x000000,
                },
            }, true);
            expect((toggle as any).onText.visible).to.equal(true);
            expect((toggle as any).offText.visible).to.equal(false);
        });

        it('shows only the off label when toggled off', () => {
            const toggle = makeToggle({
                labelOptions: {
                    fontName: 'TestFont', onLabel: 'ON', offLabel: 'OFF',
                    onColor: 0x000000, offColor: 0x000000,
                },
            }, false);
            expect((toggle as any).onText.visible).to.equal(false);
            expect((toggle as any).offText.visible).to.equal(true);
        });

        it('tints each label with its configured color', () => {
            const toggle = makeToggle({
                labelOptions: {
                    fontName: 'TestFont', onLabel: 'ON', offLabel: 'OFF',
                    onColor: 0xff0000, offColor: 0x0000ff,
                },
            }, true);
            expect((toggle as any).onText.tint).to.equal(0xff0000);
            expect((toggle as any).offText.tint).to.equal(0x0000ff);
        });

        it('throws when a label is too wide for the toggle', () => {
            expect(() => makeToggle({
                width: 10,
                labelOptions: {
                    fontName: 'TestFont', onLabel: 'AN EXTREMELY LONG LABEL', offLabel: 'OFF',
                    onColor: 0x000000, offColor: 0x000000,
                },
            })).to.throw(/too long/);
        });
    });
});

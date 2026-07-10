import { expect } from 'chai';
import ColorTween, { ColorFrame } from '../src/ColorTween';

const VALID_HEX = /^#[0-9a-f]{6}$/;

describe('ColorTween', () => {
    it('produces valid 6-digit hex strings mid-tween (fractional channels must round)', () => {
        const tween = new ColorTween(['#000000'], ['#ffffff']).duration(1000).start();
        // Force a halfway-progress update deterministically.
        (tween as any).startTime = performance.now() - 500;

        const frames = tween.update() as ColorFrame[];

        expect(frames).to.have.length(1);
        const hex = frames[0].hex();
        expect(hex).to.match(VALID_HEX, `mid-tween hex "${hex}" is not a valid css hex color`);
        // Halfway between #000000 and #ffffff is ~#808080 (allow ±1 per channel for rounding).
        const channel = parseInt(hex.slice(1, 3), 16);
        expect(channel).to.be.closeTo(0x80, 1);
    });

    it('every update over a tween lifetime yields parseable hex for all frames', () => {
        const tween = new ColorTween(['#123456', '#abcdef'], ['#fedcba', '#654321'])
            .duration(1000)
            .start();

        for (const elapsed of [1, 250, 333.7, 500, 750, 999]) {
            (tween as any).startTime = performance.now() - elapsed;
            const frames = tween.update() as ColorFrame[];
            frames.forEach((frame) => {
                expect(frame.hex()).to.match(VALID_HEX);
            });
        }
    });

    it('completes at the exact end colors once duration elapses', () => {
        const tween = new ColorTween(['#112233'], ['#445566']).duration(100).start();
        (tween as any).startTime = performance.now() - 200;

        const frames = tween.update() as ColorFrame[];

        expect(frames[0].hex()).to.equal('#445566');
    });
});

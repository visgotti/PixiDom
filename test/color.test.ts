import { expect } from 'chai';
import { normalizeColor, colorToInt, normalizeColorOr, type Color } from '../src/color';

describe('normalizeColor', () => {
    describe('hex string input', () => {
        it('parses 6-digit hex with #', () => {
            expect(normalizeColor('#e7e7e7')).to.deep.equal({ value: 0xe7e7e7, alpha: 1 });
        });
        it('parses 6-digit hex without #', () => {
            expect(normalizeColor('e7e7e7')).to.deep.equal({ value: 0xe7e7e7, alpha: 1 });
        });
        it('parses 6-digit hex with 0x prefix', () => {
            expect(normalizeColor('0xe7e7e7')).to.deep.equal({ value: 0xe7e7e7, alpha: 1 });
        });
        it('parses uppercase 6-digit hex', () => {
            expect(normalizeColor('#FFAABB')).to.deep.equal({ value: 0xffaabb, alpha: 1 });
        });
        it('parses 3-digit shorthand hex', () => {
            expect(normalizeColor('#fff')).to.deep.equal({ value: 0xffffff, alpha: 1 });
            expect(normalizeColor('#abc')).to.deep.equal({ value: 0xaabbcc, alpha: 1 });
        });
        it('parses 4-digit hex with alpha', () => {
            const result = normalizeColor('#ffff');
            expect(result.value).to.equal(0xffffff);
            expect(result.alpha).to.equal(1);
            const halfAlpha = normalizeColor('#fff8');
            expect(halfAlpha.value).to.equal(0xffffff);
            expect(halfAlpha.alpha).to.be.closeTo(0x88 / 0xff, 0.001);
        });
        it('parses 8-digit hex with alpha', () => {
            const result = normalizeColor('#e7e7e780');
            expect(result.value).to.equal(0xe7e7e7);
            expect(result.alpha).to.be.closeTo(0x80 / 0xff, 0.001);
        });
        it('parses 8-digit hex with full alpha', () => {
            const result = normalizeColor('#e7e7e7ff');
            expect(result.value).to.equal(0xe7e7e7);
            expect(result.alpha).to.equal(1);
        });
        it('trims whitespace', () => {
            expect(normalizeColor('  #ff0000  ')).to.deep.equal({ value: 0xff0000, alpha: 1 });
        });
        it('throws on invalid hex characters', () => {
            expect(() => normalizeColor('#zzzzzz')).to.throw(TypeError);
        });
        it('throws on wrong length hex', () => {
            expect(() => normalizeColor('#ff')).to.throw(TypeError);
            expect(() => normalizeColor('#fffff')).to.throw(TypeError);
            expect(() => normalizeColor('#fffffff')).to.throw(TypeError);
        });
        it('throws on empty string', () => {
            expect(() => normalizeColor('')).to.throw(TypeError);
            expect(() => normalizeColor('   ')).to.throw(TypeError);
        });
    });

    describe('hex int input', () => {
        it('handles 0xRRGGBB form', () => {
            expect(normalizeColor(0xe7e7e7)).to.deep.equal({ value: 0xe7e7e7, alpha: 1 });
        });
        it('handles 0', () => {
            expect(normalizeColor(0)).to.deep.equal({ value: 0, alpha: 1 });
        });
        it('handles max 24-bit value', () => {
            expect(normalizeColor(0xffffff)).to.deep.equal({ value: 0xffffff, alpha: 1 });
        });
        it('masks values above 24-bit range to lowest 24 bits', () => {
            expect(normalizeColor(0x1ffffff).value).to.equal(0xffffff);
        });
        it('throws on NaN', () => {
            expect(() => normalizeColor(NaN)).to.throw(TypeError);
        });
        it('throws on Infinity', () => {
            expect(() => normalizeColor(Infinity)).to.throw(TypeError);
        });
    });

    describe('RGB(A) object input', () => {
        it('parses {r,g,b}', () => {
            expect(normalizeColor({ r: 231, g: 231, b: 231 })).to.deep.equal({ value: 0xe7e7e7, alpha: 1 });
        });
        it('parses {r,g,b,a}', () => {
            expect(normalizeColor({ r: 255, g: 0, b: 0, a: 0.5 })).to.deep.equal({
                value: 0xff0000,
                alpha: 0.5,
            });
        });
        it('rounds fractional channel values', () => {
            expect(normalizeColor({ r: 254.6, g: 0.4, b: 127.5 }).value).to.equal((255 << 16) | (0 << 8) | 128);
        });
        it('clamps channels above 255', () => {
            expect(normalizeColor({ r: 300, g: 256, b: 999 }).value).to.equal(0xffffff);
        });
        it('clamps channels below 0', () => {
            expect(normalizeColor({ r: -10, g: -1, b: -1000 }).value).to.equal(0x000000);
        });
        it('clamps alpha above 1', () => {
            expect(normalizeColor({ r: 0, g: 0, b: 0, a: 5 }).alpha).to.equal(1);
        });
        it('clamps alpha below 0', () => {
            expect(normalizeColor({ r: 0, g: 0, b: 0, a: -1 }).alpha).to.equal(0);
        });
        it('treats undefined alpha as 1', () => {
            expect(normalizeColor({ r: 0, g: 0, b: 0, a: undefined as unknown as number }).alpha).to.equal(1);
        });
        it('throws on missing channel', () => {
            expect(() => normalizeColor({ r: 1, g: 2 } as unknown as Color)).to.throw(TypeError);
        });
        it('treats non-finite channel as 0', () => {
            expect(normalizeColor({ r: NaN, g: 100, b: 100 }).value).to.equal((0 << 16) | (100 << 8) | 100);
        });
    });

    describe('RGB(A) tuple input', () => {
        it('parses [r,g,b]', () => {
            expect(normalizeColor([231, 231, 231])).to.deep.equal({ value: 0xe7e7e7, alpha: 1 });
        });
        it('parses [r,g,b,a]', () => {
            expect(normalizeColor([255, 0, 0, 0.25])).to.deep.equal({ value: 0xff0000, alpha: 0.25 });
        });
        it('clamps tuple channels', () => {
            expect(normalizeColor([400, -50, 128]).value).to.equal(0xff0080);
        });
        it('throws on tuple of wrong length', () => {
            expect(() => normalizeColor([255, 0] as unknown as Color)).to.throw(TypeError);
            expect(() => normalizeColor([255, 0, 0, 1, 1] as unknown as Color)).to.throw(TypeError);
        });
        it('throws on tuple with non-numbers', () => {
            expect(() => normalizeColor(['255', 0, 0] as unknown as Color)).to.throw(TypeError);
        });
    });

    describe('invalid input', () => {
        it('throws on null', () => {
            expect(() => normalizeColor(null as unknown as Color)).to.throw(TypeError);
        });
        it('throws on undefined', () => {
            expect(() => normalizeColor(undefined as unknown as Color)).to.throw(TypeError);
        });
        it('throws on boolean', () => {
            expect(() => normalizeColor(true as unknown as Color)).to.throw(TypeError);
        });
        it('throws on plain object without rgb fields', () => {
            expect(() => normalizeColor({ foo: 'bar' } as unknown as Color)).to.throw(TypeError);
        });
    });

    describe('cross-format equivalence', () => {
        it('all formats for the same color produce the same value', () => {
            const v = 0xe7e7e7;
            const formats: Color[] = [
                0xe7e7e7,
                '#e7e7e7',
                'e7e7e7',
                '0xe7e7e7',
                { r: 231, g: 231, b: 231 },
                [231, 231, 231],
                { r: 231, g: 231, b: 231, a: 1 },
                [231, 231, 231, 1],
            ];
            for (const f of formats) {
                expect(normalizeColor(f).value, JSON.stringify(f)).to.equal(v);
                expect(normalizeColor(f).alpha, JSON.stringify(f)).to.equal(1);
            }
        });
    });
});

describe('colorToInt', () => {
    it('strips alpha', () => {
        expect(colorToInt({ r: 255, g: 0, b: 0, a: 0.5 })).to.equal(0xff0000);
        expect(colorToInt('#ff000080')).to.equal(0xff0000);
    });
    it('returns 24-bit value for plain int', () => {
        expect(colorToInt(0xabcdef)).to.equal(0xabcdef);
    });
});

describe('normalizeColorOr', () => {
    it('uses fallback for null', () => {
        expect(normalizeColorOr(null, 0xff0000)).to.deep.equal({ value: 0xff0000, alpha: 1 });
    });
    it('uses fallback for undefined', () => {
        expect(normalizeColorOr(undefined, '#00ff00')).to.deep.equal({ value: 0x00ff00, alpha: 1 });
    });
    it('uses provided color when valid', () => {
        expect(normalizeColorOr('#0000ff', 0xff0000)).to.deep.equal({ value: 0x0000ff, alpha: 1 });
    });
});

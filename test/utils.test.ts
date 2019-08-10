import { expect } from 'chai';
import { parseLengthMeasurements } from '../src/utils';

describe('parseMeasurement', () => {
    it('should validate %s correctly', () => {
        expect(parseLengthMeasurements('100%')).to.deep.equal({
            valid: true,
            value: 100,
            type: 'percent'
        });
        expect(parseLengthMeasurements('-150%')).to.deep.equal({
            valid: true,
            value: -150,
            type: 'percent'
        })
    });
    it('should invalidate %s correctly', () => {
        expect(parseLengthMeasurements('qwerqwerqwerqwer%')).to.deep.equal({
            valid: false,
            error: 'Did not find a number in front of % sign',
        });
        expect(parseLengthMeasurements('-qwerqwer0%%')).to.deep.equal({
            valid: false,
            error: 'Did not find a number in front of % sign',
        })
    });
    it('should validate px correctly', () => {
        expect(parseLengthMeasurements('100px')).to.deep.equal({
            valid: true,
            value: 100,
            type: 'pixel'
        });
        expect(parseLengthMeasurements('150px')).to.deep.equal({
            valid: true,
            value: 150,
            type: 'pixel'
        })
    });
    it('should invalidate %s correctly', () => {
        expect(parseLengthMeasurements('qweqweqwewqepx')).to.deep.equal({
            valid: false,
            error: 'Did not find a number in front of px',
        });
        expect(parseLengthMeasurements('-150px')).to.deep.equal({
            valid: false,
            error: 'Can not have negative pixel length value',
        })
    });
    it('should invalidate anything that doesnt have a px or %', () => {
        expect(parseLengthMeasurements('42342234')).to.deep.equal({
            valid: false,
            error: 'Length values must either be in % or px',
        });
        expect(parseLengthMeasurements(42342234)).to.deep.equal({
            valid: false,
            error: 'Length values must either be in % or px',
        });
        expect(parseLengthMeasurements('324234234px324234234')).to.deep.equal({
            valid: false,
            error: 'Length values must either be in % or px',
        });
    })
});
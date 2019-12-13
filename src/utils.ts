Number.isNaN = Number.isNaN || function(value) {
    return typeof value === "number" && isNaN(value);
}

type ParsedMeasurement = {
    valid: boolean,
    error?: string,
    value?: number,
    type?: string, // percent or pixel
}

export const parseLengthMeasurements = function(measurement) : ParsedMeasurement {
    let value: number;
    try {
        const last2 = measurement.toString().slice(-2);
        if(last2.charAt(1) === '%') {
            value = parseInt(measurement.slice(0, -1));
            if(Number.isNaN(value)) {
                throw new Error('Did not find a number in front of % sign')
            } else {
                return {
                    valid: true,
                    value,
                    type: 'percent'
                }
            }
        } else if (last2 === 'px') {
            value = parseInt(measurement.slice(0, -2));
            if(Number.isNaN(value)) {
                throw new Error('Did not find a number in front of px')
            } else if(value < 0) {
                throw new Error('Can not have negative pixel length value')
            } else {
                return {
                    valid: true,
                    value,
                    type: 'pixel'
                }
            }
        } else {
            throw new Error('Length values must either be in % or px');
        }
    } catch(err) {
        return { valid: false, error: err.message }
    }
}

export function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
}
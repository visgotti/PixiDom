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
    const invalid = (error: string): ParsedMeasurement => ({ valid: false, error });
    const asNumber = (value: any) => {
        if (typeof value === 'number' && !Number.isNaN(value)) {
            return value;
        }
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed.length) {
                return undefined;
            }
            const parsed = Number(trimmed);
            if (!Number.isNaN(parsed)) {
                return parsed;
            }
        }
        return undefined;
    };

    try {
        if (measurement == null) {
            throw new Error('Length values must either be in % or px');
        }

        if (typeof measurement === 'object' && 'value' in measurement && 'type' in measurement) {
            const numeric = asNumber((measurement as ParsedMeasurement).value);
            if (numeric === undefined) {
                throw new Error('Did not find a number in front of px');
            }
            const type = (measurement as ParsedMeasurement).type === 'percent' ? 'percent' : 'pixel';
            if (type === 'pixel' && numeric < 0) {
                throw new Error('Can not have negative pixel length value');
            }
            return {
                valid: true,
                value: numeric,
                type,
            };
        }

        if (typeof measurement === 'number') {
            if (measurement < 0) {
                throw new Error('Can not have negative pixel length value');
            }
            return {
                valid: true,
                value: measurement,
                type: 'pixel',
            };
        }

        const raw = measurement.toString().trim();
        if (!raw.length) {
            throw new Error('Length values must either be in % or px');
        }

        if (raw.endsWith('%')) {
            const percentValue = asNumber(raw.slice(0, -1));
            if (percentValue === undefined) {
                throw new Error('Did not find a number in front of % sign');
            }
            return {
                valid: true,
                value: percentValue,
                type: 'percent',
            };
        }

        if (raw.toLowerCase().endsWith('px')) {
            const pixelValue = asNumber(raw.slice(0, -2));
            if (pixelValue === undefined) {
                throw new Error('Did not find a number in front of px');
            }
            if (pixelValue < 0) {
                throw new Error('Can not have negative pixel length value');
            }
            return {
                valid: true,
                value: pixelValue,
                type: 'pixel',
            };
        }

        const numericValue = asNumber(raw);
        if (numericValue !== undefined) {
            if (numericValue < 0) {
                throw new Error('Can not have negative pixel length value');
            }
            return {
                valid: true,
                value: numericValue,
                type: 'pixel',
            };
        }

        throw new Error('Length values must either be in % or px');
    } catch(err) {
        return invalid(err.message);
    }
}

export function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
}

export function string2hex(string) {
    if (typeof string === 'string' && string[0] === '#')
    {
        string = string.substr(1);
    }
    return parseInt(string, 16);
}


type PixiRectLike = { x: number, y: number, width: number, height: number, parent?: { width: number, height: number } }


export function centerPixiObject(object: PixiRectLike, opts: { axis: 'y', parent?: { height: number } })
export function centerPixiObject(object: PixiRectLike, opts: { axis?: 'x' | 'y', parent?: { width?: number, height?: number } }) {
    if(!object.parent && !opts?.parent) throw new Error(`No parent`);
    const parentRect : { width?: number, height?: number } = opts?.parent || object.parent;
    const centerX = () => object.x = parentRect.width / 2 - object.width / 2
    const centerY = () => object.y = parentRect.height / 2 - object.height / 2
    if(opts?.axis) {
      if(opts.axis === 'x') {
        centerX();
      } else if (opts.axis === 'y') {
        centerY();
      }
    } else {
      centerX();
      centerY();
    }
  }
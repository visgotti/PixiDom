import type { ParsedMeasurement, PixiRectLike, ValidMeasurement } from "./types";

Number.isNaN = Number.isNaN || function(value) {
    return typeof value === "number" && isNaN(value);
}

export const parseLengthMeasurements = function(measurement: ValidMeasurement): ParsedMeasurement {
    // Handle null or undefined
    if (measurement == null) {
        return {
            valid: false,
            error: 'Measurement cannot be null or undefined'
        };
    }

    // Handle number type
    if (typeof measurement === 'number') {
        if (isNaN(measurement)) {
            return {
                valid: false,
                error: 'Invalid number value'
            };
        }
        
        if (measurement < 0) {
            return {
                valid: false,
                error: 'Cannot have negative length value'
            };
        }
        
        return {
            valid: true,
            type: 'pixel',
            value: measurement
        };
    }

    // Handle object type
    if (typeof measurement === 'object' && 'value' in measurement && 'type' in measurement) {
        const { value, type } = measurement;
        
        if (isNaN(value) || value < 0) {
            return {
                valid: false,
                error: 'Invalid or negative value in object'
            };
        }

        if (type === 'px' || type === 'pixel' || type === 'pixels') {
            return {
                valid: true,
                type: 'pixel',
                value
            };
        } else if (type === '%' || type === 'percent') {
            return {
                valid: true,
                type: 'percent',
                value
            };
        } else {
            return {
                valid: false,
                error: 'Invalid measurement type. Must be px, pixel, pixels, % or percent'
            };
        }
    }

    // Handle string type
    try {
        const strMeasurement = String(measurement);
        
        // Check for percentage
        if (strMeasurement.endsWith('%')) {
            const value = parseFloat(strMeasurement.slice(0, -1));
            if (isNaN(value)) {
                return {
                    valid: false,
                    error: 'Did not find a valid number in front of % sign'
                };
            }
            return {
                valid: true,
                value,
                type: 'percent'
            };
        } 
        // Check for pixel values
        else if (strMeasurement.endsWith('px')) {
            const value = parseFloat(strMeasurement.slice(0, -2));
            if (isNaN(value)) {
                return {
                    valid: false,
                    error: 'Did not find a valid number in front of px'
                };
            }
            if (value < 0) {
                return {
                    valid: false,
                    error: 'Cannot have negative pixel length value'
                };
            }
            return {
                valid: true,
                value,
                type: 'pixel'
            };
        } 
        // Try to parse as number
        else {
            const value = parseFloat(strMeasurement);
            if (!isNaN(value)) {
                if (value < 0) {
                    return {
                        valid: false,
                        error: 'Cannot have negative length value'
                    };
                }
                return {
                    valid: true,
                    value,
                    type: 'pixel'
                };
            }
            return {
                valid: false,
                error: 'Length values must either be in %, px, or a valid number'
            };
        }
    } catch (err) {
        return { 
            valid: false, 
            error: err instanceof Error ? err.message : 'Unknown error parsing measurement' 
        };
    }
}

export function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
}

export function string2hex(string: string): number {
  return parseInt(string.replace('#', ''), 16);
}

export function centerPixiObject(object: PixiRectLike, opts: { axis: 'y', parent?: { height: number } })
export function centerPixiObject(object: PixiRectLike, opts: { axis: 'x', parent?: { width: number } })
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
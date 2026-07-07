Number.isNaN = Number.isNaN || function(value) {
    return typeof value === "number" && isNaN(value);
}

import type { MeasurementType, ValidMeasurement } from './types';

type ParsedMeasurement =
    | (ValidMeasurement & { valid: true })
    | { valid: false; error: string };

export const parseLengthMeasurements = function(measurement: unknown) : ParsedMeasurement {
    const invalid = (error: string): ParsedMeasurement => ({ valid: false, error });
    const asNumber = (value: unknown): number | undefined => {
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
            const obj = measurement as { value: unknown; type: unknown };
            const numeric = asNumber(obj.value);
            if (numeric === undefined) {
                throw new Error('Did not find a number in front of px');
            }
            const type: MeasurementType = obj.type === 'percent' ? 'percent' : 'pixel';
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

        const raw = String(measurement).trim();
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
        const message = err instanceof Error ? err.message : String(err);
        return invalid(message);
    }
}

export function clamp(num: number, min: number, max: number): number {
    return num <= min ? min : num >= max ? max : num;
}

export function string2hex(input: string | number): number {
    let s = typeof input === 'number' ? input.toString(16) : input;
    if (typeof s === 'string' && s[0] === '#') {
        s = s.substring(1);
    }
    return parseInt(s, 16);
}


type PixiRectLike = { x: number, y: number, width: number, height: number, parent?: { width: number, height: number } | null }
type CenterParent = { width?: number, height?: number };


export function centerPixiObject(object: PixiRectLike, opts: { axis: 'y', parent?: { height: number } }): void;
export function centerPixiObject(object: PixiRectLike, opts: { axis?: 'x' | 'y', parent?: CenterParent }): void {
    const parentRect: CenterParent | null = opts?.parent ?? object.parent ?? null;
    if (!parentRect) throw new Error(`No parent`);
    const centerX = () => {
        if (parentRect.width === undefined) throw new Error('Parent has no width');
        object.x = parentRect.width / 2 - object.width / 2;
    };
    const centerY = () => {
        if (parentRect.height === undefined) throw new Error('Parent has no height');
        object.y = parentRect.height / 2 - object.height / 2;
    };
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
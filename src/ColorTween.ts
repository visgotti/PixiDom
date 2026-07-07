// Minimal local ColorTween implementation compatible with gotti-color-tween's
// public API as used in Toggle.ts.

// Easing names map to tween.js-like semantics; we can extend this table if
// more easing types are needed.
const easingFunctions = {
  linear: (k: number): number => k,
} as const;

export type ColorTweenEasing = keyof typeof easingFunctions | string;

// Frame is a small object exposing a `.hex()` method, mimicking gotti-color-tween
// so existing Toggle.midAnimationToggleUpdate can keep calling colors[i].hex().
export interface ColorFrame {
  hex(): string;
}

type Updater = (frames: ColorFrame[], progress: number) => void;
type Ender = (frames: ColorFrame[], progress: number) => void;

type RGB = [number, number, number];

function hexStringToRgbArray(hex: string): RGB {
  // hex is a css-style string like "#ffffff"; parse manually to avoid PIXI
  const normalized = hex.replace('#', '');
  const int = parseInt(normalized, 16);
  const r = (int >> 16) & 0xff;
  const g = (int >> 8) & 0xff;
  const b = int & 0xff;
  return [r, g, b];
}

function rgbArrayToHexString(rgb: RGB): string {
  const toHex = (v: number) => {
    const base = v.toString(16);
    return base.length === 1 ? '0' + base : base;
  };
  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`;
}

export class ColorTween {
  private startColors: RGB[];
  private endColors: RGB[];
  private updater: Updater = () => {};
  private ender: Ender = () => {};
  private length = 1000; // ms
  private startTime: number | undefined;
  private easingName: ColorTweenEasing = 'linear';

  constructor(startColorStrings: string[], endColorStrings: string[]) {
    this.startColors = startColorStrings.map(hexStringToRgbArray);
    this.endColors = endColorStrings.map(hexStringToRgbArray);
  }

  onUpdate(fn: Updater): this {
    this.updater = fn;
    return this;
  }

  onEnd(fn: Ender): this {
    this.ender = fn;
    return this;
  }

  duration(ms: number): this {
    this.length = ms;
    return this;
  }

  easing(name: ColorTweenEasing): this {
    this.easingName = name;
    return this;
  }

  start(cb?: () => void): this {
    this.startTime = performance.now();
    if (typeof cb === 'function') {
      setTimeout(cb, 0);
    }
    return this;
  }

  update(): ColorFrame[] | null {
    if (this.startTime == null) return null;
    const now = performance.now();
    const pos = now - this.startTime;
    const percent = pos / this.length;
    if (percent >= 1) {
      const frames = this.endColors.map<ColorFrame>(c => {
        const hex = rgbArrayToHexString(c);
        return { hex: () => hex };
      });
      this.updater(frames, 1);
      this.stop();
      return frames;
    }
    const easeFn = easingFunctions[this.easingName as keyof typeof easingFunctions] || easingFunctions.linear;
    const eased = easeFn(Math.max(0, Math.min(1, percent)));
    const frames = this.endColors.map<ColorFrame>((endColor, i) => {
      const startColor = this.startColors[i];
      const rgb: RGB = [
        startColor[0] + (endColor[0] - startColor[0]) * eased,
        startColor[1] + (endColor[1] - startColor[1]) * eased,
        startColor[2] + (endColor[2] - startColor[2]) * eased,
      ];
      const hex = rgbArrayToHexString(rgb);
      return { hex: () => hex };
    });
    this.updater(frames, percent);
    return frames;
  }

  stop(): this {
    this.startTime = undefined;
    const frames = this.endColors.map<ColorFrame>(c => {
      const hex = rgbArrayToHexString(c);
      return { hex: () => hex };
    });
    this.ender(frames, 1);
    return this;
  }
}

export default ColorTween;

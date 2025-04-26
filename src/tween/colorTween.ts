import getEasing from './easing';
import Color from './color';

interface TweenParams {
  updater: (color: Color | Color[], progress: number) => void;
  ender: (color: Color | Color[]) => void;
  length: number;
  startTime?: number;
  easing: (k: number) => number;
}

interface FrameResult {
  frame: Color | Color[];
  progress: number;
}

export class ColorTween {
  private startColors: Color[];
  private endColors: Color[];
  private params: TweenParams;
  
  constructor(startColorStrings: string[], endColorStrings: string[]) {
    this.startColors = startColorStrings.map(color => new Color(color));
    this.endColors = endColorStrings.map(color => new Color(color));
    
    this.params = {
      updater: () => {},
      ender: () => {},
      length: 1000,
      easing: getEasing('linear')
    };
  }

  onUpdate(callback: (colors: Color | Color[], progress: number) => void): ColorTween {
    this.params.updater = callback;
    return this;
  }

  onEnd(callback: (colors: Color | Color[]) => void): ColorTween {
    this.params.ender = callback;
    return this;
  }

  duration(length: number): ColorTween {
    this.params.length = length;
    return this;
  }

  easing(name: string): ColorTween {
    this.params.easing = getEasing(name);
    return this;
  }

  start(callback?: () => void): ColorTween {
    this.params.startTime = Date.now();
    if (typeof callback === 'function') {
      setTimeout(callback);
    }
    return this;
  }

  update(): boolean {
    if (this.params.startTime) {
      const frame = this.renderFrame();
      if (frame.progress >= 1) {
        this.done();
        return false;
      } else {
        this.params.updater(frame.frame, frame.progress);
        return true;
      }
    }
    return false;
  }

  private renderFrame(): FrameResult {
    const pos = Date.now() - (this.params.startTime || 0);
    const percent = pos / this.params.length;
    const frames = this.endColors.map((endColor, i) => {
      const startColor = this.startColors[i];
      const startRGB = startColor.array();
      const endRGB = endColor.array();
      const frameColor = endRGB.map((val, j) => {
        const interpolated = startRGB[j] + (val - startRGB[j]) * this.params.easing(percent);
        return Math.round(interpolated);
      });
      return new Color(frameColor);
    });
    
    return {
      frame: frames.length === 1 ? frames[0] : frames,
      progress: percent
    };
  }

  private done(): ColorTween {
    const endColorResult = this.endColors.length === 1 ? this.endColors[0] : this.endColors;
    this.params.updater(endColorResult, 1);
    this.stop();
    return this;
  }

  stop(): ColorTween {
    const endColorResult = this.endColors.length === 1 ? this.endColors[0] : this.endColors;
    this.params.startTime = undefined;
    this.params.ender(endColorResult);
    return this;
  }
}

export default ColorTween;
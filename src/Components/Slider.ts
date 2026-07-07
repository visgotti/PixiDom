import { PixiElement } from "../Element";
import { centerPixiObject } from "../utils";
import { normalizeColor, type Color } from "../color";

/**
 * Configuration options for creating a Slider component.
 */
type SliderOptions = {
  /** Starting value of the slider */
  startingValue?: number;
  /** Minimum value of the slider */
  minValue?: number;
  /** Maximum value of the slider */
  maxValue?: number;
  /** Width of the track in pixels */
  width: number;
  /** Height of the track in pixels */
  height: number;
  /** Radius of the handle circle (alias: handleRadius) */
  circleRadius?: number;
  /** Alias for circleRadius */
  handleRadius?: number;
  preventScaleAdjustment?: boolean;
  circleOpacity?: number;
  down?: {
      circleOpacity?: number;
      circleRadius?: number;
      handleRadius?: number;
      /** Accepts any {@link Color} format. */
      circleColor?: Color;
      /** Accepts any {@link Color} format. */
      handleColor?: Color;
      circleOutlineWidth?: number;
      /** Accepts any {@link Color} format. */
      circleOutlineColor?: Color;
      circleOutlineOpacity?: number;
  };
  hover?: {
      circleOpacity?: number;
      circleRadius?: number;
      handleRadius?: number;
      /** Accepts any {@link Color} format. */
      circleColor?: Color;
      /** Accepts any {@link Color} format. */
      handleColor?: Color;
      circleOutlineWidth?: number;
      /** Accepts any {@link Color} format. */
      circleOutlineColor?: Color;
      circleOutlineOpacity?: number;
  };
  /** Color of the active (filled) portion of the track. Accepts any {@link Color} format. */
  activeColor?: Color;
  /** Color of the inactive portion of the track (alias: trackColor). Accepts any {@link Color} format. */
  inactiveColor?: Color;
  /** Alias for inactiveColor. Accepts any {@link Color} format. */
  trackColor?: Color;
  opacity?: number;
  /** Color of the handle circle (alias: handleColor). Accepts any {@link Color} format. */
  circleColor?: Color;
  /** Alias for circleColor. Accepts any {@link Color} format. */
  handleColor?: Color;
  circleOutlineWidth?: number;
  /** Outline color of the handle circle. Accepts any {@link Color} format. */
  circleOutlineColor?: Color;
  circleOutlineOpacity?: number;
  /** Alias for startingValue */
  value?: number;
  /** Alias for minValue */
  min?: number;
  /** Alias for maxValue */
  max?: number;
}

type ResolvedSliderOptions = SliderOptions & {
  startingValue: number;
  minValue: number;
  maxValue: number;
  circleRadius: number;
  activeColor: Color;
  inactiveColor: Color;
  circleColor: Color;
};

/**
 * Normalizes slider options by resolving aliases to canonical property names.
 */
function normalizeSliderOptions(opts: SliderOptions): ResolvedSliderOptions {
  const normalized = { ...opts };
  // Handle aliases
  if (normalized.handleRadius !== undefined && normalized.circleRadius === undefined) {
    normalized.circleRadius = normalized.handleRadius;
  }
  if (normalized.trackColor !== undefined && normalized.inactiveColor === undefined) {
    normalized.inactiveColor = normalized.trackColor;
  }
  if (normalized.handleColor !== undefined && normalized.circleColor === undefined) {
    normalized.circleColor = normalized.handleColor;
  }
  if (normalized.value !== undefined && normalized.startingValue === undefined) {
    normalized.startingValue = normalized.value;
  }
  if (normalized.min !== undefined && normalized.minValue === undefined) {
    normalized.minValue = normalized.min;
  }
  if (normalized.max !== undefined && normalized.maxValue === undefined) {
    normalized.maxValue = normalized.max;
  }
  // Defaults
  normalized.startingValue = normalized.startingValue ?? 0;
  normalized.minValue = normalized.minValue ?? 0;
  normalized.maxValue = normalized.maxValue ?? 100;
  normalized.circleRadius = normalized.circleRadius ?? 10;
  normalized.activeColor = normalized.activeColor ?? 0x4a90d9;
  normalized.inactiveColor = normalized.inactiveColor ?? 0x666666;
  normalized.circleColor = normalized.circleColor ?? 0xffffff;
  
  // Normalize nested states
  if (normalized.down) {
    if (normalized.down.handleRadius !== undefined && normalized.down.circleRadius === undefined) {
      normalized.down.circleRadius = normalized.down.handleRadius;
    }
    if (normalized.down.handleColor !== undefined && normalized.down.circleColor === undefined) {
      normalized.down.circleColor = normalized.down.handleColor;
    }
  }
  if (normalized.hover) {
    if (normalized.hover.handleRadius !== undefined && normalized.hover.circleRadius === undefined) {
      normalized.hover.circleRadius = normalized.hover.handleRadius;
    }
    if (normalized.hover.handleColor !== undefined && normalized.hover.circleColor === undefined) {
      normalized.hover.circleColor = normalized.hover.handleColor;
    }
  }
  
  return normalized as ResolvedSliderOptions;
}

/**
 * Draggable slider component for selecting numeric values.
 * Features customizable handle appearance with state-specific styles for hover and pressed states.
 * 
 * @example
 * ```typescript
 * const slider = new Slider({
 *   width: 200,
 *   height: 4,
 *   minValue: 0,
 *   maxValue: 100,
 *   startingValue: 50,
 *   activeColor: 0x4a90d9,
 *   inactiveColor: 0xcccccc,
 *   circleRadius: 8,
 *   circleColor: 0xffffff,
 * });
 * 
 * slider.onChange((value) => console.log('Slider value:', value));
 * stage.addChild(slider);
 * ```
 * 
 * @extends PIXI.Container
 */
class Slider extends PIXI.Container {
  /** Whether the slider handle is currently being dragged */
  isDragging: boolean;
  isHovered: boolean;
  curOutlineWidth: number;
  lastX: number;
  resolvedScale: { x: number; y: number; } | null;
  options: ResolvedSliderOptions;
  currentValue: number;
  backgroundGraphic: PIXI.Graphics;
  circleRadius: number;
  circleGraphic: PIXI.Graphics;
  private circleHandle: PixiElement;

  /**
   * Creates a new Slider instance.
   * @param options - Configuration options for the slider appearance and behavior
   */
  constructor(t: SliderOptions) {
      super();
      this.isDragging = false;
      this.isHovered = false;
      this.curOutlineWidth = 0;
      this.lastX = 0;
      this.resolvedScale = null;
      this.options = normalizeSliderOptions(t);
      this.currentValue = this.options.startingValue;

      this.backgroundGraphic = new PIXI.Graphics();
      super.addChild(this.backgroundGraphic);

      this.circleRadius = this.options.circleRadius;

      this.circleHandle = new PixiElement();
      this.circleGraphic = new PIXI.Graphics();
      this.circleGraphic.drawCircle(0, this.circleRadius, this.circleRadius);
      this.circleHandle.addChild(this.circleGraphic);
      super.addChild(this.circleHandle);

      const e = (this.currentValue - this.options.minValue) / (this.options.maxValue - this.options.minValue);
      this.circleHandle.x = e * this.options.width;

      this.redrawCircle();
      this.redrawBar();

      // Hover state
      this.circleHandle.onMouseOver(() => {
          this.isHovered = true;
          this.redrawCircle();
      });
      this.circleHandle.onMouseOut(() => {
          if (this.isHovered) {
              this.isHovered = false;
              if (!this.isDragging) {
                  this.redrawCircle();
              }
          }
      });

      // Drag — PixiElement's framework handles window-level pointermove cleanup,
      // so we just consume dragstart/dragmove/dragend here.
      let startGlobalX = 0;
      let startCircleX = 0;
      this.circleHandle.onDragStart((event: PIXI.FederatedPointerEvent) => {
          this.resolvedScale = null;
          this.resolveScale();
          this.isDragging = true;
          startGlobalX = (event as any).global?.x ?? event.data?.global?.x ?? 0;
          startCircleX = this.circleHandle.x;
          this.redrawCircle();
      }, 0);
      this.circleHandle.onDragMove((event: PIXI.FederatedPointerEvent) => {
          if (!this.isDragging) return;
          const gx = (event as any).global?.x ?? event.data?.global?.x ?? 0;
          const scale = this.options.preventScaleAdjustment ? 1 : this.resolveScale().x;
          const targetX = startCircleX + (gx - startGlobalX) * scale;
          const next = Math.max(0, Math.min(targetX, this.options.width));
          if (next === this.circleHandle.x) return;
          this.circleHandle.x = next;
          this.currentValue = this.calculateValue();
          this.redrawBar();
          super.emit("slider-change", this.currentValue);
      });
      this.circleHandle.onDragEnd(() => {
          if (this.isDragging) {
              this.resolvedScale = null;
              this.isDragging = false;
              this.redrawCircle();
          }
      });
  }

  resolveScale() {
      if (this.resolvedScale) return this.resolvedScale;

      let t = 1 / this.scale.x, e = 1 / this.scale.y, i = this.parent;

      for (; i;) {
          t /= i.scale.x;
          e /= i.scale.y;
          i = i.parent;
      }

      return this.resolvedScale = { x: t, y: e };
  }

  calculateValue() {
      const { maxValue, minValue, width } = this.options;
      const s = this.circleHandle.x / width;
      return lerp(minValue, maxValue, s);
  }

  redrawCircle() {
    this.circleGraphic.clear();
    let circleOpacity = this.options.circleOpacity || 1;
    if (this.isDragging && this.options.down?.circleOpacity) {
        circleOpacity = this.options.down.circleOpacity;
    } else if (this.isHovered && this.options.hover?.circleOpacity) {
        circleOpacity = this.options.hover.circleOpacity;
    }
    let circleRadius = this.options.circleRadius;
    if (this.isDragging && this.options.down?.circleRadius) {
        circleRadius = this.options.down.circleRadius;
    } else if (this.isHovered && this.options.hover?.circleRadius) {
        circleRadius = this.options.hover.circleRadius;
    }
    let circleColor: Color = this.options.circleColor as Color;
    if (this.isDragging && this.options.down?.circleColor) {
        circleColor = this.options.down.circleColor;
    } else if (this.isHovered && this.options.hover?.circleColor) {
        circleColor = this.options.hover.circleColor;
    }
    let circleOutlineWidth = 0;
    if (this.isDragging && this.options.down?.circleOutlineWidth) {
        circleOutlineWidth = this.options.down.circleOutlineWidth;
    } else if (this.isHovered && this.options.hover?.circleOutlineWidth) {
        circleOutlineWidth = this.options.hover.circleOutlineWidth;
    } else if (this.options.circleOutlineWidth) {
        circleOutlineWidth = this.options.circleOutlineWidth;
    }
    let circleOutlineColor: Color = this.options.circleOutlineColor ?? 0x000000;
    if (this.isDragging && this.options.down?.circleOutlineColor) {
        circleOutlineColor = this.options.down.circleOutlineColor;
    } else if (this.isHovered && this.options.hover?.circleOutlineColor) {
        circleOutlineColor = this.options.hover.circleOutlineColor;
    }
    let circleOutlineOpacity = this.options.circleOutlineOpacity || 1;
    if (this.isDragging && this.options.down?.circleOutlineOpacity) {
        circleOutlineOpacity = this.options.down.circleOutlineOpacity;
    } else if (this.isHovered && this.options.hover?.circleOutlineOpacity) {
        circleOutlineOpacity = this.options.hover.circleOutlineOpacity;
    }

    const fillColor = normalizeColor(circleColor);
    const strokeColor = normalizeColor(circleOutlineColor);
    this.circleGraphic.lineStyle(circleOutlineWidth, strokeColor.value, strokeColor.alpha * circleOutlineOpacity);
    this.circleGraphic.beginFill(fillColor.value, fillColor.alpha * circleOpacity);
    this.circleGraphic.drawCircle(0, circleRadius, circleRadius);
    this.circleGraphic.endFill();

    // position circle to be centered on y axis by the options height
    centerPixiObject(this.circleGraphic, { axis: 'y', parent: { height: this.options.height } });
}

redrawBar() {
    const t = this.circleHandle.x;
    const e = this.options.width - t;
    this.backgroundGraphic.clear();
    const i = this.options.opacity || 1;
    const active = normalizeColor(this.options.activeColor);
    const inactive = normalizeColor(this.options.inactiveColor);
    this.backgroundGraphic.beginFill(active.value, active.alpha * i);
    this.backgroundGraphic.drawRect(0, 0, t, this.options.height);
    this.backgroundGraphic.endFill();
    this.backgroundGraphic.beginFill(inactive.value, inactive.alpha * i);
    this.backgroundGraphic.drawRect(t, 0, e, this.options.height);
    this.backgroundGraphic.endFill();
}
  /**
   * Removes a previously registered change listener.
   * @param callback - The callback function to remove
   */
  offChange(t: (v: number) => void) {
    super.off("slider-change", t);
  }

  /**
   * Registers a callback to be invoked when the slider value changes.
   * @param callback - Function to call with the new slider value
   */
  onChange(t: (v: number) => void) {
    super.on("slider-change", t);
  }
}
function lerp(a: number, b: number, t: number): number {
    return (1 - t) * a + t * b;
}
export { Slider };
export type { SliderOptions };
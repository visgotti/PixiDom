import { centerPixiObject } from "../utils";

type SliderOptions = {
  startingValue: number;
  minValue: number;
  maxValue: number;
  width: number;
  height: number;
  circleRadius: number;
  preventScaleAdjustment?: boolean;
  circleOpacity?: number;
  down?: {
      circleOpacity?: number;
      circleRadius?: number;
      circleColor?: number;
      circleOutlineWidth?: number;
      circleOutlineColor?: number;
      circleOutlineOpacity?: number;
  };
  hover?: {
      circleOpacity?: number;
      circleRadius?: number;
      circleColor?: number;
      circleOutlineWidth?: number;
      circleOutlineColor?: number;
      circleOutlineOpacity?: number;
  };
  activeColor: number;
  inactiveColor: number;
  opacity?: number;
  circleColor?: number;
  circleOutlineWidth?: number;
  circleOutlineColor?: number;
  circleOutlineOpacity?: number;
}

class Slider extends PIXI.Container {
  isDragging: boolean;
  isHovered: boolean;
  curOutlineWidth: number;
  lastX: number;
  resolvedScale: { x: number; y: number; } | null;
  options: SliderOptions;
  currentValue: number;
  backgroundGraphic: PIXI.Graphics;
  circleRadius: number;
  circleGraphic: PIXI.Graphics;

  constructor(t: SliderOptions) { // You need to define the type of 't'
      super();
      this.isDragging = false;
      this.isHovered = false;
      this.curOutlineWidth = 0;
      this.lastX = 0;
      this.resolvedScale = null;
      this.options = t;
      this.currentValue = this.options.startingValue;

      this.backgroundGraphic = new PIXI.Graphics();
      super.addChild(this.backgroundGraphic);

      this.circleRadius = this.options.circleRadius;

      this.circleGraphic = new PIXI.Graphics();
      this.circleGraphic.drawCircle(0, this.circleRadius, this.circleRadius);
      this.circleGraphic.y = 0;
      this.circleGraphic.buttonMode = true;
      super.addChild(this.circleGraphic);
      this.circleGraphic.interactive = true;
      console.log(this.options.maxValue - this.options.minValue);


      const e = (this.currentValue - this.options.minValue) / (this.options.maxValue - this.options.minValue);
      this.circleGraphic.x = e * this.options.width;

      this.redrawCircle();
      this.redrawBar();

      this.circleGraphic.on("pointerover", t => {
          this.isHovered = true;
          this.redrawCircle();
      });

      this.circleGraphic.on("pointerout", () => {
          if (this.isHovered) {
              this.isHovered = false;
              if (!this.isDragging) {
                  this.redrawCircle();
              }
          }
      });

      this.circleGraphic.on("pointerdown", t => {
          this.resolvedScale = null;
          this.resolveScale();
          this.isDragging = true;
          this.lastX = t.data.global.x;
          this.redrawCircle();
      });

      this.circleGraphic.on("pointercancel", () => {
          if (this.isDragging) {
              this.resolvedScale = null;
              this.isDragging = false;
              this.redrawCircle();
          }
      });

      this.circleGraphic.on("pointerup", () => {
          if (this.isDragging) {
              this.resolvedScale = null;
              this.isDragging = false;
              this.redrawCircle();
          }
      });

      this.circleGraphic.on("pointerupoutside", () => {
          if (this.isDragging) {
              this.resolvedScale = null;
              this.isDragging = false;
              this.redrawCircle();
          }
      });

      this.circleGraphic.on("pointermove", t => {
          if (!this.isDragging) return;

          let e = t.data.global.x - this.lastX;
          const i = this.options.preventScaleAdjustment ? 1 : this.resolveScale().x;

          e *= i;

          if ((e < 0 && t.data.global.x * i < this.x && this.circleGraphic.x === 0) || (e > 0 && t.data.global.x * i > this.options.width && this.circleGraphic.x === this.options.width)) return;

          this.lastX = t.data.global.x;

          const r = this.circleGraphic.x;
          this.circleGraphic.x += e;
          this.circleGraphic.x = Math.max(0, Math.min(this.circleGraphic.x, this.options.width));

          if (this.circleGraphic.x - r) {
              this.currentValue = this.calculateValue();
              this.redrawBar();
              super.emit("slider-change", this.currentValue);
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
      const s = this.circleGraphic.x / width;
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
    let circleColor = this.options.circleColor;
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
    let circleOutlineColor = this.options.circleOutlineColor || 0x000000;
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

    this.circleGraphic.lineStyle(circleOutlineWidth, circleOutlineColor, circleOutlineOpacity);
    this.circleGraphic.beginFill(circleColor, circleOpacity);
    this.circleGraphic.drawCircle(0, circleRadius, circleRadius);
    this.circleGraphic.endFill();

    // position circle to be centered on y axis by the options height
    centerPixiObject(this.circleGraphic, { axis: 'y', parent: { height: this.options.height } });
}

redrawBar() {
    const t = this.circleGraphic.x;
    const e = this.options.width - t;
    this.backgroundGraphic.clear();
    const i = this.options.opacity || 1;
    this.backgroundGraphic.beginFill(this.options.activeColor, i);
    this.backgroundGraphic.drawRect(0, 0, t, this.options.height);
    this.backgroundGraphic.endFill();
    this.backgroundGraphic.beginFill(this.options.inactiveColor, i);
    this.backgroundGraphic.drawRect(t, 0, e, this.options.height);
    this.backgroundGraphic.endFill();
}
  offChange(t: (v: number) => void) {
    super.off("slider-change", t);
  }

  onChange(t: (v: number) => void) {
    super.on("slider-change", t);
  }
}
function lerp(a: number, b: number, t: number): number {
    return (1 - t) * a + t * b;
}
export { Slider, SliderOptions };
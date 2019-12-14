import color = Mocha.reporters.Base.color;
import { string2hex } from "../utils";

const ColorTween = require('gotti-color-tween/dist/color-tween.js');
const circlePadding = 2;

import { ToggleOptions, AnimationType, OutlineOptions, LabelOptions, AnimationOptions, ToggleAnimationExclusions } from "../types";

export class Toggle extends PIXI.Container {
    private _toggled: boolean = true;
    private backgroundGraphic: PIXI.Graphics;
    private circleGraphic: PIXI.Graphics;
    private options: ToggleOptions;
    private circleRadius: number;
    private computedBorderRadius: number;

    private onText: PIXI.extras.BitmapText;
    private offText: PIXI.extras.BitmapText;
    private usingLabels: boolean = false;
    private updateToggle: Function;

    private _activeBackgroundColor;
    private _inactiveBackgroundColor;
    private _activeCircleColor;
    private _inactiveCircleColor;
    private _travelToX;

    private tween: any;

    private backgroundColorsArrayIndex: number = null;
    private circleColorsArrayIndex: number = null;

    private toggleCircleTravelDistance: number = 0;

    constructor(options: ToggleOptions, isToggled?: boolean) {
        super();
        this.options = options;
        this.backgroundGraphic = new PIXI.Graphics();
        const borderRadius = options.borderRadius ? options.borderRadius : 50;
        options.borderRadius = borderRadius;
        this.computedBorderRadius = (options.borderRadius / 100) * options.height;

        this.backgroundGraphic.drawRoundedRect(0, 0, options.width, options.height, this.computedBorderRadius);
        this.addChild(this.backgroundGraphic);

        if(options.labelOptions) {
            const { fontName, onLabel, offLabel, onColor, offColor } = options.labelOptions;
            this.onText = new PIXI.extras.BitmapText(onLabel, { font: fontName, align: "left" });
            this.offText = new PIXI.extras.BitmapText(offLabel, { font: fontName, align: "left" });
            this.addChild(this.onText);
            this.addChild(this.offText);

            this.onText.visible = false;
            this.offText.visible = false;

            const offXDiff = (options.width / 2) - this.offText.width;
            if(offXDiff < 0) {throw new Error('Label for off text was too long')}
            this.offText.x = ((options.width / 2)  + offXDiff / 2) - circlePadding;
            this.offText.tint = offColor;

            const offYDiff = options.height - this.offText.height;
            if(offYDiff < 0) { throw new Error('Label font is too large to fit within height of toggle, either increase height or use smaller font')};
            this.offText.y = offYDiff / 2;

            const onXDiff = (options.width / 2) - this.onText.width;
            if(onXDiff < 0) {throw new Error('Label for on text was too long')}
            this.onText.x = circlePadding + onXDiff / 2;
            this.onText.tint = onColor;

            const onYDiff = options.height - this.onText.height;
            if(onYDiff < 0) { throw new Error('Label font is too large to fit within height of toggle, either increase height or use smaller font')};
            this.onText.y = offYDiff / 2;
            this.usingLabels = true;
        }

        this.circleRadius = (this.options.height / 2) - circlePadding;
        this.circleGraphic = new PIXI.Graphics();
        this.circleGraphic.drawCircle(0, 0, this.circleRadius);

        this.circleGraphic.y = circlePadding;

        this.addChild(this.circleGraphic);

        this.toggleCircleTravelDistance = Math.abs((circlePadding) -  (this.options.width - this.circleGraphic.width - circlePadding));

        this.interactive = true;
        this.buttonMode = true;
        this.on('pointerdown', () => {
            this.toggled = !this.toggled;
        });
        this.updateToggle = this.staticToggleUpdate.bind(this);
        this.toggled = !!isToggled;
        this.updateToggle = options.animationOptions ? this.animatedToggleUpdate.bind(this) : this.staticToggleUpdate.bind(this);
    }

    get activeBackgroundColor() {
        return this.toggled ? this.options.onBackgroundColor : this.options.offBackgroundColor;
    }

    get inactiveBackgroundColor() {
        return this.toggled ? this.options.offBackgroundColor : this.options.onBackgroundColor;
    }

    get activeCircleColor() {
        return this.toggled ? this.options.onCircleColor : this.options.offCircleColor;
    }

    get inactiveCircleColor() {
        return this.toggled ? this.options.offCircleColor : this.options.onCircleColor;
    }

    get activeTextLabel() {
        return this.toggled ? this.onText : this.offText;
    }

    get inactiveTextLabel() {
        return this.toggled ? this.offText : this.onText;
    }

    get travelToX() {
        return this.toggled ? circlePadding : this.options.width - this.circleGraphic.width - circlePadding;
    }

    set toggled(val) {
        this.emit('toggle-change', val);
        this._toggled = val;

        this.updateToggle();

        //TODO: tween colors in interval with a delta
    }

    get toggled() {
        return this._toggled;
    }

    public onToggle(callback) {
        this.on('toggle-change', callback);
    }

    private animateToggle(delta) {
        if(this.tween.update()) {
            requestAnimationFrame(this.animateToggle.bind(this));
        }
    }

    private midAnimationToggleUpdate(colors, progress) {
        const traveledDistance = this.toggleCircleTravelDistance * progress;
        const { exclude } = this.options.animationOptions;

        if(this.usingLabels && (!exclude || !exclude.includes(ToggleAnimationExclusions.label))) {
            this.activeTextLabel.visible = true;
            this.inactiveTextLabel.visible = true;
            this.inactiveTextLabel.alpha = 1 - progress;
            this.activeTextLabel.alpha = progress;
        }

        if (this.backgroundColorsArrayIndex !== null) {
            this.backgroundGraphic.clear();
            if (this.options.hasOwnProperty('backgroundOutline')) {
                const {width, color} = this.options.backgroundOutline;
                this.backgroundGraphic.lineStyle(width, color);
            }
            this.backgroundGraphic.beginFill(string2hex(colors[this.backgroundColorsArrayIndex].hex()));
            this.backgroundGraphic.drawRoundedRect(0, 0, this.options.width, this.options.height, this.computedBorderRadius);
            this.backgroundGraphic.endFill();
        }

        if (!exclude || !exclude.includes(ToggleAnimationExclusions.circle_position)) {
            if (this.toggled) {
                this.circleGraphic.x = this.travelToX + traveledDistance;
            } else {
                this.circleGraphic.x = this.travelToX - traveledDistance;
            }
        };

        if (this.circleColorsArrayIndex !== null) {
            this.circleGraphic.clear();
            this.circleGraphic.beginFill(string2hex(colors[this.circleColorsArrayIndex].hex()));
            this.circleGraphic.drawCircle(this.circleRadius, this.circleRadius, this.circleRadius);
            this.circleGraphic.endFill();
        };
    }

    private animatedToggleUpdate() {
        const activeColorsArray = [];
        const inactiveColorsArray = [];
        const { exclude } = this.options.animationOptions;

        if(!exclude || !exclude.includes(ToggleAnimationExclusions.background)) {
            activeColorsArray.push(PIXI.utils.hex2string(this.activeBackgroundColor));
            inactiveColorsArray.push(PIXI.utils.hex2string(this.inactiveBackgroundColor));
            this.backgroundColorsArrayIndex = 0;
        }
        if(!exclude || !exclude.includes(ToggleAnimationExclusions.circle_color)) {
            activeColorsArray.push(PIXI.utils.hex2string(this.activeCircleColor));
            inactiveColorsArray.push(PIXI.utils.hex2string(this.inactiveCircleColor));
            this.circleColorsArrayIndex = activeColorsArray.length - 1;
        }
        this.tween = new ColorTween(inactiveColorsArray, activeColorsArray)
            .duration(this.options.animationOptions.duration)
            .easing(this.options.animationOptions.type)
            .onUpdate(this.midAnimationToggleUpdate.bind(this))
            .onEnd(this.staticToggleUpdate.bind(this))
            .start(this.animateToggle.bind(this));
    }

    private staticToggleUpdate() {
        this.backgroundGraphic.clear();
        if(this.options.hasOwnProperty('backgroundOutline')) {
            const { width, color } = this.options.backgroundOutline;
            this.backgroundGraphic.lineStyle(width, color);
        }
        // when its to the right were toggled/on so use options/width to calculate for now\
        let xPosition;
        let circleColor;
        let backgroundColor;

        if(this._toggled) {
            backgroundColor = this.options.onBackgroundColor;
            xPosition = this.options.width - this.circleGraphic.width - circlePadding;
            circleColor =  this.options.onCircleColor;
            this._showOnText();
        } else {
            backgroundColor =  this.options.offBackgroundColor;
            xPosition =  0 + circlePadding;
            circleColor = this.options.offCircleColor;
            this._showOffText();
        }

        this.backgroundGraphic.beginFill(backgroundColor);
        this.backgroundGraphic.drawRoundedRect(0, 0, this.options.width, this.options.height, this.computedBorderRadius);
        this.backgroundGraphic.endFill();

        this.circleGraphic.clear();
        this.circleGraphic.beginFill(circleColor);
        this.circleGraphic.drawCircle(this.circleRadius, this.circleRadius, this.circleRadius);
        this.circleGraphic.endFill();
        this.circleGraphic.x = xPosition;
    }

    private _showOnText() {
        if(this.usingLabels) {
            this.onText.visible = true;
            this.offText.visible = false;
        }
    }

    private _showOffText() {
        if(this.usingLabels) {
            this.onText.visible = false;
            this.offText.visible = true;
        }
    }
}
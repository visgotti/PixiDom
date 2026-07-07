import { string2hex } from "../utils";
import { normalizeColor, colorToInt, type NormalizedColor } from "../color";
import ColorTween from '../ColorTween';
import { ToggleOptions, ToggleAnimationExclusions } from "../types";
import { BitmapTextLike, createBitmapText, setBitmapTextTint } from "../pixi-adapter-utils";

const circlePadding = 2;

type ResolvedToggleColors = {
    onBackground: NormalizedColor,
    offBackground: NormalizedColor,
    onCircle: NormalizedColor,
    offCircle: NormalizedColor,
    outline: NormalizedColor | null,
};

interface TweenLike {
    update(): boolean;
}

/**
 * Animated toggle switch component with customizable colors and optional labels.
 * Supports smooth color transitions between on/off states.
 * 
 * @example
 * ```typescript
 * const toggle = new Toggle({
 *   width: 60,
 *   height: 30,
 *   borderRadius: 50,
 *   onBackgroundColor: 0x4cd964,
 *   offBackgroundColor: 0xe5e5e5,
 *   onCircleColor: 0xffffff,
 *   offCircleColor: 0xffffff,
 *   animationOptions: {
 *     type: AnimationType.LINEAR,
 *     duration: 200,
 *   },
 * }, true);
 * 
 * toggle.onToggle((isOn) => console.log('Toggle state:', isOn));
 * stage.addChild(toggle);
 * ```
 * 
 * @extends PIXI.Container
 */
export class Toggle extends PIXI.Container {
    private _toggled: boolean = true;
    private backgroundGraphic: PIXI.Graphics;
    private circleGraphic: PIXI.Graphics;
    private options: ToggleOptions;
    private circleRadius: number = 0;
    private circleDiameter: number = 0;
    private computedBorderRadius: number = 0;

    private onText: BitmapTextLike | null = null;
    private offText: BitmapTextLike | null = null;
    private usingLabels: boolean = false;
    private updateToggle: () => void;

    private tween: TweenLike | null = null;

    private backgroundColorsArrayIndex: number | null = null;
    private circleColorsArrayIndex: number | null = null;

    private toggleCircleTravelDistance: number = 0;
    private resolvedColors: ResolvedToggleColors;

    /**
     * Creates a new Toggle instance.
     * @param options - Configuration options for the toggle appearance and behavior
     * @param isToggled - Initial toggle state (default: false). Prefer using options.startingValue instead.
     */
    constructor(options: ToggleOptions, isToggled?: boolean) {
        super();
        this.options = options;
        // Resolve all color inputs (hex string, hex int, rgb object, rgb tuple) to a uniform shape.
        this.resolvedColors = {
            onBackground: normalizeColor(options.onBackgroundColor),
            offBackground: normalizeColor(options.offBackgroundColor),
            onCircle: normalizeColor(options.onCircleColor ?? options.onToggleColor as any),
            offCircle: normalizeColor(options.offCircleColor ?? options.offToggleColor as any),
            outline: options.backgroundOutline
                ? normalizeColor(options.backgroundOutline.color)
                : null,
        };
        // Support startingValue in options (preferred) or legacy isToggled parameter
        const initialState = options.startingValue ?? isToggled ?? false;
        this.backgroundGraphic = new PIXI.Graphics();
        const borderRadius = options.borderRadius ? options.borderRadius : 50;
        options.borderRadius = borderRadius;
        this.computedBorderRadius = (options.borderRadius / 100) * options.height;

        this.backgroundGraphic.drawRoundedRect(0, 0, options.width, options.height, this.computedBorderRadius);
        this.addChild(this.backgroundGraphic);

        if(options.labelOptions) {
            const { fontName, onLabel, offLabel, onColor, offColor } = options.labelOptions;
            this.onText = createBitmapText(onLabel, { font: fontName, align: "left" });
            this.offText = createBitmapText(offLabel, { font: fontName, align: "left" });
            this.addChild(this.onText);
            this.addChild(this.offText);

            this.onText.visible = false;
            this.offText.visible = false;

            const offXDiff = (options.width / 2) - this.offText.width;
            if(offXDiff < 0) {throw new Error('Label for off text was too long')}
            this.offText.x = ((options.width / 2)  + offXDiff / 2) - circlePadding;
            setBitmapTextTint(this.offText, colorToInt(offColor));

            const offYDiff = options.height - this.offText.height;
            if(offYDiff < 0) { throw new Error('Label font is too large to fit within height of toggle, either increase height or use smaller font')};
            this.offText.y = offYDiff / 2;

            const onXDiff = (options.width / 2) - this.onText.width;
            if(onXDiff < 0) {throw new Error('Label for on text was too long')}
            this.onText.x = circlePadding + onXDiff / 2;
            setBitmapTextTint(this.onText, colorToInt(onColor));

            const onYDiff = options.height - this.onText.height;
            if(onYDiff < 0) { throw new Error('Label font is too large to fit within height of toggle, either increase height or use smaller font')};
            this.onText.y = offYDiff / 2;
            this.usingLabels = true;
        }

    this.circleRadius = (this.options.height / 2) - circlePadding;
    this.circleDiameter = this.circleRadius * 2;
    this.circleGraphic = new PIXI.Graphics();
    this.circleGraphic.y = circlePadding;

        this.addChild(this.circleGraphic);

        this.toggleCircleTravelDistance = Math.abs(this.getCircleCenter(false) - this.getCircleCenter(true));

        this.interactive = true;
        this.buttonMode = true;
        this.on('pointerdown', () => {
            this.toggled = !this.toggled;
        });
        // Use static update for initial state (no animation)
        this.updateToggle = this.staticToggleUpdate.bind(this);
        this._toggled = initialState;
        this.updateToggle();
        // Now enable animated updates if configured
        this.updateToggle = options.animationOptions ? this.animatedToggleUpdate.bind(this) : this.staticToggleUpdate.bind(this);
    }

    get activeBackgroundColor(): number {
        return this.toggled ? this.resolvedColors.onBackground.value : this.resolvedColors.offBackground.value;
    }

    get inactiveBackgroundColor(): number {
        return this.toggled ? this.resolvedColors.offBackground.value : this.resolvedColors.onBackground.value;
    }

    get activeCircleColor(): number {
        return this.toggled ? this.resolvedColors.onCircle.value : this.resolvedColors.offCircle.value;
    }

    get inactiveCircleColor(): number {
        return this.toggled ? this.resolvedColors.offCircle.value : this.resolvedColors.onCircle.value;
    }

    get activeTextLabel() {
        return this.toggled ? this.onText : this.offText;
    }

    get inactiveTextLabel() {
        return this.toggled ? this.offText : this.onText;
    }

    get travelToX() {
        return this.toggled ? this.getCircleCenter(false) : this.getCircleCenter(true);
    }

    set toggled(val) {
        this.emit('toggle-change', val);
        this._toggled = val;

        this.updateToggle();

        //TODO: tween colors in interval with a delta
    }

    /** Gets the current toggle state */
    get toggled() {
        return this._toggled;
    }

    /**
     * Registers a callback to be invoked when the toggle state changes.
     * @param callback - Function to call with the new toggle state (boolean)
     */
    public onToggle(callback: (toggled: boolean) => void) {
        this.on('toggle-change', callback);
    }

    private animateToggle() {
        if(this.tween && this.tween.update()) {
            requestAnimationFrame(() => this.animateToggle());
        }
    }

    private midAnimationToggleUpdate(colors: Array<{ hex(): string }>, progress: number) {
        const animationOptions = this.options.animationOptions;
        if (!animationOptions) return;
        const exclude = animationOptions.exclude;
        const traveledDistance = this.toggleCircleTravelDistance * progress;

        if(this.usingLabels && this.activeTextLabel && this.inactiveTextLabel && (!exclude || !exclude.includes(ToggleAnimationExclusions.label))) {
            this.activeTextLabel.visible = true;
            this.inactiveTextLabel.visible = true;
            this.inactiveTextLabel.alpha = 1 - progress;
            this.activeTextLabel.alpha = progress;
        }

        if (this.backgroundColorsArrayIndex !== null) {
            this.backgroundGraphic.clear();
            const outline = this.options.backgroundOutline;
            const outlineColor = this.resolvedColors.outline;
            if (outline && outlineColor) {
                this.backgroundGraphic.lineStyle(outline.width, outlineColor.value, outlineColor.alpha);
            }
            const bgEntry = colors[this.backgroundColorsArrayIndex];
            if (bgEntry) {
                this.backgroundGraphic.beginFill(string2hex(bgEntry.hex()));
                this.backgroundGraphic.drawRoundedRect(0, 0, this.options.width, this.options.height, this.computedBorderRadius);
                this.backgroundGraphic.endFill();
            }
        }

        if (!exclude || !exclude.includes(ToggleAnimationExclusions.circle_position)) {
            if (this.toggled) {
                this.circleGraphic.x = this.travelToX + traveledDistance;
            } else {
                this.circleGraphic.x = this.travelToX - traveledDistance;
            }
        }

        if (this.circleColorsArrayIndex !== null) {
            const circleEntry = colors[this.circleColorsArrayIndex];
            if (circleEntry) {
                this.setCircleColor(string2hex(circleEntry.hex()));
            }
        }
    }

    private animatedToggleUpdate() {
        const animationOptions = this.options.animationOptions;
        if (!animationOptions) {
            this.staticToggleUpdate();
            return;
        }
        const exclude = animationOptions.exclude;
        const activeColorsArray: string[] = [];
        const inactiveColorsArray: string[] = [];

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
            .duration(animationOptions.duration)
            .easing(animationOptions.type)
            .onUpdate(this.midAnimationToggleUpdate.bind(this))
            .onEnd(this.staticToggleUpdate.bind(this))
            .start(() => this.animateToggle()) as unknown as TweenLike;
    }

    private staticToggleUpdate() {
        this.backgroundGraphic.clear();
        const outline = this.options.backgroundOutline;
        const outlineColor = this.resolvedColors.outline;
        if(outline && outlineColor) {
            this.backgroundGraphic.lineStyle(outline.width, outlineColor.value, outlineColor.alpha);
        }
        // when its to the right were toggled/on so use options/width to calculate for now\
        let xPosition;
        let circleColor: NormalizedColor;
        let backgroundColor: NormalizedColor;

        if(this._toggled) {
            backgroundColor = this.resolvedColors.onBackground;
            xPosition = this.options.width - this.circleDiameter - circlePadding;
            circleColor = this.resolvedColors.onCircle;
            this._showOnText();
        } else {
            backgroundColor = this.resolvedColors.offBackground;
            xPosition =  circlePadding;
            circleColor = this.resolvedColors.offCircle;
            this._showOffText();
        }

        this.backgroundGraphic.beginFill(backgroundColor.value, backgroundColor.alpha);
        this.backgroundGraphic.drawRoundedRect(0, 0, this.options.width, this.options.height, this.computedBorderRadius);
        this.backgroundGraphic.endFill();

        this.setCircleColor(circleColor.value, circleColor.alpha);
        this.circleGraphic.x = xPosition;
    }

    private setCircleColor(color: number, alpha: number = 1) {
        this.circleGraphic.clear();
        this.circleGraphic.beginFill(color, alpha);
        this.circleGraphic.drawCircle(this.circleRadius, this.circleRadius, this.circleRadius);
        this.circleGraphic.endFill();
    }

    private getCircleCenter(isRight: boolean) {
        return isRight
            ? this.options.width - circlePadding - this.circleDiameter
            : circlePadding;
    }

    private _showOnText() {
        if(this.usingLabels && this.onText && this.offText) {
            this.onText.visible = true;
            this.offText.visible = false;
        }
    }

    private _showOffText() {
        if(this.usingLabels && this.onText && this.offText) {
            this.onText.visible = false;
            this.offText.visible = true;
        }
    }
}
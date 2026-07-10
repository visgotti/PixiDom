import { PixiElement } from "../Element";
import { BitmapTextLike, createBitmapText, setBitmapTextTint } from "../pixi-adapter-utils";
import { normalizeColor, type Color } from "../color";

/**
 * Style options for a specific button state (default, hover, or pressed).
 */
export interface ButtonStyleStateOptions {
    /** Width of the button in pixels */
    width?: number,
    /** Height of the button in pixels */
    height?: number,
    /** Text color. Accepts any {@link Color} format. */
    textColor?: Color,
    /** Optional texture for the button background */
    backgroundTexture?: PIXI.Texture,
    /** Background opacity (0-1) */
    backgroundOpacity?: number,
    /** Background color. Accepts any {@link Color} format. */
    backgroundColor?: Color,
    /** Border color. Accepts any {@link Color} format. */
    borderColor?: Color,
    /** Border width in pixels */
    borderWidth?: number,
    /** Border opacity (0-1) */
    borderOpacity?: number,
    /** Border radius as a percentage (0-100) */
    borderRadius?: number,
}

/**
 * Configuration options for creating a Button component.
 */
export interface ButtonStyleOptions {
    /** Whether to use BitmapText (true) or regular Text (false) for the label */
    useBitmapText: boolean,
    /** Font size in pixels (only applies when useBitmapText is false) */
    fontSize?: number,
    /** Style options for the default/idle state */
    defaultStyle: ButtonStyleStateOptions,
    /** Style options for the hover state */
    hoverStyle?: ButtonStyleStateOptions,
    /** Style options for the pressed/active state */
    pressedStyle?: ButtonStyleStateOptions,
    /** Font name to use (bitmap font name or font family) */
    font: string,
}

type ResolvedStyleState = Required<Pick<ButtonStyleStateOptions, 'width' | 'height'>> & ButtonStyleStateOptions;

/**
 * Internal enum representing button states.
 * @internal
 */
enum BtnState {
    NONE,
    HOVER,
    PRESSED,
}

/**
 * Interactive button component with customizable appearance for different states.
 * Supports bitmap fonts and regular text, backgrounds with colors or textures,
 * and automatic state management for hover and pressed interactions.
 * 
 * @example
 * ```typescript
 * const button = new Button('Click Me', {
 *   font: 'myFont',
 *   useBitmapText: true,
 *   defaultStyle: {
 *     width: 120,
 *     height: 40,
 *     backgroundColor: 0x4a90d9,
 *     textColor: 0xffffff,
 *   },
 *   hoverStyle: {
 *     width: 120,
 *     height: 40,
 *     backgroundColor: 0x357abd,
 *     textColor: 0xffffff,
 *   },
 * });
 * 
 * button.onClick(() => console.log('Button clicked!'));
 * stage.addChild(button);
 * ```
 * 
 * @extends PixiElement
 */
export class Button extends PixiElement {
    private _text: string;
    private bitmapTxtSprite: BitmapTextLike | null = null;
    private txtSprite: PIXI.Text | null = null;
    private bgGraphic: PIXI.Graphics | null = null;
    private bgSprite: PIXI.Sprite | null = null;
    private styleOptions: ButtonStyleOptions = { defaultStyle: {}, font: '', useBitmapText: true };
    private _btnState: BtnState = BtnState.NONE;

    /**
     * Creates a new Button instance.
     * @param text - The label text to display on the button
     * @param styleOptions - Configuration options for button appearance
     */
    constructor(text: string, styleOptions: ButtonStyleOptions) {
        super();
        this._text = text;
        this.interactive = true;
        this.buttonMode = true;
        this.on('pointerdown', () => this.btnState = BtnState.PRESSED);
        this.on('pointerup', () => this.btnState = BtnState.NONE);
        this.on('pointerupoutside', () => this.btnState = BtnState.NONE);
        this.on('pointerover', () => this.btnState = BtnState.HOVER);
        this.on('pointerout', () => this.btnState = BtnState.NONE);
        this.updateStyle(styleOptions);
    }

    set btnState(newState: BtnState) {
        if(newState !== this._btnState) {
            this._btnState = newState;
            this.redraw();
        }
    }

    /**
     * Sets the button label text.
     * @param value - New text to display
     */
    set text(value: string) {
        this._text = value;
        this.redrawText();
    }

    /**
     * Updates the button's style options and triggers a redraw.
     * @param styleOptions - New style configuration to apply
     */
    public updateStyle(styleOptions: ButtonStyleOptions) {
        const needsFullClear = this.styleOptions.useBitmapText !== styleOptions.useBitmapText;
        this.styleOptions = { ...this.styleOptions, ...styleOptions };
        this.styleOptions.useBitmapText = this.styleOptions.useBitmapText ?? false;
        if(needsFullClear) {
            this.clear();
        }
        this.redraw();
    }

    /**
     * Forces a complete redraw of the button including background and text.
     */
    public redraw() {
        this.redrawBg();
        this.redrawText();
    }

    /**
     * Redraws just the text portion of the button.
     */
    public redrawText() {
        const styleState = this.currentStyleState;
        let sprite: BitmapTextLike | PIXI.Text;
        if(this.styleOptions.useBitmapText) {
            if(!this.bitmapTxtSprite) {
                this.bitmapTxtSprite = createBitmapText('', {font: this.styleOptions.font, align: 'center'});
            }
            if(this.txtSprite) {
                this.txtSprite.destroy();
                this.txtSprite = null;
            }
            this.bitmapTxtSprite.maxWidth = this.width;
            sprite = this.bitmapTxtSprite;
        } else {
            if(!this.txtSprite) {
                this.txtSprite = new PIXI.Text('', {fontFamily: this.styleOptions.font, align: 'center'});
            }
            if(this.styleOptions.fontSize) {
                this.txtSprite.style.fontSize = this.styleOptions.fontSize;
            }
            if(this.bitmapTxtSprite) {
                this.bitmapTxtSprite.destroy({ children: true });
                this.bitmapTxtSprite = null;
            }
            sprite = this.txtSprite;
        }
        if(styleState.textColor !== undefined && styleState.textColor !== null) {
            const txt = normalizeColor(styleState.textColor);
            if(this.bitmapTxtSprite && this.styleOptions.useBitmapText) {
                setBitmapTextTint(this.bitmapTxtSprite, txt.value);
            } else if(this.txtSprite) {
                this.txtSprite.style.fill = txt.value;
            }
        }
        if(!sprite.parent) {
            this.addChild(sprite);
        }
        sprite.text = this._text;

        // Center text using anchor for regular Text, manual positioning for BitmapText
        if(this.styleOptions.useBitmapText) {
            sprite.x = styleState.width / 2 - sprite.width / 2;
            sprite.y = styleState.height / 2 - sprite.height / 2;
        } else if (this.txtSprite) {
            this.txtSprite.anchor.set(0.5);
            sprite.x = styleState.width / 2;
            sprite.y = styleState.height / 2;
        }
    }

    get textSpriteUtilized() {
        if(this.styleOptions.useBitmapText) return this.bitmapTxtSprite;
        return this.txtSprite;
    }

    public redrawBg() {
        const styleState = this.currentStyleState;
        const { backgroundColor, borderRadius, borderColor, borderWidth, width, height, backgroundTexture } = styleState;
        const backgroundOpacity = typeof styleState.backgroundOpacity === 'number' ? styleState.backgroundOpacity : 1;
        const borderOpacity = typeof styleState.borderOpacity === 'number' ? styleState.borderOpacity : 1;

        if(backgroundColor !== undefined && backgroundColor !== null) {
            if(!this.bgGraphic) {
                this.bgGraphic = new PIXI.Graphics();
            } else {
                this.bgGraphic.clear();
            }
            if(!this.bgGraphic.parent) {
                this.addChild(this.bgGraphic);
            }
            const bg = normalizeColor(backgroundColor);
            this.bgGraphic.beginFill(bg.value, bg.alpha * backgroundOpacity);
            if(borderWidth) {
                const border = borderColor !== undefined && borderColor !== null ? normalizeColor(borderColor) : null;
                this.bgGraphic.lineStyle(borderWidth, border?.value ?? 0, (border?.alpha ?? 1) * borderOpacity);
            }

            if(borderRadius) {
                const computedBorderRadius = borderRadius / 100 * height;
                this.bgGraphic.drawRoundedRect(0, 0, width, height, computedBorderRadius);
            } else {
                this.bgGraphic.drawRect(0, 0, width, height);
            }
            this.bgGraphic.endFill();
        }

        if(backgroundTexture) {
            if(!this.bgSprite) {
                this.bgSprite = new PIXI.Sprite();
            }
            if(!this.bgSprite.parent) {
                this.addChild(this.bgSprite);
            }
            this.bgSprite.texture = backgroundTexture;
            this.bgSprite.x = width / 2 - this.bgSprite.width / 2;
            this.bgSprite.y = height / 2 - this.bgSprite.height / 2;
        }
        this.hitArea = new PIXI.Rectangle(0, 0, width, height);
    }

    private clear() {
        const utilized = this.textSpriteUtilized;
        if(utilized) {
            this.removeChild(utilized);
            utilized.destroy({ children: true });
            this.bitmapTxtSprite = null;
            this.txtSprite = null;
        }
        if(this.bgGraphic) {
            this.removeChild(this.bgGraphic);
            this.bgGraphic.destroy();
            this.bgGraphic = null;
        }
        if(this.bgSprite) {
            this.removeChild(this.bgSprite);
            this.bgSprite.destroy();
            this.bgSprite = null;
        }
    }

    get currentStyleState(): ResolvedStyleState {
        const defaultStyle = this.styleOptions.defaultStyle;
        let merged: ButtonStyleStateOptions;
        switch(this._btnState) {
            case BtnState.HOVER:
                merged = this.styleOptions.hoverStyle ? { ...defaultStyle, ...this.styleOptions.hoverStyle } : defaultStyle;
                break;
            case BtnState.PRESSED:
                merged = this.styleOptions.pressedStyle
                    ? { ...defaultStyle, ...this.styleOptions.pressedStyle }
                    : (this.styleOptions.hoverStyle ? { ...defaultStyle, ...this.styleOptions.hoverStyle } : defaultStyle);
                break;
            case BtnState.NONE:
            default:
                merged = defaultStyle;
                break;
        }
        return {
            ...merged,
            width: merged.width ?? 0,
            height: merged.height ?? 0,
        };
    }
}
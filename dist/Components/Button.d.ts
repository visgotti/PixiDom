import { PixiElement } from '../Element';
import { BitmapTextLike } from '../pixi-adapter-utils';
import { Color } from '../color';
/**
 * Style options for a specific button state (default, hover, or pressed).
 */
export interface ButtonStyleStateOptions {
    /** Width of the button in pixels */
    width?: number;
    /** Height of the button in pixels */
    height?: number;
    /** Text color. Accepts any {@link Color} format. */
    textColor?: Color;
    /** Optional texture for the button background */
    backgroundTexture?: PIXI.Texture;
    /** Background opacity (0-1) */
    backgroundOpacity?: number;
    /** Background color. Accepts any {@link Color} format. */
    backgroundColor?: Color;
    /** Border color. Accepts any {@link Color} format. */
    borderColor?: Color;
    /** Border width in pixels */
    borderWidth?: number;
    /** Border opacity (0-1) */
    borderOpacity?: number;
    /** Border radius as a percentage (0-100) */
    borderRadius?: number;
}
/**
 * Configuration options for creating a Button component.
 */
export interface ButtonStyleOptions {
    /** Whether to use BitmapText (true) or regular Text (false) for the label */
    useBitmapText: boolean;
    /** Font size in pixels (only applies when useBitmapText is false) */
    fontSize?: number;
    /** Style options for the default/idle state */
    defaultStyle: ButtonStyleStateOptions;
    /** Style options for the hover state */
    hoverStyle?: ButtonStyleStateOptions;
    /** Style options for the pressed/active state */
    pressedStyle?: ButtonStyleStateOptions;
    /** Font name to use (bitmap font name or font family) */
    font: string;
}
type ResolvedStyleState = Required<Pick<ButtonStyleStateOptions, 'width' | 'height'>> & ButtonStyleStateOptions;
/**
 * Internal enum representing button states.
 * @internal
 */
declare enum BtnState {
    NONE = 0,
    HOVER = 1,
    PRESSED = 2
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
export declare class Button extends PixiElement {
    private _text;
    private bitmapTxtSprite;
    private txtSprite;
    private bgGraphic;
    private bgSprite;
    private styleOptions;
    private _btnState;
    /**
     * Creates a new Button instance.
     * @param text - The label text to display on the button
     * @param styleOptions - Configuration options for button appearance
     */
    constructor(text: string, styleOptions: ButtonStyleOptions);
    set btnState(newState: BtnState);
    /**
     * Sets the button label text.
     * @param value - New text to display
     */
    set text(value: string);
    /**
     * Updates the button's style options and triggers a redraw.
     * @param styleOptions - New style configuration to apply
     */
    updateStyle(styleOptions: ButtonStyleOptions): void;
    /**
     * Forces a complete redraw of the button including background and text.
     */
    redraw(): void;
    /**
     * Redraws just the text portion of the button.
     */
    redrawText(): void;
    get textSpriteUtilized(): BitmapTextLike | PIXI.Text | null;
    redrawBg(): void;
    private clear;
    get currentStyleState(): ResolvedStyleState;
}
export {};
//# sourceMappingURL=Button.d.ts.map
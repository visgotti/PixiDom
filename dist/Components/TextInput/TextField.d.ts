import { Color, NormalizedColor } from '../../color';
import { IKeyboardBase } from '../../mixins/KeyboardHandlers';
import { ValidMeasurement } from '../../types';
/**
 * Internal style options with parsed measurements.
 * Colors are pre-normalized into `{ value, alpha }` shape.
 * @internal
 */
export type StyleOptions = {
    width: ValidMeasurement;
    height: ValidMeasurement;
    cursorHeight: ValidMeasurement;
    cursorWidth: number;
    borderWidth: number;
    borderColor: NormalizedColor;
    fontColor: NormalizedColor;
    highlightedFontColor: NormalizedColor;
    cursorColor: NormalizedColor;
    backgroundColor: NormalizedColor;
    highlightedBackgroundColor: NormalizedColor;
    borderOpacity: number;
    xPadding: number;
    yPadding: number;
};
/**
 * Configuration options for TextField styling.
 */
export type StyleOptionsParams = {
    /** Width of the text field (e.g., '300px' or 300) */
    width?: number | string;
    /** Height of the text field (e.g., '32px' or 32) */
    height?: number | string;
    /** Border width in pixels */
    borderWidth?: number;
    /** Border color. Accepts any {@link Color} format. */
    borderColor?: Color;
    /** Text color. Accepts any {@link Color} format. */
    fontColor?: Color;
    /** Color of selected/highlighted text. Accepts any {@link Color} format. */
    highlightedFontColor?: Color;
    /** Cursor color. Accepts any {@link Color} format. */
    cursorColor?: Color;
    /** Cursor height (e.g., '90%' or 14) */
    cursorHeight?: number | string;
    /** Cursor width in pixels */
    cursorWidth: number;
    /** Background color. Accepts any {@link Color} format. */
    backgroundColor?: Color;
    /** Background color for text selection. Accepts any {@link Color} format. */
    highlightedBackgroundColor?: Color;
    /** Border opacity (0-1) */
    borderOpacity?: number;
    /** Horizontal padding in pixels */
    xPadding?: number;
    /** Vertical padding in pixels */
    yPadding?: number;
};
/**
 * A fully-featured text input component with cursor navigation, text selection, and keyboard handling.
 * Uses bitmap fonts for rendering and supports focus/blur, selection, and submit events.
 *
 * @example
 * ```typescript
 * import { TextField, FontLoader } from 'pixidom.js';
 *
 * const fontLoader = new FontLoader();
 * fontLoader.add('myFont', './fonts/myFont.fnt');
 * fontLoader.load(() => {
 *   const textField = new TextField('myFont', {
 *     width: '300px',
 *     height: '32px',
 *     backgroundColor: 0xffffff,
 *     borderColor: 0x333333,
 *     fontColor: 0x000000,
 *   });
 *
 *   textField.onFocus(() => console.log('Focused'));
 *   textField.onChange((text) => console.log('Text:', text));
 *   textField.onSubmit(() => console.log('Submitted'));
 *
 *   stage.addChild(textField);
 * });
 * ```
 *
 * @extends PIXI.Container
 */
declare class TextFieldClass extends PIXI.Container implements IKeyboardBase {
    private styleOptions;
    private cursorSprite;
    private textbox;
    private textboxMask;
    private textSprite;
    private inFocus;
    private cursorIndex;
    private clickedTimestamp;
    private cursorAnimationFrame;
    private lastCursorTs;
    private accCursorTime;
    private toggleCursorTime;
    private cursorIsVisible;
    private _text;
    private overflowOffsetX;
    private overflowOffsetY;
    private dragIndexStart;
    private dragIndexEnd;
    private inDrag;
    /** Key codes that trigger the submit event (default: Enter key) */
    submitKeyCodes: Array<number | string>;
    /** Key codes to ignore when typing */
    ignoreKeys: Array<number | string>;
    /** @internal */
    _maxCharacterLength: number | null;
    private onFocusHandler;
    private onBlurHandler;
    private onChangeHandler;
    private onSubmitHandler;
    private onCharLimitHandler;
    /**
     * Creates a new TextField instance.
     * @param font - The name of the bitmap font to use
     * @param styleOptions - Optional styling configuration
     * @param maxCharacterLength - Optional maximum number of characters allowed
     * @param ignoreKeys - Optional array of key codes to ignore
     */
    constructor(font: string, styleOptions?: StyleOptionsParams, maxCharacterLength?: number, ignoreKeys?: Array<number | string>);
    updateStyle(styleOptions: StyleOptionsParams): void;
    private redraw;
    private redrawCursor;
    private redrawText;
    private redrawTextbox;
    private getEventLocalX;
    private handleMouseUp;
    private handleMouseDown;
    private handleMouseMove;
    private clearRange;
    private handleRangeStart;
    private handleRangeChange;
    private handleRangeFinish;
    private getCursorXFromIndex;
    setCursor(index: number): void;
    moveCursor(indexChange: number): void;
    private getCursorIndexFromX;
    getSelectedChars(): string;
    replaceSelectedWith(replaceWith: string): string;
    getSelectedRangeIndexes(): {
        start: number;
        end: number;
    } | null;
    getSelectedRange(): {
        indexes: {
            start: number;
            end: number;
        };
        x: {
            start: number;
            end: number;
        };
    } | null;
    selectAll(): void;
    private setSelectedRange;
    private charFromPosition;
    removeLeftOfCursor(): void;
    removeRightOfCursor(): void;
    onCharLimit(handler: (value: string) => void): void;
    onChange(handler: (value: string) => void): void;
    onFocus(handler: () => void): void;
    onBlur(handler: () => void): void;
    onSubmit(handler: (value: string) => void): void;
    clear(): void;
    private getGlyphs;
    submit(): void;
    focus(): void;
    blur(): void;
    set maxCharacterLength(value: number);
    private _change;
    private refreshBitmapTextMetrics;
    change(value: string): boolean;
    private startCursorAnimation;
    private stopCursorAnimation;
    private blinkCursor;
    private checkForOutsideClick;
    get text(): string;
    set text(value: string);
    show(): void;
    hide(): void;
}
declare const TextField: {
    new (...args: any[]): {
        copiedText: string;
        textStates: Array<string>;
        currentStateIndex: number;
        dispatchBeforeInput(inputType: import('../..').InputType, data: string | null, nativeEvent: import('../..').BeforeInputEvent["nativeEvent"]): boolean;
        changeStateIndex(change: number): void;
        registerHandlers(): void;
        unregisterHandlers(): void;
        onPaste(event: ClipboardEvent): void;
        onCopy(event: ClipboardEvent): void;
        onCut(event: ClipboardEvent): void;
        onBackspace(): void;
        onDelete(): void;
        onArrowUp(_event?: unknown): void;
        onArrowDown(_event?: unknown): void;
        onHome(_event?: unknown): void;
        onEnd(_event?: unknown): void;
        onPageUp(_event?: unknown): void;
        onPageDown(_event?: unknown): void;
        onKeyDown(event: Pick<KeyboardEvent, "keyCode" | "which" | "ctrlKey" | "metaKey" | "shiftKey" | "preventDefault" | "code">): void;
        onKeyPress(event: Pick<KeyboardEvent, "keyCode" | "which" | "key" | "ctrlKey" | "metaKey" | "shiftKey" | "preventDefault" | "code">): void;
        addState(newText: string): void;
        readonly text: string;
        ignoreKeys: Array<number | string>;
        submitKeyCodes: Array<number | string>;
        on: (event: string, handler: (event: any) => void) => void;
        off: (event: string, handler: (event: any) => void) => void;
        emit: (event: string, ...args: any[]) => void;
        change: (text: string) => void;
        replaceSelectedWith: (text: string) => string;
        getSelectedChars: () => string;
        setCursor: (n: number) => void;
        moveCursor: (n: number) => void;
        removeLeftOfCursor: () => void;
        removeRightOfCursor: () => void;
        selectAll: () => void;
        submit: () => void;
        getSelectedRange: () => ({
            indexes: {
                start: number;
                end: number;
            };
            x: {
                start: number;
                end: number;
            };
        } | null);
    };
} & typeof TextFieldClass;
export type TextField = InstanceType<typeof TextField>;
export { TextField };
//# sourceMappingURL=TextField.d.ts.map
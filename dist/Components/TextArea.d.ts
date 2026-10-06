import { Color, NormalizedColor } from '../color';
import { IKeyboardBase } from '../mixins/KeyboardHandlers';
import { ValidMeasurement } from '../types';
import { MeasureGlyph, TextLayout } from '../text-layout';
/**
 * Internal style options with parsed measurements and normalized colors.
 * @internal
 */
export type TextAreaStyleOptions = {
    width: ValidMeasurement;
    height: ValidMeasurement;
    lineHeight?: number;
    fontSize?: number;
    borderWidth: number;
    borderColor: NormalizedColor;
    fontColor: NormalizedColor;
    highlightedFontColor: NormalizedColor;
    cursorColor: NormalizedColor;
    cursorWidth: number;
    backgroundColor: NormalizedColor;
    highlightedBackgroundColor: NormalizedColor;
    borderOpacity: number;
    xPadding: number;
    yPadding: number;
    measureGlyph?: MeasureGlyph;
};
/**
 * Configuration options for TextArea styling.
 */
export type TextAreaStyleOptionsParams = {
    /** Width of the text area (e.g., '300px' or 300) */
    width?: number | string;
    /** Height of the text area (e.g., '120px' or 120) */
    height?: number | string;
    /** Line height in pixels. Defaults to the bitmap font's line height. */
    lineHeight?: number;
    /** Font size used to scale bitmap font metrics. Defaults to the font's base size. */
    fontSize?: number;
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
    /** Cursor width in pixels */
    cursorWidth?: number;
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
    /** Custom glyph measurement — overrides the bitmap font metrics. */
    measureGlyph?: MeasureGlyph;
};
/**
 * Multi-line text input with word wrapping, multi-line selection, vertical
 * caret movement, and scrolling that follows the caret.
 *
 * All caret/selection math lives in the pure `text-layout` module — TextArea
 * only renders the result (one BitmapText per laid-out line), so behavior is
 * identical across PIXI versions and renderers. Enter inserts a newline
 * (`submitKeyCodes` is empty by default); copy/cut/paste, undo/redo, and
 * cancelable `beforeinput` events come from the shared keyboard mixin.
 *
 * @example
 * ```typescript
 * import { TextArea, FontLoader } from 'pixidom.js';
 *
 * const fontLoader = new FontLoader();
 * fontLoader.add('myFont', './fonts/myFont.fnt');
 * fontLoader.load(() => {
 *   const textArea = new TextArea('myFont', {
 *     width: '300px',
 *     height: '120px',
 *     backgroundColor: 0xffffff,
 *   });
 *   textArea.onChange((text) => console.log('Text:', text));
 *   stage.addChild(textArea);
 * });
 * ```
 *
 * @extends PIXI.Container
 */
declare class TextAreaClass extends PIXI.Container implements IKeyboardBase {
    private styleOptions;
    private backgroundGraphic;
    private selectionGraphic;
    private cursorSprite;
    private contentMask;
    private lineContainer;
    private lineSprites;
    private font;
    private _text;
    private _layout;
    private cursorIndex;
    private dragIndexStart;
    private dragIndexEnd;
    private inDrag;
    private inFocus;
    private clickedTimestamp;
    private _scrollY;
    private _registeredScrollEvent;
    /** Sticky column (pixel x) preserved across consecutive vertical caret moves. */
    private desiredX;
    private cursorAnimationFrame;
    private toggleCursorTime;
    private cursorIsVisible;
    /** Key codes that trigger submit. Empty by default: Enter inserts a newline. */
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
     * Creates a new TextArea instance.
     * @param font - The name of the bitmap font to use
     * @param styleOptions - Optional styling configuration
     * @param maxCharacterLength - Optional maximum number of characters allowed
     * @param ignoreKeys - Optional array of key codes to ignore
     */
    constructor(font: string, styleOptions?: TextAreaStyleOptionsParams, maxCharacterLength?: number, ignoreKeys?: Array<number | string>);
    updateStyle(styleOptions: TextAreaStyleOptionsParams): void;
    private invalidateLayout;
    private resolveMetrics;
    private resolveBoxSize;
    /** The current text layout (lines and caret-position tables). Recomputed lazily. */
    get layout(): TextLayout;
    private get innerHeight();
    private get maxScrollY();
    /** Vertical scroll offset in pixels (clamped to the content height). */
    get scrollY(): number;
    set scrollY(value: number);
    /** Wheel scrolls while the pointer hovers the area (same pattern as ScrollList). */
    private registerScrollEvents;
    private handleWheelScroll;
    private ensureCaretVisible;
    private redraw;
    private syncLineSprites;
    private redrawCursor;
    private getEventLocalPoint;
    /**
     * Map a point in this container's local space (e.g. from a pointer event)
     * to a caret index, accounting for padding and scroll.
     */
    caretIndexFromPoint(localX: number, localY: number): number;
    private handleMouseDown;
    private handleMouseMove;
    private handleMouseUp;
    private clearRange;
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
    getSelectedChars(): string;
    setSelectedRange(start: number, end: number): void;
    selectAll(): void;
    setCursor(index: number): void;
    moveCursor(indexChange: number): void;
    /**
     * Move the caret up or down one visual line, preserving the horizontal
     * position across consecutive moves (sticky column, like a DOM textarea).
     */
    moveCaretLine(direction: -1 | 1): void;
    /** Move the caret to the start or end of its current visual line (Home/End). */
    moveCaretToLineEdge(edge: 'start' | 'end'): void;
    /** Move the caret up or down by one viewport of lines (PageUp/PageDown). */
    moveCaretPage(direction: -1 | 1): void;
    replaceSelectedWith(replaceWith: string): string;
    removeLeftOfCursor(): void;
    removeRightOfCursor(): void;
    clear(): void;
    set maxCharacterLength(value: number);
    private _change;
    change(value: string): boolean;
    get text(): string;
    set text(value: string);
    submit(): void;
    focus(): void;
    blur(): void;
    private checkForOutsideClick;
    private startCursorAnimation;
    private stopCursorAnimation;
    private blinkCursor;
    onCharLimit(handler: (value: string) => void): void;
    onChange(handler: (value: string) => void): void;
    onFocus(handler: () => void): void;
    onBlur(handler: () => void): void;
    onSubmit(handler: (value: string) => void): void;
    show(): void;
    hide(): void;
    destroy(options?: Parameters<PIXI.Container['destroy']>[0]): void;
}
declare const TextAreaWithKeyboard_base: {
    new (...args: any[]): {
        copiedText: string;
        textStates: Array<string>;
        currentStateIndex: number;
        dispatchBeforeInput(inputType: import('..').InputType, data: string | null, nativeEvent: import('..').BeforeInputEvent["nativeEvent"]): boolean;
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
} & typeof TextAreaClass;
declare class TextAreaWithKeyboard extends TextAreaWithKeyboard_base {
    onArrowUp(): void;
    onArrowDown(): void;
    onHome(): void;
    onEnd(): void;
    onPageUp(): void;
    onPageDown(): void;
}
declare const TextArea: typeof TextAreaWithKeyboard;
export type TextArea = InstanceType<typeof TextArea>;
export { TextArea };
//# sourceMappingURL=TextArea.d.ts.map
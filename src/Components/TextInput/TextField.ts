import { parseLengthMeasurements } from "../../utils";
import { normalizeColor, type Color, type NormalizedColor } from "../../color";
import KeyboardHandlerMixin, { IKeyboardBase } from "../../mixins/KeyboardHandlers";
import type { ValidMeasurement } from "../../types";
import { BitmapTextLike, createBitmapText, getBitmapTextGlyphs, setBitmapTextTint, drawFilledRect } from "../../pixi-adapter-utils";
import { caretColFromX, glyphsToCaretPositions } from "../../text-layout";

/**
 * Internal style options with parsed measurements.
 * Colors are pre-normalized into `{ value, alpha }` shape.
 * @internal
 */
export type StyleOptions = {
    width: ValidMeasurement,
    height: ValidMeasurement,
    cursorHeight: ValidMeasurement,
    cursorWidth: number,
    borderWidth: number,
    borderColor: NormalizedColor,
    fontColor: NormalizedColor,
    highlightedFontColor: NormalizedColor,
    cursorColor: NormalizedColor,
    backgroundColor: NormalizedColor,
    highlightedBackgroundColor: NormalizedColor,
    borderOpacity: number,
    xPadding: number,
    yPadding: number,
}

/**
 * Configuration options for TextField styling.
 */
export type StyleOptionsParams = {
    /** Width of the text field (e.g., '300px' or 300) */
    width?: number | string,
    /** Height of the text field (e.g., '32px' or 32) */
    height?: number | string,
    /** Border width in pixels */
    borderWidth?: number,
    /** Border color. Accepts any {@link Color} format. */
    borderColor?: Color,
    /** Text color. Accepts any {@link Color} format. */
    fontColor?: Color,
    /** Color of selected/highlighted text. Accepts any {@link Color} format. */
    highlightedFontColor?: Color,
    /** Cursor color. Accepts any {@link Color} format. */
    cursorColor?: Color,
    /** Cursor height (e.g., '90%' or 14) */
    cursorHeight?: number | string,
    /** Cursor width in pixels */
    cursorWidth: number,
    /** Background color. Accepts any {@link Color} format. */
    backgroundColor?: Color,
    /** Background color for text selection. Accepts any {@link Color} format. */
    highlightedBackgroundColor?: Color,
    /** Border opacity (0-1) */
    borderOpacity?: number,
    /** Horizontal padding in pixels */
    xPadding?: number,
    /** Vertical padding in pixels */
    yPadding?: number,
}

const defaultStyleOptions = function() : StyleOptionsParams {
    return {
        width: '500px',
        height: '16px',
        fontColor: 0x000000,
        highlightedFontColor: 0xffffff,
        borderColor: 0x000000,
        borderWidth: 1,
        cursorColor: 0x000000,
        cursorHeight: '90%',
        cursorWidth: 1,
        backgroundColor: 0xf7f7f7,
        highlightedBackgroundColor: 0x000080, // navy blue
        borderOpacity: 1,
        xPadding: 0,
        yPadding: 0,
    }
};

const DEFAULT_FONT_COLOR = 0x000000;
const DEFAULT_HIGHLIGHTED_FONT_COLOR = 0xffffff;

const coerceColorOrFallback = (value: unknown, fallback: number): NormalizedColor => {
    if (value === undefined || value === null) {
        return normalizeColor(fallback);
    }
    try {
        return normalizeColor(value as Color);
    } catch (_err) {
        return normalizeColor(fallback);
    }
};

const lengthFieldsToValidate = ["width", "height", "cursorHeight"];
const colorFieldsToNormalize = new Set([
    "borderColor",
    "fontColor",
    "highlightedFontColor",
    "cursorColor",
    "backgroundColor",
    "highlightedBackgroundColor",
]);

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
class TextFieldClass extends PIXI.Container implements IKeyboardBase {
    private styleOptions: StyleOptions = {} as StyleOptions;
    private cursorSprite: PIXI.Graphics = new PIXI.Graphics();
    private textbox: PIXI.Graphics = new PIXI.Graphics();
    private textboxMask: PIXI.Graphics = new PIXI.Graphics();

    private textSprite: BitmapTextLike;
    private inFocus: boolean = false;

    private cursorIndex: number = -1;
    private clickedTimestamp: number = 0;

    private cursorAnimationFrame: ReturnType<typeof setTimeout> | null = null;
    private lastCursorTs = Date.now();
    private accCursorTime: number = 0;
    private toggleCursorTime: number = 500;
    private cursorIsVisible: boolean = true;

    private _text: string = "";

    private overflowOffsetX: number = 0;
    private overflowOffsetY: number = 0;
    private dragIndexStart: number = 0;
    private dragIndexEnd: number = 0;
    private inDrag: boolean = false;

    /** Key codes that trigger the submit event (default: Enter key) */
    public submitKeyCodes: Array<number | string> = [13, "Enter"];
    /** Key codes to ignore when typing */
    public ignoreKeys: Array<number | string> = [];
    /** @internal */
    public _maxCharacterLength: number | null = null;

    private onFocusHandler: () => void = () => {};
    private onBlurHandler: () => void = () => {};
    private onChangeHandler: (value: string) => void = () => {};
    private onSubmitHandler: (value: string) => void = () => {};
    private onCharLimitHandler: (value: string) => void = () => {};

    /**
     * Creates a new TextField instance.
     * @param font - The name of the bitmap font to use
     * @param styleOptions - Optional styling configuration
     * @param maxCharacterLength - Optional maximum number of characters allowed
     * @param ignoreKeys - Optional array of key codes to ignore
     */
    constructor(
        font: string,
        styleOptions?: StyleOptionsParams,
        maxCharacterLength?: number,
        ignoreKeys?: Array<number | string>,
    ) {
        super();
        this.checkForOutsideClick = this.checkForOutsideClick.bind(this);

        // override destroy method to call blur before destroy so we unregister document handlers if needed.
        const oldDestroy = this.destroy.bind(this);
        this.destroy = (options) => {
           this.blur();
           oldDestroy(options);
        }

        if(ignoreKeys) {
            this.ignoreKeys = ignoreKeys;
        }
        const _defaultStyleOptions: StyleOptionsParams = { ...defaultStyleOptions() };
        if(styleOptions) {
            (Object.keys(styleOptions) as Array<keyof StyleOptionsParams>).forEach((key) => {
                (_defaultStyleOptions[key] as unknown) = styleOptions[key];
            });
        }
        this.maxCharacterLength = maxCharacterLength ?? -1;
    
        this.buttonMode = true;
        this.interactive = true;

    this.textSprite = createBitmapText('', { font, align: "left" });

        this.cursor = "text";

        this.on('pointerdown', this.handleMouseDown.bind(this));
        //this.on('touchstart', this.handleMouseDown.bind(this));

        this.on('pointerup', this.handleMouseUp.bind(this));
    //    this.on('touchend', this.handleMouseUp.bind(this));

        this.on('pointermove', this.handleMouseMove.bind(this));
    //    this.on('touchmove', this.handleMouseMove.bind(this));
        this.on('pointerupoutside', this.handleMouseUp.bind(this));

        this.addChild(this.textboxMask);
        this.addChild(this.textbox);
        this.addChild(this.textSprite);
        this.addChild(this.cursorSprite);

        this.textSprite.mask = this.textboxMask;
       // this.mask = this.textboxMask;

        this.updateStyle(_defaultStyleOptions);

        this.show();
    }

    public updateStyle(styleOptions: StyleOptionsParams) {
        const target = this.styleOptions as Record<string, unknown>;
        const source = styleOptions as Record<string, unknown>;
        for(const key in styleOptions) {
            if(lengthFieldsToValidate.includes(key)) {
                const parsed = parseLengthMeasurements(source[key]);
                if(!parsed.valid) {
                    throw new Error(`Error for passed in style: ${key}, ${parsed.error}`);
                }
                target[key] = { value: parsed.value, type: parsed.type } satisfies ValidMeasurement;
            } else if(colorFieldsToNormalize.has(key)) {
                const raw = source[key];
                if(raw !== undefined && raw !== null) {
                    target[key] = normalizeColor(raw as Color);
                }
            } else {
                target[key] = source[key];
            }
        }
        this.styleOptions.fontColor = coerceColorOrFallback(this.styleOptions.fontColor, DEFAULT_FONT_COLOR);
        this.styleOptions.highlightedFontColor = coerceColorOrFallback(this.styleOptions.highlightedFontColor, DEFAULT_HIGHLIGHTED_FONT_COLOR);
        this.redraw();
    }

    private redraw() {
        this.redrawText();
        this.redrawTextbox();
        this.redrawCursor();
    }

    private redrawCursor() {
        if(!this.inFocus) {
            this.cursorIsVisible = false;
            this.cursorSprite.visible = false;
            return;
        }

        const cursorX = this.getCursorXFromIndex(this.cursorIndex) - this.overflowOffsetX;
        this.cursorSprite.clear();

        const cursor = this.styleOptions.cursorColor;
        this.cursorSprite.lineStyle(this.styleOptions.cursorWidth, cursor.value, cursor.alpha);

        const { value, type } = this.styleOptions.cursorHeight;

        const cursorHeight = type === "pixel" ? value : Math.round(this.textbox.height * (value/100));

        // Center the cursor vertically and draw it at its full requested height.
        const top = (this.textbox.height - cursorHeight) / 2;
        this.cursorSprite.moveTo(cursorX, top).lineTo(cursorX, top + cursorHeight);

        // cursor is only visible if theres no range
        if(this.getSelectedRange()) {
            this.cursorIsVisible = false;
            this.cursorSprite.visible = false;
        } else {
            this.cursorIsVisible = true;
            this.cursorSprite.visible = true;
        }
    }

    private redrawText() {
        const range = this.getSelectedRange();
        this.textSprite.y = this.styleOptions.yPadding;
        this.textSprite.x = this.styleOptions.xPadding;

        const currentCursorX = this.getCursorXFromIndex(this.dragIndexEnd);

        const { value, type } = this.styleOptions.width;
        const totalWidth = window.innerWidth;
        const maxWidth = type === 'pixel' ? value : totalWidth * (value/100);

        if(currentCursorX > maxWidth + this.overflowOffsetX) {
            this.overflowOffsetX = currentCursorX - maxWidth;
            this.textSprite.x -= this.overflowOffsetX;
        } else if(currentCursorX > maxWidth) {
            if(currentCursorX < maxWidth + this.overflowOffsetX) {

                if(currentCursorX < this.overflowOffsetX) {
                    this.overflowOffsetX -= (this.overflowOffsetX - currentCursorX);
                }

                this.textSprite.x -= this.overflowOffsetX;
            } else {
                this.textSprite.x -= this.overflowOffsetX;
            }
        } else {
            this.overflowOffsetX = 0;
        }

        const glyphs = getBitmapTextGlyphs(this.textSprite);
        const fontColor = this.styleOptions.fontColor.value;
        const highlightedColor = this.styleOptions.highlightedFontColor.value;

        if(range) {
            const { indexes } = range;
            const { start, end } = indexes;
            const clampedStart = Math.max(0, Math.min(start, glyphs.length));
            const clampedEnd = Math.max(clampedStart, Math.min(end, glyphs.length));
            
            // Check if any glyphs support per-character tinting (v4-v6 have real sprite children)
            const supportsPerGlyphTint = glyphs.length > 0 && typeof (glyphs[0] as any)?.tint !== "undefined";
            
            if (supportsPerGlyphTint) {
                // v4-v6: Set per-glyph colors directly
                for(let i = 0; i < glyphs.length; i++) {
                    const glyph = glyphs[i] as any;
                    if(glyph && typeof glyph.tint !== "undefined") {
                        // Selected glyphs get highlighted color, others get font color
                        glyph.tint = (i >= clampedStart && i < clampedEnd) ? highlightedColor : fontColor;
                    }
                }
            } else {
                // v7+: Per-glyph tinting not supported, use highlighted color for entire text when selected
                // This is the best we can do since BitmapText uses GPU batching without individual sprites
                setBitmapTextTint(this.textSprite, highlightedColor);
            }
        } else {
            setBitmapTextTint(this.textSprite, fontColor);
        }
    }

    private redrawTextbox() {
        this.textbox.clear();
        const bg = this.styleOptions.backgroundColor;
        this.textbox.beginFill(bg.value, bg.alpha);
        if(this.styleOptions.borderWidth > 0 && !Number.isNaN(this.styleOptions.borderWidth)) {
            const border = this.styleOptions.borderColor;
            // borderColor's alpha is multiplied by the explicit borderOpacity option to preserve
            // existing behavior while still honoring alpha provided via Color.
            const combinedAlpha = (border?.alpha ?? 1) * (this.styleOptions.borderOpacity ?? 1);
            this.textbox.lineStyle(this.styleOptions.borderWidth, border?.value ?? 0, combinedAlpha)
        }

        let { value, type } = this.styleOptions.height;

        const totalWidth = window.innerWidth;
        const totalHeight = window.innerHeight;

        const height = type === 'pixel' ? value : totalHeight * (value/100);
        ({ value, type } = this.styleOptions.width);
        const maxWidth = type === 'pixel' ? value : totalWidth * (value/100);

        const range = this.getSelectedRange();

        this.textbox.drawRect(0, 0, maxWidth, height);
        this.textbox.endFill();

        if(range) {
            let start = range.x.start - this.overflowOffsetX;
            const end = range.x.end - this.overflowOffsetX;
            const highlightBg = this.styleOptions.highlightedBackgroundColor;
            this.textbox.beginFill(highlightBg.value, highlightBg.alpha);
            let _width = end-start;

            if(start + _width >= maxWidth) {
                _width = maxWidth - start;
            } else {
                _width = end-start;
            }

            if(start + _width === maxWidth && _width > maxWidth) {
                start = 0;
                _width = maxWidth;
            }
        
            this.textbox.drawRect(start, 0, _width, height);
            this.textbox.endFill();
        }

        this.textboxMask.clear();
        drawFilledRect(this.textboxMask, 0, 0, maxWidth, height, 0xffffff, 1);
    }

    private getEventLocalX(e: PIXI.FederatedPointerEvent): number {
        const dataAny = e.data as unknown as { getLocalPosition?: (target: unknown) => { x: number } } | undefined;
        if (dataAny && typeof dataAny.getLocalPosition === 'function') {
            return dataAny.getLocalPosition(this).x;
        }
        const eventAny = e as unknown as { getLocalPosition?: (target: unknown) => { x: number } };
        if (typeof eventAny.getLocalPosition === 'function') {
            return eventAny.getLocalPosition(this).x;
        }
        return 0;
    }

    private handleMouseUp(e: PIXI.FederatedPointerEvent) {
        const x = this.getEventLocalX(e);
        if(this.inDrag) {
            this.cursorIndex = this.getCursorIndexFromX(x);
            this.handleRangeFinish();
        }
    }

    private handleMouseDown(e: PIXI.FederatedPointerEvent) {
        // Use nativeEvent.timeStamp for v7+, fall back to data.originalEvent.timeStamp for older versions
        const eventAny = e as unknown as {
            nativeEvent?: { timeStamp?: number };
            data?: { originalEvent?: { timeStamp?: number } };
        };
        this.clickedTimestamp = eventAny.nativeEvent?.timeStamp ?? eventAny.data?.originalEvent?.timeStamp ?? 0;
        const x = this.getEventLocalX(e);
        if(!this.inFocus) {
            this.focus();
        }
        this.clearRange();
        this.cursorIndex = this.getCursorIndexFromX(x);
        this.handleRangeStart(this.cursorIndex);
        this.redraw();
    }

    private handleMouseMove(e: PIXI.FederatedPointerEvent) {
        if(this.inDrag) {
            const x = this.getEventLocalX(e);
            this.handleRangeChange(this.getCursorIndexFromX(x));
        }
    }

    private clearRange() {
        this.dragIndexEnd = this.cursorIndex;
        this.dragIndexStart = this.cursorIndex;
    }

    private handleRangeStart(startIndex: number) {
        this.inDrag = true;
        this.dragIndexStart = startIndex;
        this.dragIndexEnd = startIndex;
    }

    private handleRangeChange(endIndex: number) {
        if(endIndex !== this.dragIndexEnd) {
            this.dragIndexEnd = endIndex;
            this.redraw();
        }
    }

    private handleRangeFinish() {
        this.inDrag = false;
    }

    private getCursorXFromIndex(index: number): number {
        const glyphs = this.getGlyphs() as unknown as Array<{ x: number; width: number }>;
        const xPadding = this.styleOptions.xPadding ?? 0;
        if(!glyphs.length || index <= 0) {
            return xPadding;
        }

        const positions = glyphsToCaretPositions(glyphs);
        const col = Math.min(index, positions.length - 1);
        // caret sits 1px to the right of the character on its left
        return positions[col] + 1 + xPadding;
    }

    public setCursor(index: number) {
        if(index > -1 && index <= this.text.length) {
            this.cursorIndex = index;
            this.clearRange();
            this.redraw();
        }
    }

    public moveCursor(indexChange: number) {
        const newCursorIndex = this.cursorIndex + indexChange;
        if(newCursorIndex > -1 && newCursorIndex <= this.text.length) {
            this.cursorIndex = newCursorIndex;
            this.clearRange();
            this.redraw();
        }
    }

    private getCursorIndexFromX(x: number) : number {
        x += this.overflowOffsetX;

        if(x <= 0) {
            return 0;
        }

        const glyphs = this.getGlyphs() as unknown as Array<{ x: number; width: number }>;
        if(!glyphs.length) {
            return 0;
        }
        return caretColFromX(glyphsToCaretPositions(glyphs), x);
    }

    public getSelectedChars() {
        const range = this.getSelectedRange();
        if(!range) return "";

         const { indexes } = range;
         const { start, end } = indexes;
         return this.text.substr(start, end - start);
    }

    public replaceSelectedWith(replaceWith: string) : string {
        const replaceWithArray = replaceWith.split('');

        const replacedLength = replaceWithArray.length;

        const textArray = this.text.split('');
        let start: number;
        let end: number;
        const range = this.getSelectedRangeIndexes();

        if(range) {
            start = range.start;
            end = range.end;
        } else {
            start = end = this.cursorIndex;
        }
        const deleteCount = end - start;

        textArray.splice(start, deleteCount, ...replaceWithArray);
        if(this._change(textArray.join(''))) {
            this.cursorIndex = start + replacedLength;
            this.clearRange();
            this.redraw();
            return this.text;
        } else {
            return this.text;
        }
    }

    public getSelectedRangeIndexes(): { start: number; end: number } | null {
        const range = this.getSelectedRange();
        if(!range) return null;
        return { start: range.indexes.start, end: range.indexes.end };
    }

    public getSelectedRange(): {
        indexes: { start: number; end: number };
        x: { start: number; end: number };
    } | null {
        const start = Math.min(this.dragIndexStart, this.dragIndexEnd);
        const end = Math.max(this.dragIndexStart, this.dragIndexEnd);

        if(start === end) return null;

        const startX = this.getCursorXFromIndex(start);
        const endX = this.getCursorXFromIndex(end);

        return {
            indexes: { start, end },
            x: { start: startX, end: endX }
        }
    }

    public selectAll() {
        this.setSelectedRange(0, this.text.length);
    }
    private setSelectedRange(start: number, end: number) {
        this.dragIndexStart = start;
        this.dragIndexEnd = end;
        this.cursorIndex = end;
        this.redraw();
    }

    private charFromPosition(_position: number): { left?: string; right?: string } {
        return {};
    }

    public removeLeftOfCursor() {
        if(this.cursorIndex > 0) {
            const array = this.text.split('');
            array.splice(this.cursorIndex - 1, 1);
            this.cursorIndex--;
            this._change(array.join(''));
            this.redraw();
        }
    }

    public removeRightOfCursor() {
        const array = this.text.split('');
        if(array.length && this.cursorIndex < array.length) {
            array.splice(this.cursorIndex, 1);
            this._change(array.join(''));
            this.redraw();
        }
    }
    public onCharLimit(handler: (value: string) => void) {
        this.onCharLimitHandler = handler;
    }
    public onChange(handler: (value: string) => void) {
        this.onChangeHandler = handler;
    }
    public onFocus(handler: () => void) {
        this.onFocusHandler = handler;
    }
    public onBlur(handler: () => void) {
        this.onBlurHandler = handler;
    }
    public onSubmit(handler: (value: string) => void) {
        this.onSubmitHandler = handler;
    }

    public clear() {
        this.text = "";
        this.cursorIndex = 0;
        this.clearRange();
        this.redraw();
    }

    private getGlyphs(): PIXI.DisplayObject[] {
        if(!this.textSprite) {
            return [];
        }
        return getBitmapTextGlyphs(this.textSprite);
    }

    public submit() {
        this.onSubmitHandler(this.text);
    }

    public focus() {
        if(!this.inFocus) {
            document.addEventListener('mousedown', this.checkForOutsideClick);
            this.inFocus = true;
            this.startCursorAnimation();
            this.emit('focus');
            this.onFocusHandler();
        }
    }

    public blur() {
        if(this.inFocus) {
            document.removeEventListener('mousedown', this.checkForOutsideClick);
            this.inFocus = false;
            this.stopCursorAnimation();
            this.clearRange();
            this.redraw();
            this.emit('blur');
            this.onBlurHandler();
        }
    }

    set maxCharacterLength(value: number) {
        if(!isNaN(value) && value >= 0) {
            this._maxCharacterLength = value;
        } else {
            this._maxCharacterLength = null;
        }
    }

    private _change(value: string) {
        if(value !== this.text) {
            if(this._maxCharacterLength !== null && value.length > this._maxCharacterLength) {
                this.onCharLimitHandler(value);
                return false;
            } else {
                this._text = value;
                this.textSprite.text = value;
                if(this._text === "" && this.textSprite.children) {
                    this.textSprite.children.forEach(child => {
                        this.textSprite.removeChild(child);
                    })
                }
                this.refreshBitmapTextMetrics();                   
                this.emit('change', value);
                this.onChangeHandler(value);
                return true;
            }
        }
        return false;
    }

    private refreshBitmapTextMetrics() {
        const sprite: any = this.textSprite;
        if(!sprite) {
            return;
        }
        const updateText = sprite.updateText || sprite._updateText;
        if(typeof updateText === 'function') {
            try {
                updateText.call(sprite);
                return;
            } catch (error) {
                // fall back to transform refresh
            }
        }
        if(typeof sprite.updateTransform === 'function') {
            try {
                sprite.updateTransform();
            } catch (error) {
                /* noop */
            }
        }
    }

    public change(value: string) : boolean {
        const c = this._change(value);
        if(c) {
            this.redrawText();
        }
        return c;
    }

    private startCursorAnimation() {
        if(this.cursorAnimationFrame) {
            this.stopCursorAnimation();
        }
        this.blinkCursor();
    }

    private stopCursorAnimation() {
        this.cursorSprite.visible = false;
        if(this.cursorAnimationFrame) {
            clearTimeout(this.cursorAnimationFrame);
            this.cursorAnimationFrame = null;
            this.accCursorTime = 0;
        }
    }

    private blinkCursor() {
        if(this.cursorIsVisible) {
            this.cursorSprite.visible = !this.cursorSprite.visible;
        }
        this.cursorAnimationFrame = setTimeout(this.blinkCursor.bind(this), this.toggleCursorTime);
    }

    private checkForOutsideClick(e: MouseEvent) {
        if(e.timeStamp !== this.clickedTimestamp) {
            this.blur();
        }
    }

    get text() {
        if(this.textSprite.text === " " && this._text !== " ") {
            return "";
        }
        return this.textSprite.text;
    }

    set text(value) {
        this.change(value);
    }

    public show() {
        this.visible = true;
        this.startCursorAnimation();
    }

    public hide() {
        this.visible = false;
        this.stopCursorAnimation();
    }
}

const TextField = KeyboardHandlerMixin(TextFieldClass)
export type TextField = InstanceType<typeof TextField>;

export { TextField } 
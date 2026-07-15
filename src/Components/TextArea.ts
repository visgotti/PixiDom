import { parseLengthMeasurements } from "../utils";
import { normalizeColor, type Color, type NormalizedColor } from "../color";
import KeyboardHandlerMixin, { IKeyboardBase } from "../mixins/KeyboardHandlers";
import type { ValidMeasurement } from "../types";
import {
    BitmapTextLike,
    createBitmapText,
    createBitmapFontMeasure,
    setBitmapTextTint,
    drawFilledRect,
} from "../pixi-adapter-utils";
import {
    layoutText,
    caretFromIndex,
    indexFromPoint,
    moveCaretVertically,
    moveCaretByLines,
    lineBounds,
    selectionRects,
    type MeasureGlyph,
    type TextLayout,
} from "../text-layout";

/**
 * Internal style options with parsed measurements and normalized colors.
 * @internal
 */
export type TextAreaStyleOptions = {
    width: ValidMeasurement,
    height: ValidMeasurement,
    lineHeight?: number,
    fontSize?: number,
    borderWidth: number,
    borderColor: NormalizedColor,
    fontColor: NormalizedColor,
    highlightedFontColor: NormalizedColor,
    cursorColor: NormalizedColor,
    cursorWidth: number,
    backgroundColor: NormalizedColor,
    highlightedBackgroundColor: NormalizedColor,
    borderOpacity: number,
    xPadding: number,
    yPadding: number,
    measureGlyph?: MeasureGlyph,
}

/**
 * Configuration options for TextArea styling.
 */
export type TextAreaStyleOptionsParams = {
    /** Width of the text area (e.g., '300px' or 300) */
    width?: number | string,
    /** Height of the text area (e.g., '120px' or 120) */
    height?: number | string,
    /** Line height in pixels. Defaults to the bitmap font's line height. */
    lineHeight?: number,
    /** Font size used to scale bitmap font metrics. Defaults to the font's base size. */
    fontSize?: number,
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
    /** Cursor width in pixels */
    cursorWidth?: number,
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
    /** Custom glyph measurement — overrides the bitmap font metrics. */
    measureGlyph?: MeasureGlyph,
}

const defaultStyleOptions = function() : TextAreaStyleOptionsParams {
    return {
        width: '300px',
        height: '120px',
        fontColor: 0x000000,
        highlightedFontColor: 0xffffff,
        borderColor: 0x000000,
        borderWidth: 1,
        cursorColor: 0x000000,
        cursorWidth: 1,
        backgroundColor: 0xf7f7f7,
        highlightedBackgroundColor: 0x000080,
        borderOpacity: 1,
        xPadding: 0,
        yPadding: 0,
    }
};

const lengthFieldsToValidate = ["width", "height"];
const colorFieldsToNormalize = new Set([
    "borderColor",
    "fontColor",
    "highlightedFontColor",
    "cursorColor",
    "backgroundColor",
    "highlightedBackgroundColor",
]);

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
class TextAreaClass extends PIXI.Container implements IKeyboardBase {
    private styleOptions: TextAreaStyleOptions = {} as TextAreaStyleOptions;

    private backgroundGraphic: PIXI.Graphics = new PIXI.Graphics();
    private selectionGraphic: PIXI.Graphics = new PIXI.Graphics();
    private cursorSprite: PIXI.Graphics = new PIXI.Graphics();
    private contentMask: PIXI.Graphics = new PIXI.Graphics();
    private lineContainer: PIXI.Container = new PIXI.Container();
    private lineSprites: BitmapTextLike[] = [];

    private font: string;
    private _text: string = "";
    private _layout: TextLayout | null = null;

    private cursorIndex: number = 0;
    private dragIndexStart: number = 0;
    private dragIndexEnd: number = 0;
    private inDrag: boolean = false;
    private inFocus: boolean = false;
    private clickedTimestamp: number = 0;

    private _scrollY: number = 0;
    private _registeredScrollEvent: boolean = false;
    /** Sticky column (pixel x) preserved across consecutive vertical caret moves. */
    private desiredX: number | null = null;

    private cursorAnimationFrame: ReturnType<typeof setTimeout> | null = null;
    private toggleCursorTime: number = 500;
    private cursorIsVisible: boolean = true;

    /** Key codes that trigger submit. Empty by default: Enter inserts a newline. */
    public submitKeyCodes: Array<number | string> = [];
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
     * Creates a new TextArea instance.
     * @param font - The name of the bitmap font to use
     * @param styleOptions - Optional styling configuration
     * @param maxCharacterLength - Optional maximum number of characters allowed
     * @param ignoreKeys - Optional array of key codes to ignore
     */
    constructor(
        font: string,
        styleOptions?: TextAreaStyleOptionsParams,
        maxCharacterLength?: number,
        ignoreKeys?: Array<number | string>,
    ) {
        super();
        this.font = font;
        this.checkForOutsideClick = this.checkForOutsideClick.bind(this);
        this.handleWheelScroll = this.handleWheelScroll.bind(this);

        if(ignoreKeys) {
            this.ignoreKeys = ignoreKeys;
        }
        this.maxCharacterLength = maxCharacterLength ?? -1;

        this.buttonMode = true;
        this.interactive = true;
        this.cursor = "text";

        this.addChild(this.backgroundGraphic);
        this.addChild(this.contentMask);
        this.addChild(this.selectionGraphic);
        this.addChild(this.lineContainer);
        this.addChild(this.cursorSprite);

        this.selectionGraphic.mask = this.contentMask;
        this.lineContainer.mask = this.contentMask;
        this.cursorSprite.mask = this.contentMask;

        this.on('pointerdown', this.handleMouseDown.bind(this));
        this.on('pointermove', this.handleMouseMove.bind(this));
        this.on('pointerup', this.handleMouseUp.bind(this));
        this.on('pointerupoutside', this.handleMouseUp.bind(this));
        this.registerScrollEvents();

        const merged = { ...defaultStyleOptions(), ...(styleOptions ?? {}) };
        this.updateStyle(merged);
    }

    public updateStyle(styleOptions: TextAreaStyleOptionsParams) {
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
        this.invalidateLayout();
        this.redraw();
    }

    // ---- layout ----

    private invalidateLayout() {
        this._layout = null;
    }

    private resolveMetrics(): { measure: MeasureGlyph; lineHeight: number } {
        const explicitMeasure = this.styleOptions.measureGlyph;
        const fontMetrics = explicitMeasure ? null : createBitmapFontMeasure(this.font, this.styleOptions.fontSize);
        const fallbackSize = this.styleOptions.fontSize ?? 16;
        return {
            measure: explicitMeasure ?? fontMetrics?.measure ?? (() => fallbackSize * 0.6),
            lineHeight: this.styleOptions.lineHeight ?? fontMetrics?.lineHeight ?? Math.round(fallbackSize * 1.2),
        };
    }

    private resolveBoxSize(): { width: number; height: number } {
        const resolve = (measurement: ValidMeasurement, total: number) =>
            measurement.type === 'pixel' ? measurement.value : total * (measurement.value / 100);
        return {
            width: resolve(this.styleOptions.width, typeof window !== 'undefined' ? window.innerWidth : 0),
            height: resolve(this.styleOptions.height, typeof window !== 'undefined' ? window.innerHeight : 0),
        };
    }

    /** The current text layout (lines and caret-position tables). Recomputed lazily. */
    public get layout(): TextLayout {
        if(!this._layout) {
            const { measure, lineHeight } = this.resolveMetrics();
            const { width } = this.resolveBoxSize();
            const wrapWidth = width - this.styleOptions.xPadding * 2;
            this._layout = layoutText(this._text, {
                measure,
                lineHeight,
                wrapWidth: wrapWidth > 0 ? wrapWidth : undefined,
            });
        }
        return this._layout;
    }

    // ---- scrolling ----

    private get innerHeight(): number {
        return this.resolveBoxSize().height - this.styleOptions.yPadding * 2;
    }

    private get maxScrollY(): number {
        return Math.max(0, this.layout.height - this.innerHeight);
    }

    /** Vertical scroll offset in pixels (clamped to the content height). */
    public get scrollY(): number {
        return this._scrollY;
    }

    public set scrollY(value: number) {
        const clamped = Math.max(0, Math.min(this.maxScrollY, value));
        if(clamped !== this._scrollY) {
            this._scrollY = clamped;
            this.redraw();
        }
    }

    /** Wheel scrolls while the pointer hovers the area (same pattern as ScrollList). */
    private registerScrollEvents() {
        this.once('pointerover', () => {
            this._registeredScrollEvent = true;
            document.addEventListener('wheel', this.handleWheelScroll, { passive: false });
            this.once('pointerout', () => {
                document.removeEventListener('wheel', this.handleWheelScroll);
                this._registeredScrollEvent = false;
                this.registerScrollEvents();
            });
        });
    }

    private handleWheelScroll(event: WheelEvent) {
        if(event.cancelable) event.preventDefault();
        this.scrollY += event.deltaY;
    }

    private ensureCaretVisible() {
        const caret = caretFromIndex(this.layout, this.cursorIndex);
        const lineHeight = this.layout.lineHeight;
        if(caret.y < this._scrollY) {
            this._scrollY = caret.y;
        } else if(caret.y + lineHeight > this._scrollY + this.innerHeight) {
            this._scrollY = caret.y + lineHeight - this.innerHeight;
        }
        this._scrollY = Math.max(0, Math.min(this.maxScrollY, this._scrollY));
    }

    // ---- rendering ----

    private redraw() {
        const layout = this.layout;
        const { width: boxWidth, height: boxHeight } = this.resolveBoxSize();
        const { xPadding, yPadding } = this.styleOptions;

        const bg = this.styleOptions.backgroundColor;
        this.backgroundGraphic.clear();
        if(this.styleOptions.borderWidth > 0 && !Number.isNaN(this.styleOptions.borderWidth)) {
            const border = this.styleOptions.borderColor;
            const combinedAlpha = (border?.alpha ?? 1) * (this.styleOptions.borderOpacity ?? 1);
            this.backgroundGraphic.lineStyle(this.styleOptions.borderWidth, border?.value ?? 0, combinedAlpha);
        }
        this.backgroundGraphic.beginFill(bg.value, bg.alpha);
        this.backgroundGraphic.drawRect(0, 0, boxWidth, boxHeight);
        this.backgroundGraphic.endFill();

        this.contentMask.clear();
        drawFilledRect(this.contentMask, 0, 0, boxWidth, boxHeight, 0xffffff, 1);

        const range = this.getSelectedRangeIndexes();

        this.selectionGraphic.clear();
        if(range) {
            const highlightBg = this.styleOptions.highlightedBackgroundColor;
            this.selectionGraphic.beginFill(highlightBg.value, highlightBg.alpha);
            selectionRects(layout, range.start, range.end).forEach((rect) => {
                this.selectionGraphic.drawRect(
                    rect.x + xPadding,
                    rect.y + yPadding - this._scrollY,
                    rect.width,
                    rect.height,
                );
            });
            this.selectionGraphic.endFill();
        }

        this.syncLineSprites(layout);
        const fontColor = this.styleOptions.fontColor.value;
        const highlightedColor = this.styleOptions.highlightedFontColor.value;
        layout.lines.forEach((line, i) => {
            const sprite = this.lineSprites[i];
            sprite.text = line.text;
            sprite.x = xPadding;
            sprite.y = yPadding + line.y - this._scrollY;
            // Per-glyph tint isn't available on v7+/v8 GPU-batched BitmapText,
            // so a line intersecting the selection is tinted whole.
            const selected = !!range && range.start < line.start + line.text.length && range.end > line.start;
            setBitmapTextTint(sprite, selected ? highlightedColor : fontColor);
        });

        this.redrawCursor();
    }

    private syncLineSprites(layout: TextLayout) {
        while(this.lineSprites.length < layout.lines.length) {
            const sprite = createBitmapText('', { font: this.font, align: 'left' });
            this.lineContainer.addChild(sprite);
            sprite.mask = this.contentMask;
            this.lineSprites.push(sprite);
        }
        while(this.lineSprites.length > layout.lines.length) {
            const sprite = this.lineSprites.pop()!;
            this.lineContainer.removeChild(sprite);
            sprite.destroy({ children: true });
        }
    }

    private redrawCursor() {
        this.cursorSprite.clear();
        if(!this.inFocus || this.getSelectedRangeIndexes()) {
            this.cursorIsVisible = false;
            this.cursorSprite.visible = false;
            return;
        }
        const caret = caretFromIndex(this.layout, this.cursorIndex);
        const { xPadding, yPadding } = this.styleOptions;
        const cursor = this.styleOptions.cursorColor;
        const x = xPadding + caret.x + 1;
        const top = yPadding + caret.y - this._scrollY;
        this.cursorSprite.lineStyle(this.styleOptions.cursorWidth, cursor.value, cursor.alpha);
        this.cursorSprite.moveTo(x, top + 1).lineTo(x, top + this.layout.lineHeight - 1);
        this.cursorIsVisible = true;
        this.cursorSprite.visible = true;
    }

    // ---- pointer interaction ----

    private getEventLocalPoint(e: PIXI.FederatedPointerEvent): { x: number; y: number } {
        const dataAny = e.data as unknown as { getLocalPosition?: (target: unknown) => { x: number; y: number } } | undefined;
        if (dataAny && typeof dataAny.getLocalPosition === 'function') {
            return dataAny.getLocalPosition(this);
        }
        const eventAny = e as unknown as { getLocalPosition?: (target: unknown) => { x: number; y: number } };
        if (typeof eventAny.getLocalPosition === 'function') {
            return eventAny.getLocalPosition(this);
        }
        return { x: 0, y: 0 };
    }

    /**
     * Map a point in this container's local space (e.g. from a pointer event)
     * to a caret index, accounting for padding and scroll.
     */
    public caretIndexFromPoint(localX: number, localY: number): number {
        return indexFromPoint(
            this.layout,
            localX - this.styleOptions.xPadding,
            localY - this.styleOptions.yPadding + this._scrollY,
        );
    }

    private handleMouseDown(e: PIXI.FederatedPointerEvent) {
        const eventAny = e as unknown as {
            nativeEvent?: { timeStamp?: number };
            data?: { originalEvent?: { timeStamp?: number } };
        };
        this.clickedTimestamp = eventAny.nativeEvent?.timeStamp ?? eventAny.data?.originalEvent?.timeStamp ?? 0;
        if(!this.inFocus) {
            this.focus();
        }
        const point = this.getEventLocalPoint(e);
        this.cursorIndex = this.caretIndexFromPoint(point.x, point.y);
        this.desiredX = null;
        this.inDrag = true;
        this.dragIndexStart = this.cursorIndex;
        this.dragIndexEnd = this.cursorIndex;
        this.redraw();
    }

    private handleMouseMove(e: PIXI.FederatedPointerEvent) {
        if(this.inDrag) {
            const point = this.getEventLocalPoint(e);
            const index = this.caretIndexFromPoint(point.x, point.y);
            if(index !== this.dragIndexEnd) {
                this.dragIndexEnd = index;
                this.redraw();
            }
        }
    }

    private handleMouseUp(e: PIXI.FederatedPointerEvent) {
        if(this.inDrag) {
            const point = this.getEventLocalPoint(e);
            this.cursorIndex = this.caretIndexFromPoint(point.x, point.y);
            this.inDrag = false;
        }
    }

    // ---- selection / caret (IKeyboardBase) ----

    private clearRange() {
        this.dragIndexStart = this.cursorIndex;
        this.dragIndexEnd = this.cursorIndex;
    }

    public getSelectedRangeIndexes(): { start: number; end: number } | null {
        const start = Math.min(this.dragIndexStart, this.dragIndexEnd);
        const end = Math.max(this.dragIndexStart, this.dragIndexEnd);
        if(start === end) return null;
        return { start, end };
    }

    public getSelectedRange(): {
        indexes: { start: number; end: number };
        x: { start: number; end: number };
    } | null {
        const indexes = this.getSelectedRangeIndexes();
        if(!indexes) return null;
        return {
            indexes,
            x: {
                start: caretFromIndex(this.layout, indexes.start).x,
                end: caretFromIndex(this.layout, indexes.end).x,
            },
        };
    }

    public getSelectedChars() {
        const range = this.getSelectedRangeIndexes();
        if(!range) return "";
        return this.text.substring(range.start, range.end);
    }

    public setSelectedRange(start: number, end: number) {
        this.dragIndexStart = start;
        this.dragIndexEnd = end;
        this.cursorIndex = end;
        this.redraw();
    }

    public selectAll() {
        this.setSelectedRange(0, this.text.length);
    }

    public setCursor(index: number) {
        if(index > -1 && index <= this.text.length) {
            this.cursorIndex = index;
            this.desiredX = null;
            this.clearRange();
            this.ensureCaretVisible();
            this.redraw();
        }
    }

    public moveCursor(indexChange: number) {
        const newCursorIndex = this.cursorIndex + indexChange;
        if(newCursorIndex > -1 && newCursorIndex <= this.text.length) {
            this.cursorIndex = newCursorIndex;
            this.desiredX = null;
            this.clearRange();
            this.ensureCaretVisible();
            this.redraw();
        }
    }

    /**
     * Move the caret up or down one visual line, preserving the horizontal
     * position across consecutive moves (sticky column, like a DOM textarea).
     */
    public moveCaretLine(direction: -1 | 1) {
        if(this.desiredX === null) {
            this.desiredX = caretFromIndex(this.layout, this.cursorIndex).x;
        }
        this.cursorIndex = moveCaretVertically(this.layout, this.cursorIndex, direction, this.desiredX);
        this.clearRange();
        this.ensureCaretVisible();
        this.redraw();
    }

    /** Move the caret to the start or end of its current visual line (Home/End). */
    public moveCaretToLineEdge(edge: 'start' | 'end') {
        const bounds = lineBounds(this.layout, this.cursorIndex);
        this.cursorIndex = edge === 'start' ? bounds.start : bounds.end;
        this.desiredX = null;
        this.clearRange();
        this.ensureCaretVisible();
        this.redraw();
    }

    /** Move the caret up or down by one viewport of lines (PageUp/PageDown). */
    public moveCaretPage(direction: -1 | 1) {
        const pageLines = Math.max(1, Math.floor(this.innerHeight / this.layout.lineHeight));
        if(this.desiredX === null) {
            this.desiredX = caretFromIndex(this.layout, this.cursorIndex).x;
        }
        this.cursorIndex = moveCaretByLines(this.layout, this.cursorIndex, direction * pageLines, this.desiredX);
        this.clearRange();
        this.ensureCaretVisible();
        this.redraw();
    }

    // ---- text mutation (IKeyboardBase) ----

    public replaceSelectedWith(replaceWith: string) : string {
        const range = this.getSelectedRangeIndexes();
        const start = range ? range.start : this.cursorIndex;
        const end = range ? range.end : this.cursorIndex;
        const newText = this.text.slice(0, start) + replaceWith + this.text.slice(end);
        if(this._change(newText)) {
            this.cursorIndex = start + replaceWith.length;
            this.desiredX = null;
            this.clearRange();
            this.ensureCaretVisible();
            this.redraw();
        }
        return this.text;
    }

    public removeLeftOfCursor() {
        if(this.cursorIndex > 0) {
            const newText = this.text.slice(0, this.cursorIndex - 1) + this.text.slice(this.cursorIndex);
            if(this._change(newText)) {
                this.cursorIndex--;
                this.desiredX = null;
                this.ensureCaretVisible();
            }
            this.redraw();
        }
    }

    public removeRightOfCursor() {
        if(this.cursorIndex < this.text.length) {
            const newText = this.text.slice(0, this.cursorIndex) + this.text.slice(this.cursorIndex + 1);
            this._change(newText);
            this.desiredX = null;
            this.redraw();
        }
    }

    public clear() {
        this.text = "";
        this.cursorIndex = 0;
        this.clearRange();
        this.redraw();
    }

    set maxCharacterLength(value: number) {
        if(!isNaN(value) && value >= 0) {
            this._maxCharacterLength = value;
        } else {
            this._maxCharacterLength = null;
        }
    }

    private _change(value: string): boolean {
        if(value === this._text) {
            return false;
        }
        if(this._maxCharacterLength !== null && value.length > this._maxCharacterLength) {
            this.onCharLimitHandler(value);
            return false;
        }
        this._text = value;
        this.invalidateLayout();
        this.emit('change', value);
        this.onChangeHandler(value);
        return true;
    }

    public change(value: string) : boolean {
        const changed = this._change(value);
        if(changed) {
            if(this.cursorIndex > value.length) {
                this.cursorIndex = value.length;
            }
            this.clearRange();
            this.ensureCaretVisible();
            this.redraw();
        }
        return changed;
    }

    get text() {
        return this._text;
    }

    set text(value: string) {
        this.change(value);
    }

    // ---- focus / events ----

    public submit() {
        this.onSubmitHandler(this.text);
    }

    public focus() {
        if(!this.inFocus) {
            document.addEventListener('mousedown', this.checkForOutsideClick);
            this.inFocus = true;
            this.startCursorAnimation();
            this.redraw();
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

    private checkForOutsideClick(e: MouseEvent) {
        if(e.timeStamp !== this.clickedTimestamp) {
            this.blur();
        }
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
        }
    }

    private blinkCursor() {
        if(this.cursorIsVisible) {
            this.cursorSprite.visible = !this.cursorSprite.visible;
        }
        this.cursorAnimationFrame = setTimeout(this.blinkCursor.bind(this), this.toggleCursorTime);
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

    public show() {
        this.visible = true;
    }

    public hide() {
        this.visible = false;
        this.stopCursorAnimation();
    }

    public override destroy(options?: Parameters<PIXI.Container['destroy']>[0]) {
        this.blur();
        this.stopCursorAnimation();
        if(this._registeredScrollEvent) {
            document.removeEventListener('wheel', this.handleWheelScroll);
            this._registeredScrollEvent = false;
        }
        super.destroy(options);
    }
}

class TextAreaWithKeyboard extends KeyboardHandlerMixin(TextAreaClass) {
    public override onArrowUp() {
        this.moveCaretLine(-1);
    }
    public override onArrowDown() {
        this.moveCaretLine(1);
    }
    public override onHome() {
        this.moveCaretToLineEdge('start');
    }
    public override onEnd() {
        this.moveCaretToLineEdge('end');
    }
    public override onPageUp() {
        this.moveCaretPage(-1);
    }
    public override onPageDown() {
        this.moveCaretPage(1);
    }
}

const TextArea = TextAreaWithKeyboard;
export type TextArea = InstanceType<typeof TextArea>;

export { TextArea };

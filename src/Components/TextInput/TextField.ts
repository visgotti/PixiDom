import { parseLengthMeasurements } from "../../utils";
import KeyboardHandlerMixin, { IKeyboardBase } from "../../mixins/KeyboardHandlers";
import { ValidMeasurement } from "../../types";
import { BitmapTextLike, createBitmapText, getBitmapTextGlyphs, getPixiVersion } from "../../pixi-adapter-utils";

const DEFAULT_BORDER_COLOR = 0x7b7b7b;

export type StyleOptions = {
    width?: ValidMeasurement,
    height?: ValidMeasurement,
    cursorHeight: ValidMeasurement,
    cursorWidth: number,
    borderWidth?: number,
    borderColor?: number,
    borderAccentColor?: number,
    fontColor: number,
    highlightedFontColor: number,
    cursorColor: number,
    backgroundColor: number,
    highlightedBackgroundColor: number,
    borderOpacity: number,
    borderAccentOpacity?: number,
    xPadding: number,
    yPadding: number,
}

export type StyleOptionsParams = {
    width?: number | string,
    height?: number | string,
    borderWidth?: number,
    borderColor?: number,
    borderAccentColor?: number,
    fontColor?: number,
    highlightedFontColor?: number,
    cursorColor?: number,
    cursorHeight?: number | string,
    cursorWidth: number,
    backgroundColor?: number,
    highlightedBackgroundColor?: number,
    borderOpacity?: number,
    borderAccentOpacity?: number,
    xPadding?: number,
    yPadding?: number,
}

const defaultStyleOptions = function() : StyleOptionsParams {
    return {
        width: '500px',
        height: '16px',
        fontColor: 0x000000,
        highlightedFontColor: 0xffffff,
    borderColor: DEFAULT_BORDER_COLOR,
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

const lengthFieldsToValidate = ["width", "height", "cursorHeight"];

let TEXT_FIELD_ID = 0;

class TextFieldClass extends PIXI.Container implements IKeyboardBase {
    private styleOptions: StyleOptions = {} as StyleOptions;
    private cursorSprite: PIXI.Graphics = new PIXI.Graphics();
    private textbox: PIXI.Graphics = new PIXI.Graphics();
    private selectionOverlay: PIXI.Graphics = new PIXI.Graphics();
    private textboxBorder: PIXI.Graphics = new PIXI.Graphics();
    private textboxMask: PIXI.Graphics = new PIXI.Graphics();

    private textSprite: BitmapTextLike;
    private inFocus: boolean = false;

    private cursorIndex: number = -1;
    private clickedTimestamp: number;

    private cursorAnimationFrame: any;
    private lastCursorTs = Date.now();
    private accCursorTime: number = 0;
    private toggleCursorTime: number = 500;
    private cursorIsVisible: boolean = true;

    private _text: string = "";

    private _visible: boolean = true;

    private overflowOffsetX: number = 0;
    private overflowOffsetY: number = 0;
    private dragIndexStart: number = 0;
    private dragIndexEnd: number = 0;
    private inDrag: boolean = false;
    private caretPositionsCacheKey: string | null = null;
    private caretPositionsCache: number[] | null = null;

    public submitKeyCodes: Array<number | string> = [13, "Enter"];
    public ignoreKeys: Array<number | string> = [];
    public _maxCharacterLength: number = null;

    private onFocusHandler: Function = () => {};
    private onBlurHandler: Function = () => {};
    private onChangeHandler: Function = () => {};
    private onSubmitHandler: Function = () => {};
    private onCharLimitHandler: Function = () => {};
    private __pixiDomFieldId: number;
    constructor(font: string, styleOptions?: StyleOptionsParams, maxCharacterLength?, ignoreKeys?) {
        super();
        this.__pixiDomFieldId = ++TEXT_FIELD_ID;
        this.checkForOutsideClick = this.checkForOutsideClick.bind(this);

        // override destroy method to call blur before destroy so we unregister document handlers if needed.
        const oldDestroy = this.destroy.bind(this);
        this['destroy'] = (options) => {
           this.blur();
           oldDestroy(options);
        }

        if(ignoreKeys) {
            this.ignoreKeys = ignoreKeys;
        }
        const _defaultStyleOptions = { ...defaultStyleOptions() };
        if(styleOptions) {
            for(let key in styleOptions) {
                _defaultStyleOptions[key] = styleOptions[key];
            }
        }
        this.maxCharacterLength = maxCharacterLength;
    
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
    this.addChild(this.selectionOverlay);
    this.addChild(this.textboxBorder);
    this.addChild(this.textSprite);
    this.addChild(this.cursorSprite);

        this.textSprite.mask = this.textboxMask;
       // this.mask = this.textboxMask;

        this.updateStyle(_defaultStyleOptions);

        this.show();
    }

    public updateStyle(styleOptions: StyleOptionsParams) {
        for(const key in styleOptions) {
            if(lengthFieldsToValidate.includes(key)) {
                const parsed = parseLengthMeasurements(styleOptions[key]);
                if(parsed.error) {
                    throw new Error(`Error for passed in style: ${key}, ${parsed.error}`)
                } else {
                    this.styleOptions[key] = parsed;
                }
            } else {
                this.styleOptions[key] = styleOptions[key];
            }
        }
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

        this.cursorSprite.lineStyle(this.styleOptions.cursorWidth, this.styleOptions.cursorColor);

        const { value, type } = this.styleOptions.cursorHeight;

        const cursorHeight = type === "pixel" ? value : Math.round(this.textbox.height * (value/100));

        const min = Math.min(this.textbox.height, cursorHeight);
        const max = Math.max(this.textbox.height, cursorHeight);
        const yOffset = (max - min) / 2; // centers cursor vertically
        const bottomOffset = Math.floor(yOffset);
        const topOffset = Math.ceil(yOffset);

        this.cursorSprite.moveTo(cursorX, bottomOffset).lineTo(cursorX,  cursorHeight - topOffset);

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

        const glyphs = this.getGlyphs();
        for(let i = 0; i < glyphs.length; i++) {
            const child = glyphs[i] as PIXI.Sprite;

            if(range) {
                const { indexes } = range;
                const { start, end } = indexes;
                const withinRange = i >= start && i < end;
                if(withinRange) {
                    child.tint = this.styleOptions.highlightedFontColor;
                    continue;
                }
            }

            if("fontColor" in this.styleOptions) {
                child.tint = this.styleOptions.fontColor;
            } else {
                child.tint = 0xFFFFFF
            }
        }
    }

    private redrawTextbox() {
        this.textbox.clear();
        this.textbox.beginFill(this.styleOptions.backgroundColor, 1);

        let { value, type } = this.styleOptions.height;

        const totalWidth = window.innerWidth;
        const totalHeight = window.innerHeight;

        const height = type === 'pixel' ? value : totalHeight * (value/100);
        ({ value, type } = this.styleOptions.width);
        const maxWidth = type === 'pixel' ? value : totalWidth * (value/100);

        const range = this.getSelectedRange();

        this.textbox.drawRect(0, 0, maxWidth, height);
        this.textbox.endFill();

        this.selectionOverlay.clear();
        if(range) {
            let start = range.x.start - this.overflowOffsetX;
            let end = range.x.end - this.overflowOffsetX;
            start = Math.max(0, Math.min(maxWidth, start));
            end = Math.max(start, Math.min(maxWidth, end));
            const width = end - start;
            if(width > 0) {
                this.selectionOverlay.beginFill(this.styleOptions.highlightedBackgroundColor, 1);
                this.selectionOverlay.drawRect(start, 0, width, height);
                this.selectionOverlay.endFill();
            }
        }

        this.textboxMask.clear();
        this.textboxMask.beginFill(0xffffff, 1);
        this.textboxMask.drawRect(0, 0, maxWidth, height);
        this.textboxMask.endFill();

    this.drawTextboxBorder(maxWidth, height);
    }

    private drawTextboxBorder(maxWidth: number, height: number) {
        const target = this.textboxBorder;
        target.clear();
        const borderWidth = this.styleOptions.borderWidth ?? 0;
        if(borderWidth <= 0 || Number.isNaN(borderWidth)) {
            return;
        }
        const hasCustomBorderColor = typeof this.styleOptions.borderColor === "number";
        const borderColor = hasCustomBorderColor ? this.styleOptions.borderColor : DEFAULT_BORDER_COLOR;
        const borderOpacity = this.styleOptions.borderOpacity ?? 1;
        const accentColor = this.getComputedAccentColor(borderColor);
        const accentOpacity = this.styleOptions.borderAccentOpacity ?? borderOpacity;

        this.fillBorderSegment(target, 0, 0, maxWidth, borderWidth, borderColor, borderOpacity); // top
        const bottomColor = this.getBottomBorderColor(borderColor);
        this.fillBorderSegment(target, 0, height - borderWidth, maxWidth, borderWidth, bottomColor, borderOpacity); // bottom
        this.fillBorderSegment(target, 0, 0, borderWidth, height, borderColor, borderOpacity); // left
        this.fillBorderSegment(target, maxWidth - borderWidth, 0, borderWidth, height, borderColor, borderOpacity); // right

        if(accentColor !== null && borderWidth >= 2) {
            const accentHeight = Math.max(1, Math.floor(borderWidth / 2));
            this.fillBorderSegment(target, 0, 0, maxWidth, accentHeight, accentColor, accentOpacity);
        }

        this.applyCornerBlends(target, maxWidth, height, borderWidth, borderColor);
    }

    private getComputedAccentColor(borderColor: number): number | null {
        if(typeof this.styleOptions.borderAccentColor === "number") {
            return this.styleOptions.borderAccentColor;
        }
        return this.getBorderAccentFallbackColor(borderColor);
    }

    private getBorderAccentFallbackColor(color: number): number | null {
        if(this.styleOptions.borderWidth === undefined || (this.styleOptions.borderWidth ?? 0) < 2) {
            return null;
        }
        return this.getHalfToneColor(color);
    }

    private fillBorderSegment(target: PIXI.Graphics, x: number, y: number, width: number, height: number, color: number, alpha: number) {
        if(width <= 0 || height <= 0) {
            return;
        }
        target.beginFill(color, alpha);
        target.drawRect(x, y, width, height);
        target.endFill();
    }

    private getBottomBorderColor(color: number): number {
        if(typeof color !== "number" || Number.isNaN(color)) {
            return color;
        }
        const lighten = (value: number) => Math.min(255, value + 1);
        const r = (color >> 16) & 0xff;
        const g = (color >> 8) & 0xff;
        const b = color & 0xff;
        return (lighten(r) << 16) | (lighten(g) << 8) | lighten(b);
    }

    private applyCornerBlends(target: PIXI.Graphics, maxWidth: number, height: number, borderWidth: number, borderColor: number) {
        if(borderWidth <= 0) {
            return;
        }
        const blendColor = this.getStageEdgeBlendColor(borderColor);
        if(typeof blendColor !== "number") {
            return;
        }
        const blendSize = Math.min(borderWidth, 1);
        if(blendSize <= 0) {
            return;
        }
        this.fillBorderSegment(target, 0, 0, blendSize, blendSize, blendColor, 1); // top-left
        this.fillBorderSegment(target, 0, height - blendSize, blendSize, blendSize, blendColor, 1); // bottom-left
    }

    private getStageEdgeBlendColor(color: number): number | null {
        return this.getHalfToneColor(color);
    }

    private getHalfToneColor(color: number): number | null {
        if(typeof color !== "number" || Number.isNaN(color)) {
            return null;
        }
        const r = this.halfAndClamp((color >> 16) & 0xff);
        const g = this.halfAndClamp((color >> 8) & 0xff);
        const b = this.halfAndClamp(color & 0xff);
        return (r << 16) | (g << 8) | b;
    }

    private halfAndClamp(value: number): number {
        return Math.max(0, Math.min(255, Math.round(value * 0.5)));
    }


    private handleMouseUp(e){
        const { x } = e.data.getLocalPosition(this);

        if(this.inDrag) {
            this.cursorIndex = this.getCursorIndexFromX(x);
            this.handleRangeFinish();
            // do multi text selext
            //const clicked = this.indexFromPosition(e.position).left;
            //this.multiSelect(this.dragIndexStart, this.indexFromPosition(e.position)
        }
    }

    private handleMouseDown(e) {
        this.clickedTimestamp = e.data.originalEvent.timeStamp;
        const { x } = e.data.getLocalPosition(this);
        if(!this.inFocus) {
            this.focus();
        }
        this.clearRange();
        this.cursorIndex = this.getCursorIndexFromX(x);
        this.handleRangeStart(this.cursorIndex);
        this.redraw();
    }

    private handleMouseMove(e) {
        if(this.inDrag) {
            const { x } = e.data.getLocalPosition(this);
            this.handleRangeChange(this.getCursorIndexFromX(x));
        }
    }

    private clearRange() {
        this.dragIndexEnd = this.cursorIndex;
        this.dragIndexStart = this.cursorIndex;
    }

    private handleRangeStart(startIndex) {
        this.inDrag = true;
        this.dragIndexStart = startIndex;
        this.dragIndexEnd = startIndex;
    }

    private handleRangeChange(endIndex) {
        if(endIndex !== this.dragIndexEnd) {
            this.dragIndexEnd = endIndex;
            this.redraw();
        }
    }

    private handleRangeFinish() {
        this.inDrag = false;
    }

    private getCursorXFromIndex(index) {
        const padding = this.styleOptions.xPadding ?? 0;
        let leftChar;
        // if theres no children in the text sprite that means our cursor should get x value for the beginning of the textfield
        const glyphs = this.getGlyphs();
        if(glyphs.length && index > 0) {
            if(index >= glyphs.length) {
                leftChar = glyphs[glyphs.length - 1]
            } else {
                leftChar = glyphs[index - 1];
            }
            if(leftChar && typeof leftChar.x === "number" && typeof leftChar.width === "number") {
                return leftChar.x + leftChar.width + 1 + padding;
            }
        }
        const layoutPositions = this.resolveCaretPositionsFromLayout();
        if(!layoutPositions.length || index <= 0) {
            return padding;
        }
        const clamped = Math.min(index, layoutPositions.length);
        const cursorPos = layoutPositions[clamped - 1] ?? 0;
        // get the position of character to left plus 1 pixel for padding
        return cursorPos + padding + 1;
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

        const glyphs = this.getGlyphs();
        for(let i = 0; i < glyphs.length; i++) {
            const charChild = glyphs[i] as any;
            if(charChild.x + charChild.width > x) {
                // click was on right side of character, current cursor index becomes i+1
                if(charChild.x + (charChild.width / 2) < x) {
                    return i+1;
                } else {
                    return i;
                }
            }
        }
        return glyphs.length;
    }

    public getSelectedChars() {
        const range = this.getSelectedRange();
        if(!range) return "";

         const { indexes } = range;
         const { start, end } = indexes;
         return this.text.substr(start, end - start);
    }

    public replaceSelectedWith(replaceWith) : string {
        const replaceWithArray = replaceWith.split('');
        
        const replacedLength = replaceWithArray.length;

        let oldTextValue = this.text;

        const textArray = this.text.split('');
        let start, end;
        const range = this.getSelectedRangeIndexes();

        if(range) {
            ({ start, end } = range);
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

    public getSelectedRangeIndexes() : {
        start: number,
        end: number
    } {

        const range = this.getSelectedRange();
        if(!range) return null;

        return { start: range.indexes.start, end: range.indexes.end };
    }

    public getSelectedRange() : {
            indexes:
                { start: number, end: number },
            x:
                { start: number, end: number }
        } {


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
    private setSelectedRange(start, end) {
        this.dragIndexStart = start;
        this.dragIndexEnd = end;
        this.cursorIndex = end;
        this.redraw();
    }

    private charFromPosition(position) : { left?: string, right?: string } {
        return { left: null, right: null };
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
    public onCharLimit(handler) {
        this.onCharLimitHandler = handler;
    }
    public onChange(handler) {
        this.onChangeHandler = handler;
    }
    public onFocus(handler) {
        this.onFocusHandler = handler;
    }
    public onBlur(handler) {
        this.onBlurHandler = handler;
    }
    public onSubmit(handler) {
        this.onSubmitHandler = handler;
    }

    public clear() {
        this.text = "";
        this.cursorIndex = 0;
        this.clearRange();
        this.redraw();
    }

    public submit() {
        this.onSubmitHandler(this.text);
    }

    public focus() {
        if(!this.inFocus) {
            document.addEventListener('pointerdown', this.checkForOutsideClick, true);
            this.inFocus = true;
            this.startCursorAnimation();
            this.emit('focus');
            this.onFocusHandler();
        }
    }

    public blur() {
        if(this.inFocus) {
            document.removeEventListener('pointerdown', this.checkForOutsideClick, true);
            this.inFocus = false;
            this.stopCursorAnimation();
            this.clearRange();
            this.redraw();
            this.emit('blur');
            this.onBlurHandler();
        }
    }

    set maxCharacterLength(value: number) {
        if(!isNaN(value)) {
            if(value === null || value < 0) {
                this._maxCharacterLength = null;
            } else {
                this._maxCharacterLength = value;
            }
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
                this.invalidateCaretPositions();
                if(this._text === "") {
                    this.getGlyphs().forEach(child => {
                        if(child.parent === this.textSprite) {
                            this.textSprite.removeChild(child);
                        }
                    })
                }
                
                if(getPixiVersion() < 8 && typeof this.textSprite.updateTransform === "function") {
                    this.textSprite.updateTransform();
                }
                this.emit('change', value);
                this.onChangeHandler(value);
                return true;
            }
        }
        return false;
    }

    private getGlyphs(): PIXI.DisplayObject[] {
        if(!this.textSprite) {
            return [];
        }
        return getBitmapTextGlyphs(this.textSprite);
    }

    private invalidateCaretPositions() {
        this.caretPositionsCacheKey = null;
        this.caretPositionsCache = null;
    }

    private resolveCaretPositionsFromLayout(): number[] {
        const text = this.textSprite?.text ?? '';
        if(this.caretPositionsCache && this.caretPositionsCacheKey === text) {
            return this.caretPositionsCache;
        }
        const glyphs = this.getGlyphs();
        if(glyphs.length) {
            const positions = glyphs.map((glyph: any) => {
                const width = typeof glyph.width === "number" ? glyph.width : 0;
                const x = typeof glyph.x === "number" ? glyph.x : 0;
                return x + width;
            });
            this.caretPositionsCacheKey = text;
            this.caretPositionsCache = positions;
            return positions;
        }
        if(getPixiVersion() < 8) {
            this.caretPositionsCacheKey = text;
            this.caretPositionsCache = [];
            return this.caretPositionsCache;
        }
        const pixiAny = PIXI as any;
        const manager = pixiAny?.BitmapFontManager;
        if(!manager || typeof manager.measureText !== "function" || typeof manager.getFont !== "function") {
            this.caretPositionsCacheKey = text;
            this.caretPositionsCache = [];
            return this.caretPositionsCache;
        }
        const style = this.textSprite?.style ?? (this.textSprite as any)?._style ?? null;
        if(!style) {
            this.caretPositionsCacheKey = text;
            this.caretPositionsCache = [];
            return this.caretPositionsCache;
        }
        try {
            const layout = manager.measureText(text, style) ?? null;
            const font = manager.getFont(text, style) ?? null;
            const scale = layout?.scale ?? 1;
            const lines = layout?.lines ?? [];
            const positions: number[] = [];
            if(font && lines.length) {
                let globalIndex = 0;
                for(const line of lines) {
                    const chars = line.chars ?? [];
                    for(let i = 0; i < line.charPositions.length; i++, globalIndex++) {
                        const current = line.charPositions[i];
                        const char = chars[i] ?? text[globalIndex] ?? ' ';
                        const charData = font.chars?.[char] ?? font.chars?.[' '] ?? null;
                        const nextStart = i + 1 < line.charPositions.length
                            ? line.charPositions[i + 1]
                            : current + (charData?.xAdvance ?? font.lineHeight ?? 0);
                        positions[globalIndex] = nextStart * scale;
                    }
                }
            }
            this.caretPositionsCacheKey = text;
            this.caretPositionsCache = positions;
            return positions;
        } catch (error) {
            this.caretPositionsCacheKey = text;
            this.caretPositionsCache = [];
            return this.caretPositionsCache;
        }
    }

    public change(value) : boolean {
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

    private checkForOutsideClick(e) {
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

    // @ts-ignore
    set visible(value) {
        // @ts-ignore
        super.visible = value;
        this._visible = value;
        if(value) {
            this.startCursorAnimation();
        } else {
            this.stopCursorAnimation();
        }
    }

    get visible() {
        return this._visible;
    }

    public show() {
        this.visible = true;
    }

    public hide() {
        this.visible = false;
    }
}

const TextField = KeyboardHandlerMixin(TextFieldClass)
export type TextField = InstanceType<typeof TextField>;

export { TextField } 
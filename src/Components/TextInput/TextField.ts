import { parseLengthMeasurements } from "../../utils";
import KeyboardHandlerMixin, { IKeyboardBase } from "../../mixins/KeyboardHandlers";
import { ValidMeasurement } from "../../types";

export type StyleOptions = {
    width?: ValidMeasurement,
    height?: ValidMeasurement,
    cursorHeight: ValidMeasurement,
    cursorWidth: number,
    borderWidth?: number,
    borderColor?: number,
    fontColor: number,
    highlightedFontColor: number,
    cursorColor: number,
    backgroundColor: number,
    highlightedBackgroundColor: number,
    borderOpacity: number,
    xPadding: number,
    yPadding: number,
}

export type StyleOptionsParams = {
    width?: number | string,
    height?: number | string,
    borderWidth?: number,
    borderColor?: number,
    fontColor?: number,
    highlightedFontColor?: number,
    cursorColor?: number,
    cursorHeight?: number | string,
    cursorWidth: number,
    backgroundColor?: number,
    highlightedBackgroundColor?: number,
    borderOpacity?: number,
    xPadding?: number,
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

const lengthFieldsToValidate = ["width", "height", "cursorHeight"];

class TextFieldClass extends PIXI.Container implements IKeyboardBase {
    private styleOptions: StyleOptions = {} as StyleOptions;
    private cursorSprite: PIXI.Graphics = new PIXI.Graphics();
    private textbox: PIXI.Graphics = new PIXI.Graphics();
    private textboxMask: PIXI.Graphics = new PIXI.Graphics();

    private textSprite: PIXI.extras.BitmapText;
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

    public submitKeyCodes: Array<number | string> = [13, "Enter"];
    public ignoreKeys: Array<number | string> = [];
    public _maxCharacterLength: number = null;

    private onFocusHandler: Function = () => {};
    private onBlurHandler: Function = () => {};
    private onChangeHandler: Function = () => {};
    private onSubmitHandler: Function = () => {};
    private onCharLimitHandler: Function = () => {};
    constructor(font: string, styleOptions?: StyleOptionsParams, maxCharacterLength?, ignoreKeys?) {
        super();
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

        this.textSprite = new PIXI.extras.BitmapText('', { font, align: "left" });

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

        for(let i = 0; i < this.textSprite.children.length; i++) {
            const child = this.textSprite.children[i] as PIXI.Sprite;

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
        if(this.styleOptions.borderWidth > 0 && !Number.isNaN(this.styleOptions.borderWidth)) {
            this.textbox.lineStyle(this.styleOptions.borderWidth, this.styleOptions.borderColor, this.styleOptions.borderOpacity)
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
            this.textbox.beginFill(this.styleOptions.highlightedBackgroundColor, 1);
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
        this.textboxMask.drawRect(0, 0, maxWidth, height);
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
        let leftChar;
        // if theres no children in the text sprite that means our cursor should get x value for the beginning of the textfield
        if(!this.textSprite.children || !this.textSprite.children.length || index <= 0) {
            if(this.styleOptions.xPadding) {
                return this.styleOptions.xPadding;
            }
            return 0;
        }

        if(index >= this.textSprite.children.length) {
            leftChar = this.textSprite.children[this.textSprite.children.length - 1]
        } else {
            leftChar = this.textSprite.children[index - 1];
        }
        // get the position of character to left plus 1 pixel for padding
        return leftChar.x + leftChar.width + 1 + this.styleOptions.xPadding;
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

        for(let i = 0; i < this.textSprite.children.length; i++) {
            const charChild = this.textSprite.children[i] as any;
            if(charChild.x + charChild.width > x) {
                // click was on right side of character, current cursor index becomes i+1
                if(charChild.x + (charChild.width / 2) < x) {
                    return i+1;
                } else {
                    return i;
                }
            }
        }
        return this.textSprite.children.length;
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
                if(this._text === "" && this.textSprite.children) {
                    this.textSprite.children.forEach(child => {
                        this.textSprite.removeChild(child);
                    })
                }
                
                this.textSprite.updateTransform();                   
                this.emit('change', value);
                this.onChangeHandler(value);
                return true;
            }
        }
        return false;
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
import { parseLengthMeasurements } from "../utils";

type ValidMeasurement = {
    value: number,
    type: string, // percent or pixel
}

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

export class TextField extends PIXI.Container {
    private styleOptions: StyleOptions = {} as StyleOptions;
    private cursorSprite: PIXI.Graphics = new PIXI.Graphics();
    private textbox: PIXI.Graphics = new PIXI.Graphics();

    private textSprite: PIXI.extras.BitmapText;
    private inFocus: boolean = false;

    private cursorIndex: number = -1;
    private clickedTimestamp: number;


    private overflowOffsetX: number = 0;
    private overflowOffsetY: number = 0;
    private dragIndexStart: number = 0;
    private dragIndexEnd: number = 0;
    private inDrag: boolean = false;

    private onFocusHandler: Function = () => {};
    private onBlurHandler: Function = () => {};
    private onChangeHandler: Function = () => {};

    constructor(font: string, styleOptions?: StyleOptionsParams) {
        super();
        const _defaultStyleOptions = { ...defaultStyleOptions() };
        if(styleOptions) {
            for(let key in styleOptions) {
                _defaultStyleOptions[key] = styleOptions[key];
            }
        }

        this.buttonMode = true;
        this.interactive = true;

        this.textSprite = new PIXI.extras.BitmapText('test', { font, align: "left" });

        this.cursor = "text";

        this.on('pointerdown', this.handleMouseDown.bind(this));
        //this.on('touchstart', this.handleMouseDown.bind(this));

        this.on('pointerup', this.handleMouseUp.bind(this));
    //    this.on('touchend', this.handleMouseUp.bind(this));

        this.on('pointermove', this.handleMouseMove.bind(this));
    //    this.on('touchmove', this.handleMouseMove.bind(this));
        this.on('pointerupoutside', this.handleMouseUp.bind(this));

        this.addChild(this.textbox);
        this.addChild(this.textSprite);
        this.addChild(this.cursorSprite);

        this.updateStyle(_defaultStyleOptions);

        this.checkForOutsideClick = this.checkForOutsideClick.bind(this);
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
            this.cursorSprite.visible = false;
            return;
        }

        const cursorX = this.getCursorXFromIndex(this.cursorIndex);
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
            this.cursorSprite.visible = false;
        } else {
            this.cursorSprite.visible = true;
        }
    }

    private redrawText() {
        const range = this.getSelectedRange();

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
        const width = type === 'pixel' ? value : totalWidth * (value/100);

        const range = this.getSelectedRange();
        if(range) {
            const unselectedRange1Width = Math.abs(0 - range.x.start);
            const unselectedRange2Width = Math.abs(range.x.end - width);
            const selectedRangeWidth = range.x.end - range.x.start;
            this.textbox.drawRect(0, 0, unselectedRange1Width, height);
            this.textbox.endFill();

            this.textbox.beginFill(this.styleOptions.highlightedBackgroundColor, 1);
            this.textbox.drawRect(unselectedRange1Width, 0, selectedRangeWidth, height);
            this.textbox.endFill();

            this.textbox.beginFill(this.styleOptions.backgroundColor, 1);
            this.textbox.drawRect(width - unselectedRange2Width, 0, unselectedRange2Width, height);
            this.textbox.endFill();

        } else {
            this.textbox.drawRect(0, 0, width, height);
            this.textbox.endFill();
        }
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
        return leftChar.x + leftChar.width + 1;
    }

    private getCursorIndexFromX(x) : number {
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


    private getSelectedRange() : {
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

    private charFromPosition(position) : { left?: string, right?: string } {
        return { left: null, right: null };
    }

    public addCharsAtIndex(start, chars) {
    }
    public removeCharsBetweenIndexes(start, finish) {
    }
    public leftClick(x, y) {
        this.inFocus = true;
    }
    public rightClick(x, y) {
    }
    public undo() {
    }
    public redo() {
    }
    public paste(){
    }
    public cut(){
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

    public focus() {
        if(!this.inFocus) {
            document.addEventListener('mousedown', this.checkForOutsideClick);
            this.inFocus = true;
            this.onFocusHandler();
        }
    }

    public blur() {
        if(this.inFocus) {
            document.removeEventListener('mousedown', this.checkForOutsideClick);
            this.inFocus = false;
            this.clearRange();
            this.redraw();
            this.onBlurHandler();
        }
    }

    private checkForOutsideClick(e) {
        if(e.timeStamp !== this.clickedTimestamp) {
            this.blur();
        }
    }
}
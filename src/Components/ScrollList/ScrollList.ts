import {parseLengthMeasurements} from "../../utils";
export type ScrollItemOptions = {
    container: PIXI.Container,
    onClick?: Function,
}


import { PixiElement } from "../../Element";
import { ValidMeasurement } from "../../types";

import { ScrollBar } from './ScrollBar';

export type ScrollStyleOptions = {
    width?: ValidMeasurement,
    height?: ValidMeasurement,
    backgroundColor: number,
    dividerColor: number,
    dividerPixelHeight: number,
    dividerPercentWidth: number,
    dividerTopPadding: number,
    dividerBottomPadding: number,
    borderOpacity: number,
    xPadding: number,
    yPadding: number,
    scrollBarWidth: number,
    scrollBarSide: "left" | "right"
}

export default class ScrollList extends PIXI.Container {
    private scrollStyleOptions: ScrollStyleOptions;
    private scrollItemsById: any = {};
    private options: Array<ScrollItemOptions> = [];
    private po: PIXI.Container = new PIXI.Container();

    private scrollBar: ScrollBar;
    private scrollbarScroll: PIXI.Graphics;

    private scrollMask: PIXI.Graphics;

    private _currentScroll: number = 0;
    private lastScroll: number = 0;
    private __width: number;
    private __height: number;

    private listContainer: PixiElement = new PixiElement();
    private listRect: PIXI.Graphics = new PIXI.Graphics();

    constructor(scrollStyleOptions: ScrollStyleOptions, scrollItemOptions: Array<ScrollItemOptions>) {
        super();
        this.__width = parseLengthMeasurements(scrollStyleOptions.width).value;
        this.__height = parseLengthMeasurements(scrollStyleOptions.width).value;
        this.scrollbarScroll = new PIXI.Graphics();
        this.scrollStyleOptions = scrollStyleOptions;
        this.scrollMask = new PIXI.Graphics();
        this.addChild(this.scrollMask);
    }

    private redraw() {
        this.scrollMask.clear();
        this.scrollMask
            .beginFill(0xFFFFFF)
            .drawRect(0, 0, this.__width, this.__height)
            .endFill();
        this.listRect
            .beginFill(this.scrollStyleOptions.backgroundColor)
            .drawRect(0, 0, this.__width, this.__height)
            .endFill();

        this.adjustOptions();
    }

    private adjustOptions() {
        this.po.y = -this.currentScroll;
        for(let i = 0; i < this.options.length; i++) {
            const canSeeFromTop = 25 + this.options[i].container.y + this.options[i].container.height > 0;
            const canSeeFromBottom = 25 + this.options[i].container.y < this.__height;
            this.options[i].container.visible = canSeeFromBottom || canSeeFromTop;
        }
    }

    set currentScroll(value) {
        this.lastScroll = this._currentScroll;
        this._currentScroll = value;
        if (this.scrollBar) {
            //  this.scrollBar.adjust(this._currentScroll);
        }
        this.adjustOptions();
    }

    get currentScroll() {
        return this._currentScroll;
    }

    public scrollUp(pixels: number) {
        this.currentScroll += pixels;
    }
    public scrollDown(pixels: number) {
        this.currentScroll -= pixels;
    }

    public addScrollItem(options: ScrollItemOptions) {
        this.po.addChild(options.container);
        return this.options.push(options)
    }

    public removeScrollItem(indexOrContainer) {
        let container;
        if (!isNaN(indexOrContainer)) {
            container = this.options[indexOrContainer].container;
        } else {
            container = indexOrContainer;
        }
        const foundOption = this.options.find(o => o.container === container);
        if (foundOption) {
            this.po.removeChild(foundOption.container);
            this.redraw();
        }
        return false;
    }

    public scroll(difference, func?) {
        if (func) {
        }

        for (let i = 0; i < this.options.length; i++) {

        }
    }
}

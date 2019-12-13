import {parseLengthMeasurements} from "../utils";
export type ScrollItemOptions = {
    container: PIXI.Container,
    onClick?: Function,
}

import { ValidMeasurement } from "../types";

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

    private scrollbarSprite: PIXI.Graphics;
    private scrollbarScroll: PIXI.Graphics;

    private scrollMask: PIXI.Graphics;

    private currentScroll: number = 0;

    private __width: number;
    private __height: number;

    constructor(scrollStyleOptions: ScrollStyleOptions, scrollItemOptions: Array<ScrollItemOptions>) {
        super();
        this.__width = parseLengthMeasurements(scrollStyleOptions.width).value;
        this.__height = parseLengthMeasurements(scrollStyleOptions.width).value;
        this.scrollbarScroll = new PIXI.Graphics();
        this.scrollbarSprite = new PIXI.Graphics();
        this.scrollStyleOptions = scrollStyleOptions;
        this.scrollMask = new PIXI.Graphics();
        this.scrollMask
            .beginFill(0xFFFFFF)
            .drawRect(0, 0, this.__width, this.__height)
            .endFill();

        this.addChild(this.scrollMask);
    }

    private reDrawScrollbar() {
    }
    private positionScroll() {
    }

    public addScrollItem(options: ScrollItemOptions) {
        this.addChild(options.container);
        return this.options.push(options)
    }

    public removeScrollItem(indexOrContainer) {
        let container;
        if(!isNaN(indexOrContainer)) {
            container = this.options[indexOrContainer].container;
        } else {
            container = indexOrContainer;
        }
        const foundOption = this.options.find(o => o.container === container);
        if(foundOption) {
            this.removeChild(foundOption.container);
            this.redraw();
        }
        return false;
    }

    public scroll(difference, func?) {
        if(func) {
        }

        for(let i = 0; i < this.options.length; i++) {

        }
    }

    public redraw() {
    }
}

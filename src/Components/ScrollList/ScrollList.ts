import {clamp, parseLengthMeasurements} from "../../utils";
export type ScrollItemOptions = {
    container: PIXI.Container,
    onClick?: Function,
}

const tweenFunctions = require('tween-functions');

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

export class ScrollList extends PIXI.Container {
    private scrollStyleOptions: ScrollStyleOptions;
    private scrollItemsById: any = {};
    private options: Array<PIXI.Container> = [];
    private po: PixiElement = new PixiElement();

    private scrollBar: ScrollBar;
    private scrollbarScroll: PIXI.Graphics;
    private scrollRect: PixiElement = new PixiElement();
    private scrollDuration: number = 0;

    private scrollMask: PIXI.Graphics;

    private _currentScroll: number = 0;
    private lastScroll: number = 0;
    private __width: number;
    private __height: number;

    private scrollCurrentDur: number = 0;

    private animationFrame: any = null;
    private nextItemY: number = 0;
    private scrollToDest: number = 0;
    private listContainer: PixiElement = new PixiElement();
    private listRect: PIXI.Graphics = new PIXI.Graphics();
    private scrollLength: number = 0;
    constructor(scrollStyleOptions: ScrollStyleOptions, scrollItemOptions: Array<ScrollItemOptions>) {
        super();
        this.interactive = true;
        this.interactiveChildren = true;
        this.__width = parseLengthMeasurements(scrollStyleOptions.width).value;
        this.__height = parseLengthMeasurements(scrollStyleOptions.height).value;
        this.scrollbarScroll = new PIXI.Graphics();
        this.scrollStyleOptions = scrollStyleOptions;
        this.scrollLength = 0;
        this.scrollMask = new PIXI.Graphics();
        this.scrollMask.beginFill(0xFFFFFF)
        this.scrollMask.drawRect(0, 0, this.__width, this.__height);
        this.scrollMask.endFill();

     //   this.scrollMask.hitArea = new PIXI.Rectangle(0, 0, this.__width, this.__height);

        this.addChild(this.scrollMask);
        this.addChild(this.po);
        this.po.mask = this.scrollMask;

        this.scrollRect.hitArea = new PIXI.Rectangle(0, 0, this.__width, this.__height);

        this.addChild(this.scrollRect);
        this.po.onSwipe(this.applySwipe.bind(this));
        this.po.onHeldDown(() => {
            if(this.animationFrame !== null) {
                cancelAnimationFrame(this.animationFrame);
                this.animationFrame = null;
            }
        }, 100);

        let lastScrollY;
        this.po.onDragStart(event => {
            this.scrollLength = 0;
            lastScrollY = event.data.global.y;
        });
        this.po.onDragMove(event => {
            const diff =  event.data.global.y - lastScrollY;
            lastScrollY = event.data.global.y;
            this.applyDrag(diff);
        });

       // this.po.mask = this.scrollMask;
        this.redraw();
    }

    private redraw() {
        /*
        this.scrollMask.clear();
        this.scrollMask
            .beginFill(0xFFFFFF)
            .drawRect(0, 0, this.__width, this.__height)
            .endFill();
         */
        /*
        this.listRect
            .beginFill(this.scrollStyleOptions.backgroundColor)
            .drawRect(0, 0, this.__width, this.__height)
            .endFill();

         */
        this.adjustOptions();
    }


    private repositionOptions() {
        let y = 0;
        for(let i = 0; i < this.options.length; i++) {
            this.options[i].y = y;
            y += this.options[i].height
        }
    }

    private adjustOptions() {
        this.po.y = -this.currentScroll;
        if(this.animationFrame === null) {
            for(let i = 0; i < this.options.length; i++) {
                const canSeeFromTop = 250 + this.options[i].y + this.options[i].height > 0;
                const canSeeFromBottom = 250 + this.options[i].y < this.__height;
                this.options[i].visible = canSeeFromBottom || canSeeFromTop;
            }
        }
    }

    private animateScroll(ts: number) {
        const now = Date.now();
        const delta = now - ts;
        this.scrollCurrentDur += delta;
        if(this.scrollCurrentDur >= this.scrollDuration) {
            this.animationFrame = null;
            this.currentScroll = this.scrollToDest;
            return null;
        }
        this.currentScroll = tweenFunctions.easeOutCubic(this.scrollCurrentDur, this.lastScroll, this.scrollToDest, this.scrollDuration);;
        return requestAnimationFrame(() => {
            if(this.animationFrame !== null) {
                this.animationFrame = this.animateScroll(now);
            }
        });
    }


    private applyDrag(difference) {
        this.lastScroll = this._currentScroll;
        this.scrollLength += difference;
        this.scrollCurrentDur += this.scrollDuration - this.scrollCurrentDur;
        // scroll height is less than total height.. no need to scroll anything.
        if(this.po.height <= this.__height) {
            return;
        }
        this.scrollToDest = this.scrollLength >= 0 ?
            Math.min(this.po.height - this.__height, this._currentScroll - difference) :
            Math.max(0, this._currentScroll - difference);

        this.scrollDuration = 1000;
        this.animationFrame = this.animateScroll(Date.now());
    }

    private applySwipe(power) {
        if(Math.abs(power) < 2) return;
        if(Math.abs(power) < 10) {
            power = power / 10;
        }
        this.lastScroll = this._currentScroll;
        this.scrollCurrentDur = 0;
        const diff = power * 100;
        // scroll height is less than total height.. no need to scroll anything.
        if(this.po.height <= this.__height) {
            return;
        }

        this.scrollToDest = power >= 0 ?
            Math.min(this.po.height - this.__height, this._currentScroll + diff) :
            Math.max(0, this._currentScroll + diff);

        this.scrollDuration = Math.abs(power) * 100
        this.animationFrame = this.animateScroll(Date.now());
    }

    set currentScroll(value) {
        this._currentScroll = value;
        if (this.scrollBar) {
            //  this.scrollBar.adjust(this._currentScroll);
        }
        this.adjustOptions();
    }

    get currentScroll() {
        return this._currentScroll;
    }

    public addScrollItems(containers: Array<PIXI.Container>) {
        containers.forEach(c => {
            this.po.addChild(c);
            return this.options.push(c);
        });
        this.repositionOptions();
        this.redraw();
    }
    public addScrollItem(container: PIXI.Container) {
        this.addScrollItems([container])
    }

    public removeScrollItem(indexOrContainer) {
        let container;
        if (!isNaN(indexOrContainer)) {
            container = this.options[indexOrContainer];
        } else {
            container = indexOrContainer;
        }
        const foundOption = this.options.find(o => o === container);
        if (foundOption) {
            this.po.removeChild(foundOption);
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

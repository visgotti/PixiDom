import { PixiElement } from '../../Element';
import {clamp, parseLengthMeasurements} from "../../utils";
import {ScrollList} from "./ScrollList";
export type SideScrollOptions = {
    width: number,
    height: number,
    color: number
}

export type ScrollerStyleOptions = {
    color: number,
    hoverColor: number,
    mouseDownColor: number,
}

export type ScrollBarStyleOptions = {
    width: number,
    height: number,
    backgroundColor: number,
    scrollerOptions: ScrollerStyleOptions
}

export class ScrollBar extends PixiElement {
    public scrolling : boolean = false;
    private scroller: Scroller;
    private bg: PIXI.Graphics;
    private options: ScrollBarStyleOptions;
    private _maxLength: number;
    private scrollStart : boolean;
    private scrollList : ScrollList;
    private returnedEarlyDuringScroll : boolean = false;
    constructor(scrollList: ScrollList, options: ScrollBarStyleOptions) {
        super();
        this.scrollList = scrollList;
        // @ts-ignore
        this.options = options || {};
        this.bg = new PIXI.Graphics();
        this.addChild(this.bg);
        this.scroller = new Scroller(this, options.scrollerOptions);
        this.addChild(this.scroller);
        this.scroller.y = 0;
        this.redraw();
        this.registerScrollerEvents();
        let heldDownInterval = 0;
    }
    public resizeScrollBar(parentTotalHeight: number, parentMaxHeight: number,) {
    }
    get visibleLength() {
        return this.scrollList.height;
    }
    get maxLength() {
        return this.scrollList.maxHeight;
    }
    public redraw() {
        this.bg.clear();
        this.bg.beginFill(this.options.backgroundColor || 0xf7f7f7);
        this.bg.drawRect(0, 0, this.options.width, this.visibleLength);
        this.scroller.redraw();
    }

    public setScrollPercent(n: number) {
        const utilizedSpaceForPercent = this.visibleLength - this.scroller.height;
        const y = utilizedSpaceForPercent * n;
        this.scroller.y = y;
    }

    private registerScrollerEvents() {
        let lastScrollY:any;
        this.onHeldDown((e) => {
            const mouseY = e.data.global.y -this.getGlobalPosition().y;
            let toY = -1;
            if(mouseY < this.scroller.y) {
                toY = mouseY;
            } else if (mouseY > this.scroller.y + this.scroller.height) {
                toY = mouseY - this.scroller.height
            }

            if(toY >= 0) {
                this.scroller.y = clamp(toY, 0, this.visibleLength-this.scroller.height);
                this.emitScroll();
            }
        }, 50);

        this.scroller.onDragStart(event => {
            this.returnedEarlyDuringScroll = false;
            this.scrolling = true;
            lastScrollY = event.data.global.y;
        });
        this.scroller.onDragEnd(event => {
            this.returnedEarlyDuringScroll = false;
            this.scrolling = false;
        });
        this.scroller.onDragMove(event => {
            event.stopPropagation();
            const movementY = event.data.originalEvent.movementY;
            const mouseY = event.data.global.y;
            const globalP = this.getGlobalPosition();
            const globalScrollY = this.scroller.y + globalP.y;
            if(this.returnedEarlyDuringScroll) {
                const padding = Math.min(this.scroller.height / 4, 30);
                if(mouseY+padding > globalScrollY + this.scroller.height || mouseY-padding < globalScrollY) {
                    return;
                }
            } else {
                if (mouseY > globalScrollY + this.scroller.height || mouseY < globalScrollY) {
                    this.returnedEarlyDuringScroll = true;
                    return;
                }
            }
            this.returnedEarlyDuringScroll = false;
            //if(Math.abs(mouseY - scrollerGlobalCenterY) > this.scroller.height/2) {

           // }
            this.scroller.y = clamp(this.scroller.y + movementY, 0, this.visibleLength-this.scroller.height);
            this.emitScroll();
        })
    }
    private emitScroll() {
        const utilizedSpaceForPercent = this.visibleLength - this.scroller.height;
        const percent = this.scroller.y / utilizedSpaceForPercent
        this.emit('scrolled', percent);
    }
}


class Scroller extends PixiElement {
    private rect: PIXI.Graphics;
    private curPercent: number;
    private scrollBar : ScrollBar;
    private styleObj : Partial<ScrollerStyleOptions>;
    constructor(scrollBar: ScrollBar, options?: ScrollerStyleOptions) {
        super();
        this.scrollBar = scrollBar;
        this.styleObj = options || {};
        this.rect = new PIXI.Graphics();
        this.addChild(this.rect);
    }
    private setStyle(o: ScrollBarStyleOptions) {
        this.redraw();
    }
    public redraw() {
        this.rect.clear();
        if(this.scrollBar.visibleLength >= this.scrollBar.maxLength) return;
        const length = Math.ceil(this.scrollBar.visibleLength / (this.scrollBar.maxLength / this.scrollBar.visibleLength));
        this.rect.beginFill('color' in this.styleObj ? this.styleObj.color : 0x000000);
        this.rect.drawRect(0, 0, this.scrollBar.width, length);
        this.rect.endFill();
    }
}
import { PixiElement } from '../../Element';
import {clamp} from "../../utils";
export type SideScrollOptions = {
    width: number,
    height: number,
    color: number
}

export class ScrollBar extends PixiElement {
    private scroller: Scroller;
    private bg: PIXI.Graphics;
    private options: any;
    constructor(options) {
        super();
        this.options = options;
        this.bg = new PIXI.Graphics();
        this.bg.beginFill(0xff00ff);
        this.bg.drawRect(0, 0, options.width, options.height);
        this.addChild(this.bg);
        this.scroller = new Scroller();
        this.addChild(this.scroller);
        this.scroller.y = 0;
        this.registerScrollerEvents();
    }

    private registerScrollerEvents() {
        let lastScrollY:any;

        let dontApplyUntilYGreater = null;
        let dontApplyUntilYLess = null;

        this.scroller.onDragStart(event => {
            lastScrollY = event.data.global.y;
        });
        this.scroller.onDragMove(event => {

            if(dontApplyUntilYGreater !== null && !(event.data.global.y >= dontApplyUntilYGreater)) {
                return;
            }
            if(dontApplyUntilYLess !== null && !(event.data.global.y <= dontApplyUntilYLess)) {
                return;
            }
            dontApplyUntilYGreater = null;
            dontApplyUntilYLess = null;
            const diff =  event.data.global.y - lastScrollY;
            lastScrollY = event.data.global.y;
            let newScroll = this.scroller.y + diff;
            this.scroller.y = clamp(newScroll, 0, this.options.height);
            if(this.scroller.y === 0) {
                dontApplyUntilYGreater = event.data.global.y;
                lastScrollY = this.y;
            } else if (this.scroller.y === this.options.height) {
                dontApplyUntilYLess = event.data.global.y;
                lastScrollY = this.y + this.options.height;
            }
            this.emit('scrolled', diff);
        })
    }
}


class Scroller extends PixiElement {
    private circ: PIXI.Graphics;
    constructor() {
        super();
        this.circ = new PIXI.Graphics();
        this.circ.beginFill(0x00ffff);
        this.circ.drawCircle(0, 0, 15);
        this.addChild(this.circ);
    }
}
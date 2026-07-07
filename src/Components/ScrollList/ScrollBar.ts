import { PixiElement } from '../../Element';
import {clamp} from "../../utils";
import { normalizeColor, type Color, type NormalizedColor } from "../../color";
import {ScrollList} from "./ScrollList";

/**
 * Options for side scroll buttons.
 */
export type SideScrollOptions = {
    /** Width of the scroll button */
    width: number,
    /** Height of the scroll button */
    height: number,
    /** Color of the scroll button. Accepts any {@link Color} format. */
    color: Color
}

/**
 * Styling options for the scroller thumb element.
 */
export type ScrollerStyleOptions = {
    /** Default color of the scroller. Accepts any {@link Color} format. */
    color: Color,
    /** Color when hovering over the scroller. Accepts any {@link Color} format. */
    hoverColor: Color,
    /** Color when the scroller is pressed. Accepts any {@link Color} format. */
    mouseDownColor: Color,
}

/**
 * Configuration options for the ScrollBar component.
 */
export type ScrollBarStyleOptions = {
    /** Width of the scrollbar */
    width: number,
    /** Height of the scrollbar (optional, auto-calculated) */
    height: number,
    /** Background color of the scrollbar track. Accepts any {@link Color} format. */
    backgroundColor: Color,
    /** Styling options for the scroller thumb */
    scrollerOptions: ScrollerStyleOptions
}

/**
 * Scrollbar component for the ScrollList.
 * Provides visual feedback and interactive scrolling via drag or click.
 * 
 * @extends PixiElement
 */
export class ScrollBar extends PixiElement {
    public scrolling : boolean = false;
    private scroller: Scroller;
    private bg: PIXI.Graphics;
    private options: ScrollBarStyleOptions;
    private resolvedBackgroundColor: NormalizedColor;
    private scrollList : ScrollList;
    constructor(scrollList: ScrollList, options: ScrollBarStyleOptions) {
        super();
        this.scrollList = scrollList;
        // @ts-ignore
        this.options = options || {};
        this.resolvedBackgroundColor = normalizeColor(this.options.backgroundColor ?? 0xf7f7f7);
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
        this.bg.beginFill(this.resolvedBackgroundColor.value, this.resolvedBackgroundColor.alpha);
        this.bg.drawRect(0, 0, this.options.width, this.visibleLength);
        this.scroller.redraw();
    }

    public setScrollPercent(n: number) {
        console.error('set', n)
        const utilizedSpaceForPercent = this.visibleLength - this.scroller.height;
        const y = utilizedSpaceForPercent * n;
        this.scroller.y = y;
    }

    private registerScrollerEvents() {
        this.onHeldDown((e: PIXI.FederatedPointerEvent) => {
            const mouseY = e.data.global.y -this.getGlobalPosition().y;
            let toY = -1;
            if(mouseY < this.scroller.y) {
                toY = mouseY;
            } else if (mouseY > this.scroller.y + this.scroller.height) {
                toY = mouseY - this.scroller.height
            }

            if(toY >= 0 && !this.scrolling) {
                this.scroller.y = clamp(toY, 0, this.visibleLength-this.scroller.height);
                this.emitScroll();
            }
        }, 50);

        // PixiElement attaches window-level pointermove on dragstart, so dragmove
        // continues firing when the cursor leaves the scroller. We just consume it.
        let startGlobalY = 0;
        let startScrollerY = 0;

        this.scroller.onDragStart((event: PIXI.FederatedPointerEvent) => {
            this.scrolling = true;
            startGlobalY = (event as any).global?.y ?? event.data?.global?.y ?? 0;
            startScrollerY = this.scroller.y;
        }, 0);
        this.scroller.onDragMove((event: PIXI.FederatedPointerEvent) => {
            event.stopPropagation();
            const gy = (event as any).global?.y ?? event.data?.global?.y ?? 0;
            const next = clamp(startScrollerY + (gy - startGlobalY), 0, this.visibleLength - this.scroller.height);
            if (next === this.scroller.y) return;
            this.scroller.y = next;
            this.emitScroll();
        });
        this.scroller.onDragEnd(() => {
            this.scrolling = false;
        });
    }

    private emitScroll() {
        const utilizedSpaceForPercent = this.visibleLength - this.scroller.height;
        const percent = this.scroller.y / utilizedSpaceForPercent
        this.emit('scrolled', percent);
    }
}


class Scroller extends PixiElement {
    private rect: PIXI.Graphics;
    private scrollBar : ScrollBar;
    private styleObj : Partial<ScrollerStyleOptions>;
    private resolvedColor: NormalizedColor;
    constructor(scrollBar: ScrollBar, options?: ScrollerStyleOptions) {
        super();
        this.scrollBar = scrollBar;
        this.styleObj = options || {};
        this.resolvedColor = 'color' in this.styleObj && this.styleObj.color !== undefined
            ? normalizeColor(this.styleObj.color)
            : normalizeColor(0x000000);
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
        this.rect.beginFill(this.resolvedColor.value, this.resolvedColor.alpha);
        this.rect.drawRect(0, 0, this.scrollBar.width, length);
        this.rect.endFill();
    }
}
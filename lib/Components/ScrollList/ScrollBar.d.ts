import { PixiElement } from '../../Element';
import { ScrollList } from "./ScrollList";
export type SideScrollOptions = {
    width: number;
    height: number;
    color: number;
};
export type ScrollerStyleOptions = {
    color: number;
    hoverColor: number;
    mouseDownColor: number;
};
export type ScrollBarStyleOptions = {
    width: number;
    height: number;
    backgroundColor: number;
    scrollerOptions: ScrollerStyleOptions;
};
export declare class ScrollBar extends PixiElement {
    scrolling: boolean;
    private scroller;
    private bg;
    private options;
    private scrollList;
    constructor(scrollList: ScrollList, options: ScrollBarStyleOptions);
    resizeScrollBar(parentTotalHeight: number, parentMaxHeight: number): void;
    get visibleLength(): number;
    get maxLength(): number;
    redraw(): void;
    setScrollPercent(n: number): void;
    private registerScrollerEvents;
    private emitScroll;
}

import { PixiElement } from '../../Element';
import { ScrollList } from "./ScrollList";
export declare type SideScrollOptions = {
    width: number;
    height: number;
    color: number;
};
export declare type ScrollerStyleOptions = {
    color: number;
    hoverColor: number;
    mouseDownColor: number;
};
export declare type ScrollBarStyleOptions = {
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
    readonly visibleLength: number;
    readonly maxLength: number;
    redraw(): void;
    setScrollPercent(n: number): void;
    private registerScrollerEvents;
    private emitScroll;
}

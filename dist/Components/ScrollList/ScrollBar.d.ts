import { PixiElement } from '../../Element';
import { Color } from '../../color';
import { ScrollList } from './ScrollList';
/**
 * Options for side scroll buttons.
 */
export type SideScrollOptions = {
    /** Width of the scroll button */
    width: number;
    /** Height of the scroll button */
    height: number;
    /** Color of the scroll button. Accepts any {@link Color} format. */
    color: Color;
};
/**
 * Styling options for the scroller thumb element.
 */
export type ScrollerStyleOptions = {
    /** Default color of the scroller. Accepts any {@link Color} format. */
    color: Color;
    /** Color when hovering over the scroller. Accepts any {@link Color} format. */
    hoverColor: Color;
    /** Color when the scroller is pressed. Accepts any {@link Color} format. */
    mouseDownColor: Color;
};
/**
 * Configuration options for the ScrollBar component.
 */
export type ScrollBarStyleOptions = {
    /** Width of the scrollbar */
    width: number;
    /** Height of the scrollbar (optional, auto-calculated) */
    height: number;
    /** Background color of the scrollbar track. Accepts any {@link Color} format. */
    backgroundColor: Color;
    /** Styling options for the scroller thumb */
    scrollerOptions: ScrollerStyleOptions;
};
/**
 * Scrollbar component for the ScrollList.
 * Provides visual feedback and interactive scrolling via drag or click.
 *
 * @extends PixiElement
 */
export declare class ScrollBar extends PixiElement {
    scrolling: boolean;
    private scroller;
    private bg;
    private options;
    private resolvedBackgroundColor;
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
//# sourceMappingURL=ScrollBar.d.ts.map
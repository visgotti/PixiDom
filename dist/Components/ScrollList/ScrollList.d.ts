import { Color } from '../../color';
import { ValidMeasurement } from '../../types';
import { ScrollBarStyleOptions } from './ScrollBar';
import { DestroyOptions } from 'pixi.js';
type ScrollChild = (PIXI.Container | PIXI.Sprite | PIXI.Graphics | PIXI.Text) & {
    just_added?: boolean;
};
/**
 * Configuration for individual scroll list items.
 */
export type ScrollItemOptions = {
    /** The PIXI container to display as the list item */
    container: PIXI.Container;
    /** Optional click handler for the item */
    onClick?: (event: PIXI.FederatedPointerEvent) => void;
};
/**
 * Styling options for the ScrollList component.
 */
export type ScrollStyleOptions = {
    /** Width of the scroll list (e.g., '300px') */
    width?: ValidMeasurement;
    /** Height of the scroll list (e.g., '400px') */
    height?: ValidMeasurement;
    /** Background color. Accepts any {@link Color} format. */
    backgroundColor?: Color;
    /** Color of item dividers. Accepts any {@link Color} format. */
    dividerColor?: Color;
    /** Height of dividers in pixels */
    dividerPixelHeight?: number;
    /** Width of dividers as percentage (0-100) */
    dividerPercentWidth?: number;
    /** Padding above dividers */
    dividerTopPadding?: number;
    /** Padding below dividers */
    dividerBottomPadding?: number;
    /** Border opacity (0-1) */
    borderOpacity?: number;
    /** Horizontal padding */
    xPadding?: number;
    /** Vertical padding */
    yPadding?: number;
    /** Optional scrollbar configuration */
    scrollBarOptions?: ScrollBarStyleOptions;
};
/**
 * Performance-related options for ScrollList.
 */
export type ScrolllPerformanceOptions = {
    /** Disable mouse wheel scrolling */
    disableScrollWheelScroll: boolean;
    /** Disable touch/drag scrolling */
    disableTouchScroll: boolean;
    /** Buffer in pixels for virtualization visibility */
    visibilityBuffer: number;
    /** Time in ms between visibility adjustments */
    adjustVisibilityTime: number;
};
/**
 * Virtualized scrollable list component with optional scrollbar support.
 * Supports touch scrolling, mouse wheel, and swipe gestures with momentum.
 *
 * @example
 * ```typescript
 * import { ScrollList } from 'pixidom.js';
 *
 * const items = Array.from({ length: 100 }, (_, i) => {
 *   const container = new PIXI.Container();
 *   const text = new PIXI.Text(`Item ${i + 1}`);
 *   container.addChild(text);
 *   return { container };
 * });
 *
 * const scrollList = new ScrollList(
 *   {
 *     width: '300px',
 *     height: '400px',
 *     backgroundColor: 0x1a1f26,
 *     dividerColor: 0x30363d,
 *     dividerPixelHeight: 1,
 *     scrollBarOptions: {
 *       width: 8,
 *       scrollerColor: 0x4a90d9,
 *     },
 *   },
 *   items
 * );
 *
 * stage.addChild(scrollList);
 * ```
 *
 * @extends PIXI.Container
 */
export declare class ScrollList extends PIXI.Container {
    private scrollStyleOptions;
    private resolvedBackgroundColor;
    private po;
    private scrollBar?;
    private scrollRect;
    private scrollDuration;
    private scrollMask;
    private _currentScroll;
    private lastScroll;
    private __width;
    private __height;
    private pointerdownStart;
    private startingVisibleChildIndex;
    private endingVisibleChildIndex;
    private scrollCurrentDur;
    private currentAdjustVisibilityDelta;
    private animationFrame;
    private nextItemY;
    private scrollToDest;
    private listContainer;
    private backgroundRect;
    private scrollLength;
    private adjustedIndex;
    maxHeight: number;
    freezeScroll: boolean;
    private tweenFunc?;
    private options;
    private _needsUpdateScoller;
    private _registeredScrollEvent;
    readonly performanceOptions: ScrolllPerformanceOptions;
    constructor(scrollStyleOptions: ScrollStyleOptions, scrollItemOptions: Array<ScrollItemOptions>, scrollPerformanceOptions?: ScrolllPerformanceOptions);
    private handleScrollWheelScroll;
    destroy(options?: DestroyOptions | boolean): void;
    get utilizedLength(): number;
    get scrollPercent(): number;
    private registerScrollEvents;
    setScrollPercent(n: number): void;
    private findVisible;
    freeze(): void;
    unfreeze(): void;
    toggleFreezeScroll(freeze: boolean): void;
    private _containsPoint;
    resize(w: number, h: number): void;
    private redraw;
    private repositionOptions;
    private adjustVisibility;
    private adjustOptions;
    private animateScroll;
    private applyDrag;
    private applySwipe;
    set currentScroll(value: number);
    get currentScroll(): number;
    addScrollItems(containers: Array<PIXI.Container | PIXI.Sprite | PIXI.Graphics | PIXI.Text>): void;
    addScrollItem(container: PIXI.Container | PIXI.Sprite | PIXI.Graphics | PIXI.Text): void;
    private recalculateHeight;
    spliceScrollItems(fromIndex: number, toIndex?: number, destroyItem?: boolean): void;
    removeScrollItems(indexOrContainer: number | ScrollChild | Array<number | ScrollChild>, destroyItem?: boolean): boolean;
    private recurseChildren;
}
export {};
//# sourceMappingURL=ScrollList.d.ts.map
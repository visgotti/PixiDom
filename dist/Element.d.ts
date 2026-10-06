/**
 * Base class for interactive UI elements in PixiDom.
 * Extends PIXI.Container to provide comprehensive event handling including
 * mouse events, drag-and-drop, swipe gestures, and hold detection.
 *
 * @example
 * ```typescript
 * const element = new PixiElement();
 * element.onClick((event) => console.log('Clicked!'));
 * element.onDragStart((event) => console.log('Drag started'));
 * element.onSwipe((power) => console.log('Swipe power:', power));
 * stage.addChild(element);
 * ```
 *
 * @extends PIXI.Container
 */
export type PixiEventHandler = (event: PIXI.FederatedPointerEvent) => void;
export type SwipePowerHandler = (power: number) => void;
export declare class PixiElement extends PIXI.Container {
    /** Indicates whether the mouse/pointer is currently over this element */
    isMouseOver: boolean;
    private elements;
    /** Indicates whether the element is currently being dragged */
    inDrag: boolean;
    private pointerIsDown;
    private userHandlers;
    private internalHandlers;
    private _swipeupHandler;
    private _swipedownHandler;
    private _swipeHandler;
    private doubleClickTimeout;
    private completedTriggerTimeout;
    private holdDragTriggerTime;
    private holdDragTriggerTimeout;
    private helddownCountHandlers;
    private helddownTimeouts;
    private ifDragEndEmitSwipeDistance;
    private swipeStartY;
    private swipeStartTs;
    private swipeEndY;
    private startDragY;
    private lastDragCheckTs;
    private curDragSwiperCheckIterationDuration;
    private curDragSwipePowerIterationQueue;
    private lastDragDistance;
    private lastDragY;
    private dragDistanceY;
    /** Maximum time in milliseconds for a gesture to be considered a swipe */
    maxSwipeTimeout: number;
    /** Minimum distance in pixels for a gesture to be considered a swipe */
    minSwipeDistance: number;
    private hasSwipeHandler;
    private missedDiffs;
    private dragWindowMoveHandler;
    private dragWindowUpHandler;
    /**
     * When true (default), each window-level dragmove recomputes the canvas rect
     * and renderer scale via `getBoundingClientRect()`. This makes drags survive
     * mid-drag canvas resizes, DPR/monitor changes, and CSS-zoom animations
     * without the cursor and element drifting apart.
     *
     * Set to false to skip the per-move rect lookup (cache scale once at dragstart).
     * Saves a couple `getBoundingClientRect()` calls per pointermove — measurable
     * only at very high move rates or with thousands of concurrent draggables.
     */
    static recomputeDragScalePerMove: boolean;
    /**
     * Creates a new PixiElement instance.
     * Automatically sets up pointer over/out tracking.
     */
    constructor();
    set pointerdownHandler(handler: PixiEventHandler);
    set pointerupHandler(handler: PixiEventHandler);
    set pointerupoutsideHandler(handler: PixiEventHandler);
    set pointeroverHandler(handler: PixiEventHandler);
    set pointermoveHandler(handler: PixiEventHandler);
    set pointeroutHandler(handler: PixiEventHandler);
    set pointertapHandler(handler: PixiEventHandler);
    set doubleclickHandler(handler: PixiEventHandler);
    set dragstartHandler(handler: PixiEventHandler);
    set dragendHandler(handler: PixiEventHandler);
    set dragmoveHandler(handler: PixiEventHandler);
    private _setHeldDownHandler;
    private _setEventNameHandler;
    /**
     * Centers this element horizontally within its parent container.
     */
    centerX(): void;
    /**
     * Centers this element vertically within its parent container.
     */
    centerY(): void;
    /**
     * Centers this element both horizontally and vertically within its parent container.
     */
    center(): void;
    /**
     * Adds an element to the internal elements array.
     * @param element - The element to add
     * @throws Error if the element is not an instance of Element
     */
    addElement(element: PixiElement): void;
    /**
     * Removes an element from the internal elements array.
     * @param element - The element to remove
     */
    removeElement(element: PixiElement): void;
    /** Registers a handler for pointer down (mouse down / touch start) events. */
    onMouseDown(handler: PixiEventHandler): void;
    /** Registers a handler for pointer up (mouse up / touch end) events. */
    onMouseUp(handler: PixiEventHandler): void;
    /** Registers a handler for pointer up outside events. */
    onMouseUpOutside(handler: PixiEventHandler): void;
    /** Registers a handler for pointer over (mouse enter) events. */
    onMouseOver(handler: PixiEventHandler): void;
    /** Registers a handler for pointer out (mouse leave) events. */
    onMouseOut(handler: PixiEventHandler): void;
    /** Registers a handler for pointer move events. */
    onMouseMove(handler: PixiEventHandler): void;
    /** Registers a handler for click/tap events. */
    onClick(handler: PixiEventHandler): void;
    /**
     * Registers a handler that fires after the element has been held down for a specified duration.
     */
    onHeldDown(handler: PixiEventHandler, timeout: number): void;
    /**
     * Registers a handler for drag start events.
     * @param hold - Optional time in milliseconds the pointer must be held before triggering drag
     */
    onDragStart(handler: PixiEventHandler, hold?: number): void;
    /** Registers a handler for drag end events. */
    onDragEnd(handler: PixiEventHandler): void;
    /** Registers a handler for drag move events. */
    onDragMove(handler: PixiEventHandler): void;
    /** Registers a handler for double-click events. */
    onDoubleClick(handler: PixiEventHandler): void;
    /**
     * Registers a handler for swipe gestures in any direction.
     * @param handler - Callback function to execute on swipe, receives swipe power as parameter
     */
    onSwipe(handler: SwipePowerHandler): void;
    /** Registers a handler for upward swipe gestures. */
    onSwipeUp(handler: SwipePowerHandler): void;
    /** Registers a handler for downward swipe gestures. */
    onSwipeDown(handler: SwipePowerHandler): void;
    private __doubleclick;
    private clearHelddownTimeouts;
    private registerDefaultIfNeeded;
    private __pointerdown;
    private __pointertap;
    private __dragstart;
    /**
     * Track pointer movement at the window level so dragmove keeps firing when the cursor
     * leaves this element's bounding box. PIXI's element-level pointermove only fires while
     * the cursor is over the hit area, which causes drags to stall on fast movements.
     */
    private attachDragWindowListeners;
    private cleanupDragWindowListeners;
    private __dragmove;
    private resetDragSwipeVars;
    private __dragend;
    private __pointermove;
    private __pointerover;
    private __pointerout;
    private handleSwipeFinish;
    private __pointerupoutside;
    private __pointerup;
    private clearDragTimeouts;
    private repositionSelf;
    repositionChildren(): void;
    destroy(options?: Parameters<PIXI.Container['destroy']>[0]): void;
}
//# sourceMappingURL=Element.d.ts.map
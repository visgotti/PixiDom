import {
    clientToStageCoords,
    findCanvasFromEvent,
    findRendererForCanvas,
    getRendererPointerScale,
} from './pixi-adapter-utils';

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

const POINTER_EVENT_NAMES = [
    'pointerdown',
    'pointermove',
    'pointerup',
    'pointerupoutside',
    'pointerover',
    'pointerout',
    'pointertap',
] as const;
type PointerEventName = (typeof POINTER_EVENT_NAMES)[number];
type DragEventName = 'dragstart' | 'dragend' | 'dragmove';
type ElementEventName = PointerEventName | DragEventName | 'doubleclick';

type TimeoutHandle = ReturnType<typeof setTimeout>;

const eventGlobalY = (event: PIXI.FederatedPointerEvent): number => {
    if (event.global) return event.global.y;
    if (event.data?.global) return event.data.global.y;
    return 0;
};

export class PixiElement extends PIXI.Container {
    /** Indicates whether the mouse/pointer is currently over this element */
    public isMouseOver: boolean = false;
    private elements: Array<Element> = [];
    /** Indicates whether the element is currently being dragged */
    public inDrag: boolean = false;
    private pointerIsDown: boolean = false;

    private userHandlers: Partial<Record<ElementEventName, PixiEventHandler>> = {};
    private internalHandlers: Partial<Record<ElementEventName, PixiEventHandler>> = {};

    private _swipeupHandler: SwipePowerHandler | null = null;
    private _swipedownHandler: SwipePowerHandler | null = null;
    private _swipeHandler: SwipePowerHandler | null = null;

    private doubleClickTimeout: TimeoutHandle | null = null;

    private completedTriggerTimeout: boolean = false;
    private holdDragTriggerTime: number = 30;
    private holdDragTriggerTimeout: TimeoutHandle | null = null;

    private helddownCountHandlers: Record<number, PixiEventHandler> = {};
    private helddownTimeouts: Array<TimeoutHandle> = [];

    private ifDragEndEmitSwipeDistance: number = 0;

    private swipeStartY: number = 0;
    private swipeStartTs: number = 0;
    private swipeEndY: number = 0;

    private startDragY: number = 0;
    private lastDragCheckTs: number = 0;
    private curDragSwiperCheckIterationDuration: number = 0;
    private curDragSwipePowerIterationQueue: Array<number> = [];
    private lastDragDistance: number = 0;

    private lastDragY: number = 0;
    private dragDistanceY: number = 0;

    /** Maximum time in milliseconds for a gesture to be considered a swipe */
    public maxSwipeTimeout: number = 300;
    /** Minimum distance in pixels for a gesture to be considered a swipe */
    public minSwipeDistance: number = 200;

    private hasSwipeHandler: boolean = false;
    private missedDiffs: number = 0;

    private dragWindowMoveHandler: ((ev: PointerEvent) => void) | null = null;
    private dragWindowUpHandler: ((ev: PointerEvent) => void) | null = null;

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
    public static recomputeDragScalePerMove: boolean = true;

    /**
     * Creates a new PixiElement instance.
     * Automatically sets up pointer over/out tracking.
     */
    constructor() {
        super();

        // Pre-bind internal dispatchers so we can attach/detach by reference.
        this.internalHandlers.pointerdown = (e) => this.__pointerdown(e);
        this.internalHandlers.pointermove = (e) => this.__pointermove(e);
        this.internalHandlers.pointerup = (e) => this.__pointerup(e);
        this.internalHandlers.pointerupoutside = (e) => this.__pointerupoutside(e);
        this.internalHandlers.pointerover = (e) => this.__pointerover(e);
        this.internalHandlers.pointerout = (e) => this.__pointerout(e);
        this.internalHandlers.pointertap = (e) => this.__pointertap(e);
        this.internalHandlers.doubleclick = (e) => this.__doubleclick(e);
        this.internalHandlers.dragstart = (e) => this.__dragstart(e);
        this.internalHandlers.dragend = (e) => this.__dragend(e);
        this.internalHandlers.dragmove = (e) => this.__dragmove(e);

        this.on('pointerover', () => {
            this.isMouseOver = true;
        });
        this.on('pointerout', () => {
            this.isMouseOver = false;
        });
    }

    set pointerdownHandler(handler: PixiEventHandler) { this._setEventNameHandler('pointerdown', handler); }
    set pointerupHandler(handler: PixiEventHandler) { this._setEventNameHandler('pointerup', handler); }
    set pointerupoutsideHandler(handler: PixiEventHandler) { this._setEventNameHandler('pointerupoutside', handler); }
    set pointeroverHandler(handler: PixiEventHandler) { this._setEventNameHandler('pointerover', handler); }
    set pointermoveHandler(handler: PixiEventHandler) { this._setEventNameHandler('pointermove', handler); }
    set pointeroutHandler(handler: PixiEventHandler) { this._setEventNameHandler('pointerout', handler); }
    set pointertapHandler(handler: PixiEventHandler) { this._setEventNameHandler('pointertap', handler); }

    set doubleclickHandler(handler: PixiEventHandler) { this._setEventNameHandler('doubleclick', handler); }
    set dragstartHandler(handler: PixiEventHandler) { this._setEventNameHandler('dragstart', handler); }
    set dragendHandler(handler: PixiEventHandler) { this._setEventNameHandler('dragend', handler); }
    set dragmoveHandler(handler: PixiEventHandler) { this._setEventNameHandler('dragmove', handler); }

    private _setHeldDownHandler(handler: PixiEventHandler, timeout: number) {
        if (this.helddownCountHandlers[timeout]) {
            console.warn('already had held down timeout for duration at', timeout, 'this will override it.');
        }
        this.helddownCountHandlers[timeout] = handler;
    }

    private _setEventNameHandler(eventName: ElementEventName, handler: PixiEventHandler) {
        const hadUserHandler = !!this.userHandlers[eventName];
        // register internal dispatcher if we never had a user defined one
        if (!hadUserHandler) {
            const internal = this.internalHandlers[eventName];
            if (internal) this.on(eventName, internal);
        }
        this.userHandlers[eventName] = handler;

        // if button mode wasnt enabled yet, we now do so.
        if (!this.buttonMode) {
            this.buttonMode = true;
            this.interactive = true;
        }
    }

    /**
     * Centers this element horizontally within its parent container.
     */
    public centerX() {
        if (this.parent) {
            this.x = this.parent.width / 2 - this.width / 2;
        }
    }

    /**
     * Centers this element vertically within its parent container.
     */
    public centerY() {
        if (this.parent) {
            this.y = this.parent.height / 2 - this.height / 2;
        }
    }

    /**
     * Centers this element both horizontally and vertically within its parent container.
     */
    public center() {
        this.centerX();
        this.centerY();
    }

    /**
     * Adds an element to the internal elements array.
     * @param element - The element to add
     * @throws Error if the element is not an instance of Element
     */
    public addElement(element: Element) {
        if (!(element instanceof Element)) {
            throw new Error('addElement called with a non element object');
        }
        this.elements.push(element);
    }

    /**
     * Removes an element from the internal elements array.
     * @param element - The element to remove
     */
    public removeElement(element: Element) {
        this.elements = this.elements.filter((e) => e !== element);
    }

    /** Registers a handler for pointer down (mouse down / touch start) events. */
    public onMouseDown(handler: PixiEventHandler) { this.pointerdownHandler = handler; }

    /** Registers a handler for pointer up (mouse up / touch end) events. */
    public onMouseUp(handler: PixiEventHandler) { this.pointerupHandler = handler; }

    /** Registers a handler for pointer up outside events. */
    public onMouseUpOutside(handler: PixiEventHandler) { this.pointerupoutsideHandler = handler; }

    /** Registers a handler for pointer over (mouse enter) events. */
    public onMouseOver(handler: PixiEventHandler) { this.pointeroverHandler = handler; }

    /** Registers a handler for pointer out (mouse leave) events. */
    public onMouseOut(handler: PixiEventHandler) { this.pointeroutHandler = handler; }

    /** Registers a handler for pointer move events. */
    public onMouseMove(handler: PixiEventHandler) { this.pointermoveHandler = handler; }

    /** Registers a handler for click/tap events. */
    public onClick(handler: PixiEventHandler) { this.pointertapHandler = handler; }

    /**
     * Registers a handler that fires after the element has been held down for a specified duration.
     */
    public onHeldDown(handler: PixiEventHandler, timeout: number) {
        if (!this.userHandlers.pointerdown) this.onMouseDown(() => {});
        this._setHeldDownHandler(handler, timeout);
    }

    /**
     * Registers a handler for drag start events.
     * @param hold - Optional time in milliseconds the pointer must be held before triggering drag
     */
    public onDragStart(handler: PixiEventHandler, hold?: number) {
        if (typeof hold === 'number' && !isNaN(hold)) {
            this.holdDragTriggerTime = hold;
        }
        this.registerDefaultIfNeeded('pointerdown');
        this.registerDefaultIfNeeded('pointerup');
        this.registerDefaultIfNeeded('pointerupoutside');
        this.registerDefaultIfNeeded('pointerout');
        this.dragstartHandler = handler;
    }

    /** Registers a handler for drag end events. */
    public onDragEnd(handler: PixiEventHandler) {
        this.registerDefaultIfNeeded('pointerup');
        this.registerDefaultIfNeeded('pointerupoutside');
        this.dragendHandler = handler;
    }

    /** Registers a handler for drag move events. */
    public onDragMove(handler: PixiEventHandler) {
        if (!this.userHandlers.dragstart) this.onDragStart(() => {}, this.holdDragTriggerTime);
        if (!this.userHandlers.dragend) this.onDragEnd(() => {});
        this.registerDefaultIfNeeded('pointermove');
        this.dragmoveHandler = handler;
    }

    /** Registers a handler for double-click events. */
    public onDoubleClick(handler: PixiEventHandler) {
        this.registerDefaultIfNeeded('pointerdown');
        this.doubleclickHandler = handler;
    }

    /**
     * Registers a handler for swipe gestures in any direction.
     * @param handler - Callback function to execute on swipe, receives swipe power as parameter
     */
    public onSwipe(handler: SwipePowerHandler) {
        this.hasSwipeHandler = true;
        this.registerDefaultIfNeeded('pointerdown');
        this.registerDefaultIfNeeded('pointerup');
        this.registerDefaultIfNeeded('pointerupoutside');
        if (!this.userHandlers.dragmove) {
            this.onDragMove(() => {});
        }
        this._swipeHandler = handler;
    }

    /** Registers a handler for upward swipe gestures. */
    public onSwipeUp(handler: SwipePowerHandler) {
        this.hasSwipeHandler = true;
        this.registerDefaultIfNeeded('pointerdown');
        this.registerDefaultIfNeeded('pointerup');
        this.registerDefaultIfNeeded('pointerupoutside');
        this._swipeupHandler = handler;
    }

    /** Registers a handler for downward swipe gestures. */
    public onSwipeDown(handler: SwipePowerHandler) {
        this.hasSwipeHandler = true;
        this.registerDefaultIfNeeded('pointerdown');
        this.registerDefaultIfNeeded('pointerup');
        this.registerDefaultIfNeeded('pointerupoutside');
        this._swipedownHandler = handler;
    }

    private __doubleclick(event: PIXI.FederatedPointerEvent) {
        if (this.doubleClickTimeout !== null) clearTimeout(this.doubleClickTimeout);
        this.doubleClickTimeout = null;
        this.userHandlers.doubleclick?.(event);
    }

    private clearHelddownTimeouts() {
        this.helddownTimeouts.forEach((t) => clearTimeout(t));
        this.helddownTimeouts.length = 0;
    }

    private registerDefaultIfNeeded(eventName: ElementEventName) {
        if (!this.userHandlers[eventName]) {
            this._setEventNameHandler(eventName, () => {});
        }
    }

    private __pointerdown(event: PIXI.FederatedPointerEvent) {
        Object.keys(this.helddownCountHandlers).forEach((time) => {
            this.helddownTimeouts.push(
                setTimeout(() => {
                    this.helddownCountHandlers[Number(time)]?.(event);
                }, parseInt(time, 10)),
            );
        });

        this.pointerIsDown = true;
        this.userHandlers.pointerdown?.(event);

        this.swipeStartTs = Date.now();
        this.swipeStartY = eventGlobalY(event);

        if (this.userHandlers.dragstart && !this.inDrag) {
            this.holdDragTriggerTimeout = setTimeout(() => {
                this.completedTriggerTimeout = true;
                this.holdDragTriggerTimeout = null;
            }, this.holdDragTriggerTime);
        }

        if (this.doubleClickTimeout) {
            this.emit('doubleclick', event);
        } else {
            this.doubleClickTimeout = setTimeout(() => {
                this.doubleClickTimeout = null;
            }, 300);
        }
    }

    private __pointertap(event: PIXI.FederatedPointerEvent) {
        this.userHandlers.pointertap?.(event);
    }

    private __dragstart(event: PIXI.FederatedPointerEvent) {
        this.inDrag = true;
        const y = eventGlobalY(event);
        this.startDragY = y;
        this.lastDragY = y;
        this.lastDragCheckTs = Date.now();
        this.userHandlers.dragstart?.(event);
        this.attachDragWindowListeners(event);
    }

    /**
     * Track pointer movement at the window level so dragmove keeps firing when the cursor
     * leaves this element's bounding box. PIXI's element-level pointermove only fires while
     * the cursor is over the hit area, which causes drags to stall on fast movements.
     */
    private attachDragWindowListeners(event: PIXI.FederatedPointerEvent) {
        const startGlobal = (event as any).global ?? event.data?.global ?? { x: 0, y: 0 };
        const native = ((event as any).nativeEvent ?? event.data?.originalEvent) as PointerEvent | undefined;
        if (!native || typeof native.clientX !== 'number') return;
        const startClientX = native.clientX;
        const startClientY = native.clientY;
        const startGX = startGlobal.x;
        const startGY = startGlobal.y;

        // PIXI globals are in stage pixels; clientX/Y are in CSS pixels. On a
        // CSS-scaled or high-DPI canvas the two differ by the renderer's pointer
        // scale. With `recomputeDragScalePerMove` (default), each move re-derives
        // the cursor's stage position from the canvas's current rect — robust
        // against resizes, DPR changes, and zoom animations mid-drag. Otherwise
        // the scale is captured once at dragstart for slightly cheaper moves.
        const canvas = findCanvasFromEvent(native);
        const renderer = findRendererForCanvas(canvas);
        const cachedScale = renderer ? getRendererPointerScale(renderer) : { x: 1, y: 1 };

        this.dragWindowMoveHandler = (ev: PointerEvent) => {
            if (!this.inDrag) return;
            let gx: number;
            let gy: number;
            if (PixiElement.recomputeDragScalePerMove && renderer) {
                const stage = clientToStageCoords(ev.clientX, ev.clientY, renderer);
                gx = stage.x;
                gy = stage.y;
            } else {
                gx = startGX + (ev.clientX - startClientX) * cachedScale.x;
                gy = startGY + (ev.clientY - startClientY) * cachedScale.y;
            }
            const synthetic = {
                data: { global: { x: gx, y: gy }, originalEvent: ev },
                global: { x: gx, y: gy },
                client: { x: ev.clientX, y: ev.clientY },
                clientX: ev.clientX,
                clientY: ev.clientY,
                nativeEvent: ev,
                stopPropagation() {},
                preventDefault() {},
            } as unknown as PIXI.FederatedPointerEvent;
            this.emit('dragmove', synthetic);
        };

        this.dragWindowUpHandler = () => this.cleanupDragWindowListeners();

        window.addEventListener('pointermove', this.dragWindowMoveHandler);
        window.addEventListener('pointerup', this.dragWindowUpHandler);
        window.addEventListener('pointercancel', this.dragWindowUpHandler);
    }

    private cleanupDragWindowListeners() {
        if (this.dragWindowMoveHandler) {
            window.removeEventListener('pointermove', this.dragWindowMoveHandler);
            this.dragWindowMoveHandler = null;
        }
        if (this.dragWindowUpHandler) {
            window.removeEventListener('pointerup', this.dragWindowUpHandler);
            window.removeEventListener('pointercancel', this.dragWindowUpHandler);
            this.dragWindowUpHandler = null;
        }
    }

    private __dragmove(event: PIXI.FederatedPointerEvent) {
        this.userHandlers.dragmove?.(event);
        if (this.hasSwipeHandler) {
            const now = Date.now();
            const delta = now - this.lastDragCheckTs;
            this.lastDragCheckTs = now;

            this.curDragSwiperCheckIterationDuration += delta;

            const currentDragY = eventGlobalY(event);
            const diff = this.lastDragY - currentDragY;
            this.lastDragY = currentDragY;
            if (Math.abs(diff) < 7) {
                this.missedDiffs++;
            } else {
                this.missedDiffs = 0;
            }
            if (this.missedDiffs < 2) {
                if (Math.sign(this.ifDragEndEmitSwipeDistance) !== Math.sign(diff)) {
                    this.swipeStartY = currentDragY;
                    this.resetDragSwipeVars();
                }
                if (this.curDragSwiperCheckIterationDuration >= this.maxSwipeTimeout) {
                    if (this.curDragSwipePowerIterationQueue.length) {
                        this.ifDragEndEmitSwipeDistance -= this.curDragSwipePowerIterationQueue.shift() ?? 0;
                    }
                    this.curDragSwipePowerIterationQueue.push(diff);
                    this.ifDragEndEmitSwipeDistance += diff;
                } else {
                    this.ifDragEndEmitSwipeDistance += diff;
                    this.curDragSwipePowerIterationQueue.push(diff);
                }
            } else {
                this.resetDragSwipeVars();
            }
        }
    }

    private resetDragSwipeVars() {
        this.curDragSwipePowerIterationQueue.length = 0;
        this.ifDragEndEmitSwipeDistance = 0;
        this.curDragSwiperCheckIterationDuration = 0;
    }

    private __dragend(event: PIXI.FederatedPointerEvent) {
        this.cleanupDragWindowListeners();
        this.inDrag = false;
        this.userHandlers.dragend?.(event);

        if (this.hasSwipeHandler) {
            const sign = Math.sign(this.ifDragEndEmitSwipeDistance);
            if (sign) {
                const dur = Math.max(10, this.curDragSwiperCheckIterationDuration);
                const timeDiff = Math.min(this.maxSwipeTimeout, dur);
                const power = (this.ifDragEndEmitSwipeDistance / (timeDiff + 100 / 15)) * 10;
                if (sign > 0 && this._swipedownHandler) {
                    this._swipedownHandler(this.ifDragEndEmitSwipeDistance);
                } else if (this._swipeupHandler) {
                    this._swipeupHandler(this.ifDragEndEmitSwipeDistance);
                }
                this._swipeHandler?.(power);
            }
            this.resetDragSwipeVars();
        }
        this.ifDragEndEmitSwipeDistance = 0;
    }

    private __pointermove(event: PIXI.FederatedPointerEvent) {
        if (this.pointerIsDown && !this.inDrag && this.completedTriggerTimeout) {
            this.emit('dragstart', event);
        } else if (this.inDrag && this.userHandlers.dragmove && !this.dragWindowMoveHandler) {
            // When window-level tracking is active, dragmove is dispatched from there
            // to avoid double-counting moves while the cursor is over this element.
            this.emit('dragmove', event);
        }
        this.userHandlers.pointermove?.(event);
    }

    private __pointerover(event: PIXI.FederatedPointerEvent) { this.userHandlers.pointerover?.(event); }

    private __pointerout(event: PIXI.FederatedPointerEvent) {
        if (!this.pointerIsDown) {
            this.clearHelddownTimeouts();
            this.clearDragTimeouts();
        }
        this.userHandlers.pointerout?.(event);
    }

    private handleSwipeFinish(finishY: number) {
        if (this.hasSwipeHandler) {
            const yDiff = this.swipeStartY - finishY;
            const timeDiff = Math.max(Date.now() - this.swipeStartTs, 1);
            if (timeDiff < this.maxSwipeTimeout && Math.abs(yDiff) > this.minSwipeDistance) {
                const power = (yDiff / (timeDiff + 100 / 15)) * 10;
                if (Math.abs(power) > 10) {
                    const handler = yDiff > 0 ? this._swipeupHandler : this._swipedownHandler;
                    handler?.(power);
                    this._swipeHandler?.(power);
                }
            }
        }
    }

    private __pointerupoutside(event: PIXI.FederatedPointerEvent) {
        this.clearHelddownTimeouts();
        this.clearDragTimeouts();
        this.handleSwipeFinish(eventGlobalY(event));
        this.pointerIsDown = false;
        this.userHandlers.pointerupoutside?.(event);
        if (this.inDrag) this.emit('dragend', event);
    }

    private __pointerup(event: PIXI.FederatedPointerEvent) {
        this.clearHelddownTimeouts();
        this.clearDragTimeouts();
        this.handleSwipeFinish(eventGlobalY(event));
        this.pointerIsDown = false;
        this.userHandlers.pointerup?.(event);
        if (this.inDrag) this.emit('dragend', event);
    }

    private clearDragTimeouts() {
        this.completedTriggerTimeout = false;
        if (this.holdDragTriggerTimeout !== null) {
            clearTimeout(this.holdDragTriggerTimeout);
            this.holdDragTriggerTimeout = null;
        }
    }

    private repositionSelf() {
        if (this.parent) {
            // reserved
        }
    }

    public repositionChildren() {
        this.repositionSelf();
        for (let i = 0; i < this.elements.length; i++) {
            this.elements[i];
        }
        this.children.forEach((c) => {
            void c;
        });
    }

    public override destroy(options?: Parameters<PIXI.Container['destroy']>[0]) {
        this.cleanupDragWindowListeners();
        super.destroy(options);
    }
}

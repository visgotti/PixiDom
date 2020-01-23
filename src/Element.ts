export class PixiElement extends PIXI.Container {
    private elements: Array<Element>= [];
    private dragPosition = null;
    inDrag: Boolean = false;
    private pointerIsDown: Boolean = false;
    private _pointerdownHandler: Function = null;
    private _pointermoveHandler: Function = null;
    private _pointerupHandler: Function = null;
    private _pointerupoutsideHandler: Function = null;
    private _pointeroverHandler: Function = null;
    private _pointeroutHandler: Function = null;
    private _pointertapHandler: Function = null;
    private _doubleclickHandler: Function = null;
    private _dragmoveHandler: Function = null;
    private _dragendHandler: Function = null;
    private _dragstartHandler: Function = null;
    private _swipeupHandler: Function = null;
    private _swipedownHandler: Function = null;
    private _swipeHandler: Function = null;

    private doubleClickTimeout: any = null;

    private _addChild: Function;

    private completedTriggerTimeout: boolean = null;
    private holdDragTriggerTime: number = 30;
    private holdDragTriggerTimeout: any = null;

    private helddownCountHandlers: any = {};
    private helddownTimeouts: Array<any> = [];

    private ifDragEndEmitSwipeDistance: number = 0;

    private swipeStartY: number;
    private swipeStartTs: number;
    private swipeEndY: number;


    private startDragY: number;
    private lastDragCheckTs: number;
    private curDragSwiperCheckIterationDuration: number;
    private curDragSwipePowerIterationQueue: Array<number> = [];
    private lastDragDistance: number = 0;

    private lastDragY: number = 0;
    private dragDistanceY: number;

    public maxSwipeTimeout: number = 300;
    public minSwipeDistance: number = 200;

    private hasSwipeHandler: boolean = false;
    private missedDiffs: number = 0;
    constructor() {
        super();
        this._addChild = super.addChild;
    }

    set pointerdownHandler(handler) { this._setEventNameHandler("pointerdown", handler); }
    set pointerupHandler(handler) { this._setEventNameHandler("pointerup", handler); }
    set pointerupoutsideHandler(handler) {  this._setEventNameHandler("pointerupoutside", handler); }
    set pointeroverHandler(handler) { this._setEventNameHandler("pointerover", handler); }
    set pointermoveHandler(handler) { this._setEventNameHandler("pointermove", handler); }
    set pointeroutHandler(handler) { this._setEventNameHandler("pointerout", handler); }
    set pointertapHandler(handler) { this._setEventNameHandler("pointertap", handler); }


    set doubleclickHandler(handler) { this._setEventNameHandler("doubleclick", handler); }
    set dragstartHandler(handler) {this._setEventNameHandler("dragstart", handler);}
    set dragendHandler(handler) { this._setEventNameHandler("dragend", handler); }
    set dragmoveHandler(handler) {this._setEventNameHandler("dragmove", handler); }

    private _setHeldDownHandler(handler, timeout: number) {
        if(this.helddownCountHandlers[timeout]) {
            console.warn('already had held down timeout for duration at', timeout, 'this will override it.')
        }
        this.helddownCountHandlers[timeout] = handler;
    }

    private _setEventNameHandler(eventName, handler) {
        const currentHandler =  this[`_${eventName}Handler`];
        // register private handler if we never had a user defined one
        if(!currentHandler) {
            this.on(eventName, this[`__${eventName}`]);
        }
        // set user defined handler
        this[`_${eventName}Handler`] = handler;

        // if button mode wasnt enabled yet, we now do so.
        if(!this.buttonMode) {
            this.buttonMode = true;
            this.interactive = true;
        }
    }

    public centerX() {
        if(this.parent) {
            this.x = this.parent.width / 2 - this.width / 2;
        }
    }
    public centerY() {
        if(this.parent) {
            this.y = this.parent.height / 2 - this.height / 2;
        }
    }
    public center() {
        this.centerX();
        this.centerY();
    }
    public addElement (element: Element) {
        if(!(element instanceof Element)) {
            throw new Error('addElement called with a non element object')
        }
        this.elements.push(element);
       // super.addChild(element);
    }
    public removeElement(element: Element) {
        this.elements = this.elements.filter(e => e !== element);
     //   super.removeChild(element);
    }
    public onMouseDown(handler) { this.pointerdownHandler = handler; }
    public onMouseUp(handler) { this.pointerupHandler = handler; }
    public onMouseUpOutside(handler) { this.pointerupoutsideHandler = handler };
    public onMouseOver(handler) { this.pointeroverHandler = handler; }
    public onMouseOut(handler) { this.pointeroutHandler = handler; }
    public onMouseMove(handler) { this.pointermoveHandler = handler; }
    public onClick(handler) { this.pointertapHandler = handler; }
    public onHeldDown(handler, timeout: number) {
        this._setHeldDownHandler(handler, timeout)
    }

    /**
     *
     * @param handler
     * @param hold - time in milliseconds needed to be held before triggering drag
     */
    public onDragStart(handler, hold?: number) {
        if(hold || hold == 0 && !isNaN(hold)) {
            this.holdDragTriggerTime = hold;
        }
        this.registerDefaultIfNeeded('pointerdown');
        this.registerDefaultIfNeeded('pointerup');
        this.registerDefaultIfNeeded('pointerupoutside');
        this.registerDefaultIfNeeded('pointerout');
        this.dragstartHandler = handler;
    }
    public onDragEnd(handler) {
        this.registerDefaultIfNeeded('pointerup');
        this.registerDefaultIfNeeded('pointerupoutside');
        this.dragendHandler = handler;
    }
    public onDragMove(handler) {
        if(!this._dragstartHandler) {this.onDragStart((event) => {}, this.holdDragTriggerTime)}
        if(!this._dragendHandler) { this.onDragEnd((event) => {})}
        this.registerDefaultIfNeeded('pointermove');
        this.dragmoveHandler = handler;
    }

    public onDoubleClick(handler) {
        // we need a pointerdownhandler for double click to function correctly
        this.registerDefaultIfNeeded('pointerdown');
        this.doubleclickHandler = handler;
    };

    public onSwipe(handler) {
        this.hasSwipeHandler = true;
        this.registerDefaultIfNeeded('pointerdown');
        this.registerDefaultIfNeeded('pointerup');
        this.registerDefaultIfNeeded('pointerupoutside');
        if(!this._dragmoveHandler) {
            this.onDragMove(() => {});
        }
        this._swipeHandler = handler;
    }

    public onSwipeUp(handler) {
        this.hasSwipeHandler = true;
        this.registerDefaultIfNeeded('pointerdown');
        this.registerDefaultIfNeeded('pointerup');
        this.registerDefaultIfNeeded('pointerupoutside');
        this._swipeupHandler = handler;
    }
    public onSwipeDown(handler) {
        this.hasSwipeHandler = true;
        this.registerDefaultIfNeeded('pointerdown');
        this.registerDefaultIfNeeded('pointerup');
        this.registerDefaultIfNeeded('pointerupoutside');
        this._swipedownHandler = handler;
    }

    private __doubleclick(event) {
        clearTimeout(this.doubleClickTimeout);
        this.doubleClickTimeout = null;
        this._doubleclickHandler && this._doubleclickHandler(event);
    }

    private clearHelddownTimeouts() {
        this.helddownTimeouts.forEach(t => {
            clearTimeout(t);
        });
        this.helddownTimeouts.length = 0;
    }

    private registerDefaultIfNeeded(eventName) {
        if(!this[`_${eventName}Handler`]) { this[`${eventName}Handler`] = () => {} };
    }

    private __pointerdown(event) {
        Object.keys(this.helddownCountHandlers).forEach(time => {
            this.helddownTimeouts.push(
                setTimeout(() => {
                    this.helddownCountHandlers[time](event)
                }, parseInt(time))
            );
        });

        this.pointerIsDown = true;
        this._pointerdownHandler(event);

        this.swipeStartTs = Date.now();
        this.swipeStartY = event.data.global.y;

        if(this._dragstartHandler && !this.inDrag) {
            this.holdDragTriggerTimeout = setTimeout(() => {
                this.completedTriggerTimeout = true;
                this.holdDragTriggerTimeout = null;
            }, this.holdDragTriggerTime)
        }

        if(this.doubleClickTimeout) {
            this.emit("doubleclick", event);
        } else {
            this.doubleClickTimeout = setTimeout(() => {
                this.doubleClickTimeout = null;
            }, 300);
        }
    }

    private __pointertap(event) {
        this._pointertapHandler(event);
    }

    private __dragstart(event) {
        this.inDrag = true;
        this.startDragY = event.data.global.y;
        this.lastDragY = event.data.global.y;
        this.lastDragCheckTs = Date.now();
        this._dragstartHandler(event);
    }

    private __dragmove(event) {
        this._dragmoveHandler(event);
        if(this.hasSwipeHandler) {
            const now = Date.now();
            const delta = now - this.lastDragCheckTs;
            this.lastDragCheckTs = now;

            this.curDragSwiperCheckIterationDuration += delta;

            const currentDragY = event.data.global.y;
            const diff = this.lastDragY - currentDragY;
            this.lastDragY = currentDragY;
            if(Math.abs(diff) < 7) {
                this.missedDiffs++;
            } else {
                this.missedDiffs = 0;
            }
            if(this.missedDiffs < 2) {
                if(Math.sign(this.ifDragEndEmitSwipeDistance) != Math.sign(diff)) {
                    this.swipeStartY = currentDragY;
                    this.resetDragSwipeVars();
                }
                if(this.curDragSwiperCheckIterationDuration >= this.maxSwipeTimeout) {
                    if(this.curDragSwipePowerIterationQueue.length) {
                        this.ifDragEndEmitSwipeDistance -= this.curDragSwipePowerIterationQueue.shift();
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

    private __dragend(event) {
        this.inDrag = false;
        this._dragendHandler(event);

        if(this.hasSwipeHandler) {
            const sign = Math.sign(this.ifDragEndEmitSwipeDistance);
            if(sign) {
                const dur = Math.max(10, this.curDragSwiperCheckIterationDuration);
                const timeDiff = Math.min(this.maxSwipeTimeout, dur);
                const power = (this.ifDragEndEmitSwipeDistance / (timeDiff + 100 / 15)) * 10;
                if(sign > 0 && this._swipedownHandler) {
                    this._swipedownHandler(this.ifDragEndEmitSwipeDistance);
                } else if(this._swipeupHandler) {
                    this._swipeupHandler(this.ifDragEndEmitSwipeDistance);
                }
                this._swipeHandler && this._swipeHandler(power);
            }
            this.resetDragSwipeVars();
        }
        this.ifDragEndEmitSwipeDistance = 0;
    }

    private __pointermove(event) {
        if(this.pointerIsDown && !this.inDrag && this.completedTriggerTimeout) {
            this.emit("dragstart", event);
        } else if (this.inDrag && this._dragmoveHandler) {
            this.emit("dragmove", event);
        }
        this._pointermoveHandler(event);
    }

    private __pointerover(event) { this._pointeroverHandler(event); }

    private __pointerout(event) {
        this.clearHelddownTimeouts();
        this.clearDragTimeouts();
        this._pointeroutHandler(event);
    }

    private handleSwipeFinish(finishY) {
        if(this.hasSwipeHandler) {
            const yDiff = this.swipeStartY - finishY;
            const timeDiff = Math.max(Date.now() - this.swipeStartTs, 1);
            if(timeDiff < this.maxSwipeTimeout && Math.abs(yDiff) > this.minSwipeDistance) {
                const power = (yDiff / (timeDiff + 100 / 15)) * 10;
                if(Math.abs(power) > 10) {
                    const handler = yDiff > 0 ? this._swipeupHandler : this._swipedownHandler;
                    handler && handler(power);
                    this._swipeHandler && this._swipeHandler(power);
                }
            }
        }
    }

    private __pointerupoutside(event) {
        this.clearHelddownTimeouts();
        this.clearDragTimeouts();
        this.handleSwipeFinish(event.data.global.y);
        this.pointerIsDown = false;
        this._pointerupoutsideHandler(event);
        if(this.inDrag) {
            this.emit("dragend", event);
        }
    }
    private __pointerup(event) {
        this.clearHelddownTimeouts();
        this.clearDragTimeouts();
        this.handleSwipeFinish(event.data.global.y);
        this.pointerIsDown = false;
        this._pointerupHandler(event);
        if(this.inDrag) {
            this.emit("dragend", event)
        }
    }

    private clearDragTimeouts() {
        this.completedTriggerTimeout = false;
        if(this.holdDragTriggerTimeout) {
            clearTimeout(this.holdDragTriggerTimeout);
            this.holdDragTriggerTimeout = null;
        }
    }

    private repositionSelf() {
        if(this.parent) {
        }
    }

    public repositionChildren() {
        this.repositionSelf();
        for(let i = 0; i < this.elements.length; i++) {
            const elements = this.elements[i] as Element;
          //  elements.repositionChildren();
        }
        this.children.forEach(c => {
          //  c.repositionChildren();
        });
    }
}
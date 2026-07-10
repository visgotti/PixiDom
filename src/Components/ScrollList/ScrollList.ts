import {clamp, parseLengthMeasurements} from "../../utils";
import { normalizeColor, type Color, type NormalizedColor } from "../../color";
import tweenFunctions from 'tween-functions';

import { PixiElement } from "../../Element";
import type { ValidMeasurement } from "../../types";

import {ScrollBar, ScrollBarStyleOptions} from './ScrollBar';
import type {DestroyOptions} from "pixi.js";

type EasingFn = (time: number, begin: number, end: number, duration: number) => number;
type ScrollChild = (PIXI.Container | PIXI.Sprite | PIXI.Graphics | PIXI.Text) & { just_added?: boolean };

/**
 * Configuration for individual scroll list items.
 */
export type ScrollItemOptions = {
    /** The PIXI container to display as the list item */
    container: PIXI.Container,
    /** Optional click handler for the item */
    onClick?: (event: PIXI.FederatedPointerEvent) => void,
}

const resolveLength = (raw: unknown, fallback: number = 0): number => {
    const parsed = parseLengthMeasurements(raw);
    return parsed.valid ? parsed.value : fallback;
};

/**
 * Styling options for the ScrollList component.
 */
export type ScrollStyleOptions = {
  /** Width of the scroll list (e.g., '300px') */
  width?: ValidMeasurement,
  /** Height of the scroll list (e.g., '400px') */
  height?: ValidMeasurement,
  /** Background color. Accepts any {@link Color} format. */
  backgroundColor?: Color,
  /** Color of item dividers. Accepts any {@link Color} format. */
  dividerColor?: Color,
  /** Height of dividers in pixels */
  dividerPixelHeight?: number,
  /** Width of dividers as percentage (0-100) */
  dividerPercentWidth?: number,
  /** Padding above dividers */
  dividerTopPadding?: number,
  /** Padding below dividers */
  dividerBottomPadding?: number,
  /** Border opacity (0-1) */
  borderOpacity?: number,
  /** Horizontal padding */
  xPadding?: number,
  /** Vertical padding */
  yPadding?: number,
  /** Optional scrollbar configuration */
  scrollBarOptions?: ScrollBarStyleOptions,
}

/**
 * Default style options for ScrollList.
 */
const defaultScrollStyleOptions: Partial<ScrollStyleOptions> = {
  backgroundColor: 0x1a1a1a,
  dividerColor: 0x333333,
  dividerPixelHeight: 1,
  dividerPercentWidth: 100,
  dividerTopPadding: 0,
  dividerBottomPadding: 0,
  borderOpacity: 1,
  xPadding: 0,
  yPadding: 0,
};

/**
 * Performance-related options for ScrollList.
 */
export type ScrolllPerformanceOptions = {
    /** Disable mouse wheel scrolling */
    disableScrollWheelScroll: boolean;
    /** Disable touch/drag scrolling */
    disableTouchScroll : boolean;
    /** Buffer in pixels for virtualization visibility */
    visibilityBuffer: number;
    /** Time in ms between visibility adjustments */
    adjustVisibilityTime: number;
}
const defaultPerformanceOptions = {
    disableTouchScroll: false,
    disableScrollWheelScroll: false,
    visibilityBuffer: 200,
    adjustVisibilityTime: 130,
}

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
export class ScrollList extends PIXI.Container {
    private scrollStyleOptions: ScrollStyleOptions;
    private resolvedBackgroundColor: NormalizedColor;
    private po: PixiElement = new PixiElement();

    private scrollBar?: ScrollBar;
    private scrollRect: PixiElement = new PixiElement();
    private scrollDuration: number = 0;

    private scrollMask: PIXI.Graphics;

    private _currentScroll: number = 0;
    private lastScroll: number = 0;
    private __width: number = 0;
    private __height: number = 0;

    private pointerdownStart: number = 0;
    private startingVisibleChildIndex: number = 0;
    private endingVisibleChildIndex: number = 0;

    private scrollCurrentDur: number = 0;
    private currentAdjustVisibilityDelta: number = 0;
    private animationFrame: number | null = null;
    private nextItemY: number = 0;
    private scrollToDest: number = 0;
    private listContainer: PixiElement = new PixiElement();
    private backgroundRect: PIXI.Graphics = new PIXI.Graphics();
    private scrollLength: number = 0;
    private adjustedIndex: number = 0;
    maxHeight: number = 0;
    public freezeScroll: boolean = false;
    private tweenFunc?: EasingFn;
    private options: Array<ScrollChild> = [];
    private _needsUpdateScoller : boolean = true;
    private _registeredScrollEvent : boolean = false;

    readonly performanceOptions: ScrolllPerformanceOptions;
    constructor(scrollStyleOptions: ScrollStyleOptions, scrollItemOptions: Array<ScrollItemOptions>, scrollPerformanceOptions?: ScrolllPerformanceOptions) {
        super();
        this.handleScrollWheelScroll = this.handleScrollWheelScroll.bind(this);

        // Apply defaults to style options
        const mergedStyleOptions: ScrollStyleOptions = { ...defaultScrollStyleOptions, ...scrollStyleOptions };

        this.interactive = true;
        this.interactiveChildren = true;
        this.__width = resolveLength(mergedStyleOptions.width);
        this.__height = resolveLength(mergedStyleOptions.height);

        this.performanceOptions = scrollPerformanceOptions
            ? { ...defaultPerformanceOptions, ...scrollPerformanceOptions }
            : { ...defaultPerformanceOptions };
        this.scrollStyleOptions = mergedStyleOptions;
        this.resolvedBackgroundColor = normalizeColor(mergedStyleOptions.backgroundColor ?? 0x0fffff);
        this.scrollLength = 0;
        this.scrollMask = new PIXI.Graphics();
        this.scrollMask.beginFill(0xFFFFFF);
        this.scrollMask.drawRect(0, 0, this.__width, this.__height);
        this.scrollMask.endFill();

        this.backgroundRect.beginFill(this.resolvedBackgroundColor.value, this.resolvedBackgroundColor.alpha);
        this.backgroundRect.drawRect(0, 0, this.__width, this.__height);
        this.backgroundRect.endFill();
        this.addChild(this.backgroundRect);
      //  this.scrollRect.addChild(this.backgroundRect);

     //   this.scrollMask.hitArea = new PIXI.Rectangle(0, 0, this.__width, this.__height);

        this.addChild(this.scrollMask);
        this.addChild(this.po);
        this.po.interactive = true;
        this.po.mask = this.scrollMask;

        this.addChild(this.scrollRect);

        let lastScrollY: number = 0;
        let heldTimeout: ReturnType<typeof setTimeout> | null = null;

        if(!this.performanceOptions.disableScrollWheelScroll) {
            this.registerScrollEvents();
        }

     //   this.initializeEventPropogation();
        if(!this.performanceOptions.disableTouchScroll) {
            this.scrollRect.onSwipe(this.applySwipe.bind(this));

            this.on('pointerdown', (event) => {
                if(this.scrollBar && this.scrollBar.scrolling) return;
                if(this.performanceOptions.disableTouchScroll) return;
                if(this.animationFrame !== null) {
                    cancelAnimationFrame(this.animationFrame);
                    if(!this.po.inDrag) {
                        this.po.emit('dragstart', event);
                    }
                    this.animationFrame = null;
                }
            });
            this.on('pointerup', () => {
                if(this.scrollBar && this.scrollBar.scrolling) return;
                if(this.performanceOptions.disableTouchScroll) return;
                if(heldTimeout) {
                    clearTimeout(heldTimeout);
                    heldTimeout = null;
                }
            });

            this.po.onSwipe(this.applySwipe.bind(this));
            this.po.onDragStart((event) => {
                if(this.scrollBar && this.scrollBar.scrolling) return;
                if(this.freezeScroll) return;
                this.tweenFunc = tweenFunctions.easeOutElastic as EasingFn;
                this.scrollLength = 0;
                this.scrollCurrentDur = 0;
                this.scrollDuration = 0;
                this.currentAdjustVisibilityDelta = 0;
                lastScrollY = event.data?.global?.y ?? event.global?.y ?? 0;
            });
            this.po.onDragMove((event) => {
                if(this.scrollBar && this.scrollBar.scrolling) return;
                if(this.freezeScroll) return;
                const y = event.data?.global?.y ?? event.global?.y ?? lastScrollY;
                const diff = y - lastScrollY;
                lastScrollY = y;
                if(diff === 0) return;
                this.applyDrag(diff);
            });
            this.po.onDragEnd(() => {
                if(this.scrollBar && this.scrollBar.scrolling) return;
                this.adjustVisibility(0, true);
            });
        }
        if(scrollStyleOptions.scrollBarOptions) {
            this.scrollBar = new ScrollBar(this, scrollStyleOptions.scrollBarOptions);
            this.addChild(this.scrollBar);
            this.scrollBar.on('scrolled', (percent) => {
                this._needsUpdateScoller = false;
                this.setScrollPercent(percent);
                this._needsUpdateScoller = true;
            });
        }

       // this.po.mask = this.scrollMask;
        if (scrollItemOptions && scrollItemOptions.length) {
            this.addScrollItems(
                scrollItemOptions.map((opt) => {
                    if (opt.onClick) {
                        opt.container.interactive = true;
                        opt.container.buttonMode = true;
                        opt.container.on('pointertap', opt.onClick);
                    }
                    return opt.container;
                }),
            );
        }
        this.redraw();
    }

    private handleScrollWheelScroll(event : WheelEvent) {
        if (event.cancelable) event.preventDefault();
        this.currentScroll += event.deltaY;
        this.adjustVisibility(null, true);
    }

    public override destroy(options?: DestroyOptions | boolean) {
        if(this._registeredScrollEvent) {
            document.removeEventListener('wheel', this.handleScrollWheelScroll);
            this._registeredScrollEvent = false;
        }
        super.destroy(options);
    }

    get utilizedLength() : number {
        return this.maxHeight - this.__height;
    }

    get scrollPercent() : number {
        return this.currentScroll / this.utilizedLength
    }

    private registerScrollEvents() {
        this.once('pointerover', () => {
            this._registeredScrollEvent = true;
            document.addEventListener('wheel', this.handleScrollWheelScroll, { passive: false });
            this.once('pointerout', () => {
                document.removeEventListener('wheel', this.handleScrollWheelScroll);
                this._registeredScrollEvent = false;
                this.registerScrollEvents();
            })
        })
    }

    public setScrollPercent(n : number) {
        n = clamp(n, 0, 1);
        const prev = this.currentScroll;
        this.currentScroll = this.utilizedLength * n;
        if(prev !== this.currentScroll) {
            this.adjustVisibility(null, true);
        }
    }

    private findVisible() {

    }

    public freeze() {
        this.toggleFreezeScroll(true)
    }
    public unfreeze() {
        this.toggleFreezeScroll(false);
    }
    public toggleFreezeScroll(freeze: boolean) {
        this.freezeScroll = freeze;
    }

    private _containsPoint(container: PIXI.Container, p: PIXI.Point | { x: number; y: number }) {
        const local = this.toLocal(p);
        const ix = 0;
        const ax = this.__width;
        const iy = container.y - this.currentScroll;
        const ay = iy + container.height;

        return (ix <= local.x && local.x <= ax && iy <= local.y && local.y <= ay);
    }

    public resize(w: number, h: number) {
        this.__width = w;
        this.__height = h;
        this.scrollMask.clear();
        this.scrollMask
            .beginFill(0xFFFFFF)
            .drawRect(0, 0, this.__width, this.__height)
            .endFill();

        this.backgroundRect.clear();
        this.backgroundRect
            .beginFill(this.resolvedBackgroundColor.value, this.resolvedBackgroundColor.alpha)
            .drawRect(0, 0, this.__width, this.__height)
            .endFill();

        this.adjustVisibility(null, true);
        this.scrollBar && this.scrollBar.redraw();
    }

    private redraw() {
        this.adjustOptions();
        if(this.scrollBar) {
            this.scrollBar.redraw();
            this.scrollBar.x = this.po.width;
        }
    }


    private repositionOptions() {
        let y = 0;
        for(let i = 0; i < this.options.length; i++) {
            this.options[i].y = y;
            y += this.options[i].height
        }
    }

    private adjustVisibility(delta: number | null, force = false) {
        if (delta === null) delta = 0;
        if(force) {
            this.currentAdjustVisibilityDelta = 0;
        } else {
            this.currentAdjustVisibilityDelta += delta;
            if(!force && this.currentAdjustVisibilityDelta >= this.performanceOptions.adjustVisibilityTime) {
                this.currentAdjustVisibilityDelta = 0;
                return;
            }
        }
        let setFirstVisible = false;
        for(let i = 0; i < this.options.length; i++) {
            const option = this.options[i];
            const canSeeFromTop = option.y + option.height + this.performanceOptions.visibilityBuffer >= this.currentScroll;
            const canSeeFromBottom = this.__height + this.currentScroll >= option.y - this.performanceOptions.visibilityBuffer;
            const wasVisible = option.visible;
            option.visible = canSeeFromBottom && canSeeFromTop;
            if(option.visible && !setFirstVisible) {
                this.startingVisibleChildIndex = i;
                setFirstVisible = true;
            }
            if(!option.visible && setFirstVisible) {
                this.endingVisibleChildIndex = Math.min(i + 1, this.options.length - 1);
            }

            if(wasVisible !== option.visible) {
                if(wasVisible) {
                    option.emit('hide');
                } else {
                    option.emit('show');
                }
                if(option.just_added) {
                    delete option.just_added;
                }
            } else if (option.just_added) {
                if(option.visible) {
                    option.emit('show');
                } else {
                    option.emit('hide');
                }
                delete option.just_added;
            }

            if(!option.visible && !wasVisible && setFirstVisible) {
                // dont need to check any more
               // console.log('adjust visibility took', Date.now() - start);
                return;
            }
        }
        // if it gets here it didnt run into an ending visible which means the last item is visible.
        this.endingVisibleChildIndex = this.options.length - 1;
    //    console.log('adjust visibility took', Date.now() - start);
    }

    private adjustOptions() {
      //  console.log('adjust options', this.currentScroll);
        if(this.po && this.po.parent === this) {
            this.po.y = -this.currentScroll;
            this.adjustedIndex++;
        }
    }

    private animateScroll(ts: number) {
        const now = Date.now();
        const delta = now - ts;
        this.currentAdjustVisibilityDelta += delta;
        this.scrollCurrentDur += delta;

        if(this.scrollCurrentDur >= this.scrollDuration) {
            this.animationFrame = null;
            this.currentScroll = this.scrollToDest;
            this.currentAdjustVisibilityDelta = 0;
            this.adjustVisibility(null, true);
            return null;
        }
        if (this.tweenFunc) {
            this.currentScroll = this.tweenFunc(this.scrollCurrentDur, this.lastScroll, this.scrollToDest, this.scrollDuration);
        }

        this.adjustVisibility(delta);

        return requestAnimationFrame(() => {
            if(this.animationFrame !== null) {
                this.animationFrame = this.animateScroll(now);
            }
        });
    }

    private applyDrag(difference: number) {
        if(this.animationFrame) return;

        // scroll height is less than total height.. no need to scroll anything.
        if(this.maxHeight <= this.__height) {
            return;
        }
        if(difference > 0 && this._currentScroll === 0) {
            this.adjustVisibility(null, true);
            return;
        } else if (difference < 0 && this._currentScroll === this.maxHeight - this.__height) {
            this.adjustVisibility(null, true);
            return;
        }

        this.lastScroll = this._currentScroll;
        this.scrollLength += difference;

        this.scrollToDest = this.scrollLength >= 0 ?
            Math.min(this.maxHeight - this.__height, this._currentScroll - difference) :
            Math.max(0, this._currentScroll - difference);

        this.scrollDuration += Math.abs(difference);
        const distanceToTraverse = Math.abs(this._currentScroll - this.scrollToDest);
        const maxTime = distanceToTraverse > 1000 ? 4000 : distanceToTraverse > 700 ? 3000 : distanceToTraverse > 500  ? 2000 : distanceToTraverse > 200 ? 1000 : 400;
        this.scrollDuration = Math.min(this.scrollDuration, maxTime);
        this.animationFrame = this.animateScroll(Date.now());
    }

    private applySwipe(power: number) {
        if(Math.abs(power) < 1) return;

        if(this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        this.tweenFunc = tweenFunctions.easeOutCubic as EasingFn;
        this.lastScroll = this._currentScroll;
        this.scrollCurrentDur = 0;
        const absPower = Math.abs(power);
        const multiplier = absPower < 10 ? 25 : absPower < 25 ? 30 : absPower < 30 ? 35 : absPower < 35 ? 55 : absPower < 40 ? 60 : absPower < 60 ? 65 : 80;
        const diff = power * multiplier;
        // scroll height is less than total height.. no need to scroll anything.
        if(this.maxHeight <= this.__height) {
            return;
        }

        this.scrollToDest = power >= 0 ?
            Math.min( this.maxHeight - this.__height, this._currentScroll + diff) :
            Math.max(0, this._currentScroll + diff);

     //   if(this.scrollToDest === this.maxHeight - this.__height || this.scrollToDest === 0) {}

        const distanceToTraverse = Math.abs(this._currentScroll - this.scrollToDest);
        let maxTime;
        if(this.scrollToDest === 0 || this.scrollToDest === this.maxHeight - this.__height + 0) {
            maxTime = distanceToTraverse > 1000 ? 1000 : distanceToTraverse > 500 ? 500 : 200;
        } else {
            maxTime = distanceToTraverse > 2700 ? 4000 : distanceToTraverse > 2300 ? 3500 : distanceToTraverse > 1500 ? 3000 : distanceToTraverse > 1000 ? 2700 : distanceToTraverse > 700 ? 2300 : distanceToTraverse > 500 ? 2000 : distanceToTraverse > 300 ? 1500 : distanceToTraverse > 100 ? 1000 : 700;
        }
        this.scrollDuration = Math.min(maxTime);
        this.animationFrame = this.animateScroll(Date.now());
    }

    set currentScroll(value) {
        // When content is shorter than the viewport the max scroll is 0, not negative.
        const maxScroll = Math.max(0, this.maxHeight - this.__height);
        if(value < 0) {
            value = 0;
        } else if (value > maxScroll) {
            value = maxScroll;
        }
        this._currentScroll = value;
        if (this.scrollBar && this._needsUpdateScoller) {
            this.scrollBar.setScrollPercent(this.scrollPercent);
        }
        this.adjustOptions();
    }

    get currentScroll() {
        return this._currentScroll;
    }

    public addScrollItems(containers: Array<PIXI.Container | PIXI.Sprite | PIXI.Graphics | PIXI.Text>) {
        containers.forEach((raw) => {
            const c = raw as ScrollChild;
            c.just_added = true;
            c.visible = true;
            this.po.addChild(c);
            if(c.interactive) {
                c.hitArea = new PIXI.Rectangle(0, 0, c.width, c.height);
            }
            this.options.push(c);
        });
        this.recalculateHeight();
        this.repositionOptions();
        this.adjustVisibility(null, true);
        this.redraw();
    }
    public addScrollItem(container: PIXI.Container | PIXI.Sprite | PIXI.Graphics | PIXI.Text) {
        this.addScrollItems([container]);
    }

    private recalculateHeight() {
        let height = 0;
        this.options.forEach(c => {
            height += c.height;
        });
        this.maxHeight = height;
    }

    public spliceScrollItems(fromIndex: number, toIndex?: number, destroyItem = true) {
        const end = typeof toIndex === 'number' && toIndex >= 0 ? toIndex : this.options.length;
        const indexArray: number[] = [];
        for(let i = fromIndex; i < end; i++) {
            indexArray.push(i);
        }
        this.removeScrollItems(indexArray, destroyItem);
    }

    public removeScrollItems(indexOrContainer: number | ScrollChild | Array<number | ScrollChild>, destroyItem = true) {
        const list: Array<number | ScrollChild> = Array.isArray(indexOrContainer) ? indexOrContainer : [indexOrContainer];

        const indexesToRemove: number[] = [];
        list.forEach((entry) => {
            const container: ScrollChild | undefined = typeof entry === 'number' ? this.options[entry] : entry;
            const foundOption = this.options.find((o) => o === container);
            if (foundOption) {
                indexesToRemove.push(this.options.indexOf(foundOption));

                if(foundOption.parent === this.po) {
                    this.po.removeChild(foundOption);
                }
                if(destroyItem) {
                    foundOption.destroy({ children: true });
                }
            }
        });
        if(indexesToRemove.length) {
            this.options = this.options.filter((o, i) => {
                return !(indexesToRemove.includes(i));
            });

            this.recalculateHeight();
            if(this._currentScroll > this.maxHeight - this.__height) {
                this.currentScroll = Math.max(0, this.maxHeight - this.__height);
            }
            this.repositionOptions();
            this.adjustVisibility(null, true);
            this.redraw();
            return true;
        }

        return false;
    }


    private recurseChildren(el: PIXI.DisplayObject, point: PIXI.Point, foundChildren: Array<PIXI.DisplayObject>): Array<PIXI.DisplayObject> {
        if(el.interactive || el.interactiveChildren) {
            if(this._containsPoint(el as PIXI.Container, point)) {
                if(el.interactive) {
                    foundChildren.push(el);
                }
                const container = el as PIXI.Container;
                if(el.interactiveChildren && container.children) {
                    container.children.forEach((child) => {
                        this.recurseChildren(child, point, foundChildren);
                    });
                }
            }
        }
        return foundChildren;
    }
}

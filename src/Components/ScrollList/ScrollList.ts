import {clamp, parseLengthMeasurements} from "../../utils";
export type ScrollItemOptions = {
    container: PIXI.Container,
    onClick?: Function,
}

const tweenFunctions = require('tween-functions');

import { PixiElement } from "../../Element";
import { ValidMeasurement } from "../../types";

import { ScrollBar } from './ScrollBar';

export type ScrollStyleOptions = {
    width?: ValidMeasurement,
    height?: ValidMeasurement,
    backgroundColor: number,
    dividerColor: number,
    dividerPixelHeight: number,
    dividerPercentWidth: number,
    dividerTopPadding: number,
    dividerBottomPadding: number,
    borderOpacity: number,
    xPadding: number,
    yPadding: number,
    scrollBarWidth: number,
    scrollBarSide: "left" | "right"
}

export type ScrolllPerformanceOptions = {
    visibilityBuffer: number;
    adjustVisibilityTime: number;
}
const defaultPerformanceOptions = {
    visibilityBuffer: 200,
    adjustVisibilityTime: 130,
}

export class ScrollList extends PIXI.Container {
    private scrollStyleOptions: ScrollStyleOptions;
    private scrollItemsById: any = {};
    private options: Array<PIXI.Container> = [];
    private po: PixiElement = new PixiElement();

    private scrollBar: ScrollBar;
    private scrollbarScroll: PIXI.Graphics;
    private scrollRect: PixiElement = new PixiElement();
    private scrollDuration: number = 0;

    private scrollMask: PIXI.Graphics;

    private _currentScroll: number = 0;
    private lastScroll: number = 0;
    private __width: number;
    private __height: number;

    private pointerdownStart: number = 0;
    private startingVisibleChildIndex: number = 0;
    private endingVisibleChildIndex: number = 0;

    private scrollCurrentDur: number = 0;
    private currentAdjustVisibilityDelta: number = 0;
    private animationFrame: any = null;
    private nextItemY: number = 0;
    private scrollToDest: number = 0;
    private listContainer: PixiElement = new PixiElement();
    private listRect: PIXI.Graphics = new PIXI.Graphics();
    private scrollLength: number = 0;
    private adjustedIndex: number = 0;
    private maxHeight: number = 0;
    private lastOverOption: PIXI.Container = null;
    private lastDownOption: PIXI.Container = null;

    private tweenFunc: Function;

    readonly performanceOptions: ScrolllPerformanceOptions;
    constructor(scrollStyleOptions: ScrollStyleOptions, scrollItemOptions: Array<ScrollItemOptions>, scrollPerformanceOptions?: ScrolllPerformanceOptions) {
        super();
        this.interactive = true;
        this.interactiveChildren = true;
        this.__width = parseLengthMeasurements(scrollStyleOptions.width).value;
        this.__height = parseLengthMeasurements(scrollStyleOptions.height).value;

        this.performanceOptions = scrollPerformanceOptions ? scrollPerformanceOptions : defaultPerformanceOptions;
        if(scrollPerformanceOptions) {
            for(let key in defaultPerformanceOptions) {
                if(!scrollPerformanceOptions.hasOwnProperty(key)) {
                    this.performanceOptions[key] = defaultPerformanceOptions[key];
                }
            }
        }
        this.scrollbarScroll = new PIXI.Graphics();
        this.scrollStyleOptions = scrollStyleOptions;
        this.scrollLength = 0;
        this.scrollMask = new PIXI.Graphics();
        this.scrollMask.beginFill(0xFFFFFF);
        this.scrollMask.drawRect(0, 0, this.__width, this.__height);
        this.scrollMask.endFill();

        this.listRect.beginFill(0xFFFFFF, 0);
        this.listRect.drawRect(0, 0, this.__width, this.__height);
        this.listRect.endFill();
        this.scrollRect.addChild(this.listRect);
        this.scrollRect.onSwipe(this.applySwipe.bind(this));

     //   this.scrollMask.hitArea = new PIXI.Rectangle(0, 0, this.__width, this.__height);

        this.addChild(this.scrollMask);
        this.addChild(this.po);
        this.po.interactive = true;
        this.po.mask = this.scrollMask;

     //   this.addChild(this.scrollRect);

        this.po.onSwipe(this.applySwipe.bind(this));
        let lastScrollY;
        let heldTimeout = null;
        this.on('pointerdown', (event) => {
            if(this.animationFrame !== null) {
                cancelAnimationFrame(this.animationFrame);
                if(!this.po.inDrag) {
                    this.po.emit('dragstart', event);
                }
                this.animationFrame = null;
            }
        });
        this.on('pointerup', () => {
            if(heldTimeout) {
                clearTimeout(heldTimeout);
                heldTimeout = null;
            }
        });

     //   this.initializeEventPropogation();
        this.po.onDragStart(event => {
            this.tweenFunc = tweenFunctions.easeOutElastic;
            this.scrollLength = 0;
            this.scrollCurrentDur = 0;
            this.scrollDuration = 0;
            this.currentAdjustVisibilityDelta = 0;
            lastScrollY = event.data.global.y;
        });
        this.po.onDragMove(event => {
            const diff =  event.data.global.y - lastScrollY;
            lastScrollY = event.data.global.y;
            this.applyDrag(diff);
        });
        this.po.onDragEnd(event => {
            this.adjustVisibility(null, true);
        });

       // this.po.mask = this.scrollMask;
        this.redraw();
    }

    private findVisible() {

    }

    private _containsPoint(container: PIXI.Container, p) {
        p = this.toLocal(p);
        const ix = 0;
        const ax = this.__width;
        const iy = container.y - this.currentScroll;
        const ay = iy + container.height;

        return (ix <= p.x && p.x <= ax && iy <= p.y && p.y <= ay)
    }

    public resize(w, h) {
        this.__width = w;
        this.__height = h;
        this.scrollMask.clear();
        this.scrollMask
            .beginFill(0xFFFFFF)
            .drawRect(0, 0, this.__width, this.__height)
            .endFill();

        this.listRect.clear();
        this.listRect
            .beginFill(this.scrollStyleOptions.backgroundColor)
            .drawRect(0, 0, this.__width, this.__height)
            .endFill();

        this.adjustVisibility(null, true);
    }

    private redraw() {
        this.adjustOptions();
    }


    private repositionOptions() {
        let y = 0;
        for(let i = 0; i < this.options.length; i++) {
            this.options[i].y = y;
            y += this.options[i].height
        }
    }

    private adjustVisibility(delta, force=false) {
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
                if(option['just_added']) {
                    delete option['just_added'];
                }
            } else if (option['just_added']) {
                if(option.visible) {
                    option.emit('show');
                } else {
                    option.emit('hide');
                }
                delete option['just_added'];
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
        this.currentScroll = this.tweenFunc(this.scrollCurrentDur, this.lastScroll, this.scrollToDest, this.scrollDuration);

        this.adjustVisibility(delta);

        return requestAnimationFrame(() => {
            if(this.animationFrame !== null) {
                this.animationFrame = this.animateScroll(now);
            }
        });
    }

    private applyDrag(difference) {
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

    private applySwipe(power) {
        if(Math.abs(power) < 1) return;

        if(this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        this.tweenFunc = tweenFunctions.easeOutCubic;
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
        if(value < 0) {
            value = 0;
        } else if (value > this.maxHeight - this.__height) {
            value = this.maxHeight - this.__height
        }
        this._currentScroll = value;
        if (this.scrollBar) {
            //  this.scrollBar.adjust(this._currentScroll);
        }
        this.adjustOptions();
    }

    get currentScroll() {
        return this._currentScroll;
    }

    public addScrollItems(containers: Array<PIXI.Container>) {
        containers.forEach(c => {
            c['just_added'] = true;
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
    public addScrollItem(container: PIXI.Container) {
        this.addScrollItems([container])
    }

    private recalculateHeight() {
        let height = 0;
        this.options.forEach(c => {
            height += c.height;
        });
        this.maxHeight = height;
    }

    public spliceScrollItems(fromIndex, toIndex?, destroyItem=true) {
        toIndex = toIndex >= 0 ? toIndex : this.options.length;
        const indexArray = [];
        for(let i = fromIndex; i < toIndex; i++) {
            indexArray.push(i);
        }
        this.removeScrollItems(indexArray, destroyItem);
    }

    public removeScrollItems(indexOrContainer, destroyItem=true) {
        if(!(Array.isArray(indexOrContainer))) {
            indexOrContainer = [indexOrContainer]
        }

        const indexesToRemove = [];
        indexOrContainer.forEach(i => {
            let container;
            if (!isNaN(i)) {
                container = this.options[i];
            } else {
                container = indexOrContainer;
            }
            const foundOption = this.options.find(o => o === container);
            if (foundOption) {
                indexesToRemove.push(this.options.indexOf(foundOption));

                if(foundOption && foundOption.parent === this.po) {
                    this.po.removeChild(foundOption);
                }
                if(destroyItem) {
                    foundOption.destroy({ children: true })
                }
            }
        });
        if(indexesToRemove.length) {
            this.options = this.options.filter((o, i) => {
                return !(indexesToRemove.includes(i));
            });

            if(this._currentScroll > this.maxHeight - this.__height) {
                this.currentScroll = this.maxHeight - this.__height;
            }
            this.recalculateHeight();
            this.repositionOptions();
            this.adjustVisibility(null, true);
            this.redraw();
            return true;
        }

        return false;
    }


    private findOptionAtPoint(p) : PIXI.Container {
        for(let i = this.startingVisibleChildIndex; i <= this.endingVisibleChildIndex; i++) {
            const opt : PIXI.Container = this.options[i];
            if(opt.visible && this._containsPoint(opt, p)) {
                return opt;
            }
        }
        return null;
    }


    private recurseChildren(el, point, foundChildren) {
        if(el.interactive || el.interactiveChildren) {
            if(this._containsPoint(el, point)) {
                if(el.interactive) {
                    foundChildren.push(el);
                }
                if(el.interactiveChildren && el.children) {
                    el.children.forEach(child => {
                        this.recurseChildren(child, point, foundChildren);
                    });
                }
            }
        }
        return foundChildren;
    }
}

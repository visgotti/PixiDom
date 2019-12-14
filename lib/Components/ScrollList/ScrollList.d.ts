/// <reference types="pixi.js" />
export declare type ScrollItemOptions = {
    container: PIXI.Container;
    onClick?: Function;
};
import { ValidMeasurement } from "../../types";
export declare type ScrollStyleOptions = {
    width?: ValidMeasurement;
    height?: ValidMeasurement;
    backgroundColor: number;
    dividerColor: number;
    dividerPixelHeight: number;
    dividerPercentWidth: number;
    dividerTopPadding: number;
    dividerBottomPadding: number;
    borderOpacity: number;
    xPadding: number;
    yPadding: number;
    scrollBarWidth: number;
    scrollBarSide: "left" | "right";
};
export declare class ScrollList extends PIXI.Container {
    private scrollStyleOptions;
    private scrollItemsById;
    private options;
    private po;
    private scrollBar;
    private scrollbarScroll;
    private scrollRect;
    private scrollDuration;
    private scrollMask;
    private _currentScroll;
    private lastScroll;
    private __width;
    private __height;
    private scrollCurrentDur;
    private animationFrame;
    private nextItemY;
    private scrollToDest;
    private listContainer;
    private listRect;
    private scrollLength;
    constructor(scrollStyleOptions: ScrollStyleOptions, scrollItemOptions: Array<ScrollItemOptions>);
    private redraw;
    private repositionOptions;
    private adjustOptions;
    private animateScroll;
    private applyDrag;
    private applySwipe;
    currentScroll: any;
    addScrollItems(containers: Array<PIXI.Container>): void;
    addScrollItem(container: PIXI.Container): void;
    removeScrollItem(indexOrContainer: any): boolean;
    scroll(difference: any, func?: any): void;
}

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
export default class ScrollList extends PIXI.Container {
    private scrollStyleOptions;
    private scrollItemsById;
    private options;
    private po;
    private scrollBar;
    private scrollbarScroll;
    private scrollMask;
    private _currentScroll;
    private lastScroll;
    private __width;
    private __height;
    private listContainer;
    private listRect;
    constructor(scrollStyleOptions: ScrollStyleOptions, scrollItemOptions: Array<ScrollItemOptions>);
    private redraw;
    private adjustOptions;
    currentScroll: any;
    scrollUp(pixels: number): void;
    scrollDown(pixels: number): void;
    addScrollItem(options: ScrollItemOptions): number;
    removeScrollItem(indexOrContainer: any): boolean;
    scroll(difference: any, func?: any): void;
}

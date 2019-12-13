/// <reference types="pixi.js" />
export declare type ScrollItemOptions = {
    container: PIXI.Container;
    onClick?: Function;
};
import { ValidMeasurement } from "../types";
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
    private scrollbarSprite;
    private scrollbarScroll;
    private scrollMask;
    private currentScroll;
    private __width;
    private __height;
    constructor(scrollStyleOptions: ScrollStyleOptions, scrollItemOptions: Array<ScrollItemOptions>);
    private reDrawScrollbar;
    private positionScroll;
    addScrollItem(options: ScrollItemOptions): number;
    removeScrollItem(indexOrContainer: any): boolean;
    scroll(difference: any, func?: any): void;
    redraw(): void;
}

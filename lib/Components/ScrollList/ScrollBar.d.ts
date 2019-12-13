import { PixiElement } from '../../Element';
export declare type SideScrollOptions = {
    width: number;
    height: number;
    color: number;
};
export declare class ScrollBar extends PixiElement {
    private scroller;
    private bg;
    private options;
    constructor(options: any);
    private registerScrollerEvents;
}

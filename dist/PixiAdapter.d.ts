import { Color } from './color';
export interface CreateAppOptions {
    width?: number;
    height?: number;
    /** Background color of the canvas. Accepts any {@link Color} format. */
    backgroundColor?: Color;
    antialias?: boolean;
    forceCanvas?: boolean;
    [key: string]: any;
}
export declare const PixiAdapter: {
    createApp: (canvas: HTMLCanvasElement, opts?: CreateAppOptions) => Promise<any>;
    getPixiVersion: () => number;
    getLoader: () => import('./pixi-adapter-utils').IPixiLoader;
    newLoader: () => import('./pixi-adapter-utils').IPixiLoader;
};
//# sourceMappingURL=PixiAdapter.d.ts.map
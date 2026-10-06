export interface IPixiLoader {
    baseUrl?: string;
    progress?: number;
    loading?: boolean;
    defaultQueryString?: string;
    resources?: any;
    add(...params: any[]): IPixiLoader;
    pre?(fn: (...params: any[]) => any): IPixiLoader;
    use?(fn: (...params: any[]) => any): IPixiLoader;
    reset?(): IPixiLoader;
    load(cb?: (...params: any[]) => any): IPixiLoader | void;
}
export declare const ensurePixiCanvasFallback: () => void;
export declare const newPixiLoader: () => IPixiLoader;
export declare const getPixiLoader: () => IPixiLoader;
/**
 * Resolves the underlying HTMLCanvasElement from a PIXI renderer across versions.
 * v8 exposes `renderer.canvas`; v4–v7 use `renderer.view`. Some adapters wrap the view
 * in an object with `.canvas`, which we also unwrap.
 */
export declare const getRendererCanvas: (renderer: any) => HTMLCanvasElement | null;
export declare const getRendererResolution: (renderer: any) => number;
/**
 * Returns the renderer's stage/screen size in PIXI coordinate units (drawing-buffer
 * pixels divided by resolution). Falls back to deriving from the canvas if `renderer.screen`
 * isn't populated (older PIXI builds, or detached renderers).
 */
export declare const getRendererScreenSize: (renderer: any, canvas?: HTMLCanvasElement | null) => {
    width: number;
    height: number;
};
export type RendererPointerScale = {
    /** Multiplier from CSS-pixel delta to PIXI stage-pixel delta on the X axis. */
    x: number;
    /** Multiplier from CSS-pixel delta to PIXI stage-pixel delta on the Y axis. */
    y: number;
    resolution: number;
    screenWidth: number;
    screenHeight: number;
    cssWidth: number;
    cssHeight: number;
};
/**
 * Computes the conversion factor between CSS (client) pixels and PIXI stage pixels.
 *
 * PIXI's interaction systems (InteractionManager in v4–v7, EventSystem in v7+/v8)
 * map a native `clientX/Y` to a global/stage coordinate using
 * `(clientX - rect.left) * (canvas.width / rect.width) / resolution`,
 * which equals `(clientX - rect.left) * (renderer.screen.width / rect.width)`.
 *
 * When you receive native `PointerEvent`s outside PIXI's interaction system (e.g.
 * a window-level `pointermove`), you must apply this same factor to convert
 * client-pixel deltas into stage-pixel deltas. The factor is identical for WebGL,
 * Canvas, and WebGPU renderers — only the canvas accessor differs by PIXI version.
 */
export declare const getRendererPointerScale: (renderer: any) => RendererPointerScale;
/**
 * Convert an absolute client (CSS-pixel) coordinate to PIXI stage coordinates,
 * mirroring what PIXI's interaction system does internally.
 */
export declare const clientToStageCoords: (clientX: number, clientY: number, renderer: any) => {
    x: number;
    y: number;
};
/**
 * Register a renderer so downstream code (e.g. window-level drag handlers) can
 * recover it from the canvas alone. {@link resolvePixiRenderer} calls this
 * automatically; user code that constructs a renderer directly may call it too.
 */
export declare const registerPixiRenderer: (renderer: any) => void;
export declare const findRendererForCanvas: (canvas: HTMLCanvasElement | null | undefined) => any;
/**
 * Recover the canvas from a native pointer event by walking up the composed path
 * to the first HTMLCanvasElement (handling Shadow DOM via `composedPath`).
 */
export declare const findCanvasFromEvent: (event: Event | null | undefined) => HTMLCanvasElement | null;
export type ResolveRendererOptions = {
    width?: number;
    height?: number;
    forceWebgl?: boolean;
    forceWebgpu?: boolean;
    configureView?: boolean;
    canvas?: HTMLCanvasElement | null;
    view?: any;
    fallbackCanvas?: HTMLCanvasElement | null;
    size?: {
        width?: number;
        height?: number;
    };
    [key: string]: any;
};
export declare const resolvePixiRenderer: (options?: ResolveRendererOptions) => Promise<any>;
export declare const configureRendererView: (renderer: any, width: number, height: number, fallbackCanvas?: HTMLCanvasElement | null) => void;
export declare const renderContainer: (renderer: any, container: PIXI.Container, options?: {
    clear?: boolean;
}) => void;
export declare const ensurePixiGraphicsCompatibility: () => void;
export declare const getPixiVersion: () => number;
/**
 * Draw a filled rectangle on a Graphics object using the appropriate API for the PIXI version.
 * This bypasses the compat shim and uses native APIs directly for maximum reliability.
 */
export declare const drawFilledRect: (graphics: PIXI.Graphics, x: number, y: number, width: number, height: number, color?: number, alpha?: number) => PIXI.Graphics;
export interface BitmapTextLike extends PIXI.Container {
    text: string;
    maxWidth?: number;
    tint?: number;
    letterSpacing?: number;
    style?: any;
    destroy(options?: any): void;
}
export declare const createBitmapText: (text: string, style?: any) => BitmapTextLike;
export declare const getBitmapTextGlyphs: (bitmapText: BitmapTextLike) => PIXI.DisplayObject[];
export type BitmapFontMeasure = {
    /** Advance for `char` following `prevChar` (kerning-aware), in pixels at the target size. */
    measure: (char: string, prevChar: string | null) => number;
    /** Line height in pixels at the target size. */
    lineHeight: number;
};
/**
 * Build a glyph-measurement function from a registered bitmap font's metrics,
 * scaled to `fontSize` (defaults to the font's own base size). Returns null
 * when the font isn't in any cache — callers should fall back or inject their
 * own measure. Used by layout-driven components (TextArea) so the same pure
 * text-layout math works against real font metrics.
 */
export declare const createBitmapFontMeasure: (fontFamily: string, fontSize?: number) => BitmapFontMeasure | null;
export declare const setBitmapTextTint: (bitmapText: BitmapTextLike | null | undefined, tint: number | string | null | undefined) => void;
export declare const hasBitmapFont: (name: string) => boolean;
export declare const imageBitmapToCanvas: (imageBitmap: ImageBitmap) => HTMLCanvasElement;
export declare const imageBitmapToTexture: (imageBitmap: ImageBitmap, renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer, webGl: boolean) => PIXI.Texture;
export declare function assertGlobalPixi(context?: string): void;
//# sourceMappingURL=pixi-adapter-utils.d.ts.map
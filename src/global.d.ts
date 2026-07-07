declare global {
    namespace PIXI {
        // ---- core math types ----
        class Point {
            constructor(x?: number, y?: number);
            x: number;
            y: number;
            set(x: number, y?: number): this;
            copyFrom(p: { x: number; y: number }): this;
            clone(): Point;
        }

        class Rectangle {
            constructor(x?: number, y?: number, width?: number, height?: number);
            x: number;
            y: number;
            width: number;
            height: number;
            contains(x: number, y: number): boolean;
        }

        class RoundedRectangle {
            constructor(x?: number, y?: number, width?: number, height?: number, radius?: number);
            x: number;
            y: number;
            width: number;
            height: number;
            radius: number;
        }

        // ---- event types ----
        interface FederatedEventData {
            global: Point;
            originalEvent?: { movementX: number; movementY: number; [key: string]: unknown };
            [key: string]: unknown;
        }
        interface FederatedPointerEvent {
            global: Point;
            screen: Point;
            data: FederatedEventData;
            stopPropagation(): void;
            preventDefault(): void;
            target: DisplayObject | null;
            currentTarget: DisplayObject | null;
            type: string;
            button: number;
            buttons: number;
            originalEvent?: { movementX: number; movementY: number; [key: string]: unknown };
            [key: string]: unknown;
        }
        type InteractionEvent = FederatedPointerEvent;
        // Standard EventEmitter signature: handlers may receive anything from a custom emit() call.
        // Each call site should annotate its handler parameter with the type it actually expects.
        type EventListener = (...args: any[]) => void;

        // ---- DisplayObject / Container ----
        type EventMode = 'none' | 'passive' | 'auto' | 'static' | 'dynamic';

        class DisplayObject {
            x: number;
            y: number;
            position: Point;
            scale: Point;
            pivot: Point;
            rotation: number;
            angle: number;
            alpha: number;
            visible: boolean;
            renderable: boolean;
            interactive: boolean;
            interactiveChildren: boolean;
            buttonMode: boolean;
            cursor: string;
            eventMode: EventMode;
            hitArea: Rectangle | RoundedRectangle | { contains(x: number, y: number): boolean } | null;
            mask: DisplayObject | null;
            parent: Container | null;
            worldTransform: { tx: number; ty: number; a: number; b: number; c: number; d: number };
            on(event: string, fn: EventListener, context?: unknown): this;
            off(event: string, fn?: EventListener, context?: unknown): this;
            once(event: string, fn: EventListener, context?: unknown): this;
            emit(event: string, ...args: unknown[]): boolean;
            addListener(event: string, fn: EventListener): this;
            removeListener(event: string, fn?: EventListener): this;
            removeAllListeners(event?: string): this;
            getGlobalPosition(point?: Point, skipUpdate?: boolean): Point;
            getBounds(skipUpdate?: boolean): Rectangle;
            getLocalBounds(rect?: Rectangle): Rectangle;
            toGlobal(position: { x: number; y: number }, point?: Point): Point;
            toLocal(position: { x: number; y: number }, from?: DisplayObject, point?: Point): Point;
            destroy(options?: boolean | { children?: boolean; texture?: boolean; baseTexture?: boolean }): void;
            destroyed?: boolean;
        }

        class Container extends DisplayObject {
            constructor();
            children: DisplayObject[];
            width: number;
            height: number;
            sortableChildren: boolean;
            addChild<T extends DisplayObject>(...child: T[]): T;
            addChildAt<T extends DisplayObject>(child: T, index: number): T;
            removeChild<T extends DisplayObject>(...child: T[]): T;
            removeChildAt(index: number): DisplayObject;
            removeChildren(beginIndex?: number, endIndex?: number): DisplayObject[];
            getChildIndex(child: DisplayObject): number;
            setChildIndex(child: DisplayObject, index: number): void;
            getChildAt(index: number): DisplayObject;
            swapChildren(a: DisplayObject, b: DisplayObject): void;
            sortChildren(): void;
        }

        // ---- Texture / Sprite ----
        class BaseTexture {
            constructor(source?: HTMLImageElement | HTMLCanvasElement | ImageBitmap | unknown, options?: unknown);
            valid: boolean;
            hasLoaded?: boolean;
            width: number;
            height: number;
            source?: unknown;
            on(event: string, fn: (...args: unknown[]) => void, context?: unknown): this;
            off(event: string, fn?: (...args: unknown[]) => void, context?: unknown): this;
            once(event: string, fn: (...args: unknown[]) => void, context?: unknown): this;
            emit(event: string, ...args: unknown[]): boolean;
            destroy(): void;
        }

        class CanvasSource extends BaseTexture {
            constructor(options: { resource: HTMLImageElement | HTMLCanvasElement | ImageBitmap; [key: string]: unknown });
        }

        class Texture {
            constructor(baseTexture?: BaseTexture | { source?: unknown; frame?: unknown; [key: string]: unknown }, frame?: Rectangle);
            baseTexture: BaseTexture;
            source?: BaseTexture;
            width: number;
            height: number;
            valid: boolean;
            destroy(destroyBase?: boolean): void;
            static from(source: string | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap | unknown, options?: unknown): Texture;
            static WHITE: Texture;
            static EMPTY: Texture;
        }

        interface RenderTextureCreateOptions {
            width: number;
            height: number;
            scaleMode?: number;
            resolution?: number;
        }

        class RenderTexture extends Texture {
            static create(options: RenderTextureCreateOptions): RenderTexture;
            static create(width: number, height?: number, scaleMode?: number, resolution?: number): RenderTexture;
        }

        class Sprite extends Container {
            constructor(texture?: Texture);
            anchor: Point;
            texture: Texture;
            tint: number;
            static from(source: string | Texture | unknown, options?: unknown): Sprite;
        }

        // ---- Graphics (cross-version: v4-v7 fluent + v8 fluent) ----
        interface FillStyle {
            color?: number;
            alpha?: number;
            texture?: Texture;
        }
        interface StrokeStyle extends FillStyle {
            width?: number;
            cap?: 'butt' | 'round' | 'square';
            join?: 'bevel' | 'miter' | 'round';
            alignment?: number;
        }

        class Graphics extends Container {
            constructor();
            // v4–v7 fluent
            beginFill(color?: number, alpha?: number): this;
            beginTextureFill(options: { texture: Texture; alpha?: number; matrix?: unknown }): this;
            endFill(): this;
            lineStyle(width?: number, color?: number, alpha?: number, alignment?: number, native?: boolean): this;
            lineStyle(options: StrokeStyle): this;
            drawRect(x: number, y: number, width: number, height: number): this;
            drawRoundedRect(x: number, y: number, width: number, height: number, radius: number): this;
            drawCircle(x: number, y: number, radius: number): this;
            drawEllipse(x: number, y: number, width: number, height: number): this;
            drawPolygon(...points: number[]): this;
            moveTo(x: number, y: number): this;
            lineTo(x: number, y: number): this;
            // v8 fluent
            rect(x: number, y: number, width: number, height: number): this;
            roundRect(x: number, y: number, width: number, height: number, radius: number): this;
            circle(x: number, y: number, radius: number): this;
            ellipse(x: number, y: number, width: number, height: number): this;
            poly(points: number[] | { x: number; y: number }[]): this;
            fill(style?: number | FillStyle): this;
            stroke(style?: StrokeStyle): this;
            // shared
            clear(): this;
        }

        // ---- Text ----
        interface TextStyleOptions {
            fontFamily?: string | string[];
            fontSize?: number | string;
            fontStyle?: string;
            fontWeight?: string | number;
            fill?: number | string | number[] | string[] | { color?: number | string };
            stroke?: number | string | { color: number | string; width?: number };
            strokeThickness?: number;
            align?: 'left' | 'center' | 'right' | 'justify';
            wordWrap?: boolean;
            wordWrapWidth?: number;
            lineHeight?: number;
            letterSpacing?: number;
            padding?: number;
            dropShadow?: boolean | { color?: number | string; distance?: number; angle?: number; blur?: number };
            [key: string]: unknown;
        }

        class TextStyle {
            constructor(options?: TextStyleOptions);
            fontFamily: string | string[];
            fontSize: number;
            fontStyle: string;
            fontWeight: string | number;
            fill: number | string | unknown;
            stroke: number | string | unknown;
            strokeThickness: number;
            align: string;
            wordWrap: boolean;
            wordWrapWidth: number;
            lineHeight: number;
            letterSpacing: number;
            padding: number;
            [key: string]: unknown;
        }

        class Text extends Container {
            constructor(text?: string, style?: TextStyleOptions | TextStyle, options?: unknown);
            text: string;
            style: TextStyle;
            anchor: Point;
            tint: number;
            resolution: number;
            updateText(force?: boolean): void;
        }

        class BitmapText extends Container {
            constructor(text?: string | { text?: string; style?: unknown }, style?: unknown);
            text: string;
            fontName: string;
            fontSize: number;
            tint: number;
            anchor: Point;
            align: string;
            maxWidth: number;
            letterSpacing: number;
        }

        class BitmapFont {
            static from(name: string, style: TextStyleOptions | TextStyle, options?: unknown): BitmapFont;
            static install?(data: unknown, texture?: Texture): BitmapFont;
            static available?: { [name: string]: BitmapFont };
            font: { name?: string };
            chars: unknown;
        }

        // ---- Renderer / Application ----
        interface RendererPlugins {
            interaction?: {
                setTargetElement(canvas: HTMLCanvasElement): void;
                [key: string]: unknown;
            };
            [key: string]: unknown;
        }

        interface RendererEventSystem {
            setTargetElement(canvas: HTMLCanvasElement): void;
        }

        interface Renderer {
            type?: number;
            screen: Rectangle;
            view: HTMLCanvasElement;
            canvas?: HTMLCanvasElement;
            plugins?: RendererPlugins;
            events?: RendererEventSystem;
            options?: { transparent?: boolean; backgroundAlpha?: number; backgroundColor?: number };
            background?: { color: number; alpha: number };
            backgroundColor?: number;
            backgroundAlpha?: number;
            resolution: number;
            width: number;
            height: number;
            render(stage: DisplayObject, options?: unknown): void;
            resize(width: number, height: number): void;
            destroy(removeView?: boolean): void;
        }

        const RENDERER_TYPE: { CANVAS: number; WEBGL: number; WEBGL1?: number; WEBGL2?: number };

        class WebGLRenderer implements Renderer {
            constructor(options?: ApplicationOptions);
            type?: number;
            screen: Rectangle;
            view: HTMLCanvasElement;
            canvas?: HTMLCanvasElement;
            plugins?: RendererPlugins;
            events?: RendererEventSystem;
            options?: { transparent?: boolean; backgroundAlpha?: number; backgroundColor?: number };
            background?: { color: number; alpha: number };
            backgroundColor?: number;
            backgroundAlpha?: number;
            resolution: number;
            width: number;
            height: number;
            render(stage: DisplayObject, options?: unknown): void;
            resize(width: number, height: number): void;
            destroy(removeView?: boolean): void;
        }

        class CanvasRenderer extends WebGLRenderer {}

        function autoDetectRenderer(options?: ApplicationOptions): Renderer;

        interface Ticker {
            start(): void;
            stop(): void;
            add(fn: (delta: number) => void, context?: unknown): Ticker;
            remove(fn: (delta: number) => void, context?: unknown): Ticker;
            destroy(): void;
        }

        interface ApplicationOptions {
            width?: number;
            height?: number;
            backgroundColor?: number;
            backgroundAlpha?: number;
            antialias?: boolean;
            resolution?: number;
            view?: HTMLCanvasElement;
            canvas?: HTMLCanvasElement;
            forceCanvas?: boolean;
            transparent?: boolean;
            autoStart?: boolean;
            sharedTicker?: boolean;
            [key: string]: unknown;
        }

        class Application {
            constructor(options?: ApplicationOptions);
            init(options?: ApplicationOptions): Promise<void>;
            stage: Container;
            renderer: Renderer;
            ticker: Ticker;
            view: HTMLCanvasElement;
            canvas?: HTMLCanvasElement;
            screen: Rectangle;
            destroy(removeView?: boolean, stageOptions?: { children?: boolean; texture?: boolean; baseTexture?: boolean }): void;
        }

        // ---- Loaders ----
        interface ResourceMap {
            [key: string]: { url: string; texture?: Texture; data?: unknown; [key: string]: unknown };
        }

        class Loader {
            constructor();
            baseUrl: string;
            progress: number;
            loading: boolean;
            resources: ResourceMap;
            add(name: string, url?: string, options?: unknown, cb?: (...args: unknown[]) => void): this;
            add(url: string): this;
            add(options: { name?: string; url?: string; src?: string; alias?: string; [key: string]: unknown }): this;
            pre(fn: (...args: unknown[]) => unknown): this;
            use(fn: (...args: unknown[]) => unknown): this;
            reset(): this;
            load(cb?: (loader: Loader, resources: ResourceMap) => void): this;
            on(event: string, fn: (...args: unknown[]) => void): this;
            off(event: string, fn?: (...args: unknown[]) => void): this;
            static shared: Loader;
        }

        namespace loaders {
            class Loader extends PIXI.Loader {}
        }

        // The shared loader instance (v4: PIXI.loader)
        const loader: Loader;

        // Asset system (v7+)
        const Assets: {
            load(asset: string | { src?: string; alias?: string; [key: string]: unknown } | string[]): Promise<unknown>;
            add(asset: { alias: string; src: string } | { alias: string; src: string }[]): void;
            get(alias: string): unknown;
            unload(alias: string | string[]): Promise<void>;
            init(options?: unknown): Promise<void>;
            [key: string]: unknown;
        };

        // ---- utils namespace ----
        interface UtilsNamespace {
            string2hex(value: string): number;
            hex2string(value: number): string;
            isWebGLSupported(): boolean;
            centerObject(object: DisplayObject, target: { width: number; height: number }, axis?: 'x' | 'y' | 'both'): void;
            [key: string]: unknown;
        }
        const utils: UtilsNamespace;

        // ---- settings & env (v4-v6 control) ----
        const settings: {
            PREFER_ENV?: number;
            RESOLUTION?: number;
            ROUND_PIXELS?: boolean;
            [key: string]: unknown;
        };
        const ENV: { CANVAS: number; WEBGL: number; WEBGL2?: number };

        // ---- VERSION ----
        const VERSION: string;
    }
}

export {};

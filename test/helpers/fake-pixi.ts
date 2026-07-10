/// <reference path="../../src/global.d.ts" />
/**
 * Minimal fake of the global PIXI namespace so components can be unit tested
 * in Node without a renderer. Install BEFORE requiring any src module that
 * references the PIXI global at module-evaluation time (class extends).
 *
 * The fake mirrors the v8 global surface by default (`PIXI.utils` absent,
 * BitmapText takes an options object). Mutate `(PIXI as any).VERSION` inside
 * a test to exercise version-specific branches.
 */

declare global {
    // Tests run under ts-node in CommonJS mode without @types/node; they use
    // require() so modules load AFTER the fake PIXI global is installed
    // (static imports would hoist above the install call).
    function require(id: string): any;
}

type Listener = (...args: any[]) => void;

class FakeEventEmitter {
    private _listeners: Record<string, Listener[]> = {};

    on(event: string, fn: Listener) {
        (this._listeners[event] ??= []).push(fn);
        return this;
    }

    once(event: string, fn: Listener) {
        const wrapped = (...args: any[]) => {
            this.off(event, wrapped);
            fn(...args);
        };
        return this.on(event, wrapped);
    }

    off(event: string, fn?: Listener) {
        if (!fn) {
            delete this._listeners[event];
            return this;
        }
        this._listeners[event] = (this._listeners[event] ?? []).filter((l) => l !== fn);
        return this;
    }

    removeListener(event: string, fn?: Listener) {
        return this.off(event, fn);
    }

    emit(event: string, ...args: any[]) {
        const listeners = (this._listeners[event] ?? []).slice();
        listeners.forEach((fn) => fn(...args));
        return listeners.length > 0;
    }
}

class FakePoint {
    constructor(public x: number = 0, public y: number = 0) {}
    set(x: number, y?: number) {
        this.x = x;
        this.y = y ?? x;
        return this;
    }
    clone() {
        return new FakePoint(this.x, this.y);
    }
}

class FakeRectangle {
    constructor(
        public x: number = 0,
        public y: number = 0,
        public width: number = 0,
        public height: number = 0,
    ) {}
    contains(x: number, y: number) {
        return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
    }
}

class FakeContainer extends FakeEventEmitter {
    x = 0;
    y = 0;
    visible = true;
    alpha = 1;
    parent: FakeContainer | null = null;
    children: FakeContainer[] = [];
    mask: any = null;
    hitArea: any = null;
    interactive = false;
    interactiveChildren = false;
    buttonMode = false;
    cursor = '';
    destroyed = false;
    scale = new FakePoint(1, 1);
    pivot = new FakePoint(0, 0);

    protected _width = 0;
    protected _height = 0;

    get width() {
        return this._width;
    }
    set width(v: number) {
        this._width = v;
    }
    get height() {
        return this._height;
    }
    set height(v: number) {
        this._height = v;
    }

    addChild<T>(child: T): T {
        const c = child as unknown as FakeContainer;
        if (c.parent) {
            c.parent.removeChild(c);
        }
        c.parent = this;
        this.children.push(c);
        return child;
    }

    removeChild<T>(child: T): T {
        const c = child as unknown as FakeContainer;
        this.children = this.children.filter((existing) => existing !== c);
        if (c.parent === this) {
            c.parent = null;
        }
        return child;
    }

    toLocal(p: { x: number; y: number }) {
        return new FakePoint(p.x - this.x, p.y - this.y);
    }

    destroy(_options?: any) {
        this.destroyed = true;
    }
}

/**
 * Graphics that records draw calls so tests can assert on drawing behavior.
 * Like real PIXI Graphics, width/height derive from the drawn geometry
 * (unless a test sets them explicitly).
 */
class FakeGraphics extends FakeContainer {
    calls: Array<{ method: string; args: any[] }> = [];
    private _boundsW = 0;
    private _boundsH = 0;

    override get width() {
        return this._width || this._boundsW;
    }
    override set width(v: number) {
        this._width = v;
    }
    override get height() {
        return this._height || this._boundsH;
    }
    override set height(v: number) {
        this._height = v;
    }

    private _record(method: string, args: any[]) {
        this.calls.push({ method, args });
        return this;
    }

    private _grow(maxX: number, maxY: number) {
        this._boundsW = Math.max(this._boundsW, maxX);
        this._boundsH = Math.max(this._boundsH, maxY);
    }

    clear() {
        this.calls.push({ method: 'clear', args: [] });
        this._boundsW = 0;
        this._boundsH = 0;
        return this;
    }
    beginFill(...args: any[]) {
        return this._record('beginFill', args);
    }
    endFill(...args: any[]) {
        return this._record('endFill', args);
    }
    lineStyle(...args: any[]) {
        return this._record('lineStyle', args);
    }
    drawRect(x = 0, y = 0, w = 0, h = 0) {
        this._grow(x + w, y + h);
        return this._record('drawRect', [x, y, w, h]);
    }
    drawRoundedRect(x = 0, y = 0, w = 0, h = 0, r = 0) {
        this._grow(x + w, y + h);
        return this._record('drawRoundedRect', [x, y, w, h, r]);
    }
    drawCircle(x = 0, y = 0, r = 0) {
        this._grow(x + r, y + r);
        return this._record('drawCircle', [x, y, r]);
    }
    moveTo(...args: any[]) {
        return this._record('moveTo', args);
    }
    lineTo(...args: any[]) {
        return this._record('lineTo', args);
    }
    rect(x = 0, y = 0, w = 0, h = 0) {
        this._grow(x + w, y + h);
        return this._record('rect', [x, y, w, h]);
    }
    roundRect(x = 0, y = 0, w = 0, h = 0, r = 0) {
        this._grow(x + w, y + h);
        return this._record('roundRect', [x, y, w, h, r]);
    }
    circle(x = 0, y = 0, r = 0) {
        this._grow(x + r, y + r);
        return this._record('circle', [x, y, r]);
    }
    poly(...args: any[]) {
        return this._record('poly', args);
    }
    fill(...args: any[]) {
        return this._record('fill', args);
    }
    stroke(...args: any[]) {
        return this._record('stroke', args);
    }
}

class FakeBaseTexture extends FakeEventEmitter {
    source: any;
    width = 0;
    height = 0;
    hasLoaded = false;
    valid = false;

    constructor(source: any = null) {
        super();
        this.source = source;
        if (source && typeof source === 'object') {
            this.width = source.width ?? 0;
            this.height = source.height ?? 0;
        }
    }

    _sourceLoaded() {
        this.hasLoaded = true;
        this.valid = true;
    }
}

class FakeTexture {
    baseTexture: FakeBaseTexture;

    constructor(base: any) {
        this.baseTexture = base instanceof FakeBaseTexture ? base : new FakeBaseTexture(base);
    }

    static from(source: any) {
        return new FakeTexture(source);
    }
}

class FakeSprite extends FakeContainer {
    texture: any = null;
    anchor = new FakePoint(0, 0);

    // Real sprites derive their size from the texture; mirror that unless
    // a test sets width/height explicitly.
    override get width() {
        return this._width || this.texture?.width || 0;
    }
    override set width(v: number) {
        this._width = v;
    }
    override get height() {
        return this._height || this.texture?.height || 0;
    }
    override set height(v: number) {
        this._height = v;
    }
}

class FakeText extends FakeContainer {
    text: string;
    style: any;
    anchor = new FakePoint(0, 0);

    constructor(text: string | { text?: string; style?: any } = '', style: any = {}) {
        super();
        if (typeof text === 'object' && text !== null) {
            this.text = text.text ?? '';
            this.style = text.style ?? {};
        } else {
            this.text = text;
            this.style = style;
        }
    }
}

/**
 * BitmapText fake. Size scales with the text so layout math is observable:
 * width = 6px per char, height = 8 + text.length (artificial, but lets tests
 * distinguish labels of different lengths).
 */
class FakeBitmapText extends FakeContainer {
    text: string;
    style: any;
    tint = 0xffffff;
    maxWidth = 0;

    constructor(textOrOptions: any, style?: any) {
        super();
        if (textOrOptions && typeof textOrOptions === 'object') {
            this.text = String(textOrOptions.text ?? '');
            this.style = textOrOptions.style ?? {};
        } else {
            this.text = String(textOrOptions ?? '');
            this.style = style ?? {};
        }
    }

    override get width() {
        return this._width || this.text.length * 6;
    }
    override set width(v: number) {
        this._width = v;
    }
    override get height() {
        return this._height || 8 + this.text.length;
    }
    override set height(v: number) {
        this._height = v;
    }
}

export type FakePixiNamespace = {
    VERSION: string;
    Point: typeof FakePoint;
    Rectangle: typeof FakeRectangle;
    Container: typeof FakeContainer;
    Graphics: typeof FakeGraphics;
    Sprite: typeof FakeSprite;
    Text: typeof FakeText;
    BitmapText: typeof FakeBitmapText;
    [key: string]: any;
};

export const createFakePixi = (version = '8.5.1'): FakePixiNamespace => ({
    VERSION: version,
    Point: FakePoint,
    Rectangle: FakeRectangle,
    Container: FakeContainer,
    Graphics: FakeGraphics,
    Sprite: FakeSprite,
    Text: FakeText,
    BitmapText: FakeBitmapText,
    BaseTexture: FakeBaseTexture,
    Texture: FakeTexture,
});

/**
 * Install the fake PIXI global (plus requestAnimationFrame shims used by
 * animation code). Returns the namespace so tests can tweak it.
 */
export const installFakePixi = (version = '8.5.1'): FakePixiNamespace => {
    const fake = createFakePixi(version);
    (globalThis as any).PIXI = fake;
    (globalThis as any).window = (globalThis as any).window ?? globalThis;
    if (typeof (globalThis as any).document === 'undefined') {
        // Minimal functional event target so components that attach document
        // listeners (wheel scroll, outside-click blur) can be driven in tests
        // via document.dispatchEvent({ type, ... }).
        const listeners: Record<string, Set<(event: any) => void>> = {};
        (globalThis as any).document = {
            addEventListener(type: string, handler: (event: any) => void) {
                (listeners[type] ??= new Set()).add(handler);
            },
            removeEventListener(type: string, handler: (event: any) => void) {
                listeners[type]?.delete(handler);
            },
            dispatchEvent(event: { type: string }) {
                listeners[event.type]?.forEach((handler) => handler(event));
                return true;
            },
            createElement: (tag: string) => ({
                tag,
                width: 0,
                height: 0,
                getContext: () => ({ drawImage() {} }),
            }),
        };
    }
    if (typeof (globalThis as any).requestAnimationFrame !== 'function') {
        (globalThis as any).requestAnimationFrame = (cb: (t: number) => void) =>
            setTimeout(() => cb(Date.now()), 16);
        (globalThis as any).cancelAnimationFrame = (handle: any) => clearTimeout(handle);
    }
    return fake;
};

export {
    FakeContainer,
    FakeGraphics,
    FakeSprite,
    FakeText,
    FakeBitmapText,
    FakeRectangle,
    FakePoint,
    FakeBaseTexture,
    FakeTexture,
};

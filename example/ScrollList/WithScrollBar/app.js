Array.prototype.random = function () {
    return this[Math.floor((Math.random()*this.length))];
}

const canvas = document.getElementById('canvas');
const adapter = window.PIXI_DOM || {};
if (typeof adapter.ensurePixiCanvasFallback === 'function') {
    adapter.ensurePixiCanvasFallback();
}

const RENDER_WIDTH = 600;
const RENDER_HEIGHT = 600;

if (canvas) {
    canvas.width = RENDER_WIDTH;
    canvas.height = RENDER_HEIGHT;
    if (canvas.style) {
        canvas.style.width = `${RENDER_WIDTH}px`;
        canvas.style.height = `${RENDER_HEIGHT}px`;
    }
}

let renderer = null;

const stage = new PIXI.Container();
stage.width = RENDER_WIDTH;
stage.height = RENDER_HEIGHT;

const renderStage = () => {
    if (!renderer) {
        return;
    }
    if (typeof adapter.renderContainer === 'function') {
        adapter.renderContainer(renderer, stage);
    } else if (typeof renderer.render === 'function') {
        renderer.render(stage);
    }
};

const useWebgpu = new URLSearchParams(location.search).get('renderer') === 'webgpu';

const initializeRenderer = async () => {
    const rendererOptions = {
        width: RENDER_WIDTH,
        height: RENDER_HEIGHT,
        antialias: false,
        roundPixels: true,
        resolution: 1,
        view: canvas,
        configureView: true,
        fallbackCanvas: canvas,
        ...(useWebgpu ? { forceWebgpu: true } : { forceWebgl: true }),
    };

    try {
        if (typeof adapter.resolvePixiRenderer === 'function') {
            renderer = await adapter.resolvePixiRenderer(rendererOptions);
        } else {
            const candidate = PIXI.autoDetectRenderer(rendererOptions);
            renderer = candidate && typeof candidate.then === 'function' ? await candidate : candidate;
        }
    } catch (error) {
        console.error('Failed to initialize PIXI renderer', error);
        renderer = null;
        return;
    }

    if (!renderer) {
        console.error('PIXI renderer is unavailable.');
        return;
    }

    if (typeof adapter.configureRendererView === 'function') {
        adapter.configureRendererView(renderer, RENDER_WIDTH, RENDER_HEIGHT, canvas);
    } else if (typeof renderer.resize === 'function') {
        try {
            renderer.resize(RENDER_WIDTH, RENDER_HEIGHT);
        } catch (error) {
            /* noop */
        }
    }

    const view = renderer.view || renderer.canvas;
    if (view) {
        view.width = RENDER_WIDTH;
        view.height = RENDER_HEIGHT;
        if (view.style) {
            view.style.width = `${RENDER_WIDTH}px`;
            view.style.height = `${RENDER_HEIGHT}px`;
        }
    }

    if (typeof window !== 'undefined') {
        window.renderer = renderer;
        window.stage = stage;
    }

    renderStage();
};

initializeRenderer();

let scrollListWidth = 300;
let scrollListHeight = 400;
const SHOW_DEBUG_CONTROLS = /controls=1/.test(window.location.search);

const COLOR_PALETTE = [
    0x8e44ad,
    0x2980b9,
    0x27ae60,
    0xc0392b,
    0xf39c12,
    0x16a085,
    0x2c3e50,
    0xd35400,
    0x7f8c8d,
    0xbdc3c7,
];

let colorPointer = 0;
function getRandomColor() {
    const color = COLOR_PALETTE[colorPointer % COLOR_PALETTE.length];
    colorPointer++;
    return color;
}

function redrawWithBorder(el) {
}

function createOptions(n, borderWidth) {
    const options = [];
    if(!borderWidth && borderWidth != 0) {
        borderWidth = 3; // default to 5
    }
    for(let i = 0; i < n; i++) {
        const g = new PIXI.Graphics();
        const randomColor = getRandomColor();
        const el = new PIXI.Element();
        el.addChild(g);
        let isOver = false;
        let isDown = false;
        function drawNormal() {
            isOver = false;
            isDown = false;
            g.clear();
            g.beginFill(randomColor, 1);
            g.drawRect(0, 0, scrollListWidth, 50);
            g.endFill();
        }
        function drawHover() {
            isOver = true;
            if(isDown) return;
            g.clear();
            g.lineStyle(5, 0xffffff);
            g.beginFill(randomColor, 1);
            g.drawRect(5, 5, scrollListWidth - 10, 40);
            g.endFill();
        }
        function drawDown() {
            isDown = true;
            g.clear();
            g.lineStyle(10, 0xffffff);
            g.beginFill(randomColor, 1);
            g.drawRect(10, 10, scrollListWidth - 20, 30);
            g.endFill();
        }
        function drawUp() {
            isDown = false;
            isOver ? drawHover() : drawNormal();
        }

        /*
        const g2 = new PIXI.Graphics();
        g2.interactive = true;
        g2.beginFill(0x000000);
        g2.drawRect(0, 0, 20, 20);
        g2.on('pointerdown', () => {
           console.log('clicked g2 of', i);
        });
        el.addChild(g2);
        g2.x = 50;

         */

        drawNormal();
        el.onMouseDown(() => {
            drawDown();
        });
        el.onMouseUp(drawUp);
        el.onMouseUpOutside(drawUp);
        el.onMouseOver(drawHover);
        el.onMouseOut(drawNormal);

        el.on('pointerdown', () => {
            console.log('POINTER DOWN ON', i);
        });
        el.on('pointerup', () => {
            console.log('POINTER UP ON', i);
        });
        el.on('hide', () => {
            drawNormal();
        });
        el.on('show', () => {
        });
        options.push(el);
    }
    return options;
}

const scrollList = new PIXI.ScrollList({ width: scrollListWidth, height: scrollListHeight, scrollBarOptions: { width: 30, height: 100, backgroundColor: 0x233240, scrollerOptions: { color: 0xff5252 } }}, null, { disableTouchScroll: true });
scrollList.addScrollItems(createOptions(40, 5));
stage.addChild(scrollList);
scrollList.y = 100;
scrollList.x = 100;

function renderFrames(iterations) {
    const frames = Math.max(1, iterations || 1);
    for (let i = 0; i < frames; i++) {
        renderStage();
    }
}

window.__PIXIDOM__ = window.__PIXIDOM__ || {};
window.__PIXIDOM__.scrollListWithBarDemo = {
    scrollList,
    getScrollPosition: () => typeof scrollList.currentScroll === 'number' ? scrollList.currentScroll : 0,
    setScrollPercent: (percent) => {
        if (typeof scrollList.setScrollPercent === 'function') {
            scrollList.setScrollPercent(percent);
        }
    },
    advance: (delta, steps) => {
        renderFrames(steps);
    },
    getScrollerPoints: () => {
        const bar = scrollList['scrollBar'];
        const scroller = bar && bar['scroller'];
        const view = renderer && (renderer.canvas || renderer.view?.canvas || renderer.view);
        if (!bar || !scroller || !view || typeof scroller.getBounds !== 'function' || typeof view.getBoundingClientRect !== 'function') {
            return null;
        }
        const canvasRect = view.getBoundingClientRect();
        const bounds = scroller.getBounds();
        const centerX = bounds.x - canvasRect.left + bounds.width / 2;
        const centerY = bounds.y - canvasRect.top + bounds.height / 2;
        const travel = Math.max(0, bar.visibleLength - scroller.height);
        return {
            start: { x: centerX, y: centerY },
            mid: { x: centerX, y: centerY + travel / 2 },
        };
    },
};

if (SHOW_DEBUG_CONTROLS) {
    const loader = typeof adapter.getPixiLoader === 'function'
        ? adapter.getPixiLoader()
        : (PIXI.loader || (PIXI.Loader && PIXI.Loader.shared));
    if (loader && typeof loader.add === 'function') {
        loader.add('../../fonts/small.fnt');
        loader.load(() => {
        const addTenButton = new PIXI.extras.BitmapText('Add 10 options', { font: 'small', align: "left" });
        addTenButton.interactive = true;
        addTenButton.buttonMode = true;
        addTenButton.tint = 0xffffff;
        addTenButton.on('pointertap', () => {
            scrollList.addScrollItems(createOptions(10, 5));
            if(scrollList.options.length > 10) {
                removeLast10Button.visible = true;
            }
        });
        stage.addChild(addTenButton);
        addTenButton.x = stage.width - addTenButton.width;
        addTenButton.y = 20;

        const removeLast10Button = new PIXI.extras.BitmapText('Remove last 10 options', { font: 'small', align: "left" });
        removeLast10Button.interactive = true;
        removeLast10Button.buttonMode = true;
        removeLast10Button.tint = 0xffffff;
        removeLast10Button.on('pointertap', () => {
            scrollList.spliceScrollItems(scrollList.options.length - 10);
            if(scrollList.options.length <= 10) {
                removeLast10Button.visible = false;
            }
        });
        stage.addChild(removeLast10Button);
        removeLast10Button.x = stage.width - addTenButton.width;
        removeLast10Button.y = 35;

        const dec = new PIXI.extras.BitmapText('Decrease height by 50 pixels', { font: 'small', align: "left" });
        dec.interactive = true;
        dec.buttonMode = true;
        dec.tint = 0xffffff;
        dec.on('pointertap', () => {
            scrollListHeight -= 50;
            scrollList.resize(scrollListWidth, scrollListHeight);
        });
        stage.addChild(dec);
        dec.x = stage.width - dec.width;
        dec.y = 50;

        const inc = new PIXI.extras.BitmapText('Increase height by 50 pixels', { font: 'small', align: "left" });
        inc.interactive = true;
        inc.buttonMode = true;
        inc.tint = 0xffffff;
        inc.on('pointertap', () => {
            scrollListHeight += 50;
            scrollList.resize(scrollListWidth, scrollListHeight);
        });
        stage.addChild(inc);
        inc.x = stage.width - inc.width;
        inc.y = 65;
        });
    } else {
        console.warn('Unable to resolve PIXI loader for ScrollList debug controls.');
    }
}

setInterval(renderStage, 1000/60);
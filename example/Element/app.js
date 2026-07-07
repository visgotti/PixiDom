const canvas = document.getElementById('canvas');
const RENDER_WIDTH = 600;
const RENDER_HEIGHT = 600;

const adapter = PIXI_DOM;

adapter.ensurePixiCanvasFallback();

let renderer = null;
let stage = null;

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

const useWebgpu = new URLSearchParams(location.search).get('renderer') === 'webgpu';

const run = async () => {
    const rendererOptions = {
        width: RENDER_WIDTH,
        height: RENDER_HEIGHT,
        antialias: false,
        roundPixels: true,
        resolution: 1,
        canvas,
        ...(useWebgpu ? { forceWebgpu: true } : { forceWebgl: true }),
    };

    try {
        renderer = await adapter.resolvePixiRenderer(rendererOptions);
    } catch (error) {
        console.error('Failed to initialize PIXI renderer', error);
        return;
    }

    if (!renderer) {
        console.error('PIXI renderer resolved to an invalid value');
        return;
    }
    stage = new PIXI.Container();
    stage.__pixiDomWidth = RENDER_WIDTH;
    stage.__pixiDomHeight = RENDER_HEIGHT;

    const rect = new PIXI.Graphics();
    rect.beginFill(0xFFFF00);
    rect.lineStyle(5, 0xFF0000);
    rect.drawRect(0, 0, 100, 100);

    const element = new PIXI.Element();
    element.addChild(rect);
    stage.addChild(element);
    element.center();

    const events = [];

    element.onSwipeUp((power) => {
        events.push('swipe up');
    });

    element.onSwipeDown((power) => {
        events.push('swipe down');
    });

    element.onDragStart((event) => {
        console.log('drag start event', event);
        events.push('drag start');
    }, 50);

    element.onHeldDown(() => {
        console.log('held down for a second');
    }, 1000);

    element.onHeldDown(() => {
        console.log('held down for 3 seconds');
    }, 3000);

    element.onDragEnd((event) => {
        events.push('drag end');
    });

    element.onDragMove((event) => {
        events.push('drag move');
    });
    element.onMouseDown((event) => {
        events.push('mouse down');
    });
    element.onMouseMove((event) => {
        events.push('mouse move');
    });
    element.onMouseOut((event) => {
        events.push('mouse out');
    });
    element.onMouseOver((event) => {
        events.push('mouse over');
    });
    element.onMouseUp((event) => {
        events.push('mouse up');
    });
    element.onDoubleClick((event) => {
        events.push('double click');
    });

    const renderLoop = () => {
        adapter.renderContainer(renderer, stage);
    };

    renderLoop();

    setInterval(() => {
        renderLoop();
        if (events.length) {
            console.log('Events detected: (within 1 fps loop)', events.filter(onlyUnique).join(', '));
        }
        events.length = 0;
    }, 1000 / 1);
};

run();
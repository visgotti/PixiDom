const canvas = document.getElementById('canvas');
const RENDER_WIDTH = 600;
const RENDER_HEIGHT = 600;

const adapter = PIXI_DOM;

adapter.ensurePixiCanvasFallback();

let renderer = null;
let stage = null;

const SLIDER_OPTS = {
    width: 100,
    height: 3,
    borderRadius: 50,
    circleColor: 0xff000,
    circleRadius: 5,
    circleOutlineWidth: 1,
    circleOutlineColor: 0x007a08,
    activeColor: 0x00ff00,
    inactiveColor: 0x0000ff,
    down: {
      circleColor: 0x007a08,
      circleOutlineColor: 0x003d04,
    },
    startingValue: 25,
    minValue: 2,
    maxValue: 50,
  };

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
    stage.width = RENDER_WIDTH;
    stage.height = RENDER_HEIGHT;

    const loader = adapter.getPixiLoader();
    loader.load(() => {
        const slider = new PIXI.Slider(SLIDER_OPTS);
        stage.addChild(slider);
        console.log({ slider });
        slider.x = 50;
        slider.y = 50;
        slider.onChange((e) => {
            console.log('changed', e);
        });

        const renderLoop = () => {
            adapter.renderContainer(renderer, stage);
        };

        renderLoop();
        setInterval(renderLoop, 1000 / 30);
    });
};

run();
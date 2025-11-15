const canvas = document.getElementById('canvas');
const RENDER_WIDTH = 600;
const RENDER_HEIGHT = 600;

const adapter = PIXI_DOM;

adapter.ensurePixiCanvasFallback();

let renderer = null;
let stage = null;

const run = async () => {
    const rendererOptions = {
        width: RENDER_WIDTH,
        height: RENDER_HEIGHT,
        antialias: false,
        roundPixels: true,
        resolution: 1,
        canvas,
        forceWebgl: true,
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
    loader.add('../fonts/small.fnt');
    loader.load(() => {
        const button = new PIXI.Button("default no texture", {
            font: 'small',
            defaultStyle: {
                width: 100,
                height: 50,
                textColor: 0x000000,
                backgroundColor: 0xffffff,
            },
            hoverStyle: {
                width: 100,
                height: 50,
                textColor: 0xffffff,
                backgroundColor: 0x000000,
            },
            pressedStyle: {
                width: 100,
                height: 50,
                textColor: 0xfff000,
                backgroundColor: 0x000fff,
            },
        });

        stage.addChild(button);
        button.x = 50;
        button.y = 50;
        button.onClick(() => {
            console.log('CLICKED');
        });

        const renderLoop = () => {
            adapter.renderContainer(renderer, stage);
        };

        renderLoop();
        setInterval(renderLoop, 1000 / 30);
    });
};

run();
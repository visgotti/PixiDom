import { getPixiVersion, getPixiLoader, newPixiLoader, registerPixiRenderer } from './pixi-adapter-utils';
import { colorToInt, type Color } from './color';

export interface CreateAppOptions {
    width?: number;
    height?: number;
    /** Background color of the canvas. Accepts any {@link Color} format. */
    backgroundColor?: Color;
    antialias?: boolean;
    forceCanvas?: boolean;
    [key: string]: any;
}

const createApp = async (canvas: HTMLCanvasElement, opts: CreateAppOptions = {}): Promise<any> => {
    const {
        width = 800,
        height = 600,
        backgroundColor = 0x000000,
        antialias = true,
        forceCanvas = false,
        ...rest
    } = opts;

    const normalizedBackgroundColor = colorToInt(backgroundColor);

    const v = Math.floor(getPixiVersion());
    const PixiApp = (PIXI as any).Application;
    let app: any;

    if (v >= 8) {
        app = new PixiApp();
        await app.init({ width, height, backgroundColor: normalizedBackgroundColor, antialias, canvas, ...rest });
    } else {
        app = new PixiApp({ width, height, backgroundColor: normalizedBackgroundColor, antialias, view: canvas, forceCanvas, ...rest });
    }

    if (app.ticker) {
        app.ticker.start();
        if (v < 8) {
            app.ticker.add(() => app.renderer.render(app.stage));
        }
    }

    if (v >= 7 && app.renderer.events) {
        app.renderer.events.setTargetElement(canvas);
    } else if (v >= 5 && app.renderer.plugins && app.renderer.plugins.interaction) {
        app.renderer.plugins.interaction.setTargetElement(canvas);
    }

    if (v >= 7 && typeof app.stage.eventMode !== 'undefined') {
        app.stage.eventMode = 'static';
    } else {
        app.stage.interactive = true;
    }
    app.stage.interactiveChildren = true;

    // Register so window-level drag handlers can recover the renderer from the
    // canvas alone and apply the correct stage<->client scale per move.
    registerPixiRenderer(app.renderer);

    return app;
};

export const PixiAdapter = {
    createApp,
    getPixiVersion,
    getLoader: getPixiLoader,
    newLoader: newPixiLoader,
};

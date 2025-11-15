const canvas = document.getElementById('canvas');
const RENDER_WIDTH = 600;
const RENDER_HEIGHT = 600;

const adapter = PIXI_DOM;

adapter.ensurePixiCanvasFallback();

let renderer = null;
let stage = null;
let tickInterval = null;

const renderStage = () => {
    if (!renderer || !stage) {
        return;
    }

    adapter.renderContainer(renderer, stage);
};

const run = async () => {
    const pixiVersion = typeof adapter.getPixiVersion === 'function'
        ? adapter.getPixiVersion()
        : parseFloat((PIXI && PIXI.VERSION) || '0');
    const rendererOptions = {
        width: RENDER_WIDTH,
        height: RENDER_HEIGHT,
        antialias: false,
        roundPixels: pixiVersion < 8,
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

    tickInterval = setInterval(() => {
        renderStage();
    }, 1000 / 30);

    const FontLoader = adapter.FontLoader || null;
    if (FontLoader) {
        const fontLoader = new FontLoader();
        fontLoader.add('medium', '../fonts/medium.fnt');
        fontLoader.load(() => {
            bootstrapExamples();
        });
    } else {
        const loader = adapter.getPixiLoader();
        loader.add('../fonts/medium.fnt');
        loader.load(() => {
            bootstrapExamples();
        });
    }

    const disposeInterval = () => {
        if (typeof clearInterval === 'function' && tickInterval) {
            clearInterval(tickInterval);
            tickInterval = null;
        }
    };

    if (renderer && typeof renderer.on === 'function') {
        renderer.on('destroy', disposeInterval);
    }
};

function createBitmapText(text, style) {
    const resolvedStyle = style ? { ...style } : undefined;
    let tintOverride = null;
    const hasExplicitTint = resolvedStyle && (resolvedStyle.fill != null || resolvedStyle.tint != null);
    if (resolvedStyle) {
        if (resolvedStyle.font && !resolvedStyle.fontName) {
            resolvedStyle.fontName = resolvedStyle.font;
        }
        if (resolvedStyle.fontName && !resolvedStyle.font) {
            resolvedStyle.font = resolvedStyle.fontName;
        }
        if (resolvedStyle.fontName && !resolvedStyle.fontFamily) {
            resolvedStyle.fontFamily = resolvedStyle.fontName;
        }
        if (hasExplicitTint) {
            const desiredTint = resolvedStyle.fill ?? resolvedStyle.tint;
            if (typeof desiredTint === 'string' && PIXI.utils?.string2hex) {
                try {
                    tintOverride = PIXI.utils.string2hex(desiredTint);
                } catch (error) {
                    tintOverride = null;
                }
            } else {
                tintOverride = desiredTint;
            }
        }
    }
    const pixiVersion = typeof adapter.getPixiVersion === 'function'
        ? adapter.getPixiVersion()
        : parseFloat((PIXI && PIXI.VERSION) || '0');
    if (!hasExplicitTint && pixiVersion >= 8) {
        tintOverride = 0xffffff;
    }
    if (resolvedStyle && pixiVersion >= 8) {
        if (tintOverride != null) {
            resolvedStyle.fill = tintOverride;
        } else if (!hasExplicitTint) {
            resolvedStyle.fill = 0xffffff;
        }
        if (tintOverride != null && resolvedStyle.tint == null) {
            resolvedStyle.tint = tintOverride;
        }
    }
    if (adapter && typeof adapter.createBitmapText === 'function') {
        const instance = adapter.createBitmapText(text, resolvedStyle);
        if (typeof instance.roundPixels !== 'undefined') {
            instance.roundPixels = true;
        }
        if (tintOverride != null && typeof adapter.setBitmapTextTint === 'function') {
            adapter.setBitmapTextTint(instance, tintOverride);
        }
        return instance;
    }
    if (PIXI.BitmapText) {
        if (pixiVersion >= 8) {
            const instance = new PIXI.BitmapText({ text, style: resolvedStyle });
            if (typeof instance.roundPixels !== 'undefined') {
                instance.roundPixels = true;
            }
            const effectiveTint = tintOverride ?? resolvedStyle?.fill ?? 0xffffff;
            if (typeof adapter.setBitmapTextTint === 'function') {
                adapter.setBitmapTextTint(instance, effectiveTint);
            } else if (instance.style && typeof instance.style === 'object') {
                instance.style.fill = effectiveTint;
            }
            if (tintOverride != null && typeof instance.tint !== 'undefined') {
                instance.tint = tintOverride;
            }
            console.log('BitmapText', { text, tint: instance.tint, tintOverride, style: resolvedStyle });
            return instance;
        }
        return new PIXI.BitmapText(text, resolvedStyle);
    }
    if (PIXI.extras && PIXI.extras.BitmapText) {
        return new PIXI.extras.BitmapText(text, resolvedStyle);
    }
    throw new Error('PIXI.BitmapText is not available in this build.');
}

function bootstrapExamples() {
    const label1 = createBitmapText("Example 1: Basic", { font: "medium", align: "left" });
    stage.addChild(label1);
    label1.x = 50;
    label1.y = 80;

    const toggle = new PIXI_DOM.Toggle({
        width: 60,
        height: 30,
        borderRadius: 50,
        onCircleColor: 0x000000,
        offCircleColor: 0xffffff,
        onBackgroundColor: 0x32CD32,
        offBackgroundColor: 0x808080,
    });

    toggle.x = 50;
    toggle.y = 100;

    stage.addChild(toggle);

    toggle.onToggle((t) => {
        if (t) {
            console.log('TOGGLE ON');
        } else {
            console.log('TOGGLE OFF');
        }
    });

    const label2 = createBitmapText("Example 2: On/Off labels+outline style", { font: "medium", align: "left" });
    stage.addChild(label2);
    label2.x = 50;
    label2.y = 180;

    const toggleWithText = new PIXI_DOM.Toggle({
        width: 60,
        height: 30,
        borderRadius: 50,
        onCircleColor: 0x000000,
        offCircleColor: 0xffffff,
        onBackgroundColor: 0x32CD32,
        offBackgroundColor: 0x808080,
        backgroundOutline: {
            width: 2,
            color: 0xffffff,
        },
        labelOptions: {
            onLabel: 'on',
            offLabel: 'off',
            onColor: 0x089000,
            offColor: 0x404040,
            fontName: 'medium',
        },
    });

    toggleWithText.x = 50;
    toggleWithText.y = 200;

    stage.addChild(toggleWithText);

    toggleWithText.onToggle((t) => {
        if (t) {
            console.log('LABEL TOGGLE ON');
        } else {
            console.log('LABEL TOGGLE OFF');
        }
    });

    const label3 = createBitmapText("Example 3: Programmatically toggle other toggles", { font: "medium", align: "left" });
    stage.addChild(label3);
    label3.x = 50;
    label3.y = 280;

    const toggleManualController = new PIXI.Toggle({
        width: 60,
        height: 30,
        borderRadius: 50,
        onCircleColor: 0x000000,
        offCircleColor: 0xffffff,
        onBackgroundColor: 0x32CD32,
        offBackgroundColor: 0x808080,
        backgroundOutline: {
            width: 2,
            color: 0xffffff,
        },
    });

    toggleManualController.x = 50;
    toggleManualController.y = 300;

    stage.addChild(toggleManualController);

    toggleManualController.onToggle((t) => {
        toggle.toggled = t;
        toggleWithText.toggled = t;
    });

    const label4 = createBitmapText("Example 4: Transition animation", { font: "medium", align: "left" });
    stage.addChild(label4);
    label4.x = 50;
    label4.y = 380;

    const animatedToggle = new PIXI.Toggle({
        width: 60,
        height: 30,
        borderRadius: 50,
        onCircleColor: 0x000000,
        offCircleColor: 0xffffff,
        onBackgroundColor: 0x32CD32,
        offBackgroundColor: 0x808080,
        backgroundOutline: {
            width: 2,
            color: 0xffffff,
        },
        animationOptions: {
            type: 'quartic',
            duration: 200,
        },
        labelOptions: {
            onLabel: 'on',
            offLabel: 'off',
            onColor: 0x089000,
            offColor: 0x404040,
            fontName: 'medium',
        },
    });

    animatedToggle.x = 50;
    animatedToggle.y = 400;
    stage.addChild(animatedToggle);

    animatedToggle.onToggle((t) => {
        if (t) {
            console.log('ANIMATED LABEL TOGGLE ON');
        } else {
            console.log('ANIMATED LABEL TOGGLE OFF');
        }
    });

    const label5 = createBitmapText("Excludes animation property 'circle_position'", { font: "medium", align: "left" });
    stage.addChild(label5);
    label5.x = 50;
    label5.y = 480;

    const excludedAnimatedToggle = new PIXI.Toggle({
        width: 60,
        height: 30,
        borderRadius: 50,
        onCircleColor: 0x000000,
        offCircleColor: 0xffffff,
        onBackgroundColor: 0x32CD32,
        offBackgroundColor: 0x808080,
        backgroundOutline: {
            width: 2,
            color: 0xffffff,
        },
        animationOptions: {
            type: 'quartic',
            duration: 200,
            exclude: ['circle_position'],
        },
        labelOptions: {
            onLabel: 'on',
            offLabel: 'off',
            onColor: 0x089000,
            offColor: 0x404040,
            fontName: 'medium',
        },
    });

    excludedAnimatedToggle.x = 50;
    excludedAnimatedToggle.y = 500;
    stage.addChild(excludedAnimatedToggle);

    excludedAnimatedToggle.onToggle((t) => {
        if (t) {
            console.log('ANIMATED LABEL TOGGLE ON');
        } else {
            console.log('ANIMATED LABEL TOGGLE OFF');
        }
    });

    const toggles = [toggle, toggleWithText, toggleManualController, animatedToggle, excludedAnimatedToggle];

    const advance = (stepMs = 16.6667, iterations = 1) => {
        for (let i = 0; i < iterations; i++) {
            const advanceTime = window.__advanceTime;
            if (typeof advanceTime === 'function') {
                advanceTime(stepMs);
            }
            const flush = window.__flushAnimationFrames;
            if (typeof flush === 'function') {
                flush();
            }
            renderStage();
        }
    };

    window.__PIXIDOM__ = window.__PIXIDOM__ || {};
    window.__PIXIDOM__.toggleDemo = {
        toggles,
        getToggleCenters() {
            renderStage();
            return toggles.map((entry) => {
                const bounds = entry.getBounds();
                return {
                    x: bounds.x + bounds.width / 2,
                    y: bounds.y + bounds.height / 2,
                };
            });
        },
        advance,
        render() {
            renderStage();
        },
    };

    renderStage();
}

run();
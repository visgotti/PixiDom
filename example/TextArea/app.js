const canvas = document.getElementById('canvas');
const RENDER_WIDTH = 500;
const RENDER_HEIGHT = 500;

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

const disposeInterval = () => {
    if (typeof clearInterval === 'function' && tickInterval) {
        clearInterval(tickInterval);
        tickInterval = null;
    }
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

    const loader = adapter.getPixiLoader();
    loader.add('../fonts/small.fnt');
    loader.load(() => {
        bootstrapExamples();
    });

    if (renderer && typeof renderer.on === 'function') {
        renderer.on('destroy', disposeInterval);
    }
};

const bootstrapExamples = () => {
    disposeInterval();

    const textArea = new PIXI_DOM.TextArea('small', {
        width: '260px',
        height: '90px',
        backgroundColor: 0xffffff,
        borderColor: 0x555555,
        borderWidth: 1,
        fontColor: 0x000000,
        highlightedFontColor: 0xffffff,
        highlightedBackgroundColor: 0x2a5db0,
        cursorColor: 0x000000,
        cursorWidth: 1,
        xPadding: 4,
        yPadding: 4,
    });

    stage.addChild(textArea);
    textArea.x = 10;
    textArea.y = 40;
    textArea.change('The quick brown fox jumped over the lazy dog and kept on running.\nSecond paragraph starts here.');

    textArea.onFocus(() => {
        console.log('TEXT AREA FOCUSED');
    });

    textArea.onBlur(() => {
        console.log('TEXT AREA BLURRED');
    });

    textArea.onChange((text) => {
        console.log('TEXT AREA CHANGE:', text);
    });

    const smallTextArea = new PIXI_DOM.TextArea('small', {
        width: '140px',
        height: '48px',
        backgroundColor: 0xfdf6d8,
        borderColor: 0xb08a2a,
        borderWidth: 2,
        fontColor: 0x4a3b00,
        highlightedFontColor: 0xffffff,
        highlightedBackgroundColor: 0x8a6d1d,
        cursorColor: 0x4a3b00,
        cursorWidth: 1,
        xPadding: 3,
        yPadding: 3,
    }, 200);

    stage.addChild(smallTextArea);
    smallTextArea.x = 10;
    smallTextArea.y = 180;
    smallTextArea.change('This smaller area overflows vertically so it scrolls: one two three four five six seven eight nine ten.');

    const textAreas = [textArea, smallTextArea];

    const stabilizeCursors = () => {
        textAreas.forEach((area) => {
            if (!area) {
                return;
            }
            const stop = typeof area.stopCursorAnimation === 'function' ? area.stopCursorAnimation.bind(area) : null;
            if (stop) {
                stop();
            }
            const hasSelection = typeof area.getSelectedRangeIndexes === 'function' ? !!area.getSelectedRangeIndexes() : false;
            const shouldShowCursor = !!area.inFocus && !hasSelection;
            if (area.cursorSprite) {
                area.cursorSprite.visible = shouldShowCursor;
                if (!shouldShowCursor && typeof area.cursorSprite.clear === 'function') {
                    area.cursorSprite.clear();
                }
            }
            if (Object.prototype.hasOwnProperty.call(area, 'cursorIsVisible')) {
                area.cursorIsVisible = shouldShowCursor;
            }
        });
        renderStage();
    };

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
    window.__PIXIDOM__.textAreaDemo = {
        advance,
        freezeCursor: stabilizeCursors,
        getAreaCenters() {
            renderStage();
            return textAreas.map((area) => {
                const bounds = area.getBounds();
                return {
                    x: bounds.x + bounds.width / 2,
                    y: bounds.y + bounds.height / 2,
                };
            });
        },
        getSnapshots() {
            return textAreas.map((area) => ({
                text: area.text,
                scrollY: area.scrollY,
                lineCount: area.layout.lines.length,
                cursorIndex: area.cursorIndex,
                range: typeof area.getSelectedRangeIndexes === 'function' ? area.getSelectedRangeIndexes() : null,
            }));
        },
        setText(index, value) {
            const area = textAreas[index];
            if (area) {
                area.change(value);
            }
            advance();
        },
        scrollTo(index, value) {
            const area = textAreas[index];
            if (area) {
                area.scrollY = value;
            }
            advance();
        },
    };

    renderStage();

    tickInterval = setInterval(() => {
        renderStage();
    }, 1000 / 30);
};

run();

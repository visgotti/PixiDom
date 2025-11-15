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

    const defaultTextInput = new PIXI_DOM.TextField('small');

    stage.addChild(defaultTextInput);

    defaultTextInput.x = 10;
    defaultTextInput.y = 150;

    defaultTextInput.onFocus(() => {
        console.log('DEFAULT TEXT INPUT FOCUSED');
    });

    defaultTextInput.onBlur(() => {
        console.log('DEFAULT TEXT INPUT BLURRED');
    });

    defaultTextInput.onChange((text) => {
        console.log('DEFAULT TEXT CHANGE:', text);
    });

    defaultTextInput.onSubmit((text) => {
        console.log('DEFAULT TEXT SUBMIT:', text);
        defaultTextInput.clear();
    });

    const styledTextInput = new PIXI_DOM.TextField('small', {
        width: '60px',
        height: '20px',
        cursorHeight: '18px',
        fontColor: 0xe00000,
        highlightedFontColor: 0xf27979,
        cursorColor: 0x792396,
        borderWidth: 2,
        borderColor: 0x42e0f5,
        color: 0x42e0f5,
        backgroundColor: 0x31cf15,
        highlightColor: 0x083800,
        borderOpacity: 0.5,
        yPadding: 5,
    });

    stage.addChild(styledTextInput);
    styledTextInput.x = 10;
    styledTextInput.y = 200;

    styledTextInput.onFocus(() => {
        console.log('STYLED TEXT INPUT FOCUSED');
    });

    styledTextInput.onBlur(() => {
        console.log('STYLED TEXT INPUT BLURRED');
    });

    styledTextInput.onChange((text) => {
        console.log('STYLED TEXT CHANGE:', text);
    });

    styledTextInput.onSubmit((text) => {
        console.log('STYLED TEXT SUBMIT:', text);
        styledTextInput.clear();
    });

    const maxLengthTextInput = new PIXI_DOM.TextField('small', null, 35);
    stage.addChild(maxLengthTextInput);
    maxLengthTextInput.x = 10;
    maxLengthTextInput.y = 300;
    maxLengthTextInput.onCharLimit((text) => {
        console.log('tried inputting text with more than 35 characters:', text);
    });
    maxLengthTextInput.change('This input uses max length of 35');

    const textFields = [defaultTextInput, styledTextInput, maxLengthTextInput];

    const stabilizeTextFields = () => {
        textFields.forEach((field) => {
            if (!field) {
                return;
            }
            const stop = typeof field.stopCursorAnimation === 'function' ? field.stopCursorAnimation.bind(field) : null;
            if (stop) {
                stop();
            }
            const hasSelection = typeof field.getSelectedRange === 'function' ? !!field.getSelectedRange() : false;
            const shouldShowCursor = !!field.inFocus && !hasSelection;
            if (field.cursorSprite) {
                field.cursorSprite.visible = shouldShowCursor;
                if (!shouldShowCursor && typeof field.cursorSprite.clear === 'function') {
                    field.cursorSprite.clear();
                }
            }
            if (Object.prototype.hasOwnProperty.call(field, 'cursorIsVisible')) {
                field.cursorIsVisible = shouldShowCursor;
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
    window.__PIXIDOM__.textFieldDemo = {
        getFieldCenters() {
            renderStage();
            return textFields.map((field) => {
                const bounds = field.getBounds();
                return {
                    x: bounds.x + bounds.width / 2,
                    y: bounds.y + bounds.height / 2,
                };
            });
        },
        advance,
        setAllText(value) {
            textFields.forEach((field) => {
                if (typeof field.change === 'function') {
                    field.change(value);
                }
            });
            advance();
        },
        freezeCursor: stabilizeTextFields,
        getCursorStates() {
            return textFields.map((field) => {
                const hasRange = typeof field.getSelectedRange === 'function' ? !!field.getSelectedRange() : false;
                return {
                    inFocus: !!field.inFocus,
                    cursorIsVisible: Object.prototype.hasOwnProperty.call(field, 'cursorIsVisible') ? field.cursorIsVisible : undefined,
                    cursorSpriteVisible: field.cursorSprite ? field.cursorSprite.visible : undefined,
                    hasRange,
                    cursorColor: field.styleOptions && field.styleOptions.cursorColor,
                    cursorWidth: field.styleOptions && field.styleOptions.cursorWidth,
                    cursorGeometryPoints: field.cursorSprite && field.cursorSprite.geometry && field.cursorSprite.geometry.points ? field.cursorSprite.geometry.points.slice() : undefined,
                    cursorGraphicsData: field.cursorSprite && field.cursorSprite.geometry && field.cursorSprite.geometry.graphicsData ? field.cursorSprite.geometry.graphicsData.length : undefined,
                };
            });
        },
        getFieldSnapshots() {
            return textFields.map((field) => {
                return {
                    text: field.text,
                    cursorIndex: field.cursorIndex,
                    dragIndexStart: field.dragIndexStart,
                    dragIndexEnd: field.dragIndexEnd,
                    overflowOffsetX: field.overflowOffsetX,
                    range: typeof field.getSelectedRange === 'function' ? field.getSelectedRange() : null,
                    highlightedBackgroundColor: field.styleOptions?.highlightedBackgroundColor,
                    textboxGraphicsData: field.textbox?.geometry?.graphicsData?.map((item) => {
                        return {
                            type: item?.type,
                            fillStyle: item?.fillStyle ? {
                                color: item.fillStyle.color,
                                alpha: item.fillStyle.alpha,
                            } : null,
                            lineStyle: item?.lineStyle ? {
                                color: item.lineStyle.color,
                                alpha: item.lineStyle.alpha,
                                width: item.lineStyle.width,
                            } : null,
                        };
                    }) ?? null,
                    legacyGraphicsData: Array.isArray(field.textbox?.graphicsData)
                        ? field.textbox.graphicsData.map((item) => {
                            return {
                                type: item?.type,
                                fillColor: item?.fillColor,
                                fillAlpha: item?.fillAlpha,
                                lineWidth: item?.lineWidth,
                                lineColor: item?.lineColor,
                                lineAlpha: item?.lineAlpha,
                            };
                        })
                        : null,
                    glyphTints: typeof field.getGlyphs === 'function'
                        ? field.getGlyphs().map((glyph) => ({
                            tint: glyph?.tint,
                            text: glyph?.text ?? glyph?.character ?? undefined,
                        }))
                        : null,
                };
            });
        },
    };

    renderStage();

    tickInterval = setInterval(() => {
        renderStage();
    }, 1000 / 30);
};

run();
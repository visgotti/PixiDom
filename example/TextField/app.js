const canvas = document.getElementById('canvas');

const renderer = PIXI.autoDetectRenderer({
    width: 500,
    height: 500,
    antialias: false,
    roundPixels: true,
    resolution:  1,
    view: canvas,
});

renderer.view.width = 500;
renderer.view.height = 500;
renderer.view.style.width = '500px';
renderer.view.style.height = '500px';

const stage = new PIXI.Container();

PIXI.loader.add('../fonts/small.fnt');
PIXI.loader.load((loader, resources) => {
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

    defaultTextInput.onChange((text)=> {
        console.log('DEFAULT TEXT CHANGE:', text);
    });

    defaultTextInput.onSubmit((text)=> {
        console.log('DEFAULT TEXT SUBMIT:', text);
        defaultTextInput.clear();
    });

    const styledTextInput = new PIXI_DOM.TextField('small', {
        width: '60px',
        height: '20px',
        cursorHeight: '18px',
        fontColor: 0xe00000, // red,
        highlightedFontColor: 0xf27979, // light red
        cursorColor: 0x792396, // purple
        borderWidth: 2,
        borderColor: 0x42e0f5, // light blue
        color: 0x42e0f5, // light blue
        backgroundColor: 0x31cf15, // green
        highlightColor: 0x083800, // dark green,
        borderOpacity: .5, // 50% transparent
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

    setInterval(() => {
       renderer.render(stage);
    }, 1000/30);
});
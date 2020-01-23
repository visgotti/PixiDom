const canvas = document.getElementById('canvas');

const renderer = PIXI.autoDetectRenderer({
    width: 600,
    height: 600,
    antialias: false,
    roundPixels: true,
    resolution:  1,
    view: canvas,
});

renderer.view.width = 600;
renderer.view.height = 600;
renderer.view.style.width = '600px';
renderer.view.style.height = '600px';

const stage = new PIXI.Container();
stage.width = 600;
stage.height = 600;

PIXI.loader.add('../fonts/small.fnt');
PIXI.loader.load((loader, resources) => {
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
    setInterval(() => {
        renderer.render(stage);
    }, 1000/30);
});
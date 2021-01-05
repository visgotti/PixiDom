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

const scrollBar = new PIXI.ScrollBar({ width: 10, height: 300}, 1000);
scrollBar.x = 50;
stage.addChild(scrollBar);
scrollBar.on('scrolled', (s) => {
    console.log('scrolled:', s);
});

setInterval(() => {
   renderer.render(stage);
}, 1000/60);
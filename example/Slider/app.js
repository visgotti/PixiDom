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
  }

PIXI.loader.load((loader, resources) => {
    const slider = new PIXI.Slider(SLIDER_OPTS);
    stage.addChild(slider);
    console.log({ slider });
    slider.x = 50;
    slider.y = 50;
    slider.onChange((e) => {
        console.log('changed', e);
    });
    setInterval(() => {
        renderer.render(stage);
    }, 1000/30);
});
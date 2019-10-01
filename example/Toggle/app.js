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
renderer.view.style.height = '500';

const stage = new PIXI.Container();


PIXI.loader.add('../fonts/medium.fnt');
PIXI.loader.load((loader, resources) => {

    const label1 = new PIXI.extras.BitmapText("Example 1: Basic", { font: "medium", align: "left" })
    stage.addChild(label1);
    label1.x = 50;
    label1.y = 80;
    // ============================= MINIMUM OPTIONS DEMONSTRATION =============================
    const toggle = new PIXI_DOM.Toggle({
        width: 60,
        height: 30,
        borderRadius: 40,
        onCircleColor: 0x000000,
        offCircleColor: 0xffffff,
        onBackgroundColor: 0x32CD32, //lime green,
        offBackgroundColor: 0x808080, // gray,
    });

    toggle.x = 50;
    toggle.y = 100;

    stage.addChild(toggle);

    toggle.onToggle((t) => {
        if(t) {
            console.log('TOGGLE ON')
        } else {
            console.log('TOGGLE OFF')
        }
    });

    // ============================= TOGGLE WITH ON/OFF LABELS AND BACKGROUND OUTLINE DEMONSTRATION =============================
    const label2 = new PIXI.extras.BitmapText("Example 2: On/Off labels+outline style", { font: "medium", align: "left" })
    stage.addChild(label2);
    label2.x = 50;
    label2.y = 180;
    const toggleWithText = new PIXI_DOM.Toggle({
        width: 60,
        height: 30,
        borderRadius: 50,
        onCircleColor: 0x000000,
        offCircleColor: 0xffffff,
        onBackgroundColor: 0x32CD32, //lime green,
        offBackgroundColor: 0x808080, // gray,
        backgroundOutline: {
            width: 2,
            color: 0xffffff,
        },
        labelOptions: {
            onLabel: "on",
            offLabel: "off",
            onColor: 0x089000, //dark green
            offColor: 0x404040, // dark gray
            fontName: "medium"
        }
    });

    toggleWithText.x = 50;
    toggleWithText.y = 200;

    stage.addChild(toggleWithText);

    toggleWithText.onToggle((t) => {
        if(t) {
            console.log('LABEL TOGGLE ON')
        } else {
            console.log('LABEL TOGGLE OFF')
        }
    });


    // ============================= PROGRAMATICALLY TOGGLE DEMONSTRATION =============================
    const label3 = new PIXI.extras.BitmapText("Example 3: Programmatically toggle other toggles", { font: "medium", align: "left" })
    stage.addChild(label3);
    label3.x = 50;
    label3.y = 280;
    const toggleManualController = new PIXI_DOM.Toggle({
        width: 60,
        height: 30,
        borderRadius: 50,
        onCircleColor: 0x000000,
        offCircleColor: 0xffffff,
        onBackgroundColor: 0x32CD32, //lime green,
        offBackgroundColor: 0x808080, // gray,
        backgroundOutline: {
            width: 2,
            color: 0xffffff,
        }
    });

    toggleManualController.x = 50;
    toggleManualController.y = 300;

    stage.addChild(toggleManualController);

    toggleManualController.onToggle((t) => {
        toggle.toggled = t;
        toggleWithText.toggled = t;
    });
    /*
    LINEAR = 'linear',
        QUADRATIC = 'quadtratic',
        CUBIC = 'cubic',
        QUARTIC = "quartic",
        QUINTIC = "quintic",
        SINUSOIDAL = "sinusoidal",
        EXPONENTIAL = "exponential",
        CIRCULAR = "circular",
        ELASTIC = "elastic",
        BACK = "back",

     */

    // ============================= TRANSITION EFFECTS TOGGLE DEMONSTRATION =============================
    const label4 = new PIXI.extras.BitmapText("Example 4: Transition animation", { font: "medium", align: "left" });
    stage.addChild(label4);
    label4.x = 50;
    label4.y = 380;
    const animatedToggle = new PIXI_DOM.Toggle({
        width: 60,
        height: 30,
        borderRadius: 50,
        onCircleColor: 0x000000,
        offCircleColor: 0xffffff,
        onBackgroundColor: 0x32CD32, //lime green,
        offBackgroundColor: 0x808080, // gray,
        backgroundOutline: {
            width: 2,
            color: 0xffffff,
        },
        animationOptions: {
            type: 'quartic',
            duration: 200,
        },
        labelOptions: {
            onLabel: "on",
            offLabel: "off",
            onColor: 0x089000, //dark green
            offColor: 0x404040, // dark gray
            fontName: "medium"
        }
    });

    animatedToggle.x = 50;
    animatedToggle.y = 400;
    stage.addChild(animatedToggle);

    animatedToggle.onToggle((t) => {
        if(t) {
            console.log('ANIMATED LABEL TOGGLE ON')
        } else {
            console.log('ANIMATED LABEL TOGGLE OFF')
        }
    });

});

setInterval(() => {
   renderer.render(stage);
}, 1000/30);
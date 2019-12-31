Array.prototype.random = function () {
    return this[Math.floor((Math.random()*this.length))];
}

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

let scrollListWidth = 300;
let scrollListHeight = 400;

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return PIXI.utils.string2hex(color);
}

function redrawWithBorder(el) {
}

function createOptions(n, borderWidth) {
    const options = [];
    if(!borderWidth && borderWidth != 0) {
        borderWidth = 3; // default to 5
    }
    for(let i = 0; i < n; i++) {
        const g = new PIXI.Graphics();
        const randomColor = getRandomColor();
        const el = new PIXI.Element();
        el.addChild(g);
        let isOver = false;
        let isDown = false;
        function drawNormal() {
            isOver = false;
            isDown = false;
            g.clear();
            g.beginFill(randomColor, 1);
            g.drawRect(0, 0, scrollListWidth, 50);
            g.endFill();
        }
        function drawHover() {
            isOver = true;
            if(isDown) return;
            g.clear();
            g.lineStyle(5, 0xfffffff);
            g.beginFill(randomColor, 1);
            g.drawRect(5, 5, scrollListWidth - 10, 40);
            g.endFill();
        }
        function drawDown() {
            isDown = true;
            g.clear();
            g.lineStyle(10, 0xfffffff);
            g.beginFill(randomColor, 1);
            g.drawRect(10, 10, scrollListWidth - 20, 30);
            g.endFill();
        }
        function drawUp() {
            isDown = false;
            isOver ? drawHover() : drawNormal();
        }

        /*
        const g2 = new PIXI.Graphics();
        g2.interactive = true;
        g2.beginFill(0x000000);
        g2.drawRect(0, 0, 20, 20);
        g2.on('pointerdown', () => {
           console.log('clicked g2 of', i);
        });
        el.addChild(g2);
        g2.x = 50;

         */

        drawNormal();
        el.onMouseDown(() => {
            drawDown();
        });
        el.onMouseUp(drawUp);
        el.onMouseUpOutside(drawUp);
        el.onMouseOver(drawHover);
        el.onMouseOut(drawNormal);

        el.on('pointerdown', () => {
            console.log('POINTER DOWN ON', i);
        });
        el.on('pointerup', () => {
            console.log('POINTER UP ON', i);
        });

        el.on('hide', () => {
            drawNormal();
        });
        el.on('show', () => {
        });
        options.push(el);
    }
    return options;
}

const scrollList = new PIXI.ScrollList({ width: scrollListWidth, height: scrollListHeight});
scrollList.addScrollItems(createOptions(10, 5));
stage.addChild(scrollList);
scrollList.y = 100;
scrollList.x = 100;

PIXI.loader.add('../fonts/small.fnt');
PIXI.loader.load((loader, resources) => {
    const addTenButton = new PIXI.extras.BitmapText('Add 10 options', { font: 'small', align: "left" });
    addTenButton.interactive = true;
    addTenButton.buttonMode = true;
    addTenButton.tint = 0xffffff;
    addTenButton.on('pointertap', () => {
        scrollList.addScrollItems(createOptions(10, 5));
        if(scrollList.options.length > 10) {
            removeLast10Button.visible = true;
        }
    });
    stage.addChild(addTenButton);
    addTenButton.x = stage.width - addTenButton.width;
    addTenButton.y = 20;

    const removeLast10Button = new PIXI.extras.BitmapText('Remove last 10 options', { font: 'small', align: "left" });
    removeLast10Button.interactive = true;
    removeLast10Button.buttonMode = true;
    removeLast10Button.tint = 0xffffff;
    removeLast10Button.on('pointertap', () => {
        scrollList.spliceScrollItems(scrollList.options.length - 10);
        if(scrollList.options.length <= 10) {
            removeLast10Button.visible = false;
        }
    });
    stage.addChild(removeLast10Button);
    removeLast10Button.x = stage.width - addTenButton.width;
    removeLast10Button.y = 35;

    const dec = new PIXI.extras.BitmapText('Decrease height by 50 pixels', { font: 'small', align: "left" });
    dec.interactive = true;
    dec.buttonMode = true;
    dec.tint = 0xffffff;
    dec.on('pointertap', () => {
        scrollListHeight -= 50;
        scrollList.resize(scrollListWidth, scrollListHeight);
    });
    stage.addChild(dec);
    dec.x = stage.width - dec.width;
    dec.y = 50;

    const inc = new PIXI.extras.BitmapText('Increase height by 50 pixels', { font: 'small', align: "left" });
    inc.interactive = true;
    inc.buttonMode = true;
    inc.tint = 0xffffff;
    inc.on('pointertap', () => {
        scrollListHeight += 50;
        scrollList.resize(scrollListWidth, scrollListHeight);
    });
    stage.addChild(inc);
    inc.x = stage.width - inc.width;
    inc.y = 65;
});

setInterval(() => {
   renderer.render(stage);
}, 1000/60);
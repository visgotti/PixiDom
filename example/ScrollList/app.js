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

const scrollListWidth = 300;
const scrollListHeight = 400;

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

        drawNormal();
        el.onMouseDown(() => {
            drawDown();
        });
        el.onMouseUp(drawUp);
        el.onMouseUpOutside(drawUp);
        el.onMouseOver(drawHover);
        el.onMouseOut(drawNormal);

        el.on('hide', () => {
            el.visible = false;
        });
        el.on('show', () => {
            el.visible = true;
        });
        options.push(el);
    }
    return options;
}

const scrollList = new PIXI.ScrollList({ width: scrollListWidth, height: scrollListHeight});
scrollList.addScrollItems(createOptions(100, 5));
stage.addChild(scrollList);
scrollList.y = 100;
scrollList.x = 100;
setInterval(() => {
   renderer.render(stage);
}, 1000/60);
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
const scrollListHeight = 500;

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return PIXI.utils.string2hex(color);
}

function createOptions(n, borderWidth) {
    const options = [];
    if(!borderWidth && borderWidth != 0) {
        borderWidth = 3; // default to 5
    }
    for(let i = 0; i < n; i++) {
        const g = new PIXI.Graphics();
        g.beginFill(getRandomColor(), 1);
        g.drawRect(0, 0, scrollListWidth, 50);
        const el = new PIXI.Element();
        g.endFill();
        el.addChild(g);
        el.onMouseUp(() => {
         //   console.log('clicked option:', i);
        });
        el.onMouseOver(() => {
        });
        el.onMouseOut(() => {
        })
        options.push(el);
    }
    return options;
}

const scrollList = new PIXI.ScrollList({ width: scrollListWidth, height: scrollListHeight});
scrollList.addScrollItems(createOptions(1000, 5));
console.log('scroll List became', scrollList);
stage.addChild(scrollList);

setInterval(() => {
   renderer.render(stage);
}, 1000/60);
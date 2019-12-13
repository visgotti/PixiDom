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

const rect = new PIXI.Graphics();
rect.beginFill(0xFFFF00);
rect.lineStyle(5, 0xFF0000);
rect.drawRect(0, 0, 100, 100);

const element = new PIXI.Element();
element.addChild(rect);
stage.addChild(element);
element.center();

const events = [];
// second param is time needed for hold
element.onDragStart(event => {
    console.log('drag start event', event);
    events.push('drag start');
}, 50   /*defaults to 50*/ );

element.onHeldDown(() => {
    console.log('held down for a second')
}, 1000);

element.onHeldDown(() => {
    console.log('held down for 3 seconds');
}, 3000);

element.onDragEnd(event => {
    events.push('drag end');
});

element.onDragMove(event => {
    element.x = event.data.global.x;
    element.y = event.data.global.y;
    events.push('drag move')
});
element.onMouseDown(event => {
    events.push('mouse down');
});
element.onMouseMove(event => {
    events.push('mouse move');
});
element.onMouseOut(event => {
    events.push('mouse out');
});
element.onMouseOver(event => {
    events.push('mouse over');
});
element.onMouseUp(event => {
    events.push('mouse up');
});
element.onDoubleClick(event => {
    events.push('double click');
});
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

setInterval(() => {
   renderer.render(stage);
   if(events.length) {
       console.log('Events detected: (within 1 fps loop)', events.filter(onlyUnique).join(', '));
   }
   events.length = 0;
}, 1000/1);
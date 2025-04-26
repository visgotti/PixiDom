# Pixi Dom
Library pixi containers extended with specific functionality somewhat mimicking the DOM

# examples folder is best place to look

## ScrollList
```js
const scrollList = new PIXI.ScrollList({
  width: 300,
  height: 100,
  backgroundColor: 0xFF0000,
  dividerColor: 0xFF0000,
  dividerPixelHeight: 1,
  dividerPercentWidth: 0.1,
  dividerTopPadding: 0,
  dividerBottomPadding: 0,
  borderOpacity: 0.5,
  xPadding: 0,
  yPadding: 0,
}, []);

for(let i = 0; i < 100; i++) {
  scrollList.addScrollItem(new PIXI.Text(`item_${i}_a`, { font: '24px Arial', fill: 0xffffff, align: 'center' })); 
    // or can do addScrollItems and pass in an array.
  scrollList.addScrollItems([
    new PIXI.Text(`item_${i}_b1`, { font: '24px Arial', fill: 0xffffff, align: 'center' }),
    new PIXI.Text(`item_${i}_b2`, { font: '24px Arial', fill: 0xffffff, align: 'center' }),  
  ]); 
}
```

## Bitmap Font Textfields
```js
PIXI.loader.add('./fonts/small.fnt');
PIXI.loader.load(() => {
   const textInput = new PIXI_DOM.TextField('small');
   
   // define which keys can fire off the "onSubmit" event, by default its just 13 (enter key)
   textInput.submitKeyCodes = ([13]);
   
    // can define keys to ignore, this would ignore all tab presses as input
    textInput.ignoreKeys = ([9]) 

   // manually focus
   textInput.focus();
   // manually blur
   textInput.blur();
   // manually clear text
   textInput.clear();
   // manually trigger submit
   textInput.submit();
   // manually change
   textInput.change("Text to change to");
   
   // fired off when focused
   textInput.onFocus(() => {});
   // fired off when blurred
   textInput.onBlur(() => {});
   // fired off when text changes
   textInput.onChange((text) => {});
   // fired off when hit submit button
   textInput.onSubmit(() => {});
})
```

```js

```


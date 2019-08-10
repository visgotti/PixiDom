## Bitmap Font Textfields

### WIP but this is how the api will look, also can be seen in example folder

```js
PIXI.loader.add('./fonts/small.fnt');
PIXI.loader.load(() => {
   const textInput = new PixiText.TextField('small');
   // manually focus
   textInput.focus();
   // manually blur
   textInput.blur();
   
   // fired off when focused
   textInput.onFocus(() => {});
   // fired off when blurred
   textInput.onBlur(() => {});
   // fired off when text changes
   textInput.onChange((text) => {});
})
```
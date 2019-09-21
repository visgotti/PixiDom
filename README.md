# Pixi Dom
Starting a library with pixi interface elements

## Bitmap Font Textfields

### WIP but this is how the api will look, also can be seen in example folder

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


12


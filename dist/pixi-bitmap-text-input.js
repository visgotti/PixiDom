var PixiText=function(t){var e={};function i(r){if(e[r])return e[r].exports;var s=e[r]={i:r,l:!1,exports:{}};return t[r].call(s.exports,s,s.exports,i),s.l=!0,s.exports}return i.m=t,i.c=e,i.d=function(t,e,r){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(i.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var s in t)i.d(r,s,function(e){return t[e]}.bind(null,s));return r},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="",i(i.s=0)}([function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=i(1);e.TextField=r.TextField},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});const r=i(2),s=function(){return{width:"500px",height:"16px",fontColor:0,highlightedFontColor:16777215,borderColor:0,borderWidth:1,cursorColor:0,cursorHeight:"90%",cursorWidth:1,backgroundColor:16250871,highlightedBackgroundColor:128,borderOpacity:1,xPadding:0,yPadding:0}},n=["width","height","cursorHeight"];e.TextField=class extends PIXI.Container{constructor(t,e){super(),this.styleOptions={},this.cursorSprite=new PIXI.Graphics,this.textbox=new PIXI.Graphics,this.inFocus=!1,this.cursorIndex=-1,this.overflowOffsetX=0,this.overflowOffsetY=0,this.dragIndexStart=0,this.dragIndexEnd=0,this.inDrag=!1,this.onFocusHandler=()=>{},this.onBlurHandler=()=>{},this.onChangeHandler=()=>{};const i=Object.assign({},s());if(e)for(let t in e)i[t]=e[t];this.buttonMode=!0,this.interactive=!0,this.textSprite=new PIXI.extras.BitmapText("test",{font:t,align:"left"}),this.cursor="text",this.on("pointerdown",this.handleMouseDown.bind(this)),this.on("pointerup",this.handleMouseUp.bind(this)),this.on("pointermove",this.handleMouseMove.bind(this)),this.on("pointerupoutside",this.handleMouseUp.bind(this)),this.addChild(this.textbox),this.addChild(this.textSprite),this.addChild(this.cursorSprite),this.updateStyle(i),this.checkForOutsideClick=this.checkForOutsideClick.bind(this)}updateStyle(t){for(const e in t)if(n.includes(e)){const i=r.parseLengthMeasurements(t[e]);if(i.error)throw new Error(`Error for passed in style: ${e}, ${i.error}`);this.styleOptions[e]=i}else this.styleOptions[e]=t[e];this.redraw()}redraw(){this.redrawText(),this.redrawTextbox(),this.redrawCursor()}redrawCursor(){if(!this.inFocus)return void(this.cursorSprite.visible=!1);const t=this.getCursorXFromIndex(this.cursorIndex);this.cursorSprite.clear(),this.cursorSprite.lineStyle(this.styleOptions.cursorWidth,this.styleOptions.cursorColor);const{value:e,type:i}=this.styleOptions.cursorHeight,r="pixel"===i?e:Math.round(this.textbox.height*(e/100)),s=Math.min(this.textbox.height,r),n=(Math.max(this.textbox.height,r)-s)/2,o=Math.floor(n),h=Math.ceil(n);this.cursorSprite.moveTo(t,o).lineTo(t,r-h),this.getSelectedRange()?this.cursorSprite.visible=!1:this.cursorSprite.visible=!0}redrawText(){const t=this.getSelectedRange();for(let e=0;e<this.textSprite.children.length;e++){const i=this.textSprite.children[e];if(t){const{indexes:r}=t,{start:s,end:n}=r;if(e>=s&&e<n){i.tint=this.styleOptions.highlightedFontColor;continue}}"fontColor"in this.styleOptions?i.tint=this.styleOptions.fontColor:i.tint=16777215}}redrawTextbox(){this.textbox.clear(),this.textbox.beginFill(this.styleOptions.backgroundColor,1),this.styleOptions.borderWidth>0&&!Number.isNaN(this.styleOptions.borderWidth)&&this.textbox.lineStyle(this.styleOptions.borderWidth,this.styleOptions.borderColor,this.styleOptions.borderOpacity);let{value:t,type:e}=this.styleOptions.height;const i=window.innerWidth,r=window.innerHeight,s="pixel"===e?t:r*(t/100);({value:t,type:e}=this.styleOptions.width);const n="pixel"===e?t:i*(t/100),o=this.getSelectedRange();if(o){const t=Math.abs(0-o.x.start),e=Math.abs(o.x.end-n),i=o.x.end-o.x.start;this.textbox.drawRect(0,0,t,s),this.textbox.endFill(),this.textbox.beginFill(this.styleOptions.highlightedBackgroundColor,1),this.textbox.drawRect(t,0,i,s),this.textbox.endFill(),this.textbox.beginFill(this.styleOptions.backgroundColor,1),this.textbox.drawRect(n-e,0,e,s),this.textbox.endFill()}else this.textbox.drawRect(0,0,n,s),this.textbox.endFill()}handleMouseUp(t){const{x:e}=t.data.getLocalPosition(this);this.inDrag&&(this.cursorIndex=this.getCursorIndexFromX(e),this.handleRangeFinish())}handleMouseDown(t){this.clickedTimestamp=t.data.originalEvent.timeStamp;const{x:e}=t.data.getLocalPosition(this);this.inFocus||this.focus(),this.clearRange(),this.cursorIndex=this.getCursorIndexFromX(e),this.handleRangeStart(this.cursorIndex),this.redraw()}handleMouseMove(t){if(this.inDrag){const{x:e}=t.data.getLocalPosition(this);this.handleRangeChange(this.getCursorIndexFromX(e))}}clearRange(){this.dragIndexEnd=this.cursorIndex,this.dragIndexStart=this.cursorIndex}handleRangeStart(t){this.inDrag=!0,this.dragIndexStart=t,this.dragIndexEnd=t}handleRangeChange(t){t!==this.dragIndexEnd&&(this.dragIndexEnd=t,this.redraw())}handleRangeFinish(){this.inDrag=!1}getCursorXFromIndex(t){let e;return!this.textSprite.children||!this.textSprite.children.length||t<=0?this.styleOptions.xPadding?this.styleOptions.xPadding:0:(e=t>=this.textSprite.children.length?this.textSprite.children[this.textSprite.children.length-1]:this.textSprite.children[t-1]).x+e.width+1}getCursorIndexFromX(t){if(t<=0)return 0;for(let e=0;e<this.textSprite.children.length;e++){const i=this.textSprite.children[e];if(i.x+i.width>t)return i.x+i.width/2<t?e+1:e}return this.textSprite.children.length}getSelectedRange(){const t=Math.min(this.dragIndexStart,this.dragIndexEnd),e=Math.max(this.dragIndexStart,this.dragIndexEnd);return t===e?null:{indexes:{start:t,end:e},x:{start:this.getCursorXFromIndex(t),end:this.getCursorXFromIndex(e)}}}charFromPosition(t){return{left:null,right:null}}addCharsAtIndex(t,e){}removeCharsBetweenIndexes(t,e){}leftClick(t,e){this.inFocus=!0}rightClick(t,e){}undo(){}redo(){}paste(){}cut(){}onChange(t){this.onChangeHandler=t}onFocus(t){this.onFocusHandler=t}onBlur(t){this.onBlurHandler=t}focus(){this.inFocus||(document.addEventListener("mousedown",this.checkForOutsideClick),this.inFocus=!0,this.onFocusHandler())}blur(){this.inFocus&&(document.removeEventListener("mousedown",this.checkForOutsideClick),this.inFocus=!1,this.clearRange(),this.redraw(),this.onBlurHandler())}checkForOutsideClick(t){t.timeStamp!==this.clickedTimestamp&&this.blur()}}},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),Number.isNaN=Number.isNaN||function(t){return"number"==typeof t&&isNaN(t)},e.parseLengthMeasurements=function(t){let e;try{const i=t.toString().slice(-2);if("%"===i.charAt(1)){if(e=parseInt(t.slice(0,-1)),Number.isNaN(e))throw new Error("Did not find a number in front of % sign");return{valid:!0,value:e,type:"percent"}}if("px"===i){if(e=parseInt(t.slice(0,-2)),Number.isNaN(e))throw new Error("Did not find a number in front of px");if(e<0)throw new Error("Can not have negative pixel length value");return{valid:!0,value:e,type:"pixel"}}throw new Error("Length values must either be in % or px")}catch(t){return{valid:!1,error:t.message}}}}]);
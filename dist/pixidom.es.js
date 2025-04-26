Number.isNaN = Number.isNaN || function(e) {
  return typeof e == "number" && isNaN(e);
};
const u = function(e) {
  if (e == null)
    return {
      valid: !1,
      error: "Measurement cannot be null or undefined"
    };
  if (typeof e == "number")
    return isNaN(e) ? {
      valid: !1,
      error: "Invalid number value"
    } : e < 0 ? {
      valid: !1,
      error: "Cannot have negative length value"
    } : {
      valid: !0,
      type: "pixel",
      value: e
    };
  if (typeof e == "object" && "value" in e && "type" in e) {
    const { value: t, type: i } = e;
    return isNaN(t) || t < 0 ? {
      valid: !1,
      error: "Invalid or negative value in object"
    } : i === "px" || i === "pixel" || i === "pixels" ? {
      valid: !0,
      type: "pixel",
      value: t
    } : i === "%" || i === "percent" ? {
      valid: !0,
      type: "percent",
      value: t
    } : {
      valid: !1,
      error: "Invalid measurement type. Must be px, pixel, pixels, % or percent"
    };
  }
  try {
    const t = String(e);
    if (t.endsWith("%")) {
      const i = parseFloat(t.slice(0, -1));
      return isNaN(i) ? {
        valid: !1,
        error: "Did not find a valid number in front of % sign"
      } : {
        valid: !0,
        value: i,
        type: "percent"
      };
    } else if (t.endsWith("px")) {
      const i = parseFloat(t.slice(0, -2));
      return isNaN(i) ? {
        valid: !1,
        error: "Did not find a valid number in front of px"
      } : i < 0 ? {
        valid: !1,
        error: "Cannot have negative pixel length value"
      } : {
        valid: !0,
        value: i,
        type: "pixel"
      };
    } else {
      const i = parseFloat(t);
      return isNaN(i) ? {
        valid: !1,
        error: "Length values must either be in %, px, or a valid number"
      } : i < 0 ? {
        valid: !1,
        error: "Cannot have negative length value"
      } : {
        valid: !0,
        value: i,
        type: "pixel"
      };
    }
  } catch (t) {
    return {
      valid: !1,
      error: t instanceof Error ? t.message : "Unknown error parsing measurement"
    };
  }
};
function C(e, t, i) {
  return e <= t ? t : e >= i ? i : e;
}
function S(e) {
  return parseInt(e.replace("#", ""), 16);
}
function v(e, t) {
  if (!e.parent && !(t != null && t.parent)) throw new Error("No parent");
  const i = (t == null ? void 0 : t.parent) || e.parent, s = () => e.x = i.width / 2 - e.width / 2, n = () => e.y = i.height / 2 - e.height / 2;
  t != null && t.axis ? t.axis === "x" ? s() : t.axis === "y" && n() : (s(), n());
}
function B(e) {
  return class extends e {
    constructor(...i) {
      super(...i), this.copiedText = "", this.textStates = [], this.currentStateIndex = -1, this.registerHandlers = this.registerHandlers.bind(this), this.unregisterHandlers = this.unregisterHandlers.bind(this), this.onCopy = this.onCopy.bind(this), this.onPaste = this.onPaste.bind(this), this.onCut = this.onCut.bind(this), this.onKeyPress = this.onKeyPress.bind(this), this.onKeyDown = this.onKeyDown.bind(this), super.on("focus", this.registerHandlers), super.on("blur", this.unregisterHandlers);
    }
    changeStateIndex(i) {
      const s = this.currentStateIndex = i;
      this.textStates[s] && (super.change(this.textStates[s]), this.currentStateIndex = i);
    }
    registerHandlers() {
      document.addEventListener("copy", this.onCopy), document.addEventListener("cut", this.onCut), document.addEventListener("paste", this.onPaste), document.addEventListener("keypress", this.onKeyPress), document.addEventListener("keydown", this.onKeyDown);
    }
    unregisterHandlers() {
      document.removeEventListener("copy", this.onCopy), document.removeEventListener("cut", this.onCut), document.removeEventListener("paste", this.onPaste), document.removeEventListener("keypress", this.onKeyPress), document.removeEventListener("keydown", this.onKeyDown);
    }
    onPaste(i) {
      const s = i.clipboardData ? i.clipboardData.getData("text/plain") : this.copiedText, n = super.replaceSelectedWith(s);
      n !== null && this.addState(n);
    }
    onCopy(i) {
      i.preventDefault();
      const s = super.getSelectedChars();
      i.clipboardData && i.clipboardData.setData("text/plain", s), this.copiedText = s;
    }
    onCut(i) {
      i.preventDefault();
      const s = super.getSelectedChars();
      i.clipboardData && i.clipboardData.setData("text/plain", s), this.copiedText = s;
      const n = super.replaceSelectedWith("");
      n !== null && this.addState(n);
    }
    onBackspace() {
    }
    onDelete() {
    }
    onKeyDown(i) {
      var r, h;
      const s = i.keyCode ?? i.which, n = i.code;
      if (this.submitKeyCodes.includes(s) || this.submitKeyCodes.includes(n))
        super.submit();
      else if (s == 37 || n === "ArrowLeft") {
        const o = (r = super.getSelectedRange()) == null ? void 0 : r.indexes;
        o ? super.setCursor(o.start) : super.moveCursor(-1);
      } else if (s == 39 || n === "ArrowRight") {
        const o = (h = super.getSelectedRange()) == null ? void 0 : h.indexes;
        o ? super.setCursor(o.end) : super.moveCursor(1);
      } else if (s == 8 || n === "Backspace")
        super.getSelectedRange() ? super.replaceSelectedWith("") : super.removeLeftOfCursor();
      else if (s == 46 || n === "Delete")
        super.getSelectedRange() ? super.replaceSelectedWith("") : super.removeRightOfCursor();
      else if (i.ctrlKey || i.metaKey)
        if (s == 90 || n === "KeyZ") {
          const o = i.shiftKey ? 1 : -1;
          this.changeStateIndex(o);
        } else (s == 65 || n === "KeyA") && (i.preventDefault(), super.selectAll());
    }
    onKeyPress(i) {
      const s = i.keyCode ?? i.which, n = i.code;
      if (!(this.submitKeyCodes.includes(s) || this.submitKeyCodes.includes(n) || this.ignoreKeys.includes(s) || this.ignoreKeys.includes(n) || i.ctrlKey || i.metaKey))
        if (s != null) {
          const r = String.fromCharCode(s);
          r && (i.preventDefault(), super.replaceSelectedWith(r));
        } else n && ([
          "Backspace",
          "Tab",
          "Alt",
          "Pause",
          "CapsLock",
          "Escape",
          "Space",
          "PageUp",
          "PageDown",
          "End",
          "Home",
          "ArrowLeft",
          "ArrowUp",
          "ArrowRight",
          "ArrowDown",
          "Insert",
          "Delete",
          "ContextMenu",
          "NumLock",
          "ScrollLock",
          "PrintScreen",
          "F1",
          "F2",
          "F3",
          "F4",
          "F5",
          "F6",
          "F7",
          "F8",
          "F9",
          "F10",
          "F11",
          "F12"
        ].includes(n) ? (i.preventDefault(), super.replaceSelectedWith("")) : i.key && i.key.length === 1 && (i.preventDefault(), super.replaceSelectedWith(i.key)), n === "Backspace" || (n === "Delete" ? (i.preventDefault(), super.replaceSelectedWith("")) : n && n.length === 1 && !i.ctrlKey && !i.metaKey && (i.preventDefault(), super.replaceSelectedWith(n))));
    }
    addState(i) {
      this.textStates.push(i), this.currentStateIndex = this.textStates.length - 1;
    }
  };
}
const L = function() {
  return {
    width: "500px",
    height: "16px",
    fontColor: 0,
    highlightedFontColor: 16777215,
    borderColor: 0,
    borderWidth: 1,
    cursorColor: 0,
    cursorHeight: "90%",
    cursorWidth: 1,
    backgroundColor: 16250871,
    highlightedBackgroundColor: 128,
    // navy blue
    borderOpacity: 1,
    xPadding: 0,
    yPadding: 0
  };
}, X = ["width", "height", "cursorHeight"];
class N extends PIXI.Container {
  constructor(t, i, s, n) {
    super(), this.styleOptions = {}, this.cursorSprite = new PIXI.Graphics(), this.textbox = new PIXI.Graphics(), this.textboxMask = new PIXI.Graphics(), this.inFocus = !1, this.cursorIndex = -1, this.lastCursorTs = Date.now(), this.accCursorTime = 0, this.toggleCursorTime = 500, this.cursorIsVisible = !0, this._text = "", this._visible = !0, this.overflowOffsetX = 0, this.overflowOffsetY = 0, this.dragIndexStart = 0, this.dragIndexEnd = 0, this.inDrag = !1, this.submitKeyCodes = [13, "Enter"], this.ignoreKeys = [], this._maxCharacterLength = null, this.onFocusHandler = () => {
    }, this.onBlurHandler = () => {
    }, this.onChangeHandler = () => {
    }, this.onSubmitHandler = () => {
    }, this.onCharLimitHandler = () => {
    }, this.checkForOutsideClick = this.checkForOutsideClick.bind(this);
    const r = this.destroy.bind(this);
    this.destroy = (o) => {
      this.blur(), r(o);
    }, n && (this.ignoreKeys = n);
    const h = { ...L() };
    if (i)
      for (let o in i)
        h[o] = i[o];
    this.maxCharacterLength = s, this.buttonMode = !0, this.interactive = !0, this.textSprite = new PIXI.extras.BitmapText("", { font: t, align: "left" }), this.cursor = "text", this.on("pointerdown", this.handleMouseDown.bind(this)), this.on("pointerup", this.handleMouseUp.bind(this)), this.on("pointermove", this.handleMouseMove.bind(this)), this.on("pointerupoutside", this.handleMouseUp.bind(this)), this.addChild(this.textboxMask), this.addChild(this.textbox), this.addChild(this.textSprite), this.addChild(this.cursorSprite), this.textSprite.mask = this.textboxMask, this.updateStyle(h), this.show();
  }
  updateStyle(t) {
    for (const i in t)
      if (X.includes(i)) {
        const s = u(t[i]);
        if (s.error)
          throw new Error(`Error for passed in style: ${i}, ${s.error}`);
        this.styleOptions[i] = s;
      } else
        this.styleOptions[i] = t[i];
    this.redraw();
  }
  redraw() {
    this.redrawText(), this.redrawTextbox(), this.redrawCursor();
  }
  redrawCursor() {
    if (!this.inFocus) {
      this.cursorIsVisible = !1, this.cursorSprite.visible = !1;
      return;
    }
    const t = this.getCursorXFromIndex(this.cursorIndex) - this.overflowOffsetX;
    this.cursorSprite.clear(), this.cursorSprite.lineStyle(this.styleOptions.cursorWidth, this.styleOptions.cursorColor);
    const { value: i, type: s, error: n } = u(this.styleOptions.cursorHeight);
    if (n)
      throw new Error(`Error for passed in style: cursorHeight, ${n}`);
    const r = s === "pixel" ? i : Math.round(this.textbox.height * (i / 100)), h = Math.min(this.textbox.height, r), l = (Math.max(this.textbox.height, r) - h) / 2, c = Math.floor(l), a = Math.ceil(l);
    this.cursorSprite.moveTo(t, c).lineTo(t, r - a), this.getSelectedRange() ? (this.cursorIsVisible = !1, this.cursorSprite.visible = !1) : (this.cursorIsVisible = !0, this.cursorSprite.visible = !0);
  }
  redrawText() {
    const t = this.getSelectedRange();
    this.textSprite.y = this.styleOptions.yPadding, this.textSprite.x = this.styleOptions.xPadding;
    const i = this.getCursorXFromIndex(this.dragIndexEnd), { value: s, type: n } = u(this.styleOptions.width), r = window.innerWidth, h = n === "pixel" ? s : r * (s / 100);
    i > h + this.overflowOffsetX ? (this.overflowOffsetX = i - h, this.textSprite.x -= this.overflowOffsetX) : i > h ? i < h + this.overflowOffsetX ? (i < this.overflowOffsetX && (this.overflowOffsetX -= this.overflowOffsetX - i), this.textSprite.x -= this.overflowOffsetX) : this.textSprite.x -= this.overflowOffsetX : this.overflowOffsetX = 0;
    for (let o = 0; o < this.textSprite.children.length; o++) {
      const l = this.textSprite.children[o];
      if (t) {
        const { indexes: c } = t, { start: a, end: d } = c;
        if (o >= a && o < d) {
          l.tint = this.styleOptions.highlightedFontColor;
          continue;
        }
      }
      "fontColor" in this.styleOptions ? l.tint = this.styleOptions.fontColor : l.tint = 16777215;
    }
  }
  redrawTextbox() {
    this.textbox.clear(), this.textbox.beginFill(this.styleOptions.backgroundColor, 1), this.styleOptions.borderWidth > 0 && !Number.isNaN(this.styleOptions.borderWidth) && this.textbox.lineStyle(this.styleOptions.borderWidth, this.styleOptions.borderColor, this.styleOptions.borderOpacity);
    let { value: t, type: i } = u(this.styleOptions.height);
    const s = window.innerWidth, n = window.innerHeight, r = i === "pixel" ? t : n * (t / 100);
    ({ value: t, type: i } = u(this.styleOptions.width));
    const h = i === "pixel" ? t : s * (t / 100), o = this.getSelectedRange();
    if (this.textbox.drawRect(0, 0, h, r), this.textbox.endFill(), o) {
      let l = o.x.start - this.overflowOffsetX;
      const c = o.x.end - this.overflowOffsetX;
      this.textbox.beginFill(this.styleOptions.highlightedBackgroundColor, 1);
      let a = c - l;
      l + a >= h ? a = h - l : a = c - l, l + a === h && a > h && (l = 0, a = h), this.textbox.drawRect(l, 0, a, r), this.textbox.endFill();
    }
    this.textboxMask.clear(), this.textboxMask.drawRect(0, 0, h, r);
  }
  handleMouseUp(t) {
    const { x: i } = t.data.getLocalPosition(this);
    this.inDrag && (this.cursorIndex = this.getCursorIndexFromX(i), this.handleRangeFinish());
  }
  handleMouseDown(t) {
    this.clickedTimestamp = t.data.originalEvent.timeStamp;
    const { x: i } = t.data.getLocalPosition(this);
    this.inFocus || this.focus(), this.clearRange(), this.cursorIndex = this.getCursorIndexFromX(i), this.handleRangeStart(this.cursorIndex), this.redraw();
  }
  handleMouseMove(t) {
    if (this.inDrag) {
      const { x: i } = t.data.getLocalPosition(this);
      this.handleRangeChange(this.getCursorIndexFromX(i));
    }
  }
  clearRange() {
    this.dragIndexEnd = this.cursorIndex, this.dragIndexStart = this.cursorIndex;
  }
  handleRangeStart(t) {
    this.inDrag = !0, this.dragIndexStart = t, this.dragIndexEnd = t;
  }
  handleRangeChange(t) {
    t !== this.dragIndexEnd && (this.dragIndexEnd = t, this.redraw());
  }
  handleRangeFinish() {
    this.inDrag = !1;
  }
  getCursorXFromIndex(t) {
    let i;
    return !this.textSprite.children || !this.textSprite.children.length || t <= 0 ? this.styleOptions.xPadding ? this.styleOptions.xPadding : 0 : (t >= this.textSprite.children.length ? i = this.textSprite.children[this.textSprite.children.length - 1] : i = this.textSprite.children[t - 1], i.x + i.width + 1 + this.styleOptions.xPadding);
  }
  setCursor(t) {
    t > -1 && t <= this.text.length && (this.cursorIndex = t, this.clearRange(), this.redraw());
  }
  moveCursor(t) {
    const i = this.cursorIndex + t;
    i > -1 && i <= this.text.length && (this.cursorIndex = i, this.clearRange(), this.redraw());
  }
  getCursorIndexFromX(t) {
    if (t += this.overflowOffsetX, t <= 0)
      return 0;
    for (let i = 0; i < this.textSprite.children.length; i++) {
      const s = this.textSprite.children[i];
      if (s.x + s.width > t)
        return s.x + s.width / 2 < t ? i + 1 : i;
    }
    return this.textSprite.children.length;
  }
  getSelectedChars() {
    const t = this.getSelectedRange();
    if (!t) return "";
    const { indexes: i } = t, { start: s, end: n } = i;
    return this.text.substr(s, n - s);
  }
  replaceSelectedWith(t) {
    const i = t.split(""), s = i.length;
    this.text;
    const n = this.text.split("");
    let r, h;
    const o = this.getSelectedRangeIndexes();
    o ? { start: r, end: h } = o : r = h = this.cursorIndex;
    const l = h - r;
    return n.splice(r, l, ...i), this._change(n.join("")) ? (this.cursorIndex = r + s, this.clearRange(), this.redraw(), this.text) : this.text;
  }
  getSelectedRangeIndexes() {
    const t = this.getSelectedRange();
    return t ? { start: t.indexes.start, end: t.indexes.end } : null;
  }
  getSelectedRange() {
    const t = Math.min(this.dragIndexStart, this.dragIndexEnd), i = Math.max(this.dragIndexStart, this.dragIndexEnd);
    if (t === i) return null;
    const s = this.getCursorXFromIndex(t), n = this.getCursorXFromIndex(i);
    return {
      indexes: { start: t, end: i },
      x: { start: s, end: n }
    };
  }
  selectAll() {
    this.setSelectedRange(0, this.text.length);
  }
  setSelectedRange(t, i) {
    this.dragIndexStart = t, this.dragIndexEnd = i, this.cursorIndex = i, this.redraw();
  }
  charFromPosition(t) {
    return { left: null, right: null };
  }
  removeLeftOfCursor() {
    if (this.cursorIndex > 0) {
      const t = this.text.split("");
      t.splice(this.cursorIndex - 1, 1), this.cursorIndex--, this._change(t.join("")), this.redraw();
    }
  }
  removeRightOfCursor() {
    const t = this.text.split("");
    t.length && this.cursorIndex < t.length && (t.splice(this.cursorIndex, 1), this._change(t.join("")), this.redraw());
  }
  onCharLimit(t) {
    this.onCharLimitHandler = t;
  }
  onChange(t) {
    this.onChangeHandler = t;
  }
  onFocus(t) {
    this.onFocusHandler = t;
  }
  onBlur(t) {
    this.onBlurHandler = t;
  }
  onSubmit(t) {
    this.onSubmitHandler = t;
  }
  clear() {
    this.text = "", this.cursorIndex = 0, this.clearRange(), this.redraw();
  }
  submit() {
    this.onSubmitHandler(this.text);
  }
  focus() {
    this.inFocus || (document.addEventListener("mousedown", this.checkForOutsideClick), this.inFocus = !0, this.startCursorAnimation(), this.emit("focus"), this.onFocusHandler());
  }
  blur() {
    this.inFocus && (document.removeEventListener("mousedown", this.checkForOutsideClick), this.inFocus = !1, this.stopCursorAnimation(), this.clearRange(), this.redraw(), this.emit("blur"), this.onBlurHandler());
  }
  set maxCharacterLength(t) {
    isNaN(t) ? this._maxCharacterLength = null : t === null || t < 0 ? this._maxCharacterLength = null : this._maxCharacterLength = t;
  }
  _change(t) {
    return t !== this.text ? this._maxCharacterLength !== null && t.length > this._maxCharacterLength ? (this.onCharLimitHandler(t), !1) : (this._text = t, this.textSprite.text = t, this._text === "" && this.textSprite.children && this.textSprite.children.forEach((i) => {
      this.textSprite.removeChild(i);
    }), this.textSprite.updateTransform(), this.emit("change", t), this.onChangeHandler(t), !0) : !1;
  }
  change(t) {
    const i = this._change(t);
    return i && this.redrawText(), i;
  }
  startCursorAnimation() {
    this.cursorAnimationFrame && this.stopCursorAnimation(), this.blinkCursor();
  }
  stopCursorAnimation() {
    this.cursorSprite.visible = !1, this.cursorAnimationFrame && (clearTimeout(this.cursorAnimationFrame), this.cursorAnimationFrame = null, this.accCursorTime = 0);
  }
  blinkCursor() {
    this.cursorIsVisible && (this.cursorSprite.visible = !this.cursorSprite.visible), this.cursorAnimationFrame = setTimeout(this.blinkCursor.bind(this), this.toggleCursorTime);
  }
  checkForOutsideClick(t) {
    t.timeStamp !== this.clickedTimestamp && this.blur();
  }
  get text() {
    return this.textSprite.text === " " && this._text !== " " ? "" : this.textSprite.text;
  }
  set text(t) {
    this.change(t);
  }
  // @ts-ignore
  set visible(t) {
    super.visible = t, this._visible = t, t ? this.startCursorAnimation() : this.stopCursorAnimation();
  }
  get visible() {
    return this._visible;
  }
  show() {
    this.visible = !0;
  }
  hide() {
    this.visible = !1;
  }
}
const A = B(N);
class p extends PIXI.Container {
  constructor() {
    super(), this.isMouseOver = !1, this.elements = [], this.dragPosition = null, this.inDrag = !1, this.pointerIsDown = !1, this._pointerdownHandler = null, this._pointermoveHandler = null, this._pointerupHandler = null, this._pointerupoutsideHandler = null, this._pointeroverHandler = null, this._pointeroutHandler = null, this._pointertapHandler = null, this._doubleclickHandler = null, this._dragmoveHandler = null, this._dragendHandler = null, this._dragstartHandler = null, this._swipeupHandler = null, this._swipedownHandler = null, this._swipeHandler = null, this.doubleClickTimeout = null, this.completedTriggerTimeout = null, this.holdDragTriggerTime = 30, this.holdDragTriggerTimeout = null, this.helddownCountHandlers = {}, this.helddownTimeouts = [], this.ifDragEndEmitSwipeDistance = 0, this.curDragSwipePowerIterationQueue = [], this.lastDragDistance = 0, this.lastDragY = 0, this.maxSwipeTimeout = 300, this.minSwipeDistance = 200, this.hasSwipeHandler = !1, this.missedDiffs = 0, this._addChild = super.addChild, this.on("pointerover", () => {
      this.isMouseOver = !0;
    }), this.on("pointerout", () => {
      this.isMouseOver = !1;
    });
  }
  set pointerdownHandler(t) {
    this._setEventNameHandler("pointerdown", t);
  }
  set pointerupHandler(t) {
    this._setEventNameHandler("pointerup", t);
  }
  set pointerupoutsideHandler(t) {
    this._setEventNameHandler("pointerupoutside", t);
  }
  set pointeroverHandler(t) {
    this._setEventNameHandler("pointerover", t);
  }
  set pointermoveHandler(t) {
    this._setEventNameHandler("pointermove", t);
  }
  set pointeroutHandler(t) {
    this._setEventNameHandler("pointerout", t);
  }
  set pointertapHandler(t) {
    this._setEventNameHandler("pointertap", t);
  }
  set doubleclickHandler(t) {
    this._setEventNameHandler("doubleclick", t);
  }
  set dragstartHandler(t) {
    this._setEventNameHandler("dragstart", t);
  }
  set dragendHandler(t) {
    this._setEventNameHandler("dragend", t);
  }
  set dragmoveHandler(t) {
    this._setEventNameHandler("dragmove", t);
  }
  _setHeldDownHandler(t, i) {
    this.helddownCountHandlers[i] && console.warn("already had held down timeout for duration at", i, "this will override it."), this.helddownCountHandlers[i] = t;
  }
  _setEventNameHandler(t, i) {
    this[`_${t}Handler`] || this.on(t, this[`__${t}`]), this[`_${t}Handler`] = i, this.buttonMode || (this.buttonMode = !0, this.interactive = !0);
  }
  centerX() {
    this.parent && (this.x = this.parent.width / 2 - this.width / 2);
  }
  centerY() {
    this.parent && (this.y = this.parent.height / 2 - this.height / 2);
  }
  center() {
    this.centerX(), this.centerY();
  }
  addElement(t) {
    if (!(t instanceof Element))
      throw new Error("addElement called with a non element object");
    this.elements.push(t);
  }
  removeElement(t) {
    this.elements = this.elements.filter((i) => i !== t);
  }
  onMouseDown(t) {
    this.pointerdownHandler = t;
  }
  onMouseUp(t) {
    this.pointerupHandler = t;
  }
  onMouseUpOutside(t) {
    this.pointerupoutsideHandler = t;
  }
  onMouseOver(t) {
    this.pointeroverHandler = t;
  }
  onMouseOut(t) {
    this.pointeroutHandler = t;
  }
  onMouseMove(t) {
    this.pointermoveHandler = t;
  }
  onClick(t) {
    this.pointertapHandler = t;
  }
  onHeldDown(t, i) {
    !this._pointerdownHandler && this.onMouseDown(() => {
    }), this._setHeldDownHandler(t, i);
  }
  /**
   *
   * @param handler
   * @param hold - time in milliseconds needed to be held before triggering drag
   */
  onDragStart(t, i) {
    (i || i == 0 && !isNaN(i)) && (this.holdDragTriggerTime = i), this.registerDefaultIfNeeded("pointerdown"), this.registerDefaultIfNeeded("pointerup"), this.registerDefaultIfNeeded("pointerupoutside"), this.registerDefaultIfNeeded("pointerout"), this.dragstartHandler = t;
  }
  onDragEnd(t) {
    this.registerDefaultIfNeeded("pointerup"), this.registerDefaultIfNeeded("pointerupoutside"), this.dragendHandler = t;
  }
  onDragMove(t) {
    this._dragstartHandler || this.onDragStart((i) => {
    }, this.holdDragTriggerTime), this._dragendHandler || this.onDragEnd((i) => {
    }), this.registerDefaultIfNeeded("pointermove"), this.dragmoveHandler = t;
  }
  onDoubleClick(t) {
    this.registerDefaultIfNeeded("pointerdown"), this.doubleclickHandler = t;
  }
  onSwipe(t) {
    this.hasSwipeHandler = !0, this.registerDefaultIfNeeded("pointerdown"), this.registerDefaultIfNeeded("pointerup"), this.registerDefaultIfNeeded("pointerupoutside"), this._dragmoveHandler || this.onDragMove(() => {
    }), this._swipeHandler = t;
  }
  onSwipeUp(t) {
    this.hasSwipeHandler = !0, this.registerDefaultIfNeeded("pointerdown"), this.registerDefaultIfNeeded("pointerup"), this.registerDefaultIfNeeded("pointerupoutside"), this._swipeupHandler = t;
  }
  onSwipeDown(t) {
    this.hasSwipeHandler = !0, this.registerDefaultIfNeeded("pointerdown"), this.registerDefaultIfNeeded("pointerup"), this.registerDefaultIfNeeded("pointerupoutside"), this._swipedownHandler = t;
  }
  __doubleclick(t) {
    clearTimeout(this.doubleClickTimeout), this.doubleClickTimeout = null, this._doubleclickHandler && this._doubleclickHandler(t);
  }
  clearHelddownTimeouts() {
    this.helddownTimeouts.forEach((t) => {
      clearTimeout(t);
    }), this.helddownTimeouts.length = 0;
  }
  registerDefaultIfNeeded(t) {
    this[`_${t}Handler`] || (this[`${t}Handler`] = () => {
    });
  }
  __pointerdown(t) {
    Object.keys(this.helddownCountHandlers).forEach((i) => {
      this.helddownTimeouts.push(
        setTimeout(() => {
          this.helddownCountHandlers[i](t);
        }, parseInt(i))
      );
    }), this.pointerIsDown = !0, this._pointerdownHandler(t), this.swipeStartTs = Date.now(), this.swipeStartY = t.data.global.y, this._dragstartHandler && !this.inDrag && (this.holdDragTriggerTimeout = setTimeout(() => {
      this.completedTriggerTimeout = !0, this.holdDragTriggerTimeout = null;
    }, this.holdDragTriggerTime)), this.doubleClickTimeout ? this.emit("doubleclick", t) : this.doubleClickTimeout = setTimeout(() => {
      this.doubleClickTimeout = null;
    }, 300);
  }
  __pointertap(t) {
    this._pointertapHandler(t);
  }
  __dragstart(t) {
    this.inDrag = !0, this.startDragY = t.data.global.y, this.lastDragY = t.data.global.y, this.lastDragCheckTs = Date.now(), this._dragstartHandler(t);
  }
  __dragmove(t) {
    if (this._dragmoveHandler(t), this.hasSwipeHandler) {
      const i = Date.now(), s = i - this.lastDragCheckTs;
      this.lastDragCheckTs = i, this.curDragSwiperCheckIterationDuration += s;
      const n = t.data.global.y, r = this.lastDragY - n;
      this.lastDragY = n, Math.abs(r) < 7 ? this.missedDiffs++ : this.missedDiffs = 0, this.missedDiffs < 2 ? (Math.sign(this.ifDragEndEmitSwipeDistance) != Math.sign(r) && (this.swipeStartY = n, this.resetDragSwipeVars()), this.curDragSwiperCheckIterationDuration >= this.maxSwipeTimeout ? (this.curDragSwipePowerIterationQueue.length && (this.ifDragEndEmitSwipeDistance -= this.curDragSwipePowerIterationQueue.shift()), this.curDragSwipePowerIterationQueue.push(r), this.ifDragEndEmitSwipeDistance += r) : (this.ifDragEndEmitSwipeDistance += r, this.curDragSwipePowerIterationQueue.push(r))) : this.resetDragSwipeVars();
    }
  }
  resetDragSwipeVars() {
    this.curDragSwipePowerIterationQueue.length = 0, this.ifDragEndEmitSwipeDistance = 0, this.curDragSwiperCheckIterationDuration = 0;
  }
  __dragend(t) {
    if (this.inDrag = !1, this._dragendHandler(t), this.hasSwipeHandler) {
      const i = Math.sign(this.ifDragEndEmitSwipeDistance);
      if (i) {
        const s = Math.max(10, this.curDragSwiperCheckIterationDuration), n = Math.min(this.maxSwipeTimeout, s), r = this.ifDragEndEmitSwipeDistance / (n + 100 / 15) * 10;
        i > 0 && this._swipedownHandler ? this._swipedownHandler(this.ifDragEndEmitSwipeDistance) : this._swipeupHandler && this._swipeupHandler(this.ifDragEndEmitSwipeDistance), this._swipeHandler && this._swipeHandler(r);
      }
      this.resetDragSwipeVars();
    }
    this.ifDragEndEmitSwipeDistance = 0;
  }
  __pointermove(t) {
    this.pointerIsDown && !this.inDrag && this.completedTriggerTimeout ? this.emit("dragstart", t) : this.inDrag && this._dragmoveHandler && this.emit("dragmove", t), this._pointermoveHandler(t);
  }
  __pointerover(t) {
    this._pointeroverHandler(t);
  }
  __pointerout(t) {
    this.clearHelddownTimeouts(), this.clearDragTimeouts(), this._pointeroutHandler(t);
  }
  handleSwipeFinish(t) {
    if (this.hasSwipeHandler) {
      const i = this.swipeStartY - t, s = Math.max(Date.now() - this.swipeStartTs, 1);
      if (s < this.maxSwipeTimeout && Math.abs(i) > this.minSwipeDistance) {
        const n = i / (s + 6.666666666666667) * 10;
        if (Math.abs(n) > 10) {
          const r = i > 0 ? this._swipeupHandler : this._swipedownHandler;
          r && r(n), this._swipeHandler && this._swipeHandler(n);
        }
      }
    }
  }
  __pointerupoutside(t) {
    this.clearHelddownTimeouts(), this.clearDragTimeouts(), this.handleSwipeFinish(t.data.global.y), this.pointerIsDown = !1, this._pointerupoutsideHandler(t), this.inDrag && this.emit("dragend", t);
  }
  __pointerup(t) {
    this.clearHelddownTimeouts(), this.clearDragTimeouts(), this.handleSwipeFinish(t.data.global.y), this.pointerIsDown = !1, this._pointerupHandler(t), this.inDrag && this.emit("dragend", t);
  }
  clearDragTimeouts() {
    this.completedTriggerTimeout = !1, this.holdDragTriggerTimeout && (clearTimeout(this.holdDragTriggerTimeout), this.holdDragTriggerTimeout = null);
  }
  repositionSelf() {
    this.parent;
  }
  repositionChildren() {
    this.repositionSelf();
    for (let t = 0; t < this.elements.length; t++)
      this.elements[t];
    this.children.forEach((t) => {
    });
  }
}
function V(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var b, M;
function k() {
  if (M) return b;
  M = 1;
  var e = {
    linear: function(t, i, s, n) {
      var r = s - i;
      return r * t / n + i;
    },
    easeInQuad: function(t, i, s, n) {
      var r = s - i;
      return r * (t /= n) * t + i;
    },
    easeOutQuad: function(t, i, s, n) {
      var r = s - i;
      return -r * (t /= n) * (t - 2) + i;
    },
    easeInOutQuad: function(t, i, s, n) {
      var r = s - i;
      return (t /= n / 2) < 1 ? r / 2 * t * t + i : -r / 2 * (--t * (t - 2) - 1) + i;
    },
    easeInCubic: function(t, i, s, n) {
      var r = s - i;
      return r * (t /= n) * t * t + i;
    },
    easeOutCubic: function(t, i, s, n) {
      var r = s - i;
      return r * ((t = t / n - 1) * t * t + 1) + i;
    },
    easeInOutCubic: function(t, i, s, n) {
      var r = s - i;
      return (t /= n / 2) < 1 ? r / 2 * t * t * t + i : r / 2 * ((t -= 2) * t * t + 2) + i;
    },
    easeInQuart: function(t, i, s, n) {
      var r = s - i;
      return r * (t /= n) * t * t * t + i;
    },
    easeOutQuart: function(t, i, s, n) {
      var r = s - i;
      return -r * ((t = t / n - 1) * t * t * t - 1) + i;
    },
    easeInOutQuart: function(t, i, s, n) {
      var r = s - i;
      return (t /= n / 2) < 1 ? r / 2 * t * t * t * t + i : -r / 2 * ((t -= 2) * t * t * t - 2) + i;
    },
    easeInQuint: function(t, i, s, n) {
      var r = s - i;
      return r * (t /= n) * t * t * t * t + i;
    },
    easeOutQuint: function(t, i, s, n) {
      var r = s - i;
      return r * ((t = t / n - 1) * t * t * t * t + 1) + i;
    },
    easeInOutQuint: function(t, i, s, n) {
      var r = s - i;
      return (t /= n / 2) < 1 ? r / 2 * t * t * t * t * t + i : r / 2 * ((t -= 2) * t * t * t * t + 2) + i;
    },
    easeInSine: function(t, i, s, n) {
      var r = s - i;
      return -r * Math.cos(t / n * (Math.PI / 2)) + r + i;
    },
    easeOutSine: function(t, i, s, n) {
      var r = s - i;
      return r * Math.sin(t / n * (Math.PI / 2)) + i;
    },
    easeInOutSine: function(t, i, s, n) {
      var r = s - i;
      return -r / 2 * (Math.cos(Math.PI * t / n) - 1) + i;
    },
    easeInExpo: function(t, i, s, n) {
      var r = s - i;
      return t == 0 ? i : r * Math.pow(2, 10 * (t / n - 1)) + i;
    },
    easeOutExpo: function(t, i, s, n) {
      var r = s - i;
      return t == n ? i + r : r * (-Math.pow(2, -10 * t / n) + 1) + i;
    },
    easeInOutExpo: function(t, i, s, n) {
      var r = s - i;
      return t === 0 ? i : t === n ? i + r : (t /= n / 2) < 1 ? r / 2 * Math.pow(2, 10 * (t - 1)) + i : r / 2 * (-Math.pow(2, -10 * --t) + 2) + i;
    },
    easeInCirc: function(t, i, s, n) {
      var r = s - i;
      return -r * (Math.sqrt(1 - (t /= n) * t) - 1) + i;
    },
    easeOutCirc: function(t, i, s, n) {
      var r = s - i;
      return r * Math.sqrt(1 - (t = t / n - 1) * t) + i;
    },
    easeInOutCirc: function(t, i, s, n) {
      var r = s - i;
      return (t /= n / 2) < 1 ? -r / 2 * (Math.sqrt(1 - t * t) - 1) + i : r / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + i;
    },
    easeInElastic: function(t, i, s, n) {
      var r = s - i, h, o, l;
      return l = 1.70158, o = 0, h = r, t === 0 ? i : (t /= n) === 1 ? i + r : (o || (o = n * 0.3), h < Math.abs(r) ? (h = r, l = o / 4) : l = o / (2 * Math.PI) * Math.asin(r / h), -(h * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * n - l) * (2 * Math.PI) / o)) + i);
    },
    easeOutElastic: function(t, i, s, n) {
      var r = s - i, h, o, l;
      return l = 1.70158, o = 0, h = r, t === 0 ? i : (t /= n) === 1 ? i + r : (o || (o = n * 0.3), h < Math.abs(r) ? (h = r, l = o / 4) : l = o / (2 * Math.PI) * Math.asin(r / h), h * Math.pow(2, -10 * t) * Math.sin((t * n - l) * (2 * Math.PI) / o) + r + i);
    },
    easeInOutElastic: function(t, i, s, n) {
      var r = s - i, h, o, l;
      return l = 1.70158, o = 0, h = r, t === 0 ? i : (t /= n / 2) === 2 ? i + r : (o || (o = n * (0.3 * 1.5)), h < Math.abs(r) ? (h = r, l = o / 4) : l = o / (2 * Math.PI) * Math.asin(r / h), t < 1 ? -0.5 * (h * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * n - l) * (2 * Math.PI) / o)) + i : h * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * n - l) * (2 * Math.PI) / o) * 0.5 + r + i);
    },
    easeInBack: function(t, i, s, n, r) {
      var h = s - i;
      return r === void 0 && (r = 1.70158), h * (t /= n) * t * ((r + 1) * t - r) + i;
    },
    easeOutBack: function(t, i, s, n, r) {
      var h = s - i;
      return r === void 0 && (r = 1.70158), h * ((t = t / n - 1) * t * ((r + 1) * t + r) + 1) + i;
    },
    easeInOutBack: function(t, i, s, n, r) {
      var h = s - i;
      return r === void 0 && (r = 1.70158), (t /= n / 2) < 1 ? h / 2 * (t * t * (((r *= 1.525) + 1) * t - r)) + i : h / 2 * ((t -= 2) * t * (((r *= 1.525) + 1) * t + r) + 2) + i;
    },
    easeInBounce: function(t, i, s, n) {
      var r = s - i, h;
      return h = e.easeOutBounce(n - t, 0, r, n), r - h + i;
    },
    easeOutBounce: function(t, i, s, n) {
      var r = s - i;
      return (t /= n) < 1 / 2.75 ? r * (7.5625 * t * t) + i : t < 2 / 2.75 ? r * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + i : t < 2.5 / 2.75 ? r * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + i : r * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + i;
    },
    easeInOutBounce: function(t, i, s, n) {
      var r = s - i, h;
      return t < n / 2 ? (h = e.easeInBounce(t * 2, 0, r, n), h * 0.5 + i) : (h = e.easeOutBounce(t * 2 - n, 0, r, n), h * 0.5 + r * 0.5 + i);
    }
  };
  return b = e, b;
}
var W = k();
const P = /* @__PURE__ */ V(W);
class G extends p {
  constructor(t, i) {
    super(), this.scrolling = !1, this.scrollList = t, this.options = i || {}, this.bg = new PIXI.Graphics(), this.addChild(this.bg), this.scroller = new j(this, i.scrollerOptions), this.addChild(this.scroller), this.scroller.y = 0, this.redraw(), this.registerScrollerEvents();
  }
  resizeScrollBar(t, i) {
  }
  get visibleLength() {
    return this.scrollList.height;
  }
  get maxLength() {
    return this.scrollList.maxHeight;
  }
  redraw() {
    this.bg.clear(), this.bg.beginFill(this.options.backgroundColor || 16250871), this.bg.drawRect(0, 0, this.options.width, this.visibleLength), this.scroller.redraw();
  }
  setScrollPercent(t) {
    const s = (this.visibleLength - this.scroller.height) * t;
    this.scroller.y = s;
  }
  registerScrollerEvents() {
    this.onHeldDown((t) => {
      const i = t.data.global.y - this.getGlobalPosition().y;
      let s = -1;
      i < this.scroller.y ? s = i : i > this.scroller.y + this.scroller.height && (s = i - this.scroller.height), s >= 0 && !this.scrolling && (this.scroller.y = C(s, 0, this.visibleLength - this.scroller.height), this.emitScroll());
    }, 50), this.scroller.onDragStart((t) => {
      this.scrolling = !0;
    }, 0), this.scroller.onDragEnd((t) => {
      this.scrolling = !1;
    }), this.scroller.onDragMove((t) => {
      t.stopPropagation();
      const i = t.data.originalEvent.movementY, s = t.data.global.y, n = this.getGlobalPosition(), r = this.scroller.y + n.y;
      let h = 0;
      s > r + this.scroller.height ? h = s - (r + this.scroller.height) : s < r && (h = s - r), this.scroller.y = C(this.scroller.y + i + h, 0, this.visibleLength - this.scroller.height), this.emitScroll();
    });
  }
  emitScroll() {
    const t = this.visibleLength - this.scroller.height, i = this.scroller.y / t;
    this.emit("scrolled", i);
  }
}
class j extends p {
  constructor(t, i) {
    super(), this.scrollBar = t, this.styleObj = i || {}, this.rect = new PIXI.Graphics(), this.addChild(this.rect);
  }
  setStyle(t) {
    this.redraw();
  }
  redraw() {
    if (this.rect.clear(), this.scrollBar.visibleLength >= this.scrollBar.maxLength) return;
    const t = Math.ceil(this.scrollBar.visibleLength / (this.scrollBar.maxLength / this.scrollBar.visibleLength));
    this.rect.beginFill("color" in this.styleObj ? this.styleObj.color : 0), this.rect.drawRect(0, 0, this.scrollBar.width, t), this.rect.endFill();
  }
}
const I = {
  disableTouchScroll: !1,
  disableScrollWheelScroll: !1,
  visibilityBuffer: 200,
  adjustVisibilityTime: 130
};
class U extends PIXI.Container {
  constructor(t, i, s) {
    if (super(), this.scrollItemsById = {}, this.options = [], this.po = new p(), this.scrollRect = new p(), this.scrollDuration = 0, this._currentScroll = 0, this.lastScroll = 0, this.pointerdownStart = 0, this.startingVisibleChildIndex = 0, this.endingVisibleChildIndex = 0, this.scrollCurrentDur = 0, this.currentAdjustVisibilityDelta = 0, this.animationFrame = null, this.nextItemY = 0, this.scrollToDest = 0, this.listContainer = new p(), this.backgroundRect = new PIXI.Graphics(), this.scrollLength = 0, this.adjustedIndex = 0, this.maxHeight = 0, this.lastOverOption = null, this.lastDownOption = null, this.freezeScroll = !1, this._needsUpdateScoller = !0, this._registeredScrollEvent = !1, this.handleScrollWheelScroll = this.handleScrollWheelScroll.bind(this), this.interactive = !0, this.interactiveChildren = !0, this.__width = u(t.width).value, this.__height = u(t.height).value, this.performanceOptions = s || { ...I }, s)
      for (let r in I)
        s.hasOwnProperty(r) || (this.performanceOptions[r] = I[r]);
    this.scrollbarScroll = new PIXI.Graphics(), this.scrollStyleOptions = t, this.scrollLength = 0, this.scrollMask = new PIXI.Graphics(), this.scrollMask.beginFill(16777215), this.scrollMask.drawRect(0, 0, this.__width, this.__height), this.scrollMask.endFill(), this.backgroundRect.beginFill(this.scrollStyleOptions.backgroundColor || 1048575), this.backgroundRect.drawRect(0, 0, this.__width, this.__height), this.backgroundRect.endFill(), this.addChild(this.backgroundRect), this.addChild(this.scrollMask), this.addChild(this.po), this.po.interactive = !0, this.po.mask = this.scrollMask, this.addChild(this.scrollRect);
    let n;
    this.performanceOptions.disableScrollWheelScroll || this.registerScrollEvents(), this.performanceOptions.disableTouchScroll || (this.scrollRect.onSwipe(this.applySwipe.bind(this)), this.on("pointerdown", (r) => {
      this.scrollBar && this.scrollBar.scrolling || this.performanceOptions.disableTouchScroll || this.animationFrame !== null && (cancelAnimationFrame(this.animationFrame), this.po.inDrag || this.po.emit("dragstart", r), this.animationFrame = null);
    }), this.on("pointerup", () => {
      this.scrollBar && this.scrollBar.scrolling || this.performanceOptions.disableTouchScroll;
    }), this.po.onSwipe(this.applySwipe.bind(this)), this.po.onDragStart((r) => {
      this.scrollBar && this.scrollBar.scrolling || this.freezeScroll || (this.tweenFunc = P.easeOutElastic, this.scrollLength = 0, this.scrollCurrentDur = 0, this.scrollDuration = 0, this.currentAdjustVisibilityDelta = 0, n = r.data.global.y);
    }), this.po.onDragMove((r) => {
      if (this.scrollBar && this.scrollBar.scrolling || this.freezeScroll) return;
      const h = r.data.global.y - n;
      n = r.data.global.y, this.applyDrag(h);
    }), this.po.onDragEnd((r) => {
      this.scrollBar && this.scrollBar.scrolling || this.adjustVisibility(null, !0);
    })), t.scrollBarOptions && (this.scrollBar = new G(this, t.scrollBarOptions), this.addChild(this.scrollBar), this.scrollBar.on("scrolled", (r) => {
      this._needsUpdateScoller = !1, this.setScrollPercent(r), this._needsUpdateScoller = !0;
    })), this.redraw();
  }
  handleScrollWheelScroll(t) {
    this.currentScroll += t.deltaY, this.adjustVisibility(null, !0);
  }
  destroy(t) {
    this._registeredScrollEvent && (document.removeEventListener("wheel", this.handleScrollWheelScroll), this._registeredScrollEvent = !1), super.destroy(t);
  }
  get utilizedLength() {
    return this.maxHeight - this.__height;
  }
  get scrollPercent() {
    return this.currentScroll / this.utilizedLength;
  }
  registerScrollEvents() {
    this.once("pointerover", () => {
      this._registeredScrollEvent = !0, document.addEventListener("wheel", this.handleScrollWheelScroll), this.once("pointerout", () => {
        document.removeEventListener("wheel", this.handleScrollWheelScroll), this._registeredScrollEvent = !1, this.registerScrollEvents();
      });
    });
  }
  setScrollPercent(t) {
    t = C(t, 0, 1);
    const i = this.currentScroll;
    this.currentScroll = this.utilizedLength * t, i !== this.currentScroll && this.adjustVisibility(null, !0);
  }
  findVisible() {
  }
  freeze() {
    this.toggleFreezeScroll(!0);
  }
  unfreeze() {
    this.toggleFreezeScroll(!1);
  }
  toggleFreezeScroll(t) {
    this.freezeScroll = t;
  }
  _containsPoint(t, i) {
    i = this.toLocal(i);
    const s = 0, n = this.__width, r = t.y - this.currentScroll, h = r + t.height;
    return s <= i.x && i.x <= n && r <= i.y && i.y <= h;
  }
  resize(t, i) {
    this.__width = t, this.__height = i, this.scrollMask.clear(), this.scrollMask.beginFill(16777215).drawRect(0, 0, this.__width, this.__height).endFill(), this.backgroundRect.clear(), this.backgroundRect.beginFill(this.scrollStyleOptions.backgroundColor).drawRect(0, 0, this.__width, this.__height).endFill(), this.adjustVisibility(null, !0), this.scrollBar && this.scrollBar.redraw();
  }
  redraw() {
    this.adjustOptions(), this.scrollBar && (this.scrollBar.redraw(), this.scrollBar.x = this.po.width);
  }
  repositionOptions() {
    let t = 0;
    for (let i = 0; i < this.options.length; i++)
      this.options[i].y = t, t += this.options[i].height;
  }
  adjustVisibility(t, i = !1) {
    if (i)
      this.currentAdjustVisibilityDelta = 0;
    else if (this.currentAdjustVisibilityDelta += t, !i && this.currentAdjustVisibilityDelta >= this.performanceOptions.adjustVisibilityTime) {
      this.currentAdjustVisibilityDelta = 0;
      return;
    }
    let s = !1;
    for (let n = 0; n < this.options.length; n++) {
      const r = this.options[n], h = r.y + r.height + this.performanceOptions.visibilityBuffer >= this.currentScroll, o = this.__height + this.currentScroll >= r.y - this.performanceOptions.visibilityBuffer, l = r.visible;
      if (r.visible = o && h, r.visible && !s && (this.startingVisibleChildIndex = n, s = !0), !r.visible && s && (this.endingVisibleChildIndex = Math.min(n + 1, this.options.length - 1)), l !== r.visible ? (l ? r.emit("hide") : r.emit("show"), r.just_added && delete r.just_added) : r.just_added && (r.visible ? r.emit("show") : r.emit("hide"), delete r.just_added), !r.visible && !l && s)
        return;
    }
    this.endingVisibleChildIndex = this.options.length - 1;
  }
  adjustOptions() {
    this.po && this.po.parent === this && (this.po.y = -this.currentScroll, this.adjustedIndex++);
  }
  animateScroll(t) {
    const i = Date.now(), s = i - t;
    return this.currentAdjustVisibilityDelta += s, this.scrollCurrentDur += s, this.scrollCurrentDur >= this.scrollDuration ? (this.animationFrame = null, this.currentScroll = this.scrollToDest, this.currentAdjustVisibilityDelta = 0, this.adjustVisibility(null, !0), null) : (this.currentScroll = this.tweenFunc(this.scrollCurrentDur, this.lastScroll, this.scrollToDest, this.scrollDuration), this.adjustVisibility(s), requestAnimationFrame(() => {
      this.animationFrame !== null && (this.animationFrame = this.animateScroll(i));
    }));
  }
  applyDrag(t) {
    if (this.animationFrame || this.maxHeight <= this.__height)
      return;
    if (t > 0 && this._currentScroll === 0) {
      this.adjustVisibility(null, !0);
      return;
    } else if (t < 0 && this._currentScroll === this.maxHeight - this.__height) {
      this.adjustVisibility(null, !0);
      return;
    }
    this.lastScroll = this._currentScroll, this.scrollLength += t, this.scrollToDest = this.scrollLength >= 0 ? Math.min(this.maxHeight - this.__height, this._currentScroll - t) : Math.max(0, this._currentScroll - t), this.scrollDuration += Math.abs(t);
    const i = Math.abs(this._currentScroll - this.scrollToDest), s = i > 1e3 ? 4e3 : i > 700 ? 3e3 : i > 500 ? 2e3 : i > 200 ? 1e3 : 400;
    this.scrollDuration = Math.min(this.scrollDuration, s), this.animationFrame = this.animateScroll(Date.now());
  }
  applySwipe(t) {
    if (Math.abs(t) < 1) return;
    this.animationFrame && (cancelAnimationFrame(this.animationFrame), this.animationFrame = null), this.tweenFunc = P.easeOutCubic, this.lastScroll = this._currentScroll, this.scrollCurrentDur = 0;
    const i = Math.abs(t), s = i < 10 ? 25 : i < 25 ? 30 : i < 30 ? 35 : i < 35 ? 55 : i < 40 ? 60 : i < 60 ? 65 : 80, n = t * s;
    if (this.maxHeight <= this.__height)
      return;
    this.scrollToDest = t >= 0 ? Math.min(this.maxHeight - this.__height, this._currentScroll + n) : Math.max(0, this._currentScroll + n);
    const r = Math.abs(this._currentScroll - this.scrollToDest);
    let h;
    this.scrollToDest === 0 || this.scrollToDest === this.maxHeight - this.__height + 0 ? h = r > 1e3 ? 1e3 : r > 500 ? 500 : 200 : h = r > 2700 ? 4e3 : r > 2300 ? 3500 : r > 1500 ? 3e3 : r > 1e3 ? 2700 : r > 700 ? 2300 : r > 500 ? 2e3 : r > 300 ? 1500 : r > 100 ? 1e3 : 700, this.scrollDuration = Math.min(h), this.animationFrame = this.animateScroll(Date.now());
  }
  set currentScroll(t) {
    t < 0 ? t = 0 : t > this.maxHeight - this.__height && (t = this.maxHeight - this.__height), this._currentScroll = t, this.scrollBar && this._needsUpdateScoller && this.scrollBar.setScrollPercent(this.scrollPercent), this.adjustOptions();
  }
  get currentScroll() {
    return this._currentScroll;
  }
  addScrollItems(t) {
    t.forEach((i) => {
      i.just_added = !0, i.visible = !0, this.po.addChild(i), i.interactive && (i.hitArea = new PIXI.Rectangle(0, 0, i.width, i.height)), this.options.push(i);
    }), this.recalculateHeight(), this.repositionOptions(), this.adjustVisibility(null, !0), this.redraw();
  }
  addScrollItem(t) {
    this.addScrollItems([t]);
  }
  recalculateHeight() {
    let t = 0;
    this.options.forEach((i) => {
      t += i.height;
    }), this.maxHeight = t;
  }
  spliceScrollItems(t, i, s = !0) {
    i = i >= 0 ? i : this.options.length;
    const n = [];
    for (let r = t; r < i; r++)
      n.push(r);
    this.removeScrollItems(n, s);
  }
  removeScrollItems(t, i = !0) {
    Array.isArray(t) || (t = [t]);
    const s = [];
    return t.forEach((n) => {
      let r;
      isNaN(n) ? r = t : r = this.options[n];
      const h = this.options.find((o) => o === r);
      h && (s.push(this.options.indexOf(h)), h && h.parent === this.po && this.po.removeChild(h), i && h.destroy({ children: !0 }));
    }), s.length ? (this.options = this.options.filter((n, r) => !s.includes(r)), this._currentScroll > this.maxHeight - this.__height && (this.currentScroll = this.maxHeight - this.__height), this.recalculateHeight(), this.repositionOptions(), this.adjustVisibility(null, !0), this.redraw(), !0) : !1;
  }
  findOptionAtPoint(t) {
    for (let i = this.startingVisibleChildIndex; i <= this.endingVisibleChildIndex; i++) {
      const s = this.options[i];
      if (s.visible && this._containsPoint(s, t))
        return s;
    }
    return null;
  }
  recurseChildren(t, i, s) {
    return (t.interactive || t.interactiveChildren) && this._containsPoint(t, i) && (t.interactive && s.push(t), t.interactiveChildren && t.children && t.children.forEach((n) => {
      this.recurseChildren(n, i, s);
    })), s;
  }
}
const x = {
  In: function(e) {
    return 1 - x.Out(1 - e);
  },
  Out: function(e) {
    return e < 1 / 2.75 ? 7.5625 * e * e : e < 2 / 2.75 ? 7.5625 * (e -= 1.5 / 2.75) * e + 0.75 : e < 2.5 / 2.75 ? 7.5625 * (e -= 2.25 / 2.75) * e + 0.9375 : 7.5625 * (e -= 2.625 / 2.75) * e + 0.984375;
  },
  InOut: function(e) {
    return e < 0.5 ? x.In(e * 2) * 0.5 : x.Out(e * 2 - 1) * 0.5 + 0.5;
  }
}, F = {
  linear: {
    In: function(e) {
      return e;
    },
    Out: function(e) {
      return e;
    },
    InOut: function(e) {
      return e;
    }
  },
  quadratic: {
    In: function(e) {
      return e * e;
    },
    Out: function(e) {
      return e * (2 - e);
    },
    InOut: function(e) {
      return (e *= 2) < 1 ? 0.5 * e * e : -0.5 * (--e * (e - 2) - 1);
    }
  },
  cubic: {
    In: function(e) {
      return e * e * e;
    },
    Out: function(e) {
      return --e * e * e + 1;
    },
    InOut: function(e) {
      return (e *= 2) < 1 ? 0.5 * e * e * e : 0.5 * ((e -= 2) * e * e + 2);
    }
  },
  quartic: {
    In: function(e) {
      return e * e * e * e;
    },
    Out: function(e) {
      return 1 - --e * e * e * e;
    },
    InOut: function(e) {
      return (e *= 2) < 1 ? 0.5 * e * e * e * e : -0.5 * ((e -= 2) * e * e * e - 2);
    }
  },
  quintic: {
    In: function(e) {
      return e * e * e * e * e;
    },
    Out: function(e) {
      return --e * e * e * e * e + 1;
    },
    InOut: function(e) {
      return (e *= 2) < 1 ? 0.5 * e * e * e * e * e : 0.5 * ((e -= 2) * e * e * e * e + 2);
    }
  },
  sinusoidal: {
    In: function(e) {
      return 1 - Math.cos(e * Math.PI / 2);
    },
    Out: function(e) {
      return Math.sin(e * Math.PI / 2);
    },
    InOut: function(e) {
      return 0.5 * (1 - Math.cos(Math.PI * e));
    }
  },
  exponential: {
    In: function(e) {
      return e === 0 ? 0 : Math.pow(1024, e - 1);
    },
    Out: function(e) {
      return e === 1 ? 1 : 1 - Math.pow(2, -10 * e);
    },
    InOut: function(e) {
      return e === 0 ? 0 : e === 1 ? 1 : (e *= 2) < 1 ? 0.5 * Math.pow(1024, e - 1) : 0.5 * (-Math.pow(2, -10 * (e - 1)) + 2);
    }
  },
  circular: {
    In: function(e) {
      return 1 - Math.sqrt(1 - e * e);
    },
    Out: function(e) {
      return Math.sqrt(1 - --e * e);
    },
    InOut: function(e) {
      return (e *= 2) < 1 ? -0.5 * (Math.sqrt(1 - e * e) - 1) : 0.5 * (Math.sqrt(1 - (e -= 2) * e) + 1);
    }
  },
  elastic: {
    In: function(e) {
      return e === 0 ? 0 : e === 1 ? 1 : -Math.pow(2, 10 * (e - 1)) * Math.sin((e - 1.1) * 5 * Math.PI);
    },
    Out: function(e) {
      return e === 0 ? 0 : e === 1 ? 1 : Math.pow(2, -10 * e) * Math.sin((e - 0.1) * 5 * Math.PI) + 1;
    },
    InOut: function(e) {
      return e === 0 ? 0 : e === 1 ? 1 : (e *= 2, e < 1 ? -0.5 * Math.pow(2, 10 * (e - 1)) * Math.sin((e - 1.1) * 5 * Math.PI) : 0.5 * Math.pow(2, -10 * (e - 1)) * Math.sin((e - 1.1) * 5 * Math.PI) + 1);
    }
  },
  back: {
    In: function(e) {
      return e * e * ((1.70158 + 1) * e - 1.70158);
    },
    Out: function(e) {
      return --e * e * ((1.70158 + 1) * e + 1.70158) + 1;
    },
    InOut: function(e) {
      const t = 2.5949095;
      return (e *= 2) < 1 ? 0.5 * (e * e * ((t + 1) * e - t)) : 0.5 * ((e -= 2) * e * ((t + 1) * e + t) + 2);
    }
  },
  bounce: x
}, w = {};
Object.keys(F).forEach((e) => {
  const t = F[e], i = t.InOut;
  i.In = t.In, i.Out = t.Out, i.InOut = t.InOut, w[e] = i;
});
function K(e) {
  const t = [/InOut$/, /In$/, /Out$/];
  for (const i of t) {
    const s = i.exec(e);
    if (s)
      return [e.substr(0, s.index), s[0]];
  }
  return [e];
}
function E(e) {
  const t = K(e);
  if (!w[t[0]])
    return w.linear;
  if (t.length === 1)
    return w[t[0]];
  const i = w[t[0]];
  return i[t[1]] || i;
}
class f {
  constructor(t) {
    this.r = 0, this.g = 0, this.b = 0, this.a = 1, t !== void 0 && (typeof t == "string" ? this.parseColorString(t) : typeof t == "number" ? this.parseHex(t) : Array.isArray(t) ? this.setRgb(t) : t instanceof f && (this.r = t.r, this.g = t.g, this.b = t.b, this.a = t.a));
  }
  parseColorString(t) {
    if (t.startsWith("#")) {
      this.parseHexString(t);
      return;
    }
    if (t.startsWith("rgb")) {
      this.parseRgbString(t);
      return;
    }
    this.r = 0, this.g = 0, this.b = 0, this.a = 1;
  }
  parseHexString(t) {
    if (t = t.replace("#", ""), t.length === 3) {
      this.r = parseInt(t[0] + t[0], 16), this.g = parseInt(t[1] + t[1], 16), this.b = parseInt(t[2] + t[2], 16), this.a = 1;
      return;
    }
    if (t.length === 6) {
      this.r = parseInt(t.substring(0, 2), 16), this.g = parseInt(t.substring(2, 4), 16), this.b = parseInt(t.substring(4, 6), 16), this.a = 1;
      return;
    }
    if (t.length === 8) {
      this.r = parseInt(t.substring(0, 2), 16), this.g = parseInt(t.substring(2, 4), 16), this.b = parseInt(t.substring(4, 6), 16), this.a = parseInt(t.substring(6, 8), 16) / 255;
      return;
    }
  }
  parseHex(t) {
    this.r = t >> 16 & 255, this.g = t >> 8 & 255, this.b = t & 255, this.a = 1;
  }
  parseRgbString(t) {
    const i = t.match(/\d+(\.\d+)?/g);
    i && i.length >= 3 ? (this.r = parseInt(i[0], 10), this.g = parseInt(i[1], 10), this.b = parseInt(i[2], 10), this.a = i.length >= 4 ? parseFloat(i[3]) : 1) : (this.r = 0, this.g = 0, this.b = 0, this.a = 1);
  }
  rgb() {
    return this;
  }
  array() {
    return [this.r, this.g, this.b];
  }
  hex() {
    const t = this.padZero(this.r.toString(16)), i = this.padZero(this.g.toString(16)), s = this.padZero(this.b.toString(16));
    return `#${t}${i}${s}`;
  }
  padZero(t) {
    return t.length === 1 ? "0" + t : t;
  }
  toString() {
    return this.a < 1 ? `rgba(${Math.round(this.r)}, ${Math.round(this.g)}, ${Math.round(this.b)}, ${this.a})` : `rgb(${Math.round(this.r)}, ${Math.round(this.g)}, ${Math.round(this.b)})`;
  }
  setRgb(t) {
    return t.length >= 3 && (this.r = t[0], this.g = t[1], this.b = t[2], t.length >= 4 && (this.a = t[3])), this;
  }
  // Static helper methods
  static rgb(t) {
    return new f(t);
  }
}
class Y {
  constructor(t, i) {
    this.startColors = t.map((s) => new f(s)), this.endColors = i.map((s) => new f(s)), this.params = {
      updater: () => {
      },
      ender: () => {
      },
      length: 1e3,
      easing: E("linear")
    };
  }
  onUpdate(t) {
    return this.params.updater = t, this;
  }
  onEnd(t) {
    return this.params.ender = t, this;
  }
  duration(t) {
    return this.params.length = t, this;
  }
  easing(t) {
    return this.params.easing = E(t), this;
  }
  start(t) {
    return this.params.startTime = Date.now(), typeof t == "function" && setTimeout(t), this;
  }
  update() {
    if (this.params.startTime) {
      const t = this.renderFrame();
      return t.progress >= 1 ? (this.done(), !1) : (this.params.updater(t.frame, t.progress), !0);
    }
    return !1;
  }
  renderFrame() {
    const i = (Date.now() - (this.params.startTime || 0)) / this.params.length, s = this.endColors.map((n, r) => {
      const o = this.startColors[r].array(), c = n.array().map((a, d) => {
        const g = o[d] + (a - o[d]) * this.params.easing(i);
        return Math.round(g);
      });
      return new f(c);
    });
    return {
      frame: s.length === 1 ? s[0] : s,
      progress: i
    };
  }
  done() {
    const t = this.endColors.length === 1 ? this.endColors[0] : this.endColors;
    return this.params.updater(t, 1), this.stop(), this;
  }
  stop() {
    const t = this.endColors.length === 1 ? this.endColors[0] : this.endColors;
    return this.params.startTime = void 0, this.params.ender(t), this;
  }
}
const st = "__pixi-dom-dynamic-texture-atlas";
var z = /* @__PURE__ */ ((e) => (e.flexStart = "flex-start", e.flexEnd = "flex-end", e.center = "center", e.spaceBetween = "spaceBetween", e.spaceAround = "spaceAround", e.spaceEvenly = "spaceEvenly", e))(z || {}), $ = /* @__PURE__ */ ((e) => (e.row = "row", e.row_reverse = "row-reverse", e.column = "column", e.column_reverse = "column-reverse", e))($ || {}), q = /* @__PURE__ */ ((e) => (e.nowrap = "nowrap", e.wrap = "wrap", e.wrap_reverse = "wrap-reverse", e))(q || {}), Q = /* @__PURE__ */ ((e) => (e.LINEAR = "linear", e.QUADRATIC = "quadtratic", e.CUBIC = "cubic", e.QUARTIC = "quartic", e.QUINTIC = "quintic", e.SINUSOIDAL = "sinusoidal", e.EXPONENTIAL = "exponential", e.CIRCULAR = "circular", e.ELASTIC = "elastic", e.BACK = "back", e))(Q || {}), m = /* @__PURE__ */ ((e) => (e.background = "background", e.circle_color = "circle_color", e.circle_position = "circle_position", e.label = "label", e))(m || {});
const R = 2;
class Z extends PIXI.Container {
  constructor(t, i) {
    super(), this._toggled = !0, this.usingLabels = !1, this.backgroundColorsArrayIndex = null, this.circleColorsArrayIndex = null, this.toggleCircleTravelDistance = 0, this.circlePadding = R, this.circlePadding = t.circlePadding ?? R, this.options = t, this.backgroundGraphic = new PIXI.Graphics();
    const s = t.borderRadius ? t.borderRadius : 50;
    if (t.borderRadius = s, this.computedBorderRadius = t.borderRadius / 100 * t.height, this.backgroundGraphic.drawRoundedRect(0, 0, t.width, t.height, this.computedBorderRadius), this.addChild(this.backgroundGraphic), t.labelOptions) {
      const { fontName: n, onLabel: r, offLabel: h, onColor: o, offColor: l } = t.labelOptions;
      this.onText = new PIXI.extras.BitmapText(r, { font: n, align: "left" }), this.offText = new PIXI.extras.BitmapText(h, { font: n, align: "left" }), this.addChild(this.onText), this.addChild(this.offText), this.onText.visible = !1, this.offText.visible = !1;
      const c = t.width / 2 - this.offText.width;
      if (c < 0)
        throw new Error("Label for off text was too long");
      this.offText.x = t.width / 2 + c / 2 - this.circlePadding, this.offText.tint = l;
      const a = t.height - this.offText.height;
      if (a < 0)
        throw new Error("Label font is too large to fit within height of toggle, either increase height or use smaller font");
      this.offText.y = a / 2;
      const d = t.width / 2 - this.onText.width;
      if (d < 0)
        throw new Error("Label for on text was too long");
      if (this.onText.x = this.circlePadding + d / 2, this.onText.tint = o, t.height - this.onText.height < 0)
        throw new Error("Label font is too large to fit within height of toggle, either increase height or use smaller font");
      this.onText.y = a / 2, this.usingLabels = !0;
    }
    this.circleRadius = this.options.height / 2 - this.circlePadding, this.circleGraphic = new PIXI.Graphics(), this.circleGraphic.drawCircle(0, 0, this.circleRadius), this.circleGraphic.y = this.circlePadding, this.addChild(this.circleGraphic), this.toggleCircleTravelDistance = Math.abs(this.circlePadding - (this.options.width - this.circleGraphic.width - this.circlePadding)), this.interactive = !0, this.buttonMode = !0, this.on("pointerdown", () => {
      this.toggled = !this.toggled;
    }), this.updateToggle = this.staticToggleUpdate.bind(this), this.toggled = !!i, this.updateToggle = t.animationOptions ? this.animatedToggleUpdate.bind(this) : this.staticToggleUpdate.bind(this);
  }
  get activeBackgroundColor() {
    return this.toggled ? this.options.onBackgroundColor : this.options.offBackgroundColor;
  }
  get inactiveBackgroundColor() {
    return this.toggled ? this.options.offBackgroundColor : this.options.onBackgroundColor;
  }
  get activeCircleColor() {
    return this.toggled ? this.options.onCircleColor : this.options.offCircleColor;
  }
  get inactiveCircleColor() {
    return this.toggled ? this.options.offCircleColor : this.options.onCircleColor;
  }
  get activeTextLabel() {
    return this.toggled ? this.onText : this.offText;
  }
  get inactiveTextLabel() {
    return this.toggled ? this.offText : this.onText;
  }
  get travelToX() {
    return this.toggled ? this.circlePadding : this.options.width - this.circleGraphic.width - this.circlePadding;
  }
  set toggled(t) {
    this.emit("toggle-change", t), this._toggled = t, this.updateToggle();
  }
  get toggled() {
    return this._toggled;
  }
  onToggle(t) {
    this.on("toggle-change", t);
  }
  animateToggle(t) {
    this.tween.update() && requestAnimationFrame(this.animateToggle.bind(this));
  }
  midAnimationToggleUpdate(t, i) {
    const s = this.toggleCircleTravelDistance * i, { exclude: n } = this.options.animationOptions;
    if (this.usingLabels && (!n || !n.includes(m.label)) && (this.activeTextLabel.visible = !0, this.inactiveTextLabel.visible = !0, this.inactiveTextLabel.alpha = 1 - i, this.activeTextLabel.alpha = i), this.backgroundColorsArrayIndex !== null) {
      if (this.backgroundGraphic.clear(), this.options.hasOwnProperty("backgroundOutline")) {
        const { width: r, color: h } = this.options.backgroundOutline;
        this.backgroundGraphic.lineStyle(r, h);
      }
      this.backgroundGraphic.beginFill(S(t[this.backgroundColorsArrayIndex].hex())), this.backgroundGraphic.drawRoundedRect(0, 0, this.options.width, this.options.height, this.computedBorderRadius), this.backgroundGraphic.endFill();
    }
    (!n || !n.includes(m.circle_position)) && (this.toggled ? this.circleGraphic.x = this.travelToX + s : this.circleGraphic.x = this.travelToX - s), this.circleColorsArrayIndex !== null && (this.circleGraphic.clear(), this.circleGraphic.beginFill(S(t[this.circleColorsArrayIndex].hex())), this.circleGraphic.drawCircle(this.circleRadius, this.circleRadius, this.circleRadius), this.circleGraphic.endFill());
  }
  animatedToggleUpdate() {
    const t = [], i = [], { exclude: s } = this.options.animationOptions;
    (!s || !s.includes(m.background)) && (t.push(PIXI.utils.hex2string(this.activeBackgroundColor)), i.push(PIXI.utils.hex2string(this.inactiveBackgroundColor)), this.backgroundColorsArrayIndex = 0), (!s || !s.includes(m.circle_color)) && (t.push(PIXI.utils.hex2string(this.activeCircleColor)), i.push(PIXI.utils.hex2string(this.inactiveCircleColor)), this.circleColorsArrayIndex = t.length - 1), this.tween = new Y(i, t).duration(this.options.animationOptions.duration).easing(this.options.animationOptions.type).onUpdate(this.midAnimationToggleUpdate.bind(this)).onEnd(this.staticToggleUpdate.bind(this)).start(this.animateToggle.bind(this));
  }
  staticToggleUpdate() {
    if (this.backgroundGraphic.clear(), this.options.hasOwnProperty("backgroundOutline")) {
      const { width: n, color: r } = this.options.backgroundOutline;
      this.backgroundGraphic.lineStyle(n, r);
    }
    let t, i, s;
    this._toggled ? (s = this.options.onBackgroundColor, t = this.options.width - this.circleGraphic.width - this.circlePadding, i = this.options.onCircleColor, this._showOnText()) : (s = this.options.offBackgroundColor, t = 0 + this.circlePadding, i = this.options.offCircleColor, this._showOffText()), this.backgroundGraphic.beginFill(s), this.backgroundGraphic.drawRoundedRect(0, 0, this.options.width, this.options.height, this.computedBorderRadius), this.backgroundGraphic.endFill(), this.circleGraphic.clear(), this.circleGraphic.beginFill(i), this.circleGraphic.drawCircle(this.circleRadius, this.circleRadius, this.circleRadius), this.circleGraphic.endFill(), this.circleGraphic.x = t;
  }
  _showOnText() {
    this.usingLabels && (this.onText.visible = !0, this.offText.visible = !1);
  }
  _showOffText() {
    this.usingLabels && (this.onText.visible = !1, this.offText.visible = !0);
  }
}
class J extends p {
  constructor(t, i) {
    super(), this.styleOptions = { defaultStyle: {}, font: "", useBitmapText: !0 }, this._btnState = 0, this._text = t, this.interactive = !0, this.buttonMode = !0, this.on(
      "pointerdown",
      () => this.btnState = 2
      /* PRESSED */
    ), this.on(
      "pointerup",
      () => this.btnState = 0
      /* NONE */
    ), this.on(
      "pointerupoutside",
      () => this.btnState = 0
      /* NONE */
    ), this.on(
      "pointerover",
      () => this.btnState = 1
      /* HOVER */
    ), this.on(
      "pointerout",
      () => this.btnState = 0
      /* NONE */
    ), this.updateStyle(i);
  }
  set btnState(t) {
    t !== this._btnState && (this._btnState = t, this.redraw());
  }
  set text(t) {
    this._text = t, this.redrawText();
  }
  updateStyle(t) {
    Object.keys(t).forEach((i) => {
      this.styleOptions[i] = t[i];
    }), this.styleOptions.useBitmapText = this.styleOptions.useBitmapText ?? !1, this.redraw();
  }
  redraw() {
    this.clear(), this.redrawBg(), this.redrawText();
  }
  redrawText() {
    let t;
    this.styleOptions.useBitmapText ? (this.bitmapTxtSprite || (this.bitmapTxtSprite = new PIXI.extras.BitmapText("", { font: this.styleOptions.font, align: "center" })), this.txtSprite && (this.txtSprite.destroy(), this.txtSprite = null), this.bitmapTxtSprite.maxWidth = this.width, t = this.bitmapTxtSprite) : (this.txtSprite || (this.txtSprite = new PIXI.Text("", { fontFamily: this.styleOptions.font, align: "center" })), this.styleOptions.fontSize && (this.txtSprite.style.fontSize = this.styleOptions.fontSize), this.bitmapTxtSprite && (this.bitmapTxtSprite.destroy({ children: !0 }), this.bitmapTxtSprite = null), t = this.txtSprite), (this.currentStyleState.textColor || this.currentStyleState.textColor == 0) && (this.styleOptions.useBitmapText ? this.bitmapTxtSprite.tint = this.currentStyleState.textColor : this.txtSprite.style.fill = this.currentStyleState.textColor), t.parent || this.addChild(t), t.text = this._text, t.x = this.currentStyleState.width / 2 - t.width / 2, t.y = this.currentStyleState.height / 2 - t.height / 2;
  }
  get textSpriteUtilized() {
    return this.styleOptions.useBitmapText ? this.bitmapTxtSprite : this.txtSprite;
  }
  redrawBg() {
    let { backgroundColor: t, borderRadius: i, borderColor: s, borderWidth: n, width: r, height: h, backgroundTexture: o, backgroundOpacity: l, borderOpacity: c } = this.currentStyleState;
    if (t || t == 0) {
      if (this.bgGraphic ? this.bgGraphic.clear() : this.bgGraphic = new PIXI.Graphics(), this.bgGraphic.parent || this.addChild(this.bgGraphic), l = l || l == 0 ? l : 1, this.bgGraphic.beginFill(t, l), n && (c = c || c == 0 ? c : 1, this.bgGraphic.lineStyle(n, s, c)), i) {
        const a = i / 100 * h;
        this.bgGraphic.drawRoundedRect(0, 0, r, h, a);
      } else
        this.bgGraphic.drawRect(0, 0, r, h);
      this.bgGraphic.endFill();
    }
    o && (this.bgSprite || (this.bgSprite = new PIXI.Sprite()), this.bgSprite.parent || this.addChild(this.bgGraphic), this.bgSprite.texture = o, this.bgSprite.x = r / 2 - this.bgSprite.x / 2, this.bgSprite.y = h / 2 - this.bgSprite.y / 2), this.hitArea = new PIXI.Rectangle(0, 0, r, h);
  }
  clear() {
    this.textSpriteUtilized && (this.removeChild(this.textSpriteUtilized), this.textSpriteUtilized.destroy({ children: !0 }), this.bitmapTxtSprite = null, this.txtSprite = null), this.bgGraphic && (this.removeChild(this.bgGraphic), this.bgGraphic.destroy(), this.bgGraphic = null), this.bgSprite && (this.removeChild(this.bgSprite), this.bgSprite.destroy(), this.bgSprite = null);
  }
  get currentStyleState() {
    switch (this._btnState) {
      case 0:
        return this.styleOptions.defaultStyle;
      case 1:
        return this.styleOptions.hoverStyle ? this.styleOptions.hoverStyle : this.styleOptions.defaultStyle;
      case 2:
        return this.styleOptions.pressedStyle ? this.styleOptions.pressedStyle : this.styleOptions.hoverStyle ? this.styleOptions.hoverStyle : this.styleOptions.defaultStyle;
    }
  }
}
class tt extends PIXI.Container {
  constructor(t) {
    super(), this.isDragging = !1, this.isHovered = !1, this.curOutlineWidth = 0, this.lastX = 0, this.resolvedScale = null, this.options = t, this.currentValue = this.options.startingValue, this.backgroundGraphic = new PIXI.Graphics(), super.addChild(this.backgroundGraphic), this.circleRadius = this.options.circleRadius, this.circleGraphic = new PIXI.Graphics(), this.circleGraphic.drawCircle(0, this.circleRadius, this.circleRadius), this.circleGraphic.y = 0, this.circleGraphic.buttonMode = !0, super.addChild(this.circleGraphic), this.circleGraphic.interactive = !0;
    const i = (this.currentValue - this.options.minValue) / (this.options.maxValue - this.options.minValue);
    this.circleGraphic.x = i * this.options.width, this.redrawCircle(), this.redrawBar(), this.circleGraphic.on("pointerover", (s) => {
      this.isHovered = !0, this.redrawCircle();
    }), this.circleGraphic.on("pointerout", () => {
      this.isHovered && (this.isHovered = !1, this.isDragging || this.redrawCircle());
    }), this.circleGraphic.on("pointerdown", (s) => {
      this.resolvedScale = null, this.resolveScale(), this.isDragging = !0, this.lastX = s.data.global.x, this.redrawCircle();
    }), this.circleGraphic.on("pointercancel", () => {
      this.isDragging && (this.resolvedScale = null, this.isDragging = !1, this.redrawCircle());
    }), this.circleGraphic.on("pointerup", () => {
      this.isDragging && (this.resolvedScale = null, this.isDragging = !1, this.redrawCircle());
    }), this.circleGraphic.on("pointerupoutside", () => {
      this.isDragging && (this.resolvedScale = null, this.isDragging = !1, this.redrawCircle());
    }), this.circleGraphic.on("pointermove", (s) => {
      if (!this.isDragging) return;
      let n = s.data.global.x - this.lastX;
      const r = this.options.preventScaleAdjustment ? 1 : this.resolveScale().x;
      if (n *= r, n < 0 && s.data.global.x * r < this.x && this.circleGraphic.x === 0 || n > 0 && s.data.global.x * r > this.options.width && this.circleGraphic.x === this.options.width) return;
      this.lastX = s.data.global.x;
      const h = this.circleGraphic.x;
      this.circleGraphic.x += n, this.circleGraphic.x = Math.max(0, Math.min(this.circleGraphic.x, this.options.width)), this.circleGraphic.x - h && (this.currentValue = this.calculateValue(), this.redrawBar(), super.emit("slider-change", this.currentValue));
    });
  }
  resolveScale() {
    if (this.resolvedScale) return this.resolvedScale;
    let t = 1 / this.scale.x, i = 1 / this.scale.y, s = this.parent;
    for (; s; )
      t /= s.scale.x, i /= s.scale.y, s = s.parent;
    return this.resolvedScale = { x: t, y: i };
  }
  calculateValue() {
    const { maxValue: t, minValue: i, width: s } = this.options, n = this.circleGraphic.x / s;
    return it(i, t, n);
  }
  redrawCircle() {
    var o, l, c, a, d, g, y, D, _, O, T, H;
    this.circleGraphic.clear();
    let t = this.options.circleOpacity || 1;
    this.isDragging && ((o = this.options.down) != null && o.circleOpacity) ? t = this.options.down.circleOpacity : this.isHovered && ((l = this.options.hover) != null && l.circleOpacity) && (t = this.options.hover.circleOpacity);
    let i = this.options.circleRadius;
    this.isDragging && ((c = this.options.down) != null && c.circleRadius) ? i = this.options.down.circleRadius : this.isHovered && ((a = this.options.hover) != null && a.circleRadius) && (i = this.options.hover.circleRadius);
    let s = this.options.circleColor;
    this.isDragging && ((d = this.options.down) != null && d.circleColor) ? s = this.options.down.circleColor : this.isHovered && ((g = this.options.hover) != null && g.circleColor) && (s = this.options.hover.circleColor);
    let n = 0;
    this.isDragging && ((y = this.options.down) != null && y.circleOutlineWidth) ? n = this.options.down.circleOutlineWidth : this.isHovered && ((D = this.options.hover) != null && D.circleOutlineWidth) ? n = this.options.hover.circleOutlineWidth : this.options.circleOutlineWidth && (n = this.options.circleOutlineWidth);
    let r = this.options.circleOutlineColor || 0;
    this.isDragging && ((_ = this.options.down) != null && _.circleOutlineColor) ? r = this.options.down.circleOutlineColor : this.isHovered && ((O = this.options.hover) != null && O.circleOutlineColor) && (r = this.options.hover.circleOutlineColor);
    let h = this.options.circleOutlineOpacity || 1;
    this.isDragging && ((T = this.options.down) != null && T.circleOutlineOpacity) ? h = this.options.down.circleOutlineOpacity : this.isHovered && ((H = this.options.hover) != null && H.circleOutlineOpacity) && (h = this.options.hover.circleOutlineOpacity), this.circleGraphic.lineStyle(n, r, h), this.circleGraphic.beginFill(s, t), this.circleGraphic.drawCircle(0, i, i), this.circleGraphic.endFill(), v(this.circleGraphic, { axis: "y", parent: { height: this.options.height } });
  }
  redrawBar() {
    const t = this.circleGraphic.x, i = this.options.width - t;
    this.backgroundGraphic.clear();
    const s = this.options.opacity || 1;
    this.backgroundGraphic.beginFill(this.options.activeColor, s), this.backgroundGraphic.drawRect(0, 0, t, this.options.height), this.backgroundGraphic.endFill(), this.backgroundGraphic.beginFill(this.options.inactiveColor, s), this.backgroundGraphic.drawRect(t, 0, i, this.options.height), this.backgroundGraphic.endFill();
  }
  offChange(t) {
    super.off("slider-change", t);
  }
  onChange(t) {
    super.on("slider-change", t);
  }
}
function it(e, t, i) {
  return (1 - i) * e + i * t;
}
const rt = {
  centerPixiObject: v,
  string2hex: S
};
PIXI !== void 0 && (PIXI.Slider = PIXI.Slider || tt, PIXI.Toggle = PIXI.Toggle || Z, PIXI.TextField = PIXI.TextField || A, PIXI.Element = PIXI.Element || p, PIXI.ScrollBar = PIXI.ScrollBar || G, PIXI.ScrollList = PIXI.ScrollList || U, PIXI.Button = PIXI.Button || J, PIXI.utils && !PIXI.utils.string2hex && (PIXI.utils.string2hex = S), PIXI.utils.centerObject = v);
export {
  Q as AnimationType,
  J as Button,
  $ as FlexDirection,
  q as FlexWrap,
  st as GLOBAL_PIXI_DTA_PROPERTY_KEY,
  z as JustifyContent,
  p as PixiElement,
  G as ScrollBar,
  U as ScrollList,
  tt as Slider,
  A as TextField,
  Z as Toggle,
  m as ToggleAnimationExclusions,
  rt as utils
};
//# sourceMappingURL=pixidom.es.js.map

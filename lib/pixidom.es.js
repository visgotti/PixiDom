Number.isNaN = Number.isNaN || function(w) {
  return typeof w == "number" && isNaN(w);
};
const k = function(w) {
  let t;
  if (!isNaN(w) && w != null)
    return {
      valid: !0,
      type: "pixel",
      value: w
    };
  try {
    const e = w.toString().slice(-2);
    if (e.charAt(1) === "%") {
      if (t = parseInt(w.slice(0, -1)), Number.isNaN(t))
        throw new Error("Did not find a number in front of % sign");
      return {
        valid: !0,
        value: t,
        type: "percent"
      };
    } else if (e === "px") {
      if (t = parseInt(w.slice(0, -2)), Number.isNaN(t))
        throw new Error("Did not find a number in front of px");
      if (t < 0)
        throw new Error("Can not have negative pixel length value");
      return {
        valid: !0,
        value: t,
        type: "pixel"
      };
    } else
      throw new Error("Length values must either be in % or px");
  } catch (e) {
    return { valid: !1, error: e.message };
  }
};
function R(w, t, e) {
  return w <= t ? t : w >= e ? e : w;
}
function F(w) {
  return typeof w == "string" && w[0] === "#" && (w = w.substr(1)), parseInt(w, 16);
}
function G(w, t) {
  if (!w.parent && !(t != null && t.parent)) throw new Error("No parent");
  const e = (t == null ? void 0 : t.parent) || w.parent, a = () => w.x = e.width / 2 - w.width / 2, i = () => w.y = e.height / 2 - w.height / 2;
  t != null && t.axis ? t.axis === "x" ? a() : t.axis === "y" && i() : (a(), i());
}
function W(w) {
  return class extends w {
    constructor(...e) {
      super(...e), this.copiedText = "", this.textStates = [], this.currentStateIndex = -1, this.registerHandlers = this.registerHandlers.bind(this), this.unregisterHandlers = this.unregisterHandlers.bind(this), this.onCopy = this.onCopy.bind(this), this.onPaste = this.onPaste.bind(this), this.onCut = this.onCut.bind(this), this.onKeyPress = this.onKeyPress.bind(this), this.onKeyDown = this.onKeyDown.bind(this), super.on("focus", this.registerHandlers), super.on("blur", this.unregisterHandlers);
    }
    changeStateIndex(e) {
      const a = this.currentStateIndex = e;
      this.textStates[a] && (super.change(this.textStates[a]), this.currentStateIndex = e);
    }
    registerHandlers() {
      document.addEventListener("copy", this.onCopy), document.addEventListener("cut", this.onCut), document.addEventListener("paste", this.onPaste), document.addEventListener("keypress", this.onKeyPress), document.addEventListener("keydown", this.onKeyDown);
    }
    unregisterHandlers() {
      document.removeEventListener("copy", this.onCopy), document.removeEventListener("cut", this.onCut), document.removeEventListener("paste", this.onPaste), document.removeEventListener("keypress", this.onKeyPress), document.removeEventListener("keydown", this.onKeyDown);
    }
    onPaste(e) {
      const a = e.clipboardData ? e.clipboardData.getData("text/plain") : this.copiedText, i = super.replaceSelectedWith(a);
      i !== null && this.addState(i);
    }
    onCopy(e) {
      e.preventDefault();
      const a = super.getSelectedChars();
      e.clipboardData && e.clipboardData.setData("text/plain", a), this.copiedText = a;
    }
    onCut(e) {
      e.preventDefault();
      const a = super.getSelectedChars();
      e.clipboardData && e.clipboardData.setData("text/plain", a), this.copiedText = a;
      const i = super.replaceSelectedWith("");
      i !== null && this.addState(i);
    }
    onBackspace() {
    }
    onDelete() {
    }
    onKeyDown(e) {
      const a = e.keyCode ? e.keyCode : e.code;
      if (this.submitKeyCodes.includes(a))
        super.submit();
      else if (a == 37)
        super.moveCursor(-1);
      else if (a == 39)
        super.moveCursor(1);
      else if (a == 8)
        super.getSelectedRange() ? super.replaceSelectedWith("") : super.removeLeftOfCursor();
      else if (a == 46)
        super.getSelectedRange() ? super.replaceSelectedWith("") : super.removeRightOfCursor();
      else if (e.ctrlKey)
        if (a == 90) {
          const i = e.shiftKey ? 1 : -1;
          this.changeStateIndex(i);
        } else a == 65 && (e.preventDefault(), super.selectAll());
    }
    onKeyPress(e) {
      const a = e.keyCode ? e.keyCode : e.which;
      if (this.submitKeyCodes.includes(a) || this.ignoreKeys.includes(a))
        return;
      const i = String.fromCharCode(a);
      i && (e.ctrlKey || (e.preventDefault(), super.replaceSelectedWith(i)));
    }
    addState(e) {
      this.textStates.push(e), this.currentStateIndex = this.textStates.length - 1;
    }
  };
}
const j = function() {
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
}, q = ["width", "height", "cursorHeight"];
class Y extends PIXI.Container {
  constructor(t, e, a, i) {
    super(), this.styleOptions = {}, this.cursorSprite = new PIXI.Graphics(), this.textbox = new PIXI.Graphics(), this.textboxMask = new PIXI.Graphics(), this.inFocus = !1, this.cursorIndex = -1, this.lastCursorTs = Date.now(), this.accCursorTime = 0, this.toggleCursorTime = 500, this.cursorIsVisible = !0, this._text = "", this._visible = !0, this.overflowOffsetX = 0, this.overflowOffsetY = 0, this.dragIndexStart = 0, this.dragIndexEnd = 0, this.inDrag = !1, this.submitKeyCodes = [13], this.ignoreKeys = [], this._maxCharacterLength = null, this.onFocusHandler = () => {
    }, this.onBlurHandler = () => {
    }, this.onChangeHandler = () => {
    }, this.onSubmitHandler = () => {
    }, this.onCharLimitHandler = () => {
    }, this.checkForOutsideClick = this.checkForOutsideClick.bind(this);
    const r = this.destroy.bind(this);
    this.destroy = (b) => {
      this.blur(), r(b);
    }, i && (this.ignoreKeys = i);
    const f = { ...j() };
    if (e)
      for (let b in e)
        f[b] = e[b];
    this.maxCharacterLength = a, this.buttonMode = !0, this.interactive = !0, this.textSprite = new PIXI.extras.BitmapText("", { font: t, align: "left" }), this.cursor = "text", this.on("pointerdown", this.handleMouseDown.bind(this)), this.on("pointerup", this.handleMouseUp.bind(this)), this.on("pointermove", this.handleMouseMove.bind(this)), this.on("pointerupoutside", this.handleMouseUp.bind(this)), this.addChild(this.textboxMask), this.addChild(this.textbox), this.addChild(this.textSprite), this.addChild(this.cursorSprite), this.textSprite.mask = this.textboxMask, this.updateStyle(f), this.show();
  }
  updateStyle(t) {
    for (const e in t)
      if (q.includes(e)) {
        const a = k(t[e]);
        if (a.error)
          throw new Error(`Error for passed in style: ${e}, ${a.error}`);
        this.styleOptions[e] = a;
      } else
        this.styleOptions[e] = t[e];
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
    const { value: e, type: a } = this.styleOptions.cursorHeight, i = a === "pixel" ? e : Math.round(this.textbox.height * (e / 100)), r = Math.min(this.textbox.height, i), b = (Math.max(this.textbox.height, i) - r) / 2, p = Math.floor(b), x = Math.ceil(b);
    this.cursorSprite.moveTo(t, p).lineTo(t, i - x), this.getSelectedRange() ? (this.cursorIsVisible = !1, this.cursorSprite.visible = !1) : (this.cursorIsVisible = !0, this.cursorSprite.visible = !0);
  }
  redrawText() {
    const t = this.getSelectedRange();
    this.textSprite.y = this.styleOptions.yPadding, this.textSprite.x = this.styleOptions.xPadding;
    const e = this.getCursorXFromIndex(this.dragIndexEnd), { value: a, type: i } = this.styleOptions.width, r = window.innerWidth, f = i === "pixel" ? a : r * (a / 100);
    e > f + this.overflowOffsetX ? (this.overflowOffsetX = e - f, this.textSprite.x -= this.overflowOffsetX) : e > f ? e < f + this.overflowOffsetX ? (e < this.overflowOffsetX && (this.overflowOffsetX -= this.overflowOffsetX - e), this.textSprite.x -= this.overflowOffsetX) : this.textSprite.x -= this.overflowOffsetX : this.overflowOffsetX = 0;
    for (let b = 0; b < this.textSprite.children.length; b++) {
      const p = this.textSprite.children[b];
      if (t) {
        const { indexes: x } = t, { start: y, end: m } = x;
        if (b >= y && b < m) {
          p.tint = this.styleOptions.highlightedFontColor;
          continue;
        }
      }
      "fontColor" in this.styleOptions ? p.tint = this.styleOptions.fontColor : p.tint = 16777215;
    }
  }
  redrawTextbox() {
    this.textbox.clear(), this.textbox.beginFill(this.styleOptions.backgroundColor, 1), this.styleOptions.borderWidth > 0 && !Number.isNaN(this.styleOptions.borderWidth) && this.textbox.lineStyle(this.styleOptions.borderWidth, this.styleOptions.borderColor, this.styleOptions.borderOpacity);
    let { value: t, type: e } = this.styleOptions.height;
    const a = window.innerWidth, i = window.innerHeight, r = e === "pixel" ? t : i * (t / 100);
    ({ value: t, type: e } = this.styleOptions.width);
    const f = e === "pixel" ? t : a * (t / 100), b = this.getSelectedRange();
    if (this.textbox.drawRect(0, 0, f, r), this.textbox.endFill(), b) {
      let p = b.x.start - this.overflowOffsetX;
      const x = b.x.end - this.overflowOffsetX;
      this.textbox.beginFill(this.styleOptions.highlightedBackgroundColor, 1);
      let y = x - p;
      p + y >= f ? y = f - p : y = x - p, p + y === f && y > f && (p = 0, y = f), this.textbox.drawRect(p, 0, y, r), this.textbox.endFill();
    }
    this.textboxMask.clear(), this.textboxMask.drawRect(0, 0, f, r);
  }
  handleMouseUp(t) {
    const { x: e } = t.data.getLocalPosition(this);
    this.inDrag && (this.cursorIndex = this.getCursorIndexFromX(e), this.handleRangeFinish());
  }
  handleMouseDown(t) {
    this.clickedTimestamp = t.data.originalEvent.timeStamp;
    const { x: e } = t.data.getLocalPosition(this);
    this.inFocus || this.focus(), this.clearRange(), this.cursorIndex = this.getCursorIndexFromX(e), this.handleRangeStart(this.cursorIndex), this.redraw();
  }
  handleMouseMove(t) {
    if (this.inDrag) {
      const { x: e } = t.data.getLocalPosition(this);
      this.handleRangeChange(this.getCursorIndexFromX(e));
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
    let e;
    return !this.textSprite.children || !this.textSprite.children.length || t <= 0 ? this.styleOptions.xPadding ? this.styleOptions.xPadding : 0 : (t >= this.textSprite.children.length ? e = this.textSprite.children[this.textSprite.children.length - 1] : e = this.textSprite.children[t - 1], e.x + e.width + 1 + this.styleOptions.xPadding);
  }
  moveCursor(t) {
    const e = this.cursorIndex + t;
    e > -1 && e <= this.text.length && (this.cursorIndex = e, this.clearRange(), this.redraw());
  }
  getCursorIndexFromX(t) {
    if (t += this.overflowOffsetX, t <= 0)
      return 0;
    for (let e = 0; e < this.textSprite.children.length; e++) {
      const a = this.textSprite.children[e];
      if (a.x + a.width > t)
        return a.x + a.width / 2 < t ? e + 1 : e;
    }
    return this.textSprite.children.length;
  }
  getSelectedChars() {
    const t = this.getSelectedRange();
    if (!t) return "";
    const { indexes: e } = t, { start: a, end: i } = e;
    return this.text.substr(a, i - a);
  }
  replaceSelectedWith(t) {
    const e = t.split(""), a = e.length;
    this.text;
    const i = this.text.split("");
    let r, f;
    const b = this.getSelectedRangeIndexes();
    b ? { start: r, end: f } = b : r = f = this.cursorIndex;
    const p = f - r;
    return i.splice(r, p, ...e), this.change(i.join("")) ? (this.cursorIndex = r + a, this.clearRange(), this.redraw(), this.text) : this.text;
  }
  getSelectedRangeIndexes() {
    const t = this.getSelectedRange();
    return t ? { start: t.indexes.start, end: t.indexes.end } : null;
  }
  getSelectedRange() {
    const t = Math.min(this.dragIndexStart, this.dragIndexEnd), e = Math.max(this.dragIndexStart, this.dragIndexEnd);
    if (t === e) return null;
    const a = this.getCursorXFromIndex(t), i = this.getCursorXFromIndex(e);
    return {
      indexes: { start: t, end: e },
      x: { start: a, end: i }
    };
  }
  selectAll() {
    this.setSelectedRange(0, this.text.length);
  }
  setSelectedRange(t, e) {
    this.dragIndexStart = t, this.dragIndexEnd = e, this.cursorIndex = e, this.redraw();
  }
  charFromPosition(t) {
    return { left: null, right: null };
  }
  removeLeftOfCursor() {
    if (this.cursorIndex > 0) {
      const t = this.text.split("");
      t.splice(this.cursorIndex - 1, 1), this.cursorIndex--, this.change(t.join("")), this.redraw();
    }
  }
  removeRightOfCursor() {
    const t = this.text.split("");
    t.length && this.cursorIndex < t.length && (t.splice(this.cursorIndex, 1), this.change(t.join("")), this.redraw());
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
  change(t) {
    return t !== this.text ? this._maxCharacterLength !== null && t.length > this._maxCharacterLength ? (this.onCharLimitHandler(t), !1) : (this._text = t, this.textSprite.text = t, this._text === "" && this.textSprite.children && this.textSprite.children.forEach((e) => {
      this.textSprite.removeChild(e);
    }), this.textSprite.updateTransform(), this.emit("change", t), this.onChangeHandler(t), !0) : !1;
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
const K = W(Y);
class T extends PIXI.Container {
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
  _setHeldDownHandler(t, e) {
    this.helddownCountHandlers[e] && console.warn("already had held down timeout for duration at", e, "this will override it."), this.helddownCountHandlers[e] = t;
  }
  _setEventNameHandler(t, e) {
    this[`_${t}Handler`] || this.on(t, this[`__${t}`]), this[`_${t}Handler`] = e, this.buttonMode || (this.buttonMode = !0, this.interactive = !0);
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
    this.elements = this.elements.filter((e) => e !== t);
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
  onHeldDown(t, e) {
    !this._pointerdownHandler && this.onMouseDown(() => {
    }), this._setHeldDownHandler(t, e);
  }
  /**
   *
   * @param handler
   * @param hold - time in milliseconds needed to be held before triggering drag
   */
  onDragStart(t, e) {
    (e || e == 0 && !isNaN(e)) && (this.holdDragTriggerTime = e), this.registerDefaultIfNeeded("pointerdown"), this.registerDefaultIfNeeded("pointerup"), this.registerDefaultIfNeeded("pointerupoutside"), this.registerDefaultIfNeeded("pointerout"), this.dragstartHandler = t;
  }
  onDragEnd(t) {
    this.registerDefaultIfNeeded("pointerup"), this.registerDefaultIfNeeded("pointerupoutside"), this.dragendHandler = t;
  }
  onDragMove(t) {
    this._dragstartHandler || this.onDragStart((e) => {
    }, this.holdDragTriggerTime), this._dragendHandler || this.onDragEnd((e) => {
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
    Object.keys(this.helddownCountHandlers).forEach((e) => {
      this.helddownTimeouts.push(
        setTimeout(() => {
          this.helddownCountHandlers[e](t);
        }, parseInt(e))
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
      const e = Date.now(), a = e - this.lastDragCheckTs;
      this.lastDragCheckTs = e, this.curDragSwiperCheckIterationDuration += a;
      const i = t.data.global.y, r = this.lastDragY - i;
      this.lastDragY = i, Math.abs(r) < 7 ? this.missedDiffs++ : this.missedDiffs = 0, this.missedDiffs < 2 ? (Math.sign(this.ifDragEndEmitSwipeDistance) != Math.sign(r) && (this.swipeStartY = i, this.resetDragSwipeVars()), this.curDragSwiperCheckIterationDuration >= this.maxSwipeTimeout ? (this.curDragSwipePowerIterationQueue.length && (this.ifDragEndEmitSwipeDistance -= this.curDragSwipePowerIterationQueue.shift()), this.curDragSwipePowerIterationQueue.push(r), this.ifDragEndEmitSwipeDistance += r) : (this.ifDragEndEmitSwipeDistance += r, this.curDragSwipePowerIterationQueue.push(r))) : this.resetDragSwipeVars();
    }
  }
  resetDragSwipeVars() {
    this.curDragSwipePowerIterationQueue.length = 0, this.ifDragEndEmitSwipeDistance = 0, this.curDragSwiperCheckIterationDuration = 0;
  }
  __dragend(t) {
    if (this.inDrag = !1, this._dragendHandler(t), this.hasSwipeHandler) {
      const e = Math.sign(this.ifDragEndEmitSwipeDistance);
      if (e) {
        const a = Math.max(10, this.curDragSwiperCheckIterationDuration), i = Math.min(this.maxSwipeTimeout, a), r = this.ifDragEndEmitSwipeDistance / (i + 100 / 15) * 10;
        e > 0 && this._swipedownHandler ? this._swipedownHandler(this.ifDragEndEmitSwipeDistance) : this._swipeupHandler && this._swipeupHandler(this.ifDragEndEmitSwipeDistance), this._swipeHandler && this._swipeHandler(r);
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
      const e = this.swipeStartY - t, a = Math.max(Date.now() - this.swipeStartTs, 1);
      if (a < this.maxSwipeTimeout && Math.abs(e) > this.minSwipeDistance) {
        const i = e / (a + 6.666666666666667) * 10;
        if (Math.abs(i) > 10) {
          const r = e > 0 ? this._swipeupHandler : this._swipedownHandler;
          r && r(i), this._swipeHandler && this._swipeHandler(i);
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
function V(w) {
  return w && w.__esModule && Object.prototype.hasOwnProperty.call(w, "default") ? w.default : w;
}
var E, L;
function Q() {
  if (L) return E;
  L = 1;
  var w = {
    linear: function(t, e, a, i) {
      var r = a - e;
      return r * t / i + e;
    },
    easeInQuad: function(t, e, a, i) {
      var r = a - e;
      return r * (t /= i) * t + e;
    },
    easeOutQuad: function(t, e, a, i) {
      var r = a - e;
      return -r * (t /= i) * (t - 2) + e;
    },
    easeInOutQuad: function(t, e, a, i) {
      var r = a - e;
      return (t /= i / 2) < 1 ? r / 2 * t * t + e : -r / 2 * (--t * (t - 2) - 1) + e;
    },
    easeInCubic: function(t, e, a, i) {
      var r = a - e;
      return r * (t /= i) * t * t + e;
    },
    easeOutCubic: function(t, e, a, i) {
      var r = a - e;
      return r * ((t = t / i - 1) * t * t + 1) + e;
    },
    easeInOutCubic: function(t, e, a, i) {
      var r = a - e;
      return (t /= i / 2) < 1 ? r / 2 * t * t * t + e : r / 2 * ((t -= 2) * t * t + 2) + e;
    },
    easeInQuart: function(t, e, a, i) {
      var r = a - e;
      return r * (t /= i) * t * t * t + e;
    },
    easeOutQuart: function(t, e, a, i) {
      var r = a - e;
      return -r * ((t = t / i - 1) * t * t * t - 1) + e;
    },
    easeInOutQuart: function(t, e, a, i) {
      var r = a - e;
      return (t /= i / 2) < 1 ? r / 2 * t * t * t * t + e : -r / 2 * ((t -= 2) * t * t * t - 2) + e;
    },
    easeInQuint: function(t, e, a, i) {
      var r = a - e;
      return r * (t /= i) * t * t * t * t + e;
    },
    easeOutQuint: function(t, e, a, i) {
      var r = a - e;
      return r * ((t = t / i - 1) * t * t * t * t + 1) + e;
    },
    easeInOutQuint: function(t, e, a, i) {
      var r = a - e;
      return (t /= i / 2) < 1 ? r / 2 * t * t * t * t * t + e : r / 2 * ((t -= 2) * t * t * t * t + 2) + e;
    },
    easeInSine: function(t, e, a, i) {
      var r = a - e;
      return -r * Math.cos(t / i * (Math.PI / 2)) + r + e;
    },
    easeOutSine: function(t, e, a, i) {
      var r = a - e;
      return r * Math.sin(t / i * (Math.PI / 2)) + e;
    },
    easeInOutSine: function(t, e, a, i) {
      var r = a - e;
      return -r / 2 * (Math.cos(Math.PI * t / i) - 1) + e;
    },
    easeInExpo: function(t, e, a, i) {
      var r = a - e;
      return t == 0 ? e : r * Math.pow(2, 10 * (t / i - 1)) + e;
    },
    easeOutExpo: function(t, e, a, i) {
      var r = a - e;
      return t == i ? e + r : r * (-Math.pow(2, -10 * t / i) + 1) + e;
    },
    easeInOutExpo: function(t, e, a, i) {
      var r = a - e;
      return t === 0 ? e : t === i ? e + r : (t /= i / 2) < 1 ? r / 2 * Math.pow(2, 10 * (t - 1)) + e : r / 2 * (-Math.pow(2, -10 * --t) + 2) + e;
    },
    easeInCirc: function(t, e, a, i) {
      var r = a - e;
      return -r * (Math.sqrt(1 - (t /= i) * t) - 1) + e;
    },
    easeOutCirc: function(t, e, a, i) {
      var r = a - e;
      return r * Math.sqrt(1 - (t = t / i - 1) * t) + e;
    },
    easeInOutCirc: function(t, e, a, i) {
      var r = a - e;
      return (t /= i / 2) < 1 ? -r / 2 * (Math.sqrt(1 - t * t) - 1) + e : r / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + e;
    },
    easeInElastic: function(t, e, a, i) {
      var r = a - e, f, b, p;
      return p = 1.70158, b = 0, f = r, t === 0 ? e : (t /= i) === 1 ? e + r : (b || (b = i * 0.3), f < Math.abs(r) ? (f = r, p = b / 4) : p = b / (2 * Math.PI) * Math.asin(r / f), -(f * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * i - p) * (2 * Math.PI) / b)) + e);
    },
    easeOutElastic: function(t, e, a, i) {
      var r = a - e, f, b, p;
      return p = 1.70158, b = 0, f = r, t === 0 ? e : (t /= i) === 1 ? e + r : (b || (b = i * 0.3), f < Math.abs(r) ? (f = r, p = b / 4) : p = b / (2 * Math.PI) * Math.asin(r / f), f * Math.pow(2, -10 * t) * Math.sin((t * i - p) * (2 * Math.PI) / b) + r + e);
    },
    easeInOutElastic: function(t, e, a, i) {
      var r = a - e, f, b, p;
      return p = 1.70158, b = 0, f = r, t === 0 ? e : (t /= i / 2) === 2 ? e + r : (b || (b = i * (0.3 * 1.5)), f < Math.abs(r) ? (f = r, p = b / 4) : p = b / (2 * Math.PI) * Math.asin(r / f), t < 1 ? -0.5 * (f * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * i - p) * (2 * Math.PI) / b)) + e : f * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * i - p) * (2 * Math.PI) / b) * 0.5 + r + e);
    },
    easeInBack: function(t, e, a, i, r) {
      var f = a - e;
      return r === void 0 && (r = 1.70158), f * (t /= i) * t * ((r + 1) * t - r) + e;
    },
    easeOutBack: function(t, e, a, i, r) {
      var f = a - e;
      return r === void 0 && (r = 1.70158), f * ((t = t / i - 1) * t * ((r + 1) * t + r) + 1) + e;
    },
    easeInOutBack: function(t, e, a, i, r) {
      var f = a - e;
      return r === void 0 && (r = 1.70158), (t /= i / 2) < 1 ? f / 2 * (t * t * (((r *= 1.525) + 1) * t - r)) + e : f / 2 * ((t -= 2) * t * (((r *= 1.525) + 1) * t + r) + 2) + e;
    },
    easeInBounce: function(t, e, a, i) {
      var r = a - e, f;
      return f = w.easeOutBounce(i - t, 0, r, i), r - f + e;
    },
    easeOutBounce: function(t, e, a, i) {
      var r = a - e;
      return (t /= i) < 1 / 2.75 ? r * (7.5625 * t * t) + e : t < 2 / 2.75 ? r * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + e : t < 2.5 / 2.75 ? r * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + e : r * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + e;
    },
    easeInOutBounce: function(t, e, a, i) {
      var r = a - e, f;
      return t < i / 2 ? (f = w.easeInBounce(t * 2, 0, r, i), f * 0.5 + e) : (f = w.easeOutBounce(t * 2 - i, 0, r, i), f * 0.5 + r * 0.5 + e);
    }
  };
  return E = w, E;
}
var $ = Q();
const A = /* @__PURE__ */ V($);
class z extends T {
  constructor(t, e) {
    super(), this.scrolling = !1, this.scrollList = t, this.options = e || {}, this.bg = new PIXI.Graphics(), this.addChild(this.bg), this.scroller = new Z(this, e.scrollerOptions), this.addChild(this.scroller), this.scroller.y = 0, this.redraw(), this.registerScrollerEvents();
  }
  resizeScrollBar(t, e) {
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
    console.error("set", t);
    const a = (this.visibleLength - this.scroller.height) * t;
    this.scroller.y = a;
  }
  registerScrollerEvents() {
    this.onHeldDown((t) => {
      const e = t.data.global.y - this.getGlobalPosition().y;
      let a = -1;
      e < this.scroller.y ? a = e : e > this.scroller.y + this.scroller.height && (a = e - this.scroller.height), a >= 0 && !this.scrolling && (this.scroller.y = R(a, 0, this.visibleLength - this.scroller.height), this.emitScroll());
    }, 50), this.scroller.onDragStart((t) => {
      this.scrolling = !0;
    }, 0), this.scroller.onDragEnd((t) => {
      this.scrolling = !1;
    }), this.scroller.onDragMove((t) => {
      t.stopPropagation();
      const e = t.data.originalEvent.movementY, a = t.data.global.y, i = this.getGlobalPosition(), r = this.scroller.y + i.y;
      let f = 0;
      a > r + this.scroller.height ? f = a - (r + this.scroller.height) : a < r && (f = a - r), this.scroller.y = R(this.scroller.y + e + f, 0, this.visibleLength - this.scroller.height), this.emitScroll();
    });
  }
  emitScroll() {
    const t = this.visibleLength - this.scroller.height, e = this.scroller.y / t;
    this.emit("scrolled", e);
  }
}
class Z extends T {
  constructor(t, e) {
    super(), this.scrollBar = t, this.styleObj = e || {}, this.rect = new PIXI.Graphics(), this.addChild(this.rect);
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
const P = {
  disableTouchScroll: !1,
  disableScrollWheelScroll: !1,
  visibilityBuffer: 200,
  adjustVisibilityTime: 130
};
class J extends PIXI.Container {
  constructor(t, e, a) {
    if (super(), this.scrollItemsById = {}, this.options = [], this.po = new T(), this.scrollRect = new T(), this.scrollDuration = 0, this._currentScroll = 0, this.lastScroll = 0, this.pointerdownStart = 0, this.startingVisibleChildIndex = 0, this.endingVisibleChildIndex = 0, this.scrollCurrentDur = 0, this.currentAdjustVisibilityDelta = 0, this.animationFrame = null, this.nextItemY = 0, this.scrollToDest = 0, this.listContainer = new T(), this.listRect = new PIXI.Graphics(), this.scrollLength = 0, this.adjustedIndex = 0, this.maxHeight = 0, this.lastOverOption = null, this.lastDownOption = null, this.freezeScroll = !1, this._needsUpdateScoller = !0, this._registeredScrollEvent = !1, this.handleScrollWheelScroll = this.handleScrollWheelScroll.bind(this), this.interactive = !0, this.interactiveChildren = !0, this.__width = k(t.width).value, this.__height = k(t.height).value, this.performanceOptions = a || { ...P }, a)
      for (let r in P)
        a.hasOwnProperty(r) || (this.performanceOptions[r] = P[r]);
    this.scrollbarScroll = new PIXI.Graphics(), this.scrollStyleOptions = t, this.scrollLength = 0, this.scrollMask = new PIXI.Graphics(), this.scrollMask.beginFill(16777215), this.scrollMask.drawRect(0, 0, this.__width, this.__height), this.scrollMask.endFill(), this.listRect.beginFill(16777215, 0), this.listRect.drawRect(0, 0, this.__width, this.__height), this.listRect.endFill(), this.scrollRect.addChild(this.listRect), this.addChild(this.scrollMask), this.addChild(this.po), this.po.interactive = !0, this.po.mask = this.scrollMask;
    let i;
    this.performanceOptions.disableScrollWheelScroll || this.registerScrollEvents(), this.performanceOptions.disableTouchScroll || (this.scrollRect.onSwipe(this.applySwipe.bind(this)), this.on("pointerdown", (r) => {
      this.scrollBar && this.scrollBar.scrolling || this.performanceOptions.disableTouchScroll || this.animationFrame !== null && (cancelAnimationFrame(this.animationFrame), this.po.inDrag || this.po.emit("dragstart", r), this.animationFrame = null);
    }), this.on("pointerup", () => {
      this.scrollBar && this.scrollBar.scrolling || this.performanceOptions.disableTouchScroll;
    }), this.po.onSwipe(this.applySwipe.bind(this)), this.po.onDragStart((r) => {
      this.scrollBar && this.scrollBar.scrolling || this.freezeScroll || (this.tweenFunc = A.easeOutElastic, this.scrollLength = 0, this.scrollCurrentDur = 0, this.scrollDuration = 0, this.currentAdjustVisibilityDelta = 0, i = r.data.global.y);
    }), this.po.onDragMove((r) => {
      if (this.scrollBar && this.scrollBar.scrolling || this.freezeScroll) return;
      const f = r.data.global.y - i;
      i = r.data.global.y, this.applyDrag(f);
    }), this.po.onDragEnd((r) => {
      this.scrollBar && this.scrollBar.scrolling || this.adjustVisibility(null, !0);
    })), t.scrollBarOptions && (this.scrollBar = new z(this, t.scrollBarOptions), this.addChild(this.scrollBar), this.scrollBar.on("scrolled", (r) => {
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
    t = R(t, 0, 1);
    const e = this.currentScroll;
    this.currentScroll = this.utilizedLength * t, e !== this.currentScroll && this.adjustVisibility(null, !0);
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
  _containsPoint(t, e) {
    e = this.toLocal(e);
    const a = 0, i = this.__width, r = t.y - this.currentScroll, f = r + t.height;
    return a <= e.x && e.x <= i && r <= e.y && e.y <= f;
  }
  resize(t, e) {
    this.__width = t, this.__height = e, this.scrollMask.clear(), this.scrollMask.beginFill(16777215).drawRect(0, 0, this.__width, this.__height).endFill(), this.listRect.clear(), this.listRect.beginFill(this.scrollStyleOptions.backgroundColor).drawRect(0, 0, this.__width, this.__height).endFill(), this.adjustVisibility(null, !0), this.scrollBar && this.scrollBar.redraw();
  }
  redraw() {
    this.adjustOptions(), this.scrollBar && (this.scrollBar.redraw(), this.scrollBar.x = this.po.width);
  }
  repositionOptions() {
    let t = 0;
    for (let e = 0; e < this.options.length; e++)
      this.options[e].y = t, t += this.options[e].height;
  }
  adjustVisibility(t, e = !1) {
    if (e)
      this.currentAdjustVisibilityDelta = 0;
    else if (this.currentAdjustVisibilityDelta += t, !e && this.currentAdjustVisibilityDelta >= this.performanceOptions.adjustVisibilityTime) {
      this.currentAdjustVisibilityDelta = 0;
      return;
    }
    let a = !1;
    for (let i = 0; i < this.options.length; i++) {
      const r = this.options[i], f = r.y + r.height + this.performanceOptions.visibilityBuffer >= this.currentScroll, b = this.__height + this.currentScroll >= r.y - this.performanceOptions.visibilityBuffer, p = r.visible;
      if (r.visible = b && f, r.visible && !a && (this.startingVisibleChildIndex = i, a = !0), !r.visible && a && (this.endingVisibleChildIndex = Math.min(i + 1, this.options.length - 1)), p !== r.visible ? (p ? r.emit("hide") : r.emit("show"), r.just_added && delete r.just_added) : r.just_added && (r.visible ? r.emit("show") : r.emit("hide"), delete r.just_added), !r.visible && !p && a)
        return;
    }
    this.endingVisibleChildIndex = this.options.length - 1;
  }
  adjustOptions() {
    this.po && this.po.parent === this && (this.po.y = -this.currentScroll, this.adjustedIndex++);
  }
  animateScroll(t) {
    const e = Date.now(), a = e - t;
    return this.currentAdjustVisibilityDelta += a, this.scrollCurrentDur += a, this.scrollCurrentDur >= this.scrollDuration ? (this.animationFrame = null, this.currentScroll = this.scrollToDest, this.currentAdjustVisibilityDelta = 0, this.adjustVisibility(null, !0), null) : (this.currentScroll = this.tweenFunc(this.scrollCurrentDur, this.lastScroll, this.scrollToDest, this.scrollDuration), this.adjustVisibility(a), requestAnimationFrame(() => {
      this.animationFrame !== null && (this.animationFrame = this.animateScroll(e));
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
    const e = Math.abs(this._currentScroll - this.scrollToDest), a = e > 1e3 ? 4e3 : e > 700 ? 3e3 : e > 500 ? 2e3 : e > 200 ? 1e3 : 400;
    this.scrollDuration = Math.min(this.scrollDuration, a), this.animationFrame = this.animateScroll(Date.now());
  }
  applySwipe(t) {
    if (Math.abs(t) < 1) return;
    this.animationFrame && (cancelAnimationFrame(this.animationFrame), this.animationFrame = null), this.tweenFunc = A.easeOutCubic, this.lastScroll = this._currentScroll, this.scrollCurrentDur = 0;
    const e = Math.abs(t), a = e < 10 ? 25 : e < 25 ? 30 : e < 30 ? 35 : e < 35 ? 55 : e < 40 ? 60 : e < 60 ? 65 : 80, i = t * a;
    if (this.maxHeight <= this.__height)
      return;
    this.scrollToDest = t >= 0 ? Math.min(this.maxHeight - this.__height, this._currentScroll + i) : Math.max(0, this._currentScroll + i);
    const r = Math.abs(this._currentScroll - this.scrollToDest);
    let f;
    this.scrollToDest === 0 || this.scrollToDest === this.maxHeight - this.__height + 0 ? f = r > 1e3 ? 1e3 : r > 500 ? 500 : 200 : f = r > 2700 ? 4e3 : r > 2300 ? 3500 : r > 1500 ? 3e3 : r > 1e3 ? 2700 : r > 700 ? 2300 : r > 500 ? 2e3 : r > 300 ? 1500 : r > 100 ? 1e3 : 700, this.scrollDuration = Math.min(f), this.animationFrame = this.animateScroll(Date.now());
  }
  set currentScroll(t) {
    t < 0 ? t = 0 : t > this.maxHeight - this.__height && (t = this.maxHeight - this.__height), this._currentScroll = t, this.scrollBar && this._needsUpdateScoller && this.scrollBar.setScrollPercent(this.scrollPercent), this.adjustOptions();
  }
  get currentScroll() {
    return this._currentScroll;
  }
  addScrollItems(t) {
    t.forEach((e) => {
      e.just_added = !0, e.visible = !0, this.po.addChild(e), e.interactive && (e.hitArea = new PIXI.Rectangle(0, 0, e.width, e.height)), this.options.push(e);
    }), this.recalculateHeight(), this.repositionOptions(), this.adjustVisibility(null, !0), this.redraw();
  }
  addScrollItem(t) {
    this.addScrollItems([t]);
  }
  recalculateHeight() {
    let t = 0;
    this.options.forEach((e) => {
      t += e.height;
    }), this.maxHeight = t;
  }
  spliceScrollItems(t, e, a = !0) {
    e = e >= 0 ? e : this.options.length;
    const i = [];
    for (let r = t; r < e; r++)
      i.push(r);
    this.removeScrollItems(i, a);
  }
  removeScrollItems(t, e = !0) {
    Array.isArray(t) || (t = [t]);
    const a = [];
    return t.forEach((i) => {
      let r;
      isNaN(i) ? r = t : r = this.options[i];
      const f = this.options.find((b) => b === r);
      f && (a.push(this.options.indexOf(f)), f && f.parent === this.po && this.po.removeChild(f), e && f.destroy({ children: !0 }));
    }), a.length ? (this.options = this.options.filter((i, r) => !a.includes(r)), this._currentScroll > this.maxHeight - this.__height && (this.currentScroll = this.maxHeight - this.__height), this.recalculateHeight(), this.repositionOptions(), this.adjustVisibility(null, !0), this.redraw(), !0) : !1;
  }
  findOptionAtPoint(t) {
    for (let e = this.startingVisibleChildIndex; e <= this.endingVisibleChildIndex; e++) {
      const a = this.options[e];
      if (a.visible && this._containsPoint(a, t))
        return a;
    }
    return null;
  }
  recurseChildren(t, e, a) {
    return (t.interactive || t.interactiveChildren) && this._containsPoint(t, e) && (t.interactive && a.push(t), t.interactiveChildren && t.children && t.children.forEach((i) => {
      this.recurseChildren(i, e, a);
    })), a;
  }
}
var H = { exports: {} }, tt = H.exports, N;
function et() {
  return N || (N = 1, function(w, t) {
    (function(a, i) {
      w.exports = i();
    })(tt, function() {
      return (
        /******/
        function(e) {
          var a = {};
          function i(r) {
            if (a[r])
              return a[r].exports;
            var f = a[r] = {
              /******/
              exports: {},
              /******/
              id: r,
              /******/
              loaded: !1
              /******/
            };
            return e[r].call(f.exports, f, f.exports, i), f.loaded = !0, f.exports;
          }
          return i.m = e, i.c = a, i.p = "", i(0);
        }([
          /* 0 */
          /***/
          function(e, a, i) {
            e.exports = i(1);
          },
          /* 1 */
          /***/
          function(e, a, i) {
            var r = i(2), f = i(4), b = Date.now;
            e.exports = function(p, x) {
              var y = p.map(function(u) {
                return f(u).rgb().array();
              }), m = x.map(function(u) {
                return f(u).rgb().array();
              }), g = this;
              return params = {
                updater: function() {
                },
                ender: function() {
                },
                length: 1e3,
                startTime: void 0,
                easing: r("linear")
              }, g.onUpdate = n("updater"), g.onEnd = n("ender"), g.start = h, g.duration = n("length"), g.stop = s, g.update = l, g.easing = o, g;
              function o(u) {
                return params.easing = r(u) || r("linear"), g;
              }
              function h(u) {
                return params.startTime = b(), typeof u == "function" && setTimeout(u), g;
              }
              function l() {
                if (params.startTime) {
                  var u = c();
                  return u.progress > 1 ? d() : params.updater(u.frames, u.progress), u.frames;
                }
                return null;
              }
              function c() {
                var u = b() - params.startTime, v = u / params.length;
                return {
                  frames: m.map(function(C, I) {
                    return f.rgb(C.map(function(O, M) {
                      return y[I][M] + (O - y[I][M]) * params.easing(v);
                    }));
                  }),
                  progress: v
                };
              }
              function d() {
                return params.updater(m.map(function(u) {
                  return f.rgb(u);
                }), 1), s(), g;
              }
              function s() {
                return params.startTime = void 0, params.ender(m.map(function(u) {
                  f.rgb(u);
                }), 1), g;
              }
              function n(u) {
                return function(v) {
                  return params[u] = v, g;
                };
              }
            };
          },
          /* 2 */
          /***/
          function(e, a, i) {
            var r = i(3);
            r = Object.keys(r).reduce(function(p, x, y) {
              return p[x] = b(r[x]), p;
            }, {}), e.exports = function(p) {
              var x = f(p);
              return x.length === 1 ? r[x[0]] : r[x[0]][x[1]];
            };
            function f(p) {
              var x = [/InOut$/, /In$/, /Out$/], y = x.reduce(function(m, g, o) {
                var h = g.exec(p);
                return h && !m && (m = h), m;
              }, void 0);
              return y ? [p.substr(0, y.index), y[0]] : [p];
            }
            function b(p) {
              var x = p.InOut;
              return x.In = p.In, x.Out = p.Out, x.InOut = p.InOut, x;
            }
          },
          /* 3 */
          /***/
          function(e, a) {
            e.exports = {
              linear: {
                In: function(i) {
                  return i;
                },
                Out: function(i) {
                  return i;
                },
                InOut: function(i) {
                  return i;
                }
              },
              quadratic: {
                In: function(i) {
                  return i * i;
                },
                Out: function(i) {
                  return i * (2 - i);
                },
                InOut: function(i) {
                  return (i *= 2) < 1 ? 0.5 * i * i : -0.5 * (--i * (i - 2) - 1);
                }
              },
              cubic: {
                In: function(i) {
                  return i * i * i;
                },
                Out: function(i) {
                  return --i * i * i + 1;
                },
                InOut: function(i) {
                  return (i *= 2) < 1 ? 0.5 * i * i * i : 0.5 * ((i -= 2) * i * i + 2);
                }
              },
              quartic: {
                In: function(i) {
                  return i * i * i * i;
                },
                Out: function(i) {
                  return 1 - --i * i * i * i;
                },
                InOut: function(i) {
                  return (i *= 2) < 1 ? 0.5 * i * i * i * i : -0.5 * ((i -= 2) * i * i * i - 2);
                }
              },
              quintic: {
                In: function(i) {
                  return i * i * i * i * i;
                },
                Out: function(i) {
                  return --i * i * i * i * i + 1;
                },
                InOut: function(i) {
                  return (i *= 2) < 1 ? 0.5 * i * i * i * i * i : 0.5 * ((i -= 2) * i * i * i * i + 2);
                }
              },
              sinusoidal: {
                In: function(i) {
                  return 1 - Math.cos(i * Math.PI / 2);
                },
                Out: function(i) {
                  return Math.sin(i * Math.PI / 2);
                },
                InOut: function(i) {
                  return 0.5 * (1 - Math.cos(Math.PI * i));
                }
              },
              exponential: {
                In: function(i) {
                  return i === 0 ? 0 : Math.pow(1024, i - 1);
                },
                Out: function(i) {
                  return i === 1 ? 1 : 1 - Math.pow(2, -10 * i);
                },
                InOut: function(i) {
                  return i === 0 ? 0 : i === 1 ? 1 : (i *= 2) < 1 ? 0.5 * Math.pow(1024, i - 1) : 0.5 * (-Math.pow(2, -10 * (i - 1)) + 2);
                }
              },
              circular: {
                In: function(i) {
                  return 1 - Math.sqrt(1 - i * i);
                },
                Out: function(i) {
                  return Math.sqrt(1 - --i * i);
                },
                InOut: function(i) {
                  return (i *= 2) < 1 ? -0.5 * (Math.sqrt(1 - i * i) - 1) : 0.5 * (Math.sqrt(1 - (i -= 2) * i) + 1);
                }
              },
              elastic: {
                In: function(i) {
                  return i === 0 ? 0 : i === 1 ? 1 : -Math.pow(2, 10 * (i - 1)) * Math.sin((i - 1.1) * 5 * Math.PI);
                },
                Out: function(i) {
                  return i === 0 ? 0 : i === 1 ? 1 : Math.pow(2, -10 * i) * Math.sin((i - 0.1) * 5 * Math.PI) + 1;
                },
                InOut: function(i) {
                  return i === 0 ? 0 : i === 1 ? 1 : (i *= 2, i < 1 ? -0.5 * Math.pow(2, 10 * (i - 1)) * Math.sin((i - 1.1) * 5 * Math.PI) : 0.5 * Math.pow(2, -10 * (i - 1)) * Math.sin((i - 1.1) * 5 * Math.PI) + 1);
                }
              },
              back: {
                In: function(i) {
                  var r = 1.70158;
                  return i * i * ((r + 1) * i - r);
                },
                Out: function(i) {
                  var r = 1.70158;
                  return --i * i * ((r + 1) * i + r) + 1;
                },
                InOut: function(i) {
                  var r = 2.5949095;
                  return (i *= 2) < 1 ? 0.5 * (i * i * ((r + 1) * i - r)) : 0.5 * ((i -= 2) * i * ((r + 1) * i + r) + 2);
                }
              },
              bounce: {
                In: function(i) {
                  return 1 - Easing.Bounce.Out(1 - i);
                },
                Out: function(i) {
                  return i < 1 / 2.75 ? 7.5625 * i * i : i < 2 / 2.75 ? 7.5625 * (i -= 1.5 / 2.75) * i + 0.75 : i < 2.5 / 2.75 ? 7.5625 * (i -= 2.25 / 2.75) * i + 0.9375 : 7.5625 * (i -= 2.625 / 2.75) * i + 0.984375;
                },
                InOut: function(i) {
                  return i < 0.5 ? Easing.Bounce.In(i * 2) * 0.5 : Easing.Bounce.Out(i * 2 - 1) * 0.5 + 0.5;
                }
              }
            };
          },
          /* 4 */
          /***/
          function(e, a, i) {
            var r = i(5), f = i(9), b = [].slice, p = [
              // to be honest, I don't really feel like keyword belongs in color convert, but eh.
              "keyword",
              // gray conflicts with some method names, and has its own method defined.
              "gray",
              // shouldn't really be in color-convert either...
              "hex"
            ], x = {};
            Object.keys(f).forEach(function(s) {
              x[b.call(f[s].labels).sort().join("")] = s;
            });
            var y = {};
            function m(s, n) {
              if (!(this instanceof m))
                return new m(s, n);
              if (n && n in p && (n = null), n && !(n in f))
                throw new Error("Unknown model: " + n);
              var u, v;
              if (!s)
                this.model = "rgb", this.color = [0, 0, 0], this.valpha = 1;
              else if (s instanceof m)
                this.model = s.model, this.color = s.color.slice(), this.valpha = s.valpha;
              else if (typeof s == "string") {
                var S = r.get(s);
                if (S === null)
                  throw new Error("Unable to parse color from string: " + s);
                this.model = S.model, v = f[this.model].channels, this.color = S.value.slice(0, v), this.valpha = typeof S.value[v] == "number" ? S.value[v] : 1;
              } else if (s.length) {
                this.model = n || "rgb", v = f[this.model].channels;
                var C = b.call(s, 0, v);
                this.color = d(C, v), this.valpha = typeof s[v] == "number" ? s[v] : 1;
              } else if (typeof s == "number")
                s &= 16777215, this.model = "rgb", this.color = [
                  s >> 16 & 255,
                  s >> 8 & 255,
                  s & 255
                ], this.valpha = 1;
              else {
                this.valpha = 1;
                var I = Object.keys(s);
                "alpha" in s && (I.splice(I.indexOf("alpha"), 1), this.valpha = typeof s.alpha == "number" ? s.alpha : 0);
                var O = I.sort().join("");
                if (!(O in x))
                  throw new Error("Unable to parse color from object: " + JSON.stringify(s));
                this.model = x[O];
                var M = f[this.model].labels, B = [];
                for (u = 0; u < M.length; u++)
                  B.push(s[M[u]]);
                this.color = d(B);
              }
              if (y[this.model])
                for (v = f[this.model].channels, u = 0; u < v; u++) {
                  var X = y[this.model][u];
                  X && (this.color[u] = X(this.color[u]));
                }
              this.valpha = Math.max(0, Math.min(1, this.valpha)), Object.freeze && Object.freeze(this);
            }
            m.prototype = {
              toString: function() {
                return this.string();
              },
              toJSON: function() {
                return this[this.model]();
              },
              string: function(s) {
                var n = this.model in r.to ? this : this.rgb();
                n = n.round(typeof s == "number" ? s : 1);
                var u = n.valpha === 1 ? n.color : n.color.concat(this.valpha);
                return r.to[n.model](u);
              },
              percentString: function(s) {
                var n = this.rgb().round(typeof s == "number" ? s : 1), u = n.valpha === 1 ? n.color : n.color.concat(this.valpha);
                return r.to.rgb.percent(u);
              },
              array: function() {
                return this.valpha === 1 ? this.color.slice() : this.color.concat(this.valpha);
              },
              object: function() {
                for (var s = {}, n = f[this.model].channels, u = f[this.model].labels, v = 0; v < n; v++)
                  s[u[v]] = this.color[v];
                return this.valpha !== 1 && (s.alpha = this.valpha), s;
              },
              unitArray: function() {
                var s = this.rgb().color;
                return s[0] /= 255, s[1] /= 255, s[2] /= 255, this.valpha !== 1 && s.push(this.valpha), s;
              },
              unitObject: function() {
                var s = this.rgb().object();
                return s.r /= 255, s.g /= 255, s.b /= 255, this.valpha !== 1 && (s.alpha = this.valpha), s;
              },
              round: function(s) {
                return s = Math.max(s || 0, 0), new m(this.color.map(o(s)).concat(this.valpha), this.model);
              },
              alpha: function(s) {
                return arguments.length ? new m(this.color.concat(Math.max(0, Math.min(1, s))), this.model) : this.valpha;
              },
              // rgb
              red: h("rgb", 0, l(255)),
              green: h("rgb", 1, l(255)),
              blue: h("rgb", 2, l(255)),
              hue: h(["hsl", "hsv", "hsl", "hwb", "hcg"], 0, function(s) {
                return (s % 360 + 360) % 360;
              }),
              // eslint-disable-line brace-style
              saturationl: h("hsl", 1, l(100)),
              lightness: h("hsl", 2, l(100)),
              saturationv: h("hsv", 1, l(100)),
              value: h("hsv", 2, l(100)),
              chroma: h("hcg", 1, l(100)),
              gray: h("hcg", 2, l(100)),
              white: h("hwb", 1, l(100)),
              wblack: h("hwb", 2, l(100)),
              cyan: h("cmyk", 0, l(100)),
              magenta: h("cmyk", 1, l(100)),
              yellow: h("cmyk", 2, l(100)),
              black: h("cmyk", 3, l(100)),
              x: h("xyz", 0, l(100)),
              y: h("xyz", 1, l(100)),
              z: h("xyz", 2, l(100)),
              l: h("lab", 0, l(100)),
              a: h("lab", 1),
              b: h("lab", 2),
              keyword: function(s) {
                return arguments.length ? new m(s) : f[this.model].keyword(this.color);
              },
              hex: function(s) {
                return arguments.length ? new m(s) : r.to.hex(this.rgb().round().color);
              },
              rgbNumber: function() {
                var s = this.rgb().color;
                return (s[0] & 255) << 16 | (s[1] & 255) << 8 | s[2] & 255;
              },
              luminosity: function() {
                for (var s = this.rgb().color, n = [], u = 0; u < s.length; u++) {
                  var v = s[u] / 255;
                  n[u] = v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
                }
                return 0.2126 * n[0] + 0.7152 * n[1] + 0.0722 * n[2];
              },
              contrast: function(s) {
                var n = this.luminosity(), u = s.luminosity();
                return n > u ? (n + 0.05) / (u + 0.05) : (u + 0.05) / (n + 0.05);
              },
              level: function(s) {
                var n = this.contrast(s);
                return n >= 7.1 ? "AAA" : n >= 4.5 ? "AA" : "";
              },
              dark: function() {
                var s = this.rgb().color, n = (s[0] * 299 + s[1] * 587 + s[2] * 114) / 1e3;
                return n < 128;
              },
              light: function() {
                return !this.dark();
              },
              negate: function() {
                for (var s = this.rgb(), n = 0; n < 3; n++)
                  s.color[n] = 255 - s.color[n];
                return s;
              },
              lighten: function(s) {
                var n = this.hsl();
                return n.color[2] += n.color[2] * s, n;
              },
              darken: function(s) {
                var n = this.hsl();
                return n.color[2] -= n.color[2] * s, n;
              },
              saturate: function(s) {
                var n = this.hsl();
                return n.color[1] += n.color[1] * s, n;
              },
              desaturate: function(s) {
                var n = this.hsl();
                return n.color[1] -= n.color[1] * s, n;
              },
              whiten: function(s) {
                var n = this.hwb();
                return n.color[1] += n.color[1] * s, n;
              },
              blacken: function(s) {
                var n = this.hwb();
                return n.color[2] += n.color[2] * s, n;
              },
              grayscale: function() {
                var s = this.rgb().color, n = s[0] * 0.3 + s[1] * 0.59 + s[2] * 0.11;
                return m.rgb(n, n, n);
              },
              fade: function(s) {
                return this.alpha(this.valpha - this.valpha * s);
              },
              opaquer: function(s) {
                return this.alpha(this.valpha + this.valpha * s);
              },
              rotate: function(s) {
                var n = this.hsl(), u = n.color[0];
                return u = (u + s) % 360, u = u < 0 ? 360 + u : u, n.color[0] = u, n;
              },
              mix: function(s, n) {
                var u = this.rgb(), v = s.rgb(), S = n === void 0 ? 0.5 : n, C = 2 * S - 1, I = u.alpha() - v.alpha(), O = ((C * I === -1 ? C : (C + I) / (1 + C * I)) + 1) / 2, M = 1 - O;
                return m.rgb(
                  O * u.red() + M * v.red(),
                  O * u.green() + M * v.green(),
                  O * u.blue() + M * v.blue(),
                  u.alpha() * S + v.alpha() * (1 - S)
                );
              }
            }, Object.keys(f).forEach(function(s) {
              if (p.indexOf(s) === -1) {
                var n = f[s].channels;
                m.prototype[s] = function() {
                  if (this.model === s)
                    return new m(this);
                  if (arguments.length)
                    return new m(arguments, s);
                  var u = typeof arguments[n] == "number" ? n : this.valpha;
                  return new m(c(f[this.model][s].raw(this.color)).concat(u), s);
                }, m[s] = function(u) {
                  return typeof u == "number" && (u = d(b.call(arguments), n)), new m(u, s);
                };
              }
            });
            function g(s, n) {
              return Number(s.toFixed(n));
            }
            function o(s) {
              return function(n) {
                return g(n, s);
              };
            }
            function h(s, n, u) {
              return s = Array.isArray(s) ? s : [s], s.forEach(function(v) {
                (y[v] || (y[v] = []))[n] = u;
              }), s = s[0], function(v) {
                var S;
                return arguments.length ? (u && (v = u(v)), S = this[s](), S.color[n] = v, S) : (S = this[s]().color[n], u && (S = u(S)), S);
              };
            }
            function l(s) {
              return function(n) {
                return Math.max(0, Math.min(s, n));
              };
            }
            function c(s) {
              return Array.isArray(s) ? s : [s];
            }
            function d(s, n) {
              for (var u = 0; u < n; u++)
                typeof s[u] != "number" && (s[u] = 0);
              return s;
            }
            e.exports = m;
          },
          /* 5 */
          /***/
          function(e, a, i) {
            var r = i(6), f = i(7), b = {};
            for (var p in r)
              r.hasOwnProperty(p) && (b[r[p]] = p);
            var x = e.exports = {
              to: {},
              get: {}
            };
            x.get = function(g) {
              var o = g.substring(0, 3).toLowerCase(), h, l;
              switch (o) {
                case "hsl":
                  h = x.get.hsl(g), l = "hsl";
                  break;
                case "hwb":
                  h = x.get.hwb(g), l = "hwb";
                  break;
                default:
                  h = x.get.rgb(g), l = "rgb";
                  break;
              }
              return h ? { model: l, value: h } : null;
            }, x.get.rgb = function(g) {
              if (!g)
                return null;
              var o = /^#([a-f0-9]{3,4})$/i, h = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i, l = /^rgba?\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/, c = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/, d = /(\D+)/, s = [0, 0, 0, 1], n, u, v;
              if (n = g.match(h)) {
                for (v = n[2], n = n[1], u = 0; u < 3; u++) {
                  var S = u * 2;
                  s[u] = parseInt(n.slice(S, S + 2), 16);
                }
                v && (s[3] = Math.round(parseInt(v, 16) / 255 * 100) / 100);
              } else if (n = g.match(o)) {
                for (n = n[1], v = n[3], u = 0; u < 3; u++)
                  s[u] = parseInt(n[u] + n[u], 16);
                v && (s[3] = Math.round(parseInt(v + v, 16) / 255 * 100) / 100);
              } else if (n = g.match(l)) {
                for (u = 0; u < 3; u++)
                  s[u] = parseInt(n[u + 1], 0);
                n[4] && (s[3] = parseFloat(n[4]));
              } else if (n = g.match(c)) {
                for (u = 0; u < 3; u++)
                  s[u] = Math.round(parseFloat(n[u + 1]) * 2.55);
                n[4] && (s[3] = parseFloat(n[4]));
              } else return (n = g.match(d)) ? n[1] === "transparent" ? [0, 0, 0, 0] : (s = r[n[1]], s ? (s[3] = 1, s) : null) : null;
              for (u = 0; u < 3; u++)
                s[u] = y(s[u], 0, 255);
              return s[3] = y(s[3], 0, 1), s;
            }, x.get.hsl = function(g) {
              if (!g)
                return null;
              var o = /^hsla?\(\s*([+-]?(?:\d*\.)?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/, h = g.match(o);
              if (h) {
                var l = parseFloat(h[4]), c = (parseFloat(h[1]) + 360) % 360, d = y(parseFloat(h[2]), 0, 100), s = y(parseFloat(h[3]), 0, 100), n = y(isNaN(l) ? 1 : l, 0, 1);
                return [c, d, s, n];
              }
              return null;
            }, x.get.hwb = function(g) {
              if (!g)
                return null;
              var o = /^hwb\(\s*([+-]?\d*[\.]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/, h = g.match(o);
              if (h) {
                var l = parseFloat(h[4]), c = (parseFloat(h[1]) % 360 + 360) % 360, d = y(parseFloat(h[2]), 0, 100), s = y(parseFloat(h[3]), 0, 100), n = y(isNaN(l) ? 1 : l, 0, 1);
                return [c, d, s, n];
              }
              return null;
            }, x.to.hex = function() {
              var g = f(arguments);
              return "#" + m(g[0]) + m(g[1]) + m(g[2]) + (g[3] < 1 ? m(Math.round(g[3] * 255)) : "");
            }, x.to.rgb = function() {
              var g = f(arguments);
              return g.length < 4 || g[3] === 1 ? "rgb(" + Math.round(g[0]) + ", " + Math.round(g[1]) + ", " + Math.round(g[2]) + ")" : "rgba(" + Math.round(g[0]) + ", " + Math.round(g[1]) + ", " + Math.round(g[2]) + ", " + g[3] + ")";
            }, x.to.rgb.percent = function() {
              var g = f(arguments), o = Math.round(g[0] / 255 * 100), h = Math.round(g[1] / 255 * 100), l = Math.round(g[2] / 255 * 100);
              return g.length < 4 || g[3] === 1 ? "rgb(" + o + "%, " + h + "%, " + l + "%)" : "rgba(" + o + "%, " + h + "%, " + l + "%, " + g[3] + ")";
            }, x.to.hsl = function() {
              var g = f(arguments);
              return g.length < 4 || g[3] === 1 ? "hsl(" + g[0] + ", " + g[1] + "%, " + g[2] + "%)" : "hsla(" + g[0] + ", " + g[1] + "%, " + g[2] + "%, " + g[3] + ")";
            }, x.to.hwb = function() {
              var g = f(arguments), o = "";
              return g.length >= 4 && g[3] !== 1 && (o = ", " + g[3]), "hwb(" + g[0] + ", " + g[1] + "%, " + g[2] + "%" + o + ")";
            }, x.to.keyword = function(g) {
              return b[g.slice(0, 3)];
            };
            function y(g, o, h) {
              return Math.min(Math.max(o, g), h);
            }
            function m(g) {
              var o = g.toString(16).toUpperCase();
              return o.length < 2 ? "0" + o : o;
            }
          },
          /* 6 */
          /***/
          function(e, a) {
            e.exports = {
              aliceblue: [240, 248, 255],
              antiquewhite: [250, 235, 215],
              aqua: [0, 255, 255],
              aquamarine: [127, 255, 212],
              azure: [240, 255, 255],
              beige: [245, 245, 220],
              bisque: [255, 228, 196],
              black: [0, 0, 0],
              blanchedalmond: [255, 235, 205],
              blue: [0, 0, 255],
              blueviolet: [138, 43, 226],
              brown: [165, 42, 42],
              burlywood: [222, 184, 135],
              cadetblue: [95, 158, 160],
              chartreuse: [127, 255, 0],
              chocolate: [210, 105, 30],
              coral: [255, 127, 80],
              cornflowerblue: [100, 149, 237],
              cornsilk: [255, 248, 220],
              crimson: [220, 20, 60],
              cyan: [0, 255, 255],
              darkblue: [0, 0, 139],
              darkcyan: [0, 139, 139],
              darkgoldenrod: [184, 134, 11],
              darkgray: [169, 169, 169],
              darkgreen: [0, 100, 0],
              darkgrey: [169, 169, 169],
              darkkhaki: [189, 183, 107],
              darkmagenta: [139, 0, 139],
              darkolivegreen: [85, 107, 47],
              darkorange: [255, 140, 0],
              darkorchid: [153, 50, 204],
              darkred: [139, 0, 0],
              darksalmon: [233, 150, 122],
              darkseagreen: [143, 188, 143],
              darkslateblue: [72, 61, 139],
              darkslategray: [47, 79, 79],
              darkslategrey: [47, 79, 79],
              darkturquoise: [0, 206, 209],
              darkviolet: [148, 0, 211],
              deeppink: [255, 20, 147],
              deepskyblue: [0, 191, 255],
              dimgray: [105, 105, 105],
              dimgrey: [105, 105, 105],
              dodgerblue: [30, 144, 255],
              firebrick: [178, 34, 34],
              floralwhite: [255, 250, 240],
              forestgreen: [34, 139, 34],
              fuchsia: [255, 0, 255],
              gainsboro: [220, 220, 220],
              ghostwhite: [248, 248, 255],
              gold: [255, 215, 0],
              goldenrod: [218, 165, 32],
              gray: [128, 128, 128],
              green: [0, 128, 0],
              greenyellow: [173, 255, 47],
              grey: [128, 128, 128],
              honeydew: [240, 255, 240],
              hotpink: [255, 105, 180],
              indianred: [205, 92, 92],
              indigo: [75, 0, 130],
              ivory: [255, 255, 240],
              khaki: [240, 230, 140],
              lavender: [230, 230, 250],
              lavenderblush: [255, 240, 245],
              lawngreen: [124, 252, 0],
              lemonchiffon: [255, 250, 205],
              lightblue: [173, 216, 230],
              lightcoral: [240, 128, 128],
              lightcyan: [224, 255, 255],
              lightgoldenrodyellow: [250, 250, 210],
              lightgray: [211, 211, 211],
              lightgreen: [144, 238, 144],
              lightgrey: [211, 211, 211],
              lightpink: [255, 182, 193],
              lightsalmon: [255, 160, 122],
              lightseagreen: [32, 178, 170],
              lightskyblue: [135, 206, 250],
              lightslategray: [119, 136, 153],
              lightslategrey: [119, 136, 153],
              lightsteelblue: [176, 196, 222],
              lightyellow: [255, 255, 224],
              lime: [0, 255, 0],
              limegreen: [50, 205, 50],
              linen: [250, 240, 230],
              magenta: [255, 0, 255],
              maroon: [128, 0, 0],
              mediumaquamarine: [102, 205, 170],
              mediumblue: [0, 0, 205],
              mediumorchid: [186, 85, 211],
              mediumpurple: [147, 112, 219],
              mediumseagreen: [60, 179, 113],
              mediumslateblue: [123, 104, 238],
              mediumspringgreen: [0, 250, 154],
              mediumturquoise: [72, 209, 204],
              mediumvioletred: [199, 21, 133],
              midnightblue: [25, 25, 112],
              mintcream: [245, 255, 250],
              mistyrose: [255, 228, 225],
              moccasin: [255, 228, 181],
              navajowhite: [255, 222, 173],
              navy: [0, 0, 128],
              oldlace: [253, 245, 230],
              olive: [128, 128, 0],
              olivedrab: [107, 142, 35],
              orange: [255, 165, 0],
              orangered: [255, 69, 0],
              orchid: [218, 112, 214],
              palegoldenrod: [238, 232, 170],
              palegreen: [152, 251, 152],
              paleturquoise: [175, 238, 238],
              palevioletred: [219, 112, 147],
              papayawhip: [255, 239, 213],
              peachpuff: [255, 218, 185],
              peru: [205, 133, 63],
              pink: [255, 192, 203],
              plum: [221, 160, 221],
              powderblue: [176, 224, 230],
              purple: [128, 0, 128],
              rebeccapurple: [102, 51, 153],
              red: [255, 0, 0],
              rosybrown: [188, 143, 143],
              royalblue: [65, 105, 225],
              saddlebrown: [139, 69, 19],
              salmon: [250, 128, 114],
              sandybrown: [244, 164, 96],
              seagreen: [46, 139, 87],
              seashell: [255, 245, 238],
              sienna: [160, 82, 45],
              silver: [192, 192, 192],
              skyblue: [135, 206, 235],
              slateblue: [106, 90, 205],
              slategray: [112, 128, 144],
              slategrey: [112, 128, 144],
              snow: [255, 250, 250],
              springgreen: [0, 255, 127],
              steelblue: [70, 130, 180],
              tan: [210, 180, 140],
              teal: [0, 128, 128],
              thistle: [216, 191, 216],
              tomato: [255, 99, 71],
              turquoise: [64, 224, 208],
              violet: [238, 130, 238],
              wheat: [245, 222, 179],
              white: [255, 255, 255],
              whitesmoke: [245, 245, 245],
              yellow: [255, 255, 0],
              yellowgreen: [154, 205, 50]
            };
          },
          /* 7 */
          /***/
          function(e, a, i) {
            var r = i(8), f = Array.prototype.concat, b = Array.prototype.slice, p = e.exports = function(y) {
              for (var m = [], g = 0, o = y.length; g < o; g++) {
                var h = y[g];
                r(h) ? m = f.call(m, b.call(h)) : m.push(h);
              }
              return m;
            };
            p.wrap = function(x) {
              return function() {
                return x(p(arguments));
              };
            };
          },
          /* 8 */
          /***/
          function(e, a) {
            e.exports = function(r) {
              return !r || typeof r == "string" ? !1 : r instanceof Array || Array.isArray(r) || r.length >= 0 && (r.splice instanceof Function || Object.getOwnPropertyDescriptor(r, r.length - 1) && r.constructor.name !== "String");
            };
          },
          /* 9 */
          /***/
          function(e, a, i) {
            var r = i(10), f = i(11), b = {}, p = Object.keys(r);
            function x(m) {
              var g = function(o) {
                return o == null ? o : (arguments.length > 1 && (o = Array.prototype.slice.call(arguments)), m(o));
              };
              return "conversion" in m && (g.conversion = m.conversion), g;
            }
            function y(m) {
              var g = function(o) {
                if (o == null)
                  return o;
                arguments.length > 1 && (o = Array.prototype.slice.call(arguments));
                var h = m(o);
                if (typeof h == "object")
                  for (var l = h.length, c = 0; c < l; c++)
                    h[c] = Math.round(h[c]);
                return h;
              };
              return "conversion" in m && (g.conversion = m.conversion), g;
            }
            p.forEach(function(m) {
              b[m] = {}, Object.defineProperty(b[m], "channels", { value: r[m].channels }), Object.defineProperty(b[m], "labels", { value: r[m].labels });
              var g = f(m), o = Object.keys(g);
              o.forEach(function(h) {
                var l = g[h];
                b[m][h] = y(l), b[m][h].raw = x(l);
              });
            }), e.exports = b;
          },
          /* 10 */
          /***/
          function(e, a, i) {
            var r = i(6), f = {};
            for (var b in r)
              r.hasOwnProperty(b) && (f[r[b]] = b);
            var p = e.exports = {
              rgb: { channels: 3, labels: "rgb" },
              hsl: { channels: 3, labels: "hsl" },
              hsv: { channels: 3, labels: "hsv" },
              hwb: { channels: 3, labels: "hwb" },
              cmyk: { channels: 4, labels: "cmyk" },
              xyz: { channels: 3, labels: "xyz" },
              lab: { channels: 3, labels: "lab" },
              lch: { channels: 3, labels: "lch" },
              hex: { channels: 1, labels: ["hex"] },
              keyword: { channels: 1, labels: ["keyword"] },
              ansi16: { channels: 1, labels: ["ansi16"] },
              ansi256: { channels: 1, labels: ["ansi256"] },
              hcg: { channels: 3, labels: ["h", "c", "g"] },
              apple: { channels: 3, labels: ["r16", "g16", "b16"] },
              gray: { channels: 1, labels: ["gray"] }
            };
            for (var x in p)
              if (p.hasOwnProperty(x)) {
                if (!("channels" in p[x]))
                  throw new Error("missing channels property: " + x);
                if (!("labels" in p[x]))
                  throw new Error("missing channel labels property: " + x);
                if (p[x].labels.length !== p[x].channels)
                  throw new Error("channel and label counts mismatch: " + x);
                var y = p[x].channels, m = p[x].labels;
                delete p[x].channels, delete p[x].labels, Object.defineProperty(p[x], "channels", { value: y }), Object.defineProperty(p[x], "labels", { value: m });
              }
            p.rgb.hsl = function(o) {
              var h = o[0] / 255, l = o[1] / 255, c = o[2] / 255, d = Math.min(h, l, c), s = Math.max(h, l, c), n = s - d, u, v, S;
              return s === d ? u = 0 : h === s ? u = (l - c) / n : l === s ? u = 2 + (c - h) / n : c === s && (u = 4 + (h - l) / n), u = Math.min(u * 60, 360), u < 0 && (u += 360), S = (d + s) / 2, s === d ? v = 0 : S <= 0.5 ? v = n / (s + d) : v = n / (2 - s - d), [u, v * 100, S * 100];
            }, p.rgb.hsv = function(o) {
              var h, l, c, d, s, n = o[0] / 255, u = o[1] / 255, v = o[2] / 255, S = Math.max(n, u, v), C = S - Math.min(n, u, v), I = function(O) {
                return (S - O) / 6 / C + 1 / 2;
              };
              return C === 0 ? d = s = 0 : (s = C / S, h = I(n), l = I(u), c = I(v), n === S ? d = c - l : u === S ? d = 1 / 3 + h - c : v === S && (d = 2 / 3 + l - h), d < 0 ? d += 1 : d > 1 && (d -= 1)), [
                d * 360,
                s * 100,
                S * 100
              ];
            }, p.rgb.hwb = function(o) {
              var h = o[0], l = o[1], c = o[2], d = p.rgb.hsl(o)[0], s = 1 / 255 * Math.min(h, Math.min(l, c));
              return c = 1 - 1 / 255 * Math.max(h, Math.max(l, c)), [d, s * 100, c * 100];
            }, p.rgb.cmyk = function(o) {
              var h = o[0] / 255, l = o[1] / 255, c = o[2] / 255, d, s, n, u;
              return u = Math.min(1 - h, 1 - l, 1 - c), d = (1 - h - u) / (1 - u) || 0, s = (1 - l - u) / (1 - u) || 0, n = (1 - c - u) / (1 - u) || 0, [d * 100, s * 100, n * 100, u * 100];
            };
            function g(o, h) {
              return Math.pow(o[0] - h[0], 2) + Math.pow(o[1] - h[1], 2) + Math.pow(o[2] - h[2], 2);
            }
            p.rgb.keyword = function(o) {
              var h = f[o];
              if (h)
                return h;
              var l = 1 / 0, c;
              for (var d in r)
                if (r.hasOwnProperty(d)) {
                  var s = r[d], n = g(o, s);
                  n < l && (l = n, c = d);
                }
              return c;
            }, p.keyword.rgb = function(o) {
              return r[o];
            }, p.rgb.xyz = function(o) {
              var h = o[0] / 255, l = o[1] / 255, c = o[2] / 255;
              h = h > 0.04045 ? Math.pow((h + 0.055) / 1.055, 2.4) : h / 12.92, l = l > 0.04045 ? Math.pow((l + 0.055) / 1.055, 2.4) : l / 12.92, c = c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92;
              var d = h * 0.4124 + l * 0.3576 + c * 0.1805, s = h * 0.2126 + l * 0.7152 + c * 0.0722, n = h * 0.0193 + l * 0.1192 + c * 0.9505;
              return [d * 100, s * 100, n * 100];
            }, p.rgb.lab = function(o) {
              var h = p.rgb.xyz(o), l = h[0], c = h[1], d = h[2], s, n, u;
              return l /= 95.047, c /= 100, d /= 108.883, l = l > 8856e-6 ? Math.pow(l, 1 / 3) : 7.787 * l + 16 / 116, c = c > 8856e-6 ? Math.pow(c, 1 / 3) : 7.787 * c + 16 / 116, d = d > 8856e-6 ? Math.pow(d, 1 / 3) : 7.787 * d + 16 / 116, s = 116 * c - 16, n = 500 * (l - c), u = 200 * (c - d), [s, n, u];
            }, p.hsl.rgb = function(o) {
              var h = o[0] / 360, l = o[1] / 100, c = o[2] / 100, d, s, n, u, v;
              if (l === 0)
                return v = c * 255, [v, v, v];
              c < 0.5 ? s = c * (1 + l) : s = c + l - c * l, d = 2 * c - s, u = [0, 0, 0];
              for (var S = 0; S < 3; S++)
                n = h + 1 / 3 * -(S - 1), n < 0 && n++, n > 1 && n--, 6 * n < 1 ? v = d + (s - d) * 6 * n : 2 * n < 1 ? v = s : 3 * n < 2 ? v = d + (s - d) * (2 / 3 - n) * 6 : v = d, u[S] = v * 255;
              return u;
            }, p.hsl.hsv = function(o) {
              var h = o[0], l = o[1] / 100, c = o[2] / 100, d = l, s = Math.max(c, 0.01), n, u;
              return c *= 2, l *= c <= 1 ? c : 2 - c, d *= s <= 1 ? s : 2 - s, u = (c + l) / 2, n = c === 0 ? 2 * d / (s + d) : 2 * l / (c + l), [h, n * 100, u * 100];
            }, p.hsv.rgb = function(o) {
              var h = o[0] / 60, l = o[1] / 100, c = o[2] / 100, d = Math.floor(h) % 6, s = h - Math.floor(h), n = 255 * c * (1 - l), u = 255 * c * (1 - l * s), v = 255 * c * (1 - l * (1 - s));
              switch (c *= 255, d) {
                case 0:
                  return [c, v, n];
                case 1:
                  return [u, c, n];
                case 2:
                  return [n, c, v];
                case 3:
                  return [n, u, c];
                case 4:
                  return [v, n, c];
                case 5:
                  return [c, n, u];
              }
            }, p.hsv.hsl = function(o) {
              var h = o[0], l = o[1] / 100, c = o[2] / 100, d = Math.max(c, 0.01), s, n, u;
              return u = (2 - l) * c, s = (2 - l) * d, n = l * d, n /= s <= 1 ? s : 2 - s, n = n || 0, u /= 2, [h, n * 100, u * 100];
            }, p.hwb.rgb = function(o) {
              var h = o[0] / 360, l = o[1] / 100, c = o[2] / 100, d = l + c, s, n, u, v;
              d > 1 && (l /= d, c /= d), s = Math.floor(6 * h), n = 1 - c, u = 6 * h - s, s & 1 && (u = 1 - u), v = l + u * (n - l);
              var S, C, I;
              switch (s) {
                default:
                case 6:
                case 0:
                  S = n, C = v, I = l;
                  break;
                case 1:
                  S = v, C = n, I = l;
                  break;
                case 2:
                  S = l, C = n, I = v;
                  break;
                case 3:
                  S = l, C = v, I = n;
                  break;
                case 4:
                  S = v, C = l, I = n;
                  break;
                case 5:
                  S = n, C = l, I = v;
                  break;
              }
              return [S * 255, C * 255, I * 255];
            }, p.cmyk.rgb = function(o) {
              var h = o[0] / 100, l = o[1] / 100, c = o[2] / 100, d = o[3] / 100, s, n, u;
              return s = 1 - Math.min(1, h * (1 - d) + d), n = 1 - Math.min(1, l * (1 - d) + d), u = 1 - Math.min(1, c * (1 - d) + d), [s * 255, n * 255, u * 255];
            }, p.xyz.rgb = function(o) {
              var h = o[0] / 100, l = o[1] / 100, c = o[2] / 100, d, s, n;
              return d = h * 3.2406 + l * -1.5372 + c * -0.4986, s = h * -0.9689 + l * 1.8758 + c * 0.0415, n = h * 0.0557 + l * -0.204 + c * 1.057, d = d > 31308e-7 ? 1.055 * Math.pow(d, 1 / 2.4) - 0.055 : d * 12.92, s = s > 31308e-7 ? 1.055 * Math.pow(s, 1 / 2.4) - 0.055 : s * 12.92, n = n > 31308e-7 ? 1.055 * Math.pow(n, 1 / 2.4) - 0.055 : n * 12.92, d = Math.min(Math.max(0, d), 1), s = Math.min(Math.max(0, s), 1), n = Math.min(Math.max(0, n), 1), [d * 255, s * 255, n * 255];
            }, p.xyz.lab = function(o) {
              var h = o[0], l = o[1], c = o[2], d, s, n;
              return h /= 95.047, l /= 100, c /= 108.883, h = h > 8856e-6 ? Math.pow(h, 1 / 3) : 7.787 * h + 16 / 116, l = l > 8856e-6 ? Math.pow(l, 1 / 3) : 7.787 * l + 16 / 116, c = c > 8856e-6 ? Math.pow(c, 1 / 3) : 7.787 * c + 16 / 116, d = 116 * l - 16, s = 500 * (h - l), n = 200 * (l - c), [d, s, n];
            }, p.lab.xyz = function(o) {
              var h = o[0], l = o[1], c = o[2], d, s, n;
              s = (h + 16) / 116, d = l / 500 + s, n = s - c / 200;
              var u = Math.pow(s, 3), v = Math.pow(d, 3), S = Math.pow(n, 3);
              return s = u > 8856e-6 ? u : (s - 16 / 116) / 7.787, d = v > 8856e-6 ? v : (d - 16 / 116) / 7.787, n = S > 8856e-6 ? S : (n - 16 / 116) / 7.787, d *= 95.047, s *= 100, n *= 108.883, [d, s, n];
            }, p.lab.lch = function(o) {
              var h = o[0], l = o[1], c = o[2], d, s, n;
              return d = Math.atan2(c, l), s = d * 360 / 2 / Math.PI, s < 0 && (s += 360), n = Math.sqrt(l * l + c * c), [h, n, s];
            }, p.lch.lab = function(o) {
              var h = o[0], l = o[1], c = o[2], d, s, n;
              return n = c / 360 * 2 * Math.PI, d = l * Math.cos(n), s = l * Math.sin(n), [h, d, s];
            }, p.rgb.ansi16 = function(o) {
              var h = o[0], l = o[1], c = o[2], d = 1 in arguments ? arguments[1] : p.rgb.hsv(o)[2];
              if (d = Math.round(d / 50), d === 0)
                return 30;
              var s = 30 + (Math.round(c / 255) << 2 | Math.round(l / 255) << 1 | Math.round(h / 255));
              return d === 2 && (s += 60), s;
            }, p.hsv.ansi16 = function(o) {
              return p.rgb.ansi16(p.hsv.rgb(o), o[2]);
            }, p.rgb.ansi256 = function(o) {
              var h = o[0], l = o[1], c = o[2];
              if (h === l && l === c)
                return h < 8 ? 16 : h > 248 ? 231 : Math.round((h - 8) / 247 * 24) + 232;
              var d = 16 + 36 * Math.round(h / 255 * 5) + 6 * Math.round(l / 255 * 5) + Math.round(c / 255 * 5);
              return d;
            }, p.ansi16.rgb = function(o) {
              var h = o % 10;
              if (h === 0 || h === 7)
                return o > 50 && (h += 3.5), h = h / 10.5 * 255, [h, h, h];
              var l = (~~(o > 50) + 1) * 0.5, c = (h & 1) * l * 255, d = (h >> 1 & 1) * l * 255, s = (h >> 2 & 1) * l * 255;
              return [c, d, s];
            }, p.ansi256.rgb = function(o) {
              if (o >= 232) {
                var h = (o - 232) * 10 + 8;
                return [h, h, h];
              }
              o -= 16;
              var l, c = Math.floor(o / 36) / 5 * 255, d = Math.floor((l = o % 36) / 6) / 5 * 255, s = l % 6 / 5 * 255;
              return [c, d, s];
            }, p.rgb.hex = function(o) {
              var h = ((Math.round(o[0]) & 255) << 16) + ((Math.round(o[1]) & 255) << 8) + (Math.round(o[2]) & 255), l = h.toString(16).toUpperCase();
              return "000000".substring(l.length) + l;
            }, p.hex.rgb = function(o) {
              var h = o.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
              if (!h)
                return [0, 0, 0];
              var l = h[0];
              h[0].length === 3 && (l = l.split("").map(function(u) {
                return u + u;
              }).join(""));
              var c = parseInt(l, 16), d = c >> 16 & 255, s = c >> 8 & 255, n = c & 255;
              return [d, s, n];
            }, p.rgb.hcg = function(o) {
              var h = o[0] / 255, l = o[1] / 255, c = o[2] / 255, d = Math.max(Math.max(h, l), c), s = Math.min(Math.min(h, l), c), n = d - s, u, v;
              return n < 1 ? u = s / (1 - n) : u = 0, n <= 0 ? v = 0 : d === h ? v = (l - c) / n % 6 : d === l ? v = 2 + (c - h) / n : v = 4 + (h - l) / n + 4, v /= 6, v %= 1, [v * 360, n * 100, u * 100];
            }, p.hsl.hcg = function(o) {
              var h = o[1] / 100, l = o[2] / 100, c = 1, d = 0;
              return l < 0.5 ? c = 2 * h * l : c = 2 * h * (1 - l), c < 1 && (d = (l - 0.5 * c) / (1 - c)), [o[0], c * 100, d * 100];
            }, p.hsv.hcg = function(o) {
              var h = o[1] / 100, l = o[2] / 100, c = h * l, d = 0;
              return c < 1 && (d = (l - c) / (1 - c)), [o[0], c * 100, d * 100];
            }, p.hcg.rgb = function(o) {
              var h = o[0] / 360, l = o[1] / 100, c = o[2] / 100;
              if (l === 0)
                return [c * 255, c * 255, c * 255];
              var d = [0, 0, 0], s = h % 1 * 6, n = s % 1, u = 1 - n, v = 0;
              switch (Math.floor(s)) {
                case 0:
                  d[0] = 1, d[1] = n, d[2] = 0;
                  break;
                case 1:
                  d[0] = u, d[1] = 1, d[2] = 0;
                  break;
                case 2:
                  d[0] = 0, d[1] = 1, d[2] = n;
                  break;
                case 3:
                  d[0] = 0, d[1] = u, d[2] = 1;
                  break;
                case 4:
                  d[0] = n, d[1] = 0, d[2] = 1;
                  break;
                default:
                  d[0] = 1, d[1] = 0, d[2] = u;
              }
              return v = (1 - l) * c, [
                (l * d[0] + v) * 255,
                (l * d[1] + v) * 255,
                (l * d[2] + v) * 255
              ];
            }, p.hcg.hsv = function(o) {
              var h = o[1] / 100, l = o[2] / 100, c = h + l * (1 - h), d = 0;
              return c > 0 && (d = h / c), [o[0], d * 100, c * 100];
            }, p.hcg.hsl = function(o) {
              var h = o[1] / 100, l = o[2] / 100, c = l * (1 - h) + 0.5 * h, d = 0;
              return c > 0 && c < 0.5 ? d = h / (2 * c) : c >= 0.5 && c < 1 && (d = h / (2 * (1 - c))), [o[0], d * 100, c * 100];
            }, p.hcg.hwb = function(o) {
              var h = o[1] / 100, l = o[2] / 100, c = h + l * (1 - h);
              return [o[0], (c - h) * 100, (1 - c) * 100];
            }, p.hwb.hcg = function(o) {
              var h = o[1] / 100, l = o[2] / 100, c = 1 - l, d = c - h, s = 0;
              return d < 1 && (s = (c - d) / (1 - d)), [o[0], d * 100, s * 100];
            }, p.apple.rgb = function(o) {
              return [o[0] / 65535 * 255, o[1] / 65535 * 255, o[2] / 65535 * 255];
            }, p.rgb.apple = function(o) {
              return [o[0] / 255 * 65535, o[1] / 255 * 65535, o[2] / 255 * 65535];
            }, p.gray.rgb = function(o) {
              return [o[0] / 100 * 255, o[0] / 100 * 255, o[0] / 100 * 255];
            }, p.gray.hsl = p.gray.hsv = function(o) {
              return [0, 0, o[0]];
            }, p.gray.hwb = function(o) {
              return [0, 100, o[0]];
            }, p.gray.cmyk = function(o) {
              return [0, 0, 0, o[0]];
            }, p.gray.lab = function(o) {
              return [o[0], 0, 0];
            }, p.gray.hex = function(o) {
              var h = Math.round(o[0] / 100 * 255) & 255, l = (h << 16) + (h << 8) + h, c = l.toString(16).toUpperCase();
              return "000000".substring(c.length) + c;
            }, p.rgb.gray = function(o) {
              var h = (o[0] + o[1] + o[2]) / 3;
              return [h / 255 * 100];
            };
          },
          /* 11 */
          /***/
          function(e, a, i) {
            var r = i(10);
            function f() {
              for (var y = {}, m = Object.keys(r), g = m.length, o = 0; o < g; o++)
                y[m[o]] = {
                  // http://jsperf.com/1-vs-infinity
                  // micro-opt, but this is simple.
                  distance: -1,
                  parent: null
                };
              return y;
            }
            function b(y) {
              var m = f(), g = [y];
              for (m[y].distance = 0; g.length; )
                for (var o = g.pop(), h = Object.keys(r[o]), l = h.length, c = 0; c < l; c++) {
                  var d = h[c], s = m[d];
                  s.distance === -1 && (s.distance = m[o].distance + 1, s.parent = o, g.unshift(d));
                }
              return m;
            }
            function p(y, m) {
              return function(g) {
                return m(y(g));
              };
            }
            function x(y, m) {
              for (var g = [m[y].parent, y], o = r[m[y].parent][y], h = m[y].parent; m[h].parent; )
                g.unshift(m[h].parent), o = p(r[m[h].parent][h], o), h = m[h].parent;
              return o.conversion = g, o;
            }
            e.exports = function(y) {
              for (var m = b(y), g = {}, o = Object.keys(m), h = o.length, l = 0; l < h; l++) {
                var c = o[l], d = m[c];
                d.parent !== null && (g[c] = x(c, m));
              }
              return g;
            };
          }
          /******/
        ])
      );
    });
  }(H)), H.exports;
}
var it = et();
const U = /* @__PURE__ */ V(it), dt = "__pixi-dom-dynamic-texture-atlas";
var rt = /* @__PURE__ */ ((w) => (w.flexStart = "flex-start", w.flexEnd = "flex-end", w.center = "center", w.spaceBetween = "spaceBetween", w.spaceAround = "spaceAround", w.spaceEvenly = "spaceEvenly", w))(rt || {}), st = /* @__PURE__ */ ((w) => (w.row = "row", w.row_reverse = "row-reverse", w.column = "column", w.column_reverse = "column-reverse", w))(st || {}), nt = /* @__PURE__ */ ((w) => (w.nowrap = "nowrap", w.wrap = "wrap", w.wrap_reverse = "wrap-reverse", w))(nt || {}), at = /* @__PURE__ */ ((w) => (w.LINEAR = "linear", w.QUADRATIC = "quadtratic", w.CUBIC = "cubic", w.QUARTIC = "quartic", w.QUINTIC = "quintic", w.SINUSOIDAL = "sinusoidal", w.EXPONENTIAL = "exponential", w.CIRCULAR = "circular", w.ELASTIC = "elastic", w.BACK = "back", w))(at || {}), _ = /* @__PURE__ */ ((w) => (w.background = "background", w.circle_color = "circle_color", w.circle_position = "circle_position", w.label = "label", w))(_ || {});
console.log("color tween: ", U);
const D = 2;
class ot extends PIXI.Container {
  constructor(t, e) {
    super(), this._toggled = !0, this.usingLabels = !1, this.backgroundColorsArrayIndex = null, this.circleColorsArrayIndex = null, this.toggleCircleTravelDistance = 0, this.options = t, this.backgroundGraphic = new PIXI.Graphics();
    const a = t.borderRadius ? t.borderRadius : 50;
    if (t.borderRadius = a, this.computedBorderRadius = t.borderRadius / 100 * t.height, this.backgroundGraphic.drawRoundedRect(0, 0, t.width, t.height, this.computedBorderRadius), this.addChild(this.backgroundGraphic), t.labelOptions) {
      const { fontName: i, onLabel: r, offLabel: f, onColor: b, offColor: p } = t.labelOptions;
      this.onText = new PIXI.extras.BitmapText(r, { font: i, align: "left" }), this.offText = new PIXI.extras.BitmapText(f, { font: i, align: "left" }), this.addChild(this.onText), this.addChild(this.offText), this.onText.visible = !1, this.offText.visible = !1;
      const x = t.width / 2 - this.offText.width;
      if (x < 0)
        throw new Error("Label for off text was too long");
      this.offText.x = t.width / 2 + x / 2 - D, this.offText.tint = p;
      const y = t.height - this.offText.height;
      if (y < 0)
        throw new Error("Label font is too large to fit within height of toggle, either increase height or use smaller font");
      this.offText.y = y / 2;
      const m = t.width / 2 - this.onText.width;
      if (m < 0)
        throw new Error("Label for on text was too long");
      if (this.onText.x = D + m / 2, this.onText.tint = b, t.height - this.onText.height < 0)
        throw new Error("Label font is too large to fit within height of toggle, either increase height or use smaller font");
      this.onText.y = y / 2, this.usingLabels = !0;
    }
    this.circleRadius = this.options.height / 2 - D, this.circleGraphic = new PIXI.Graphics(), this.circleGraphic.drawCircle(0, 0, this.circleRadius), this.circleGraphic.y = D, this.addChild(this.circleGraphic), this.toggleCircleTravelDistance = Math.abs(D - (this.options.width - this.circleGraphic.width - D)), this.interactive = !0, this.buttonMode = !0, this.on("pointerdown", () => {
      this.toggled = !this.toggled;
    }), this.updateToggle = this.staticToggleUpdate.bind(this), this.toggled = !!e, this.updateToggle = t.animationOptions ? this.animatedToggleUpdate.bind(this) : this.staticToggleUpdate.bind(this);
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
    return this.toggled ? D : this.options.width - this.circleGraphic.width - D;
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
  midAnimationToggleUpdate(t, e) {
    const a = this.toggleCircleTravelDistance * e, { exclude: i } = this.options.animationOptions;
    if (this.usingLabels && (!i || !i.includes(_.label)) && (this.activeTextLabel.visible = !0, this.inactiveTextLabel.visible = !0, this.inactiveTextLabel.alpha = 1 - e, this.activeTextLabel.alpha = e), this.backgroundColorsArrayIndex !== null) {
      if (this.backgroundGraphic.clear(), this.options.hasOwnProperty("backgroundOutline")) {
        const { width: r, color: f } = this.options.backgroundOutline;
        this.backgroundGraphic.lineStyle(r, f);
      }
      this.backgroundGraphic.beginFill(F(t[this.backgroundColorsArrayIndex].hex())), this.backgroundGraphic.drawRoundedRect(0, 0, this.options.width, this.options.height, this.computedBorderRadius), this.backgroundGraphic.endFill();
    }
    (!i || !i.includes(_.circle_position)) && (this.toggled ? this.circleGraphic.x = this.travelToX + a : this.circleGraphic.x = this.travelToX - a), this.circleColorsArrayIndex !== null && (this.circleGraphic.clear(), this.circleGraphic.beginFill(F(t[this.circleColorsArrayIndex].hex())), this.circleGraphic.drawCircle(this.circleRadius, this.circleRadius, this.circleRadius), this.circleGraphic.endFill());
  }
  animatedToggleUpdate() {
    const t = [], e = [], { exclude: a } = this.options.animationOptions;
    (!a || !a.includes(_.background)) && (t.push(PIXI.utils.hex2string(this.activeBackgroundColor)), e.push(PIXI.utils.hex2string(this.inactiveBackgroundColor)), this.backgroundColorsArrayIndex = 0), (!a || !a.includes(_.circle_color)) && (t.push(PIXI.utils.hex2string(this.activeCircleColor)), e.push(PIXI.utils.hex2string(this.inactiveCircleColor)), this.circleColorsArrayIndex = t.length - 1), this.tween = new U(e, t).duration(this.options.animationOptions.duration).easing(this.options.animationOptions.type).onUpdate(this.midAnimationToggleUpdate.bind(this)).onEnd(this.staticToggleUpdate.bind(this)).start(this.animateToggle.bind(this));
  }
  staticToggleUpdate() {
    if (this.backgroundGraphic.clear(), this.options.hasOwnProperty("backgroundOutline")) {
      const { width: i, color: r } = this.options.backgroundOutline;
      this.backgroundGraphic.lineStyle(i, r);
    }
    let t, e, a;
    this._toggled ? (a = this.options.onBackgroundColor, t = this.options.width - this.circleGraphic.width - D, e = this.options.onCircleColor, this._showOnText()) : (a = this.options.offBackgroundColor, t = 0 + D, e = this.options.offCircleColor, this._showOffText()), this.backgroundGraphic.beginFill(a), this.backgroundGraphic.drawRoundedRect(0, 0, this.options.width, this.options.height, this.computedBorderRadius), this.backgroundGraphic.endFill(), this.circleGraphic.clear(), this.circleGraphic.beginFill(e), this.circleGraphic.drawCircle(this.circleRadius, this.circleRadius, this.circleRadius), this.circleGraphic.endFill(), this.circleGraphic.x = t;
  }
  _showOnText() {
    this.usingLabels && (this.onText.visible = !0, this.offText.visible = !1);
  }
  _showOffText() {
    this.usingLabels && (this.onText.visible = !1, this.offText.visible = !0);
  }
}
class ht extends T {
  constructor(t, e) {
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
    ), this.updateStyle(e);
  }
  set btnState(t) {
    t !== this._btnState && (this._btnState = t, this.redraw());
  }
  set text(t) {
    this._text = t, this.redrawText();
  }
  updateStyle(t) {
    Object.keys(t).forEach((e) => {
      this.styleOptions[e] = t[e];
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
    let { backgroundColor: t, borderRadius: e, borderColor: a, borderWidth: i, width: r, height: f, backgroundTexture: b, backgroundOpacity: p, borderOpacity: x } = this.currentStyleState;
    if (t || t == 0) {
      if (this.bgGraphic ? this.bgGraphic.clear() : this.bgGraphic = new PIXI.Graphics(), this.bgGraphic.parent || this.addChild(this.bgGraphic), p = p || p == 0 ? p : 1, this.bgGraphic.beginFill(t, p), i && (x = x || x == 0 ? x : 1, this.bgGraphic.lineStyle(i, a, x)), e) {
        const y = e / 100 * f;
        this.bgGraphic.drawRoundedRect(0, 0, r, f, y);
      } else
        this.bgGraphic.drawRect(0, 0, r, f);
      this.bgGraphic.endFill();
    }
    b && (this.bgSprite || (this.bgSprite = new PIXI.Sprite()), this.bgSprite.parent || this.addChild(this.bgGraphic), this.bgSprite.texture = b, this.bgSprite.x = r / 2 - this.bgSprite.x / 2, this.bgSprite.y = f / 2 - this.bgSprite.y / 2), this.hitArea = new PIXI.Rectangle(0, 0, r, f);
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
class lt extends PIXI.Container {
  constructor(t) {
    super(), this.isDragging = !1, this.isHovered = !1, this.curOutlineWidth = 0, this.lastX = 0, this.resolvedScale = null, this.options = t, this.currentValue = this.options.startingValue, this.backgroundGraphic = new PIXI.Graphics(), super.addChild(this.backgroundGraphic), this.circleRadius = this.options.circleRadius, this.circleGraphic = new PIXI.Graphics(), this.circleGraphic.drawCircle(0, this.circleRadius, this.circleRadius), this.circleGraphic.y = 0, this.circleGraphic.buttonMode = !0, super.addChild(this.circleGraphic), this.circleGraphic.interactive = !0, console.log(this.options.maxValue - this.options.minValue);
    const e = (this.currentValue - this.options.minValue) / (this.options.maxValue - this.options.minValue);
    this.circleGraphic.x = e * this.options.width, this.redrawCircle(), this.redrawBar(), this.circleGraphic.on("pointerover", (a) => {
      this.isHovered = !0, this.redrawCircle();
    }), this.circleGraphic.on("pointerout", () => {
      this.isHovered && (this.isHovered = !1, this.isDragging || this.redrawCircle());
    }), this.circleGraphic.on("pointerdown", (a) => {
      this.resolvedScale = null, this.resolveScale(), this.isDragging = !0, this.lastX = a.data.global.x, this.redrawCircle();
    }), this.circleGraphic.on("pointercancel", () => {
      this.isDragging && (this.resolvedScale = null, this.isDragging = !1, this.redrawCircle());
    }), this.circleGraphic.on("pointerup", () => {
      this.isDragging && (this.resolvedScale = null, this.isDragging = !1, this.redrawCircle());
    }), this.circleGraphic.on("pointerupoutside", () => {
      this.isDragging && (this.resolvedScale = null, this.isDragging = !1, this.redrawCircle());
    }), this.circleGraphic.on("pointermove", (a) => {
      if (!this.isDragging) return;
      let i = a.data.global.x - this.lastX;
      const r = this.options.preventScaleAdjustment ? 1 : this.resolveScale().x;
      if (i *= r, i < 0 && a.data.global.x * r < this.x && this.circleGraphic.x === 0 || i > 0 && a.data.global.x * r > this.options.width && this.circleGraphic.x === this.options.width) return;
      this.lastX = a.data.global.x;
      const f = this.circleGraphic.x;
      this.circleGraphic.x += i, this.circleGraphic.x = Math.max(0, Math.min(this.circleGraphic.x, this.options.width)), this.circleGraphic.x - f && (this.currentValue = this.calculateValue(), this.redrawBar(), super.emit("slider-change", this.currentValue));
    });
  }
  resolveScale() {
    if (this.resolvedScale) return this.resolvedScale;
    let t = 1 / this.scale.x, e = 1 / this.scale.y, a = this.parent;
    for (; a; )
      t /= a.scale.x, e /= a.scale.y, a = a.parent;
    return this.resolvedScale = { x: t, y: e };
  }
  calculateValue() {
    const { maxValue: t, minValue: e, width: a } = this.options, i = this.circleGraphic.x / a;
    return ct(e, t, i);
  }
  redrawCircle() {
    var b, p, x, y, m, g, o, h, l, c, d, s;
    this.circleGraphic.clear();
    let t = this.options.circleOpacity || 1;
    this.isDragging && ((b = this.options.down) != null && b.circleOpacity) ? t = this.options.down.circleOpacity : this.isHovered && ((p = this.options.hover) != null && p.circleOpacity) && (t = this.options.hover.circleOpacity);
    let e = this.options.circleRadius;
    this.isDragging && ((x = this.options.down) != null && x.circleRadius) ? e = this.options.down.circleRadius : this.isHovered && ((y = this.options.hover) != null && y.circleRadius) && (e = this.options.hover.circleRadius);
    let a = this.options.circleColor;
    this.isDragging && ((m = this.options.down) != null && m.circleColor) ? a = this.options.down.circleColor : this.isHovered && ((g = this.options.hover) != null && g.circleColor) && (a = this.options.hover.circleColor);
    let i = 0;
    this.isDragging && ((o = this.options.down) != null && o.circleOutlineWidth) ? i = this.options.down.circleOutlineWidth : this.isHovered && ((h = this.options.hover) != null && h.circleOutlineWidth) ? i = this.options.hover.circleOutlineWidth : this.options.circleOutlineWidth && (i = this.options.circleOutlineWidth);
    let r = this.options.circleOutlineColor || 0;
    this.isDragging && ((l = this.options.down) != null && l.circleOutlineColor) ? r = this.options.down.circleOutlineColor : this.isHovered && ((c = this.options.hover) != null && c.circleOutlineColor) && (r = this.options.hover.circleOutlineColor);
    let f = this.options.circleOutlineOpacity || 1;
    this.isDragging && ((d = this.options.down) != null && d.circleOutlineOpacity) ? f = this.options.down.circleOutlineOpacity : this.isHovered && ((s = this.options.hover) != null && s.circleOutlineOpacity) && (f = this.options.hover.circleOutlineOpacity), this.circleGraphic.lineStyle(i, r, f), this.circleGraphic.beginFill(a, t), this.circleGraphic.drawCircle(0, e, e), this.circleGraphic.endFill(), G(this.circleGraphic, { axis: "y", parent: { height: this.options.height } });
  }
  redrawBar() {
    const t = this.circleGraphic.x, e = this.options.width - t;
    this.backgroundGraphic.clear();
    const a = this.options.opacity || 1;
    this.backgroundGraphic.beginFill(this.options.activeColor, a), this.backgroundGraphic.drawRect(0, 0, t, this.options.height), this.backgroundGraphic.endFill(), this.backgroundGraphic.beginFill(this.options.inactiveColor, a), this.backgroundGraphic.drawRect(t, 0, e, this.options.height), this.backgroundGraphic.endFill();
  }
  offChange(t) {
    super.off("slider-change", t);
  }
  onChange(t) {
    super.on("slider-change", t);
  }
}
function ct(w, t, e) {
  return (1 - e) * w + e * t;
}
const pt = {
  centerPixiObject: G,
  string2hex: F
};
PIXI !== void 0 && (PIXI.Slider = PIXI.Slider || lt, PIXI.Toggle = PIXI.Toggle || ot, PIXI.TextField = PIXI.TextField || K, PIXI.Element = PIXI.Element || T, PIXI.ScrollBar = PIXI.ScrollBar || z, PIXI.ScrollList = PIXI.ScrollList || J, PIXI.Button = PIXI.Button || ht, PIXI.utils && !PIXI.utils.string2hex && (PIXI.utils.string2hex = F), PIXI.utils.centerObject = G);
export {
  at as AnimationType,
  ht as Button,
  st as FlexDirection,
  nt as FlexWrap,
  dt as GLOBAL_PIXI_DTA_PROPERTY_KEY,
  rt as JustifyContent,
  T as PixiElement,
  z as ScrollBar,
  J as ScrollList,
  lt as Slider,
  K as TextField,
  ot as Toggle,
  _ as ToggleAnimationExclusions,
  pt as utils
};
//# sourceMappingURL=pixidom.es.js.map

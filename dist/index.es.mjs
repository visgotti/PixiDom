Number.isNaN = Number.isNaN || function(r) {
  return typeof r == "number" && isNaN(r);
};
const tt = function(r) {
  const t = (i) => ({ valid: !1, error: i }), e = (i) => {
    if (typeof i == "number" && !Number.isNaN(i))
      return i;
    if (typeof i == "string") {
      const n = i.trim();
      if (!n.length)
        return;
      const s = Number(n);
      if (!Number.isNaN(s))
        return s;
    }
  };
  try {
    if (r == null)
      throw new Error("Length values must either be in % or px");
    if (typeof r == "object" && "value" in r && "type" in r) {
      const s = r, o = e(s.value);
      if (o === void 0)
        throw new Error("Did not find a number in front of px");
      const a = s.type === "percent" ? "percent" : "pixel";
      if (a === "pixel" && o < 0)
        throw new Error("Can not have negative pixel length value");
      return {
        valid: !0,
        value: o,
        type: a
      };
    }
    if (typeof r == "number") {
      if (r < 0)
        throw new Error("Can not have negative pixel length value");
      return {
        valid: !0,
        value: r,
        type: "pixel"
      };
    }
    const i = String(r).trim();
    if (!i.length)
      throw new Error("Length values must either be in % or px");
    if (i.endsWith("%")) {
      const s = e(i.slice(0, -1));
      if (s === void 0)
        throw new Error("Did not find a number in front of % sign");
      return {
        valid: !0,
        value: s,
        type: "percent"
      };
    }
    if (i.toLowerCase().endsWith("px")) {
      const s = e(i.slice(0, -2));
      if (s === void 0)
        throw new Error("Did not find a number in front of px");
      if (s < 0)
        throw new Error("Can not have negative pixel length value");
      return {
        valid: !0,
        value: s,
        type: "pixel"
      };
    }
    const n = e(i);
    if (n !== void 0) {
      if (n < 0)
        throw new Error("Can not have negative pixel length value");
      return {
        valid: !0,
        value: n,
        type: "pixel"
      };
    }
    throw new Error("Length values must either be in % or px");
  } catch (i) {
    const n = i instanceof Error ? i.message : String(i);
    return t(n);
  }
};
function K(r, t, e) {
  return r <= t ? t : r >= e ? e : r;
}
function A(r) {
  let t = typeof r == "number" ? r.toString(16) : r;
  return typeof t == "string" && t[0] === "#" && (t = t.substring(1)), parseInt(t, 16);
}
function et(r, t) {
  const e = t?.parent ?? r.parent ?? null;
  if (!e) throw new Error("No parent");
  const i = () => {
    if (e.width === void 0) throw new Error("Parent has no width");
    r.x = e.width / 2 - r.width / 2;
  }, n = () => {
    if (e.height === void 0) throw new Error("Parent has no height");
    r.y = e.height / 2 - r.height / 2;
  };
  t?.axis ? t.axis === "x" ? i() : t.axis === "y" && n() : (i(), n());
}
const U = (r) => !Number.isFinite(r) || r <= 0 ? 0 : r >= 255 ? 255 : Math.round(r), Ot = (r) => Number.isFinite(r) ? r <= 0 ? 0 : r >= 1 ? 1 : r : 1, Pt = /^[0-9a-fA-F]+$/, F = (r) => typeof r != "number" || !Number.isFinite(r) ? 0 : r >>> 0 & 16777215, Q = (r, t, e, i) => ({
  value: (U(r) << 16 | U(t) << 8 | U(e)) >>> 0,
  alpha: i === void 0 ? 1 : Ot(i)
}), Ht = (r) => {
  let t = r.trim();
  if (!t.length)
    throw new TypeError(`Invalid color string: ${JSON.stringify(r)}`);
  if (t.startsWith("#") && (t = t.slice(1)), (t.startsWith("0x") || t.startsWith("0X")) && (t = t.slice(2)), !Pt.test(t))
    throw new TypeError(`Invalid hex color string: ${JSON.stringify(r)}`);
  let e, i, n, s;
  switch (t.length) {
    case 3: {
      e = parseInt(t[0] + t[0], 16), i = parseInt(t[1] + t[1], 16), n = parseInt(t[2] + t[2], 16);
      break;
    }
    case 4: {
      e = parseInt(t[0] + t[0], 16), i = parseInt(t[1] + t[1], 16), n = parseInt(t[2] + t[2], 16), s = parseInt(t[3] + t[3], 16) / 255;
      break;
    }
    case 6: {
      e = parseInt(t.slice(0, 2), 16), i = parseInt(t.slice(2, 4), 16), n = parseInt(t.slice(4, 6), 16);
      break;
    }
    case 8: {
      e = parseInt(t.slice(0, 2), 16), i = parseInt(t.slice(2, 4), 16), n = parseInt(t.slice(4, 6), 16), s = parseInt(t.slice(6, 8), 16) / 255;
      break;
    }
    default:
      throw new TypeError(`Hex color must be 3, 4, 6, or 8 digits: ${JSON.stringify(r)}`);
  }
  return Q(e, i, n, s);
}, kt = (r) => {
  if (!Number.isFinite(r))
    throw new TypeError(`Invalid color number: ${r}`);
  return { value: F(r), alpha: 1 };
}, Lt = (r) => {
  if (!r || typeof r != "object") return !1;
  const t = r;
  return typeof t.r == "number" && typeof t.g == "number" && typeof t.b == "number";
}, Bt = (r) => Array.isArray(r) && (r.length === 3 || r.length === 4) && r.every((t) => typeof t == "number");
function y(r) {
  if (typeof r == "number")
    return kt(r);
  if (typeof r == "string")
    return Ht(r);
  if (Lt(r))
    return Q(r.r, r.g, r.b, r.a);
  if (Bt(r)) {
    const [t, e, i, n] = r;
    return Q(t, e, i, r.length === 4 ? n : void 0);
  }
  throw new TypeError(`Unrecognized color input: ${JSON.stringify(r)}`);
}
function X(r) {
  return y(r).value;
}
function k(r) {
  return `#${y(r).value.toString(16).padStart(6, "0")}`;
}
function Mt(r, t) {
  return r == null ? y(t) : y(r);
}
function xt(r) {
  return class extends r {
    constructor(...e) {
      super(...e), this.copiedText = "", this.textStates = [], this.currentStateIndex = -1, this.registerHandlers = this.registerHandlers.bind(this), this.unregisterHandlers = this.unregisterHandlers.bind(this), this.onCopy = this.onCopy.bind(this), this.onPaste = this.onPaste.bind(this), this.onCut = this.onCut.bind(this), this.onKeyPress = this.onKeyPress.bind(this), this.onKeyDown = this.onKeyDown.bind(this), this.on("focus", this.registerHandlers), this.on("blur", this.unregisterHandlers);
    }
    /**
     * Emit a cancelable `beforeinput` event for an impending operation.
     * Returns true when the operation may proceed (nothing called
     * `preventDefault()`), matching the DOM `beforeinput` contract.
     */
    dispatchBeforeInput(e, i, n) {
      const s = {
        inputType: e,
        data: i,
        cancelable: !0,
        defaultPrevented: !1,
        preventDefault() {
          this.defaultPrevented = !0;
        },
        nativeEvent: n
      };
      return this.emit("beforeinput", s), !s.defaultPrevented;
    }
    changeStateIndex(e) {
      const i = this.currentStateIndex + e;
      i >= 0 && i < this.textStates.length && (super.change(this.textStates[i]), this.currentStateIndex = i);
    }
    registerHandlers() {
      document.addEventListener("copy", this.onCopy, !0), document.addEventListener("cut", this.onCut, !0), document.addEventListener("paste", this.onPaste, !0), document.addEventListener("keypress", this.onKeyPress, !0), document.addEventListener("keydown", this.onKeyDown, !0);
    }
    unregisterHandlers() {
      document.removeEventListener("copy", this.onCopy, !0), document.removeEventListener("cut", this.onCut, !0), document.removeEventListener("paste", this.onPaste, !0), document.removeEventListener("keypress", this.onKeyPress, !0), document.removeEventListener("keydown", this.onKeyDown, !0);
    }
    onPaste(e) {
      const i = e.clipboardData ? e.clipboardData.getData("text/plain") : this.copiedText;
      this.dispatchBeforeInput("insertFromPaste", i, e) && this.addState(super.replaceSelectedWith(i));
    }
    onCopy(e) {
      e.preventDefault();
      const i = super.getSelectedChars();
      e.clipboardData && e.clipboardData.setData("text/plain", i), this.copiedText = i;
    }
    onCut(e) {
      e.preventDefault();
      const i = super.getSelectedChars();
      e.clipboardData && e.clipboardData.setData("text/plain", i), this.copiedText = i, this.dispatchBeforeInput("deleteByCut", null, e) && this.addState(super.replaceSelectedWith(""));
    }
    onBackspace() {
    }
    onDelete() {
    }
    /** Overridable hook: ArrowUp keydown (multi-line inputs move the caret up a line). */
    onArrowUp(e) {
    }
    /** Overridable hook: ArrowDown keydown (multi-line inputs move the caret down a line). */
    onArrowDown(e) {
    }
    /**
     * Overridable hook: Home keydown. Default moves the caret to the start
     * of the text; multi-line inputs override to go to the line start.
     */
    onHome(e) {
      super.setCursor(0);
    }
    /**
     * Overridable hook: End keydown. Default moves the caret to the end of
     * the text; multi-line inputs override to go to the line end.
     */
    onEnd(e) {
      super.setCursor(this.text.length);
    }
    /**
     * Overridable hook: PageUp keydown. Default jumps to the start of the
     * text; multi-line inputs override to move up one viewport of lines.
     */
    onPageUp(e) {
      super.setCursor(0);
    }
    /**
     * Overridable hook: PageDown keydown. Default jumps to the end of the
     * text; multi-line inputs override to move down one viewport of lines.
     */
    onPageDown(e) {
      super.setCursor(this.text.length);
    }
    onKeyDown(e) {
      const i = e.keyCode ?? e.which, n = e.code;
      if (this.submitKeyCodes.includes(i) || this.submitKeyCodes.includes(n))
        super.submit();
      else if (i == 37 || n === "ArrowLeft") {
        const s = super.getSelectedRange()?.indexes;
        s ? super.setCursor(s.start) : super.moveCursor(-1);
      } else if (i == 39 || n === "ArrowRight") {
        const s = super.getSelectedRange()?.indexes;
        s ? super.setCursor(s.end) : super.moveCursor(1);
      } else if (i == 38 || n === "ArrowUp")
        this.onArrowUp(e);
      else if (i == 40 || n === "ArrowDown")
        this.onArrowDown(e);
      else if (i == 36 || n === "Home")
        this.onHome(e);
      else if (i == 35 || n === "End")
        this.onEnd(e);
      else if (i == 33 || n === "PageUp")
        this.onPageUp(e);
      else if (i == 34 || n === "PageDown")
        this.onPageDown(e);
      else if (i == 8 || n === "Backspace")
        this.dispatchBeforeInput("deleteContentBackward", null, e) && (super.getSelectedRange() ? super.replaceSelectedWith("") : super.removeLeftOfCursor(), this.addState(this.text));
      else if (i == 46 || n === "Delete")
        this.dispatchBeforeInput("deleteContentForward", null, e) && (super.getSelectedRange() ? super.replaceSelectedWith("") : super.removeRightOfCursor(), this.addState(this.text));
      else if (e.ctrlKey || e.metaKey)
        if (i == 90 || n === "KeyZ") {
          const s = e.shiftKey ? 1 : -1;
          this.dispatchBeforeInput(s === 1 ? "historyRedo" : "historyUndo", null, e) && this.changeStateIndex(s);
        } else (i == 65 || n === "KeyA") && (e.preventDefault(), super.selectAll());
    }
    onKeyPress(e) {
      const i = e.keyCode ?? e.which, n = e.code;
      if (!(this.submitKeyCodes.includes(i) || this.submitKeyCodes.includes(n) || this.ignoreKeys.includes(i) || this.ignoreKeys.includes(n) || e.ctrlKey || e.metaKey)) {
        if (i != null) {
          const s = i === 13 ? `
` : String.fromCharCode(i);
          s && (e.preventDefault(), this.dispatchBeforeInput("insertText", s, e) && this.addState(super.replaceSelectedWith(s)));
        } else if (n) {
          const s = [
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
          ];
          n === "Enter" || e.key === "Enter" ? (e.preventDefault(), this.dispatchBeforeInput("insertText", `
`, e) && this.addState(super.replaceSelectedWith(`
`))) : s.includes(n) ? (e.preventDefault(), this.dispatchBeforeInput("deleteContentBackward", null, e) && this.addState(super.replaceSelectedWith(""))) : e.key && e.key.length === 1 && (e.preventDefault(), this.dispatchBeforeInput("insertText", e.key, e) && this.addState(super.replaceSelectedWith(e.key)));
        }
      }
    }
    addState(e) {
      this.textStates[this.currentStateIndex] !== e && (this.textStates.splice(this.currentStateIndex + 1), this.textStates.push(e), this.currentStateIndex = this.textStates.length - 1);
    }
  };
}
const je = () => {
  const r = typeof PIXI < "u" ? PIXI : null;
  if (!r)
    return;
  const t = r.utils;
  if (t && typeof t.isWebGLSupported == "function" && !t.isWebGLSupported()) {
    const e = r.settings, i = r.ENV;
    e && i && i.CANVAS && (e.PREFER_ENV = i.CANVAS);
  }
}, q = () => w() < 5 ? new PIXI.loaders.Loader() : new PIXI.Loader(), wt = () => {
  if (typeof PIXI > "u")
    throw new Error("PIXI is not available in the current environment. Please ensure PIXI is loaded and available globally/ on the window object before calling getPixiLoader.");
  const r = PIXI, t = (e) => e && typeof e.add == "function" && typeof e.load == "function";
  if (t(r.loader))
    return r.loader;
  if (r.Loader) {
    let e = null;
    if (t(r.Loader.shared))
      e = r.Loader.shared;
    else
      try {
        e = new r.Loader();
      } catch {
        e = null;
      }
    if (t(e))
      return r.loader = e, e;
  }
  if (r.loaders?.Loader)
    try {
      const e = new r.loaders.Loader();
      if (t(e))
        return r.loader = e, e;
    } catch {
    }
  if (r.Assets && typeof r.Assets.load == "function") {
    const e = [], n = (() => {
      try {
        return new URL(".", window.location.href).href;
      } catch {
        return window.location.href;
      }
    })(), s = (l) => {
      if (!l || typeof l != "string" || /^(?:[a-z]+:|\/\/)/i.test(l) || l.startsWith("data:") || l.startsWith("blob:"))
        return l;
      try {
        return new URL(l, n).toString();
      } catch {
        return l;
      }
    }, o = (l, h) => {
      if (!l)
        return null;
      if (typeof l == "string") {
        const d = s(l);
        if (h && typeof h == "object" && Object.keys(h).length) {
          const u = { ...h, src: d };
          return u.name && !u.alias && (u.alias = u.name), delete u.name, u;
        }
        return d;
      }
      if (typeof l == "object") {
        const d = { ...l };
        return h && typeof h == "object" && (d.data = h), d.resource && (d.src = s(d.resource), delete d.resource), d.url && (d.src = s(d.url), delete d.url), d.src && (d.src = s(d.src)), !d.src && d.alias && typeof d.alias == "string" && (d.src = s(d.alias)), !d.src && d.name && typeof d.name == "string" && (d.src = s(d.name)), d;
      }
      return l;
    }, a = {
      add(l, h) {
        return e.push({ resource: l, data: h }), a;
      },
      load(l) {
        if (!e.length)
          return typeof l == "function" && l(), a;
        const h = e.map(({ resource: d, data: u }) => o(d, u)).filter(Boolean).map((d) => r.Assets.load(d));
        return e.length = 0, Promise.all(h).catch((d) => {
          console.error("PIXI.Assets load failed", d);
        }).then(() => {
          typeof l == "function" && l();
        }), a;
      }
    };
    return r.loader = a, a;
  }
  throw new Error("Unable to resolve PIXI loader implementation.");
}, st = (r) => {
  if (!r || typeof PIXI > "u")
    return !1;
  const t = PIXI;
  if (r.type != null && t.RENDERER_TYPE) {
    const e = r.type, i = t.RENDERER_TYPE;
    if (e === i.CANVAS)
      return !1;
    if (e === i.WEBGL || e === i.WEBGL1 || e === i.WEBGL2)
      return !0;
  }
  return t.Renderer && r instanceof t.Renderer ? !(typeof t.CanvasRenderer < "u" && r instanceof t.CanvasRenderer) : t.CanvasRenderer && r instanceof t.CanvasRenderer ? !1 : !!(r.context?.gl || r.gl);
}, nt = (r) => {
  if (!r || typeof PIXI > "u")
    return !1;
  const t = PIXI;
  return r.type != null && t.RendererType ? r.type === t.RendererType.WEBGPU : t.WebGPURenderer && r instanceof t.WebGPURenderer ? !0 : !!r.gpu?.device;
}, v = (r) => typeof HTMLCanvasElement > "u" ? null : r instanceof HTMLCanvasElement ? r : null, T = (r) => typeof r == "number" && isFinite(r) ? r : void 0, N = (r) => r ? v(r.canvas) ?? v(r.view?.canvas) ?? v(r.view) ?? null : null, bt = (r) => {
  const t = r?.resolution;
  return typeof t == "number" && isFinite(t) && t > 0 ? t : 1;
}, Rt = (r, t) => {
  const e = r?.screen, i = T(e?.width), n = T(e?.height);
  if (i && n)
    return { width: i, height: n };
  const s = t ?? N(r), o = bt(r), a = T(s?.width), l = T(s?.height);
  return {
    width: a ? a / o : 0,
    height: l ? l / o : 0
  };
}, St = (r) => {
  const t = bt(r), e = N(r), i = {
    x: 1,
    y: 1,
    resolution: t,
    screenWidth: 0,
    screenHeight: 0,
    cssWidth: 0,
    cssHeight: 0
  };
  if (!e || typeof e.getBoundingClientRect != "function")
    return i;
  const n = e.getBoundingClientRect(), s = n.width, o = n.height;
  if (!s || !o)
    return i;
  const { width: a, height: l } = Rt(r, e);
  return !a || !l ? i : {
    x: a / s,
    y: l / o,
    resolution: t,
    screenWidth: a,
    screenHeight: l,
    cssWidth: s,
    cssHeight: o
  };
}, At = (r, t, e) => {
  const i = N(e);
  if (!i) return { x: r, y: t };
  const n = i.getBoundingClientRect(), s = St(e);
  return {
    x: (r - n.left) * s.x,
    y: (t - n.top) * s.y
  };
}, G = typeof WeakMap < "u" ? /* @__PURE__ */ new WeakMap() : null, Ct = (r) => {
  if (!G) return;
  const t = N(r);
  t && G.set(t, r);
}, Xt = (r) => !G || !r ? null : G.get(r) ?? null, Gt = (r) => {
  if (!r) return null;
  const t = typeof r.composedPath == "function" ? r.composedPath() : null;
  if (Array.isArray(t))
    for (const e of t) {
      const i = v(e);
      if (i) return i;
    }
  return v(r.target);
}, Ue = async (r = {}) => {
  const t = { ...r }, e = w();
  Wt();
  const i = t.view ?? t.canvas ?? t.canvasRef ?? null;
  i && (t.view = i), e >= 8 ? t.view && !t.canvas && (t.canvas = t.view) : "canvas" in t && delete t.canvas;
  const n = t.fallbackCanvas ?? null;
  delete t.fallbackCanvas;
  const s = v(n) ?? v(t.view), o = !!t.forceWebgl;
  delete t.forceWebgl;
  const a = !!t.forceWebgpu;
  if (delete t.forceWebgpu, o && a)
    throw new Error("forceWebgl and forceWebgpu are mutually exclusive.");
  if (a && e < 8)
    throw new Error("forceWebgpu requires PIXI v8 or later.");
  const l = t.configureView;
  delete t.configureView;
  const h = t.size || {};
  delete t.size;
  const d = T(h.width) ?? T(t.width), u = T(h.height) ?? T(t.height), c = l === void 0 ? d !== void 0 && u !== void 0 : !!l;
  let f;
  try {
    if (a) {
      const p = PIXI.WebGPURenderer;
      if (!p)
        throw new Error("forceWebgpu was requested, but this PIXI build has no WebGPURenderer.");
      const g = new p();
      f = g.init(t).then(() => g);
    } else
      f = PIXI.autoDetectRenderer(t);
  } catch (p) {
    throw console.error("Failed to create PIXI renderer synchronously", p), p;
  }
  try {
    const p = async (g) => {
      if (!g)
        throw new Error("PIXI failed to return a valid renderer.");
      if (o && !st(g))
        throw g?.destroy?.(!0), new Error("forceWebgl was requested, but PIXI failed to create a WebGL renderer.");
      if (a && !nt(g))
        throw g?.destroy?.(!0), new Error("forceWebgpu was requested, but PIXI failed to create a WebGPU renderer.");
      if (c && d !== void 0 && u !== void 0 && Nt(g, d, u, s), Vt(g), o && !st(g))
        throw g?.destroy?.(!0), new Error("forceWebgl was requested, but PIXI failed to maintain a WebGL renderer.");
      if (a && !nt(g))
        throw g?.destroy?.(!0), new Error("forceWebgpu was requested, but PIXI failed to maintain a WebGPU renderer.");
      return Ct(g), g;
    };
    if (f && typeof f.then == "function") {
      const g = await f;
      return p(g);
    }
    return p(f);
  } catch (p) {
    throw console.error("Failed to initialize PIXI renderer", p), p;
  }
};
let ot = !1;
const Wt = () => {
  if (ot || typeof PIXI > "u")
    return;
  const r = PIXI, t = [r?.Renderer, r?.WebGLRenderer, r?.WebGPURenderer].map((l) => l?.prototype).filter((l) => !!l && typeof l._addSystem == "function");
  if (!t.length)
    return;
  ot = !0;
  const e = (l) => {
    if (!l || typeof l != "object")
      return;
    let h = l;
    for (; h; ) {
      const d = Object.getOwnPropertyDescriptor(h, "value");
      if (d)
        return d;
      h = Object.getPrototypeOf(h);
    }
  }, i = (l) => l ? l.get || l.set ? !0 : !!l.value : !1, n = (l) => l ? typeof l != "object" ? !0 : i(e(l)) : !1, s = (l, h) => {
    if (!l || typeof l != "object")
      return {
        index: h,
        name: l?.name ?? "unnamed",
        kind: typeof l,
        hasValueProperty: !1,
        valueKind: "missing"
      };
    const d = e(l), u = !!d, c = !!(d?.get || d?.set), f = {
      index: h,
      name: l.name ?? "unnamed",
      keys: Object.keys(l),
      hasValueProperty: u,
      valueKind: c ? "accessor" : u ? "literal" : "missing"
    };
    return u && !c ? f.valueType = typeof d?.value : c && (f.valueType = "accessor"), f;
  }, o = (l) => {
    if (Array.isArray(l))
      return l.find((h) => !n(h));
  }, a = (l, h) => {
    if (!(!Array.isArray(l) || !h))
      return l.find((d) => d?.name === h);
  };
  for (const l of t) {
    if (!l.__pixiDomPatchedAddSystems && typeof l._addSystems == "function" && (l._addSystems = function(u) {
      let c = u;
      if (Array.isArray(c)) {
        const p = c.filter((m) => !n(m));
        p.length && typeof console < "u" && console.warn("[PixiDom] Filtering invalid PIXI renderer systems", p.map((m, x) => s(m, x))), c = c.filter((m) => n(m));
        const g = c.filter((m) => !n(m));
        g.length && typeof console < "u" && console.warn("[PixiDom] Invalid PIXI renderer systems remain after filtering", g.map((m, x) => s(m, x)));
      } else if (c instanceof Map) {
        let p = !1;
        const g = /* @__PURE__ */ new Map();
        c.forEach((m, x) => {
          n(m) ? g.set(x, m) : p = !0;
        }), p && (c = g);
      } else if (c && typeof c == "object") {
        let p = !1;
        const g = Object.create(Object.getPrototypeOf(c) ?? Object.prototype);
        for (const m of Object.keys(c)) {
          const x = c[m];
          n(x) ? g[m] = x : p = !0;
        }
        p && (c = g);
      }
      const f = Array.isArray(c) ? c : c instanceof Map ? Array.from(c.values()) : c && typeof c == "object" ? Object.keys(c).map((p) => c[p]) : c ? [c] : [];
      for (const p of f) {
        if (!p || typeof p != "object" || !n(p))
          continue;
        const g = e(p);
        let m;
        if (g?.get || g?.set)
          try {
            m = p.value;
          } catch (b) {
            typeof console < "u" && console.warn("[PixiDom] Unable to resolve PIXI renderer system via accessor", {
              entry: s(p),
              error: b
            });
            continue;
          }
        else
          m = g?.value;
        if (!m) {
          typeof console < "u" && console.warn("[PixiDom] Skipping PIXI renderer system without constructor", s(p));
          continue;
        }
        const x = typeof p.name == "string" ? p.name : "";
        this._addSystem(m, x);
      }
      return this;
    }, Object.defineProperty(l, "__pixiDomPatchedAddSystems", {
      value: !0,
      enumerable: !1,
      configurable: !0
    })), l.__pixiDomPatchedAddSystem)
      continue;
    const h = l._addSystem;
    l._addSystem = function(u, c) {
      if (!u) {
        const f = this?.config?.name ?? "unknown", p = Array.isArray(this?.config?.systems) ? this.config.systems.map((j) => j?.name ?? "unnamed") : void 0, g = o(this?.config?.systems), m = Array.isArray(p) ? p.filter(Boolean).join(", ") : "unknown", x = a(this?.config?.systems, c), b = `PIXI renderer missing system "${c ?? "unknown"}" (${f}). Registered systems: ${m}`;
        throw console.error(b, {
          rendererName: f,
          registeredSystems: p,
          missingEntry: g ? s(g) : void 0,
          systemEntryDetails: x ? s(x) : void 0
        }), new Error(b);
      }
      return h.call(this, u, c);
    }, Object.defineProperty(l, "__pixiDomPatchedAddSystem", {
      value: !0,
      enumerable: !1,
      configurable: !0
    });
  }
}, Nt = (r, t, e, i) => {
  if (!r)
    return;
  if (w(), typeof r.resize == "function") {
    const s = () => r.resize(t, e), o = () => r.resize({ width: t, height: e });
    try {
      s();
    } catch {
      try {
        o();
      } catch (l) {
        console.warn("PIXI renderer resize failed", l);
      }
    }
  }
  const n = r.canvas || r.view?.canvas || r.view || i;
  if (n && (n.width = t, n.height = e, n.style && (n.style.width = `${t}px`, n.style.height = `${e}px`)), i && i !== n && (i.width = t, i.height = e, i.style && (i.style.width = `${t}px`, i.style.height = `${e}px`), n instanceof HTMLCanvasElement)) {
    n.id = i.id || n.id;
    const s = i.parentNode;
    s && n.parentNode !== s && s.replaceChild(n, i);
  }
}, lt = "__pixiDomViewCompatApplied", Vt = (r) => {
  if (!r)
    return;
  const t = r.view;
  if (v(t) || !t || typeof t != "object" || t[lt])
    return;
  const i = v(t.canvas);
  if (!i)
    return;
  const n = (s) => {
    if (typeof t[s] == "function")
      return;
    const o = i[s];
    typeof o == "function" && Object.defineProperty(t, s, {
      value: (...a) => o.apply(i, a),
      configurable: !0
    });
  };
  ["addEventListener", "removeEventListener", "dispatchEvent", "getBoundingClientRect", "focus", "blur"].forEach(n), Object.defineProperty(t, lt, {
    value: !0,
    enumerable: !1,
    configurable: !0
  });
}, Ye = (r, t, e = {}) => {
  if (!r || !t)
    return;
  const i = w(), n = e.clear ?? !0, s = r.render;
  if (typeof s == "function") {
    i >= 8 ? s.call(r, { container: t, clear: n }) : i >= 7 && s.length > 1 ? s.call(r, t, { clear: n }) : s.call(r, t);
    return;
  }
  s && typeof s.render == "function" && (i >= 8 ? s.render({ container: t, clear: n }) : i >= 7 && s.render.length > 1 ? s.render(t, { clear: n }) : s.render(t));
}, L = (r) => typeof r != "number" || !isFinite(r) ? 1 : r < 0 ? 0 : r > 1 ? 1 : r, B = (r, t = 0) => typeof r == "number" && isFinite(r) ? r : t, M = (r, t = 16777215) => typeof r != "number" || !isFinite(r) ? F(t) : F(r), D = (r) => {
  const t = "__pixiDomGraphicsState";
  return r[t] || (r[t] = { fill: null, stroke: null, lastPoint: null }), r[t];
}, R = (r, t, e = {}) => {
  if (!t || typeof t != "object")
    return;
  const i = D(r);
  !e.skipFill && i.fill && typeof t.fill == "function" && t.fill({ color: i.fill.color, alpha: i.fill.alpha }), i.stroke && i.stroke.width > 0 && typeof t.stroke == "function" && t.stroke({
    color: i.stroke.color,
    alpha: i.stroke.alpha,
    width: i.stroke.width,
    alignment: i.stroke.alignment,
    cap: i.stroke.cap,
    join: i.stroke.join,
    miterLimit: i.stroke.miterLimit
  });
}, zt = () => {
  if (typeof PIXI > "u" || w() < 8)
    return !1;
  const e = PIXI.Graphics;
  if (!e || !e.prototype)
    return !1;
  const i = e.prototype;
  if (i.__pixiDomGraphicsCompatApplied)
    return !0;
  i.__pixiDomGraphicsCompatApplied = !0;
  const n = typeof i.clear == "function" ? i.clear : null;
  return i.clear = function(...s) {
    const o = D(this);
    return o.fill = null, o.stroke = null, o.lastPoint = null, n ? n.apply(this, s) : this;
  }, i.beginFill = function(s, o) {
    const a = D(this);
    if (typeof s == "object" && s !== null) {
      const l = s;
      a.fill = {
        color: M(l.color),
        alpha: L(l.alpha ?? o ?? 1)
      };
    } else
      a.fill = {
        color: M(s),
        alpha: L(typeof o == "number" ? o : 1)
      };
    return this;
  }, i.endFill = function() {
    const s = D(this);
    return s.fill = null, this;
  }, i.lineStyle = function(s, o, a, l) {
    const h = D(this);
    if (typeof s == "object" && s !== null) {
      const u = s, c = B(u.width, 0);
      return c <= 0 ? h.stroke = null : h.stroke = {
        width: c,
        color: M(u.color ?? o),
        alpha: L(u.alpha ?? a ?? 1),
        alignment: B(u.alignment ?? l, 0.5),
        cap: u.cap,
        join: u.join,
        miterLimit: typeof u.miterLimit == "number" && isFinite(u.miterLimit) ? u.miterLimit : void 0
      }, this;
    }
    const d = B(s, 0);
    return d <= 0 ? (h.stroke = null, this) : (h.stroke = {
      width: d,
      color: M(o),
      alpha: L(typeof a == "number" ? a : 1),
      alignment: B(l, 0.5)
    }, this);
  }, i.drawRect = function(s = 0, o = 0, a = 0, l = 0) {
    if (typeof this.rect == "function") {
      const h = this.rect(s, o, a, l);
      R(this, h);
    }
    return this;
  }, i.drawRoundedRect = function(s = 0, o = 0, a = 0, l = 0, h = 0) {
    if (typeof this.roundRect == "function") {
      const d = this.roundRect(s, o, a, l, h);
      R(this, d);
    }
    return this;
  }, i.drawCircle = function(s = 0, o = 0, a = 0) {
    if (typeof this.circle == "function") {
      const l = this.circle(s, o, a);
      R(this, l);
    }
    return this;
  }, i.moveTo = function(s = 0, o = 0) {
    const a = D(this);
    return a.lastPoint = { x: s, y: o }, this;
  }, i.lineTo = function(s = 0, o = 0) {
    const a = D(this);
    if (!a.lastPoint || typeof this.poly != "function")
      return a.lastPoint = { x: s, y: o }, this;
    const l = a.lastPoint, h = this.poly([l.x, l.y, s, o], { close: !1 });
    return R(this, h, { skipFill: !0 }), a.lastPoint = { x: s, y: o }, this;
  }, !0;
};
let at = !1;
const jt = () => {
  at || (at = zt());
}, w = () => parseFloat(PIXI.VERSION), vt = (r, t, e, i, n, s = 16777215, o = 1) => {
  const a = w(), l = r;
  return a >= 8 ? typeof l.rect == "function" && l.rect(t, e, i, n).fill({ color: s, alpha: o }) : (l.beginFill(s, o), l.drawRect(t, e, i, n), l.endFill()), r;
}, It = (r) => {
  if (typeof r == "number" && isFinite(r))
    return r;
  if (typeof r == "string")
    try {
      return y(r).value;
    } catch {
      return null;
    }
  return null;
}, _t = (r) => `#${("000000" + F(r).toString(16)).slice(-6)}`, Ut = () => {
  const r = PIXI;
  if (w() < 6) {
    const e = r.extras?.BitmapText ?? r?.extras?.BitmapText;
    if (e)
      return e;
  }
  return r.BitmapText ?? r.extras?.BitmapText ?? r?.extras?.BitmapText ?? null;
}, I = (r) => typeof r == "string" ? r.split(",")[0].trim().replace(/^['"]+|['"]+$/g, "").trim() || null : typeof r == "number" && isFinite(r) ? String(r) : null, ht = (r, t) => {
  !r || !t || ["fontFamily", "fontName", "font"].forEach((e) => {
    const i = r[e];
    if (!i) {
      r[e] = t;
      return;
    }
    if (typeof i == "string") {
      if (i === t)
        return;
      const n = I(i);
      (!n || n === t) && (r[e] = t);
      return;
    }
    if (Array.isArray(i) && i.length) {
      const n = I(i[0]);
      (!n || n === t) && (r[e] = t);
    }
  });
}, V = (r) => {
  if (!r || typeof PIXI > "u")
    return null;
  const t = PIXI, e = t?.Cache, i = `${r}-bitmap`;
  if (e) {
    if (typeof e.get == "function" && e.has?.(i))
      try {
        const s = e.get(i);
        if (s)
          return s;
      } catch {
      }
    else if (i in e) {
      const s = e[i];
      if (s)
        return s;
    }
  }
  const n = t?.BitmapFont?.available;
  if (n) {
    if (n instanceof Map) {
      if (n.has(r))
        return n.get(r);
    } else if (typeof n == "object" && r in n)
      return n[r];
  }
  return null;
}, Z = (r) => {
  if (!r)
    return null;
  const t = V(r);
  if (!t)
    return null;
  const e = [
    t.baseRenderedFontSize,
    t.baseFontSize,
    t.fontSize,
    t.size,
    t.common?.lineHeight
  ];
  for (const i of e)
    if (typeof i == "number" && isFinite(i) && i > 0)
      return i;
  return null;
}, Yt = (r) => {
  if (typeof r == "number" && isFinite(r) && r > 0)
    return r;
  if (typeof r == "string") {
    const t = parseFloat(r);
    if (isFinite(t) && t > 0)
      return t;
  }
  return null;
}, $t = (r) => {
  if (!r)
    return null;
  const t = [
    r.baseMeasurementFontSize,
    r.fontMetrics?.fontSize,
    r.fontSize,
    r.size
  ];
  for (const e of t)
    if (typeof e == "number" && isFinite(e) && e > 0)
      return e;
  return null;
}, Kt = (r, t) => {
  if (!r)
    return null;
  const e = V(r);
  if (!e)
    return null;
  const i = typeof e.baseLineOffset == "number" ? e.baseLineOffset : null;
  if (!i || !isFinite(i) || i === 0)
    return null;
  const n = $t(e), s = Yt(t?.fontSize) ?? Z(r) ?? n;
  return n && s && n > 0 ? i * (s / n) : i;
}, Qt = (r) => {
  if (r == null)
    return !0;
  if (typeof r != "string")
    return !1;
  const t = r.trim().toLowerCase();
  return t === "top" || t === "hanging";
}, qt = (r, t) => {
  if (!r || !t)
    return;
  const e = t.textBaseline;
  if (!Qt(e))
    return;
  const i = I(t.fontFamily ?? t.fontName ?? t.font), n = Kt(i, t);
  if (!n)
    return;
  const s = r;
  if (s.__pixiDomBaselined)
    return;
  const o = s.pivot;
  if (o && typeof o.y == "number")
    o.y += n;
  else if (o && typeof o.set == "function") {
    const a = typeof o.x == "number" ? o.x : 0, l = typeof o.y == "number" ? o.y : 0;
    o.set(a, l + n);
  } else typeof s.pivotY == "number" && (s.pivotY += n);
  s.__pixiDomBaselined = !0;
}, Tt = (r) => {
  if (!r || typeof PIXI > "u")
    return;
  const e = PIXI?.Cache;
  if (!(e && typeof e.has == "function" && typeof e.get == "function" && typeof e.set == "function"))
    return;
  const n = I(r.fontFamily ?? r.fontName ?? r.font), s = r._fill?.fill ?? null;
  if (!n || !s)
    return;
  const o = s.uid ?? s.id ?? s.value ?? null;
  if (o == null)
    return;
  const a = `${n}-bitmap`, l = `${a}${o}`;
  if (!(e.has(l) || !e.has(a)))
    try {
      const h = e.get(a);
      h && e.set(l, h);
    } catch {
    }
}, it = () => {
  if (typeof PIXI > "u")
    return;
  const r = PIXI, t = r?.BitmapFontManager, e = r?.Cache, i = e && typeof e.has == "function" && typeof e.get == "function" && typeof e.set == "function";
  if (!t || typeof t.getFont != "function" || t.__pixiDomCachePatched || !i)
    return;
  const n = t.getFont.bind(t);
  t.getFont = function(o, a) {
    if (a) {
      const l = I(a.fontFamily ?? a.fontName ?? a.font), h = a._fill?.fill ?? null, d = h?.uid ?? h?.id ?? h?.value ?? null;
      if (l) {
        const u = `${l}-bitmap`;
        if (e.has(u)) {
          ht(a, l);
          const c = e.get(u);
          if (c) {
            if (d != null) {
              const f = `${u}${d}`;
              if (!e.has(f))
                try {
                  e.set(f, c);
                } catch {
                }
            }
            return c;
          }
        }
      }
      if (l && d != null) {
        const u = `${l}-bitmap`, c = `${u}${d}`;
        if (!e.has(c) && e.has(u))
          try {
            const f = e.get(u);
            f && (ht(a, l), e.set(c, f));
          } catch {
          }
      }
    }
    return n(o, a);
  }, Object.defineProperty(t, "__pixiDomCachePatched", {
    value: !0,
    enumerable: !1,
    configurable: !1
  });
}, H = (r, t) => {
  it();
  const e = Ut();
  if (!e)
    throw new Error("PIXI.BitmapText is not available in this PIXI build.");
  let i = t;
  if (t && typeof t == "object") {
    i = { ...t }, i.font && !i.fontName && (i.fontName = i.font), i.fontName && !i.font && (i.font = i.fontName);
    const l = i.fontName || i.font || i.fontFamily;
    l && (i.fontName || (i.fontName = l), i.font || (i.font = l), i.fontFamily || (i.fontFamily = l));
  }
  const n = w(), s = i;
  let o = null;
  if (n >= 8 && s) {
    const l = s;
    (l.fill === void 0 || l.fill === null) && (l.fill = "#ffffff");
    const h = l.tint ?? l.fill;
    if (o = It(h), l.tint == null && o != null && (l.tint = o), l.textBaseline == null && (l.textBaseline = "top"), l.fontSize == null || !isFinite(l.fontSize)) {
      const d = I(l.fontFamily ?? l.fontName ?? l.font), u = Z(d);
      u != null && (l.fontSize = u);
    }
  }
  const a = n >= 8 ? new e({ text: r, style: s ?? i }) : new e(r, i);
  if (n >= 8) {
    const l = a;
    if (o != null) {
      typeof l.tint < "u" && (l.tint = o);
      const u = l.style ?? l._style;
      if (u && typeof u == "object")
        try {
          u.fill = _t(o);
        } catch {
        }
      W(a).forEach((c) => {
        const f = c;
        f && typeof f.tint < "u" && (f.tint = o);
      });
    }
    const h = a.style ?? a._style ?? i, d = h && (h.fontSize == null || !isFinite(h.fontSize));
    if (h && h.textBaseline == null && (h.textBaseline = "top"), d) {
      const u = I(
        h.fontFamily ?? h.fontName ?? h.font ?? s?.fontFamily ?? s?.fontName ?? s?.font
      ), c = Z(u);
      if (c != null)
        try {
          h.fontSize = c;
        } catch {
          h._fontSize = c, typeof h.onUpdate == "function" && h.onUpdate();
        }
    }
    Tt(h), qt(a, h ?? s ?? i);
  }
  return a;
}, Zt = (r) => {
  const t = r, e = t.text ?? "";
  if (!e || typeof e != "string")
    return [];
  const i = t.style ?? t._style ?? {}, n = I(
    i.fontFamily ?? i._fontFamily ?? i.fontName ?? i.font ?? t._fontFamily ?? t.fontName ?? t.font
  );
  if (!n)
    return [];
  const s = V(n);
  if (!s || !s.chars)
    return [];
  const o = s.baseMeasurementFontSize ?? s.baseRenderedFontSize ?? s.fontSize ?? s.size ?? 16, l = (i.fontSize ?? o) / o, h = [];
  let d = 0, u = null;
  const c = (f, p) => f instanceof Map ? f.get(p.charCodeAt(0)) ?? f.get(p) : f[p] ?? f[p.charCodeAt(0)];
  for (let f = 0; f < e.length; f++) {
    const p = e[f], g = c(s.chars, p);
    if (!g) {
      const rt = 8 * l;
      h.push({
        x: d,
        y: 0,
        width: rt,
        height: o * l,
        char: p
      }), d += rt, u = p;
      continue;
    }
    const m = g.kerning && u && g.kerning[u] || 0;
    d += m * l;
    const x = (g.texture?.frame?.width ?? g.width ?? g.xAdvance ?? 8) * l, b = (g.texture?.frame?.height ?? g.height ?? o) * l, j = (g.xOffset ?? 0) * l, Ft = (g.yOffset ?? 0) * l, Et = (g.xAdvance ?? x) * l;
    h.push({
      x: d + j,
      y: Ft,
      width: x,
      height: b,
      char: p
    }), d += Et, u = p;
  }
  return h;
}, W = (r) => {
  if (!r)
    return [];
  const t = r;
  if (w() < 7) {
    const n = t.glyphs ?? t._glyphs ?? t.children ?? [];
    if (Array.isArray(n) && n.length > 0)
      return n.filter(Boolean);
    if (typeof n.values == "function") {
      const s = Array.from(n.values());
      if (s.length > 0)
        return s.filter(Boolean);
    }
    if (typeof n.forEach == "function") {
      const s = [];
      if (n.forEach((o) => {
        o && s.push(o);
      }), s.length > 0)
        return s;
    }
  }
  return Zt(r);
}, Jt = (r, t) => {
  const e = I(r), i = V(e);
  if (!i || !i.chars)
    return null;
  const n = i.baseMeasurementFontSize ?? i.baseRenderedFontSize ?? i.fontSize ?? i.size ?? 16, o = (t ?? n) / n, a = i.lineHeight ?? i.common?.lineHeight ?? n, l = i.chars, h = (d) => l instanceof Map ? l.get(d.charCodeAt(0)) ?? l.get(d) : l[d] ?? l[d.charCodeAt(0)];
  return {
    lineHeight: a * o,
    measure: (d, u) => {
      const c = h(d);
      if (!c)
        return 8 * o;
      const f = c.kerning && u && c.kerning[u] || 0;
      return ((c.xAdvance ?? c.texture?.frame?.width ?? c.width ?? 8) + f) * o;
    }
  };
}, E = (r, t) => {
  if (it(), !r)
    return;
  const e = It(t);
  if (e == null)
    return;
  const i = r;
  if (typeof i.tint < "u" && (i.tint = e), w() >= 8) {
    const s = i.style ?? i._style;
    if (s && typeof s == "object")
      try {
        s.fill = _t(e);
      } catch {
      }
    Tt(s);
    const o = W(r);
    o.length && o.forEach((a) => {
      const l = a;
      l && typeof l.tint < "u" ? l.tint = e : l?.style && typeof l.style == "object" && "fill" in l.style && (l.style.fill = e);
    });
  }
}, te = () => {
  const r = PIXI;
  return r.BitmapFont?.available ?? r.BitmapFont?.fonts ?? r.extras?.BitmapText?.fonts ?? r.extras?.BitmapFont?.available ?? null;
}, ee = (r) => {
  const t = te();
  if (t) {
    if (t instanceof Map) {
      if (t.has(r))
        return !0;
    } else if (t instanceof Set) {
      if (t.has(r))
        return !0;
    } else if (typeof t == "object" && Object.prototype.hasOwnProperty.call(t, r) && t[r])
      return !0;
  }
  const e = PIXI, i = `${r}-bitmap`, n = e.Cache;
  return !!(n && (typeof n.has == "function" && n.has(i) || typeof n == "object" && i in n && n[i]));
};
if (typeof PIXI < "u")
  try {
    it();
  } catch (r) {
    typeof console < "u" && console.warn && console.warn("[PixiDom] Failed to eagerly patch BitmapFontManager cache", r);
  }
const J = (r, t) => !Number.isFinite(r) || r < 0 ? 0 : r > t ? t : Math.floor(r);
function ie(r, t) {
  const { measure: e, lineHeight: i, wrapWidth: n } = t, s = [], o = (h, d, u) => {
    const c = [0];
    let f = 0, p = null;
    for (const g of d)
      f += e(g, p), c.push(f), p = g;
    s.push({
      start: h,
      text: d,
      y: s.length * i,
      positions: c,
      width: f,
      hardBreak: u
    });
  }, a = r.split(`
`);
  let l = 0;
  for (const h of a) {
    if (n === void 0 || h.length === 0)
      o(l, h, !0);
    else {
      let d = 0, u = 0, c = null, f = -1;
      for (let p = 0; p < h.length; p++) {
        const g = h[p], m = e(g, c);
        if (u + m > n && p > d) {
          const x = f >= d ? f + 1 : p;
          o(l + d, h.slice(d, x), !1), d = x, f = -1, c = null, u = 0;
          for (let b = d; b < p; b++)
            u += e(h[b], c), c = h[b];
          u += e(g, c);
        } else
          u += m;
        g === " " && (f = p), c = g;
      }
      o(l + d, h.slice(d), !0);
    }
    l += h.length + 1;
  }
  return {
    text: r,
    lines: s,
    lineHeight: i,
    width: s.reduce((h, d) => Math.max(h, d.width), 0),
    height: s.length * i
  };
}
function z(r, t) {
  for (let e = 0; e < r.length - 1; e++) {
    const i = (r[e] + r[e + 1]) / 2;
    if (t < i)
      return e;
  }
  return r.length - 1;
}
function ct(r) {
  if (!r.length)
    return [0];
  const t = [0];
  for (let i = 1; i < r.length; i++)
    t.push(r[i].x);
  const e = r[r.length - 1];
  return t.push(e.x + e.width), t;
}
const re = (r, t) => {
  let e = 0;
  for (let i = 0; i < r.lines.length && r.lines[i].start <= t; i++)
    e = i;
  return e;
};
function C(r, t) {
  const e = J(t, r.text.length), i = re(r, e), n = r.lines[i], s = Math.min(e - n.start, n.text.length);
  return {
    line: i,
    col: s,
    x: n.positions[s],
    y: n.y
  };
}
function se(r, t, e) {
  const i = Math.max(
    0,
    Math.min(r.lines.length - 1, Math.floor(e / r.lineHeight))
  ), n = r.lines[i];
  return n.start + z(n.positions, t);
}
function ne(r, t, e, i) {
  const n = C(r, t), s = n.line + e;
  if (s < 0)
    return 0;
  if (s >= r.lines.length)
    return r.text.length;
  const o = r.lines[s];
  return o.start + z(o.positions, i ?? n.x);
}
function oe(r, t, e, i) {
  const n = C(r, t), s = Math.max(0, Math.min(r.lines.length - 1, n.line + e)), o = r.lines[s];
  return o.start + z(o.positions, i ?? n.x);
}
function le(r, t) {
  const e = C(r, t), i = r.lines[e.line];
  return { start: i.start, end: i.start + i.text.length };
}
function ae(r, t, e) {
  const i = J(Math.min(t, e), r.text.length), n = J(Math.max(t, e), r.text.length), s = [];
  if (i === n)
    return s;
  for (const o of r.lines) {
    const a = Math.max(0, Math.min(i - o.start, o.text.length)), l = Math.max(0, Math.min(n - o.start, o.text.length));
    l > a && s.push({
      x: o.positions[a],
      y: o.y,
      width: o.positions[l] - o.positions[a],
      height: r.lineHeight
    });
  }
  return s;
}
const he = function() {
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
}, ce = 0, de = 16777215, ue = ["width", "height", "cursorHeight"], fe = /* @__PURE__ */ new Set([
  "borderColor",
  "fontColor",
  "highlightedFontColor",
  "cursorColor",
  "backgroundColor",
  "highlightedBackgroundColor"
]);
class pe extends PIXI.Container {
  /**
   * Creates a new TextField instance.
   * @param font - The name of the bitmap font to use
   * @param styleOptions - Optional styling configuration
   * @param maxCharacterLength - Optional maximum number of characters allowed
   * @param ignoreKeys - Optional array of key codes to ignore
   */
  constructor(t, e, i, n) {
    super(), this.styleOptions = {}, this.cursorSprite = new PIXI.Graphics(), this.textbox = new PIXI.Graphics(), this.textboxMask = new PIXI.Graphics(), this.inFocus = !1, this.cursorIndex = -1, this.clickedTimestamp = 0, this.cursorAnimationFrame = null, this.lastCursorTs = Date.now(), this.accCursorTime = 0, this.toggleCursorTime = 500, this.cursorIsVisible = !0, this._text = "", this.overflowOffsetX = 0, this.overflowOffsetY = 0, this.dragIndexStart = 0, this.dragIndexEnd = 0, this.inDrag = !1, this.submitKeyCodes = [13, "Enter"], this.ignoreKeys = [], this._maxCharacterLength = null, this.onFocusHandler = () => {
    }, this.onBlurHandler = () => {
    }, this.onChangeHandler = () => {
    }, this.onSubmitHandler = () => {
    }, this.onCharLimitHandler = () => {
    }, this.checkForOutsideClick = this.checkForOutsideClick.bind(this);
    const s = this.destroy.bind(this);
    this.destroy = (a) => {
      this.blur(), s(a);
    }, n && (this.ignoreKeys = n);
    const o = { ...he() };
    e && Object.keys(e).forEach((a) => {
      o[a] = e[a];
    }), this.maxCharacterLength = i ?? -1, this.buttonMode = !0, this.interactive = !0, this.textSprite = H("", { font: t, align: "left" }), this.cursor = "text", this.on("pointerdown", this.handleMouseDown.bind(this)), this.on("pointerup", this.handleMouseUp.bind(this)), this.on("pointermove", this.handleMouseMove.bind(this)), this.on("pointerupoutside", this.handleMouseUp.bind(this)), this.addChild(this.textboxMask), this.addChild(this.textbox), this.addChild(this.textSprite), this.addChild(this.cursorSprite), this.textSprite.mask = this.textboxMask, this.updateStyle(o), this.show();
  }
  updateStyle(t) {
    const e = this.styleOptions, i = t;
    for (const n in t)
      if (ue.includes(n)) {
        const s = tt(i[n]);
        if (!s.valid)
          throw new Error(`Error for passed in style: ${n}, ${s.error}`);
        e[n] = { value: s.value, type: s.type };
      } else if (fe.has(n)) {
        const s = i[n];
        s != null && (e[n] = y(s));
      } else
        e[n] = i[n];
    this.styleOptions.fontColor ??= y(ce), this.styleOptions.highlightedFontColor ??= y(de), this.redraw();
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
    this.cursorSprite.clear();
    const e = this.styleOptions.cursorColor;
    this.cursorSprite.lineStyle(this.styleOptions.cursorWidth, e.value, e.alpha);
    const { value: i, type: n } = this.styleOptions.cursorHeight, s = n === "pixel" ? i : Math.round(this.textbox.height * (i / 100)), o = (this.textbox.height - s) / 2;
    this.cursorSprite.moveTo(t, o).lineTo(t, o + s), this.getSelectedRange() ? (this.cursorIsVisible = !1, this.cursorSprite.visible = !1) : (this.cursorIsVisible = !0, this.cursorSprite.visible = !0);
  }
  redrawText() {
    const t = this.getSelectedRange();
    this.textSprite.y = this.styleOptions.yPadding, this.textSprite.x = this.styleOptions.xPadding;
    const e = this.getCursorXFromIndex(this.dragIndexEnd), { value: i, type: n } = this.styleOptions.width, s = window.innerWidth, o = n === "pixel" ? i : s * (i / 100);
    e > o + this.overflowOffsetX ? (this.overflowOffsetX = e - o, this.textSprite.x -= this.overflowOffsetX) : e > o ? e < o + this.overflowOffsetX ? (e < this.overflowOffsetX && (this.overflowOffsetX -= this.overflowOffsetX - e), this.textSprite.x -= this.overflowOffsetX) : this.textSprite.x -= this.overflowOffsetX : this.overflowOffsetX = 0;
    const a = W(this.textSprite), l = this.styleOptions.fontColor.value, h = this.styleOptions.highlightedFontColor.value;
    if (t) {
      const { indexes: d } = t, { start: u, end: c } = d, f = Math.max(0, Math.min(u, a.length)), p = Math.max(f, Math.min(c, a.length));
      if (a.length > 0 && typeof a[0]?.tint < "u")
        for (let m = 0; m < a.length; m++) {
          const x = a[m];
          x && typeof x.tint < "u" && (x.tint = m >= f && m < p ? h : l);
        }
      else
        E(this.textSprite, h);
    } else
      E(this.textSprite, l);
  }
  redrawTextbox() {
    this.textbox.clear();
    const t = this.styleOptions.backgroundColor;
    if (this.textbox.beginFill(t.value, t.alpha), this.styleOptions.borderWidth > 0 && !Number.isNaN(this.styleOptions.borderWidth)) {
      const h = this.styleOptions.borderColor, d = (h?.alpha ?? 1) * (this.styleOptions.borderOpacity ?? 1);
      this.textbox.lineStyle(this.styleOptions.borderWidth, h?.value ?? 0, d);
    }
    let { value: e, type: i } = this.styleOptions.height;
    const n = window.innerWidth, s = window.innerHeight, o = i === "pixel" ? e : s * (e / 100);
    ({ value: e, type: i } = this.styleOptions.width);
    const a = i === "pixel" ? e : n * (e / 100), l = this.getSelectedRange();
    if (this.textbox.drawRect(0, 0, a, o), this.textbox.endFill(), l) {
      let h = l.x.start - this.overflowOffsetX;
      const d = l.x.end - this.overflowOffsetX, u = this.styleOptions.highlightedBackgroundColor;
      this.textbox.beginFill(u.value, u.alpha);
      let c = d - h;
      h + c >= a ? c = a - h : c = d - h, h + c === a && c > a && (h = 0, c = a), this.textbox.drawRect(h, 0, c, o), this.textbox.endFill();
    }
    this.textboxMask.clear(), vt(this.textboxMask, 0, 0, a, o, 16777215, 1);
  }
  getEventLocalX(t) {
    const e = t.data;
    if (e && typeof e.getLocalPosition == "function")
      return e.getLocalPosition(this).x;
    const i = t;
    return typeof i.getLocalPosition == "function" ? i.getLocalPosition(this).x : 0;
  }
  handleMouseUp(t) {
    const e = this.getEventLocalX(t);
    this.inDrag && (this.cursorIndex = this.getCursorIndexFromX(e), this.handleRangeFinish());
  }
  handleMouseDown(t) {
    const e = t;
    this.clickedTimestamp = e.nativeEvent?.timeStamp ?? e.data?.originalEvent?.timeStamp ?? 0;
    const i = this.getEventLocalX(t);
    this.inFocus || this.focus(), this.clearRange(), this.cursorIndex = this.getCursorIndexFromX(i), this.handleRangeStart(this.cursorIndex), this.redraw();
  }
  handleMouseMove(t) {
    if (this.inDrag) {
      const e = this.getEventLocalX(t);
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
    const e = this.getGlyphs(), i = this.styleOptions.xPadding ?? 0;
    if (!e.length || t <= 0)
      return i;
    const n = ct(e), s = Math.min(t, n.length - 1);
    return n[s] + 1 + i;
  }
  setCursor(t) {
    t > -1 && t <= this.text.length && (this.cursorIndex = t, this.clearRange(), this.redraw());
  }
  moveCursor(t) {
    const e = this.cursorIndex + t;
    e > -1 && e <= this.text.length && (this.cursorIndex = e, this.clearRange(), this.redraw());
  }
  getCursorIndexFromX(t) {
    if (t += this.overflowOffsetX, t <= 0)
      return 0;
    const e = this.getGlyphs();
    return e.length ? z(ct(e), t) : 0;
  }
  getSelectedChars() {
    const t = this.getSelectedRange();
    if (!t) return "";
    const { indexes: e } = t, { start: i, end: n } = e;
    return this.text.substr(i, n - i);
  }
  replaceSelectedWith(t) {
    const e = t.split(""), i = e.length, n = this.text.split("");
    let s, o;
    const a = this.getSelectedRangeIndexes();
    a ? (s = a.start, o = a.end) : s = o = this.cursorIndex;
    const l = o - s;
    return n.splice(s, l, ...e), this._change(n.join("")) ? (this.cursorIndex = s + i, this.clearRange(), this.redraw(), this.text) : this.text;
  }
  getSelectedRangeIndexes() {
    const t = this.getSelectedRange();
    return t ? { start: t.indexes.start, end: t.indexes.end } : null;
  }
  getSelectedRange() {
    const t = Math.min(this.dragIndexStart, this.dragIndexEnd), e = Math.max(this.dragIndexStart, this.dragIndexEnd);
    if (t === e) return null;
    const i = this.getCursorXFromIndex(t), n = this.getCursorXFromIndex(e);
    return {
      indexes: { start: t, end: e },
      x: { start: i, end: n }
    };
  }
  selectAll() {
    this.setSelectedRange(0, this.text.length);
  }
  setSelectedRange(t, e) {
    this.dragIndexStart = t, this.dragIndexEnd = e, this.cursorIndex = e, this.redraw();
  }
  charFromPosition(t) {
    return {};
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
  getGlyphs() {
    return this.textSprite ? W(this.textSprite) : [];
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
    !isNaN(t) && t >= 0 ? this._maxCharacterLength = t : this._maxCharacterLength = null;
  }
  _change(t) {
    return t !== this.text ? this._maxCharacterLength !== null && t.length > this._maxCharacterLength ? (this.onCharLimitHandler(t), !1) : (this._text = t, this.textSprite.text = t, this._text === "" && this.textSprite.children && this.textSprite.children.forEach((e) => {
      this.textSprite.removeChild(e);
    }), this.refreshBitmapTextMetrics(), this.emit("change", t), this.onChangeHandler(t), !0) : !1;
  }
  refreshBitmapTextMetrics() {
    const t = this.textSprite;
    if (!t)
      return;
    const e = t.updateText || t._updateText;
    if (typeof e == "function")
      try {
        e.call(t);
        return;
      } catch {
      }
    if (typeof t.updateTransform == "function")
      try {
        t.updateTransform();
      } catch {
      }
  }
  change(t) {
    const e = this._change(t);
    return e && this.redrawText(), e;
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
  show() {
    this.visible = !0, this.startCursorAnimation();
  }
  hide() {
    this.visible = !1, this.stopCursorAnimation();
  }
}
const ge = xt(pe), me = function() {
  return {
    width: "300px",
    height: "120px",
    fontColor: 0,
    highlightedFontColor: 16777215,
    borderColor: 0,
    borderWidth: 1,
    cursorColor: 0,
    cursorWidth: 1,
    backgroundColor: 16250871,
    highlightedBackgroundColor: 128,
    borderOpacity: 1,
    xPadding: 0,
    yPadding: 0
  };
}, ye = ["width", "height"], xe = /* @__PURE__ */ new Set([
  "borderColor",
  "fontColor",
  "highlightedFontColor",
  "cursorColor",
  "backgroundColor",
  "highlightedBackgroundColor"
]);
class we extends PIXI.Container {
  /**
   * Creates a new TextArea instance.
   * @param font - The name of the bitmap font to use
   * @param styleOptions - Optional styling configuration
   * @param maxCharacterLength - Optional maximum number of characters allowed
   * @param ignoreKeys - Optional array of key codes to ignore
   */
  constructor(t, e, i, n) {
    super(), this.styleOptions = {}, this.backgroundGraphic = new PIXI.Graphics(), this.selectionGraphic = new PIXI.Graphics(), this.cursorSprite = new PIXI.Graphics(), this.contentMask = new PIXI.Graphics(), this.lineContainer = new PIXI.Container(), this.lineSprites = [], this._text = "", this._layout = null, this.cursorIndex = 0, this.dragIndexStart = 0, this.dragIndexEnd = 0, this.inDrag = !1, this.inFocus = !1, this.clickedTimestamp = 0, this._scrollY = 0, this._registeredScrollEvent = !1, this.desiredX = null, this.cursorAnimationFrame = null, this.toggleCursorTime = 500, this.cursorIsVisible = !0, this.submitKeyCodes = [], this.ignoreKeys = [], this._maxCharacterLength = null, this.onFocusHandler = () => {
    }, this.onBlurHandler = () => {
    }, this.onChangeHandler = () => {
    }, this.onSubmitHandler = () => {
    }, this.onCharLimitHandler = () => {
    }, this.font = t, this.checkForOutsideClick = this.checkForOutsideClick.bind(this), this.handleWheelScroll = this.handleWheelScroll.bind(this), n && (this.ignoreKeys = n), this.maxCharacterLength = i ?? -1, this.buttonMode = !0, this.interactive = !0, this.cursor = "text", this.addChild(this.backgroundGraphic), this.addChild(this.contentMask), this.addChild(this.selectionGraphic), this.addChild(this.lineContainer), this.addChild(this.cursorSprite), this.selectionGraphic.mask = this.contentMask, this.lineContainer.mask = this.contentMask, this.cursorSprite.mask = this.contentMask, this.on("pointerdown", this.handleMouseDown.bind(this)), this.on("pointermove", this.handleMouseMove.bind(this)), this.on("pointerup", this.handleMouseUp.bind(this)), this.on("pointerupoutside", this.handleMouseUp.bind(this)), this.registerScrollEvents();
    const s = { ...me(), ...e ?? {} };
    this.updateStyle(s);
  }
  updateStyle(t) {
    const e = this.styleOptions, i = t;
    for (const n in t)
      if (ye.includes(n)) {
        const s = tt(i[n]);
        if (!s.valid)
          throw new Error(`Error for passed in style: ${n}, ${s.error}`);
        e[n] = { value: s.value, type: s.type };
      } else if (xe.has(n)) {
        const s = i[n];
        s != null && (e[n] = y(s));
      } else
        e[n] = i[n];
    this.invalidateLayout(), this.redraw();
  }
  // ---- layout ----
  invalidateLayout() {
    this._layout = null;
  }
  resolveMetrics() {
    const t = this.styleOptions.measureGlyph, e = t ? null : Jt(this.font, this.styleOptions.fontSize), i = this.styleOptions.fontSize ?? 16;
    return {
      measure: t ?? e?.measure ?? (() => i * 0.6),
      lineHeight: this.styleOptions.lineHeight ?? e?.lineHeight ?? Math.round(i * 1.2)
    };
  }
  resolveBoxSize() {
    const t = (e, i) => e.type === "pixel" ? e.value : i * (e.value / 100);
    return {
      width: t(this.styleOptions.width, typeof window < "u" ? window.innerWidth : 0),
      height: t(this.styleOptions.height, typeof window < "u" ? window.innerHeight : 0)
    };
  }
  /** The current text layout (lines and caret-position tables). Recomputed lazily. */
  get layout() {
    if (!this._layout) {
      const { measure: t, lineHeight: e } = this.resolveMetrics(), { width: i } = this.resolveBoxSize(), n = i - this.styleOptions.xPadding * 2;
      this._layout = ie(this._text, {
        measure: t,
        lineHeight: e,
        wrapWidth: n > 0 ? n : void 0
      });
    }
    return this._layout;
  }
  // ---- scrolling ----
  get innerHeight() {
    return this.resolveBoxSize().height - this.styleOptions.yPadding * 2;
  }
  get maxScrollY() {
    return Math.max(0, this.layout.height - this.innerHeight);
  }
  /** Vertical scroll offset in pixels (clamped to the content height). */
  get scrollY() {
    return this._scrollY;
  }
  set scrollY(t) {
    const e = Math.max(0, Math.min(this.maxScrollY, t));
    e !== this._scrollY && (this._scrollY = e, this.redraw());
  }
  /** Wheel scrolls while the pointer hovers the area (same pattern as ScrollList). */
  registerScrollEvents() {
    this.once("pointerover", () => {
      this._registeredScrollEvent = !0, document.addEventListener("wheel", this.handleWheelScroll, { passive: !1 }), this.once("pointerout", () => {
        document.removeEventListener("wheel", this.handleWheelScroll), this._registeredScrollEvent = !1, this.registerScrollEvents();
      });
    });
  }
  handleWheelScroll(t) {
    t.cancelable && t.preventDefault(), this.scrollY += t.deltaY;
  }
  ensureCaretVisible() {
    const t = C(this.layout, this.cursorIndex), e = this.layout.lineHeight;
    t.y < this._scrollY ? this._scrollY = t.y : t.y + e > this._scrollY + this.innerHeight && (this._scrollY = t.y + e - this.innerHeight), this._scrollY = Math.max(0, Math.min(this.maxScrollY, this._scrollY));
  }
  // ---- rendering ----
  redraw() {
    const t = this.layout, { width: e, height: i } = this.resolveBoxSize(), { xPadding: n, yPadding: s } = this.styleOptions, o = this.styleOptions.backgroundColor;
    if (this.backgroundGraphic.clear(), this.styleOptions.borderWidth > 0 && !Number.isNaN(this.styleOptions.borderWidth)) {
      const d = this.styleOptions.borderColor, u = (d?.alpha ?? 1) * (this.styleOptions.borderOpacity ?? 1);
      this.backgroundGraphic.lineStyle(this.styleOptions.borderWidth, d?.value ?? 0, u);
    }
    this.backgroundGraphic.beginFill(o.value, o.alpha), this.backgroundGraphic.drawRect(0, 0, e, i), this.backgroundGraphic.endFill(), this.contentMask.clear(), vt(this.contentMask, 0, 0, e, i, 16777215, 1);
    const a = this.getSelectedRangeIndexes();
    if (this.selectionGraphic.clear(), a) {
      const d = this.styleOptions.highlightedBackgroundColor;
      this.selectionGraphic.beginFill(d.value, d.alpha), ae(t, a.start, a.end).forEach((u) => {
        this.selectionGraphic.drawRect(
          u.x + n,
          u.y + s - this._scrollY,
          u.width,
          u.height
        );
      }), this.selectionGraphic.endFill();
    }
    this.syncLineSprites(t);
    const l = this.styleOptions.fontColor.value, h = this.styleOptions.highlightedFontColor.value;
    t.lines.forEach((d, u) => {
      const c = this.lineSprites[u];
      c.text = d.text, c.x = n, c.y = s + d.y - this._scrollY;
      const f = !!a && a.start < d.start + d.text.length && a.end > d.start;
      E(c, f ? h : l);
    }), this.redrawCursor();
  }
  syncLineSprites(t) {
    for (; this.lineSprites.length < t.lines.length; ) {
      const e = H("", { font: this.font, align: "left" });
      this.lineContainer.addChild(e), e.mask = this.contentMask, this.lineSprites.push(e);
    }
    for (; this.lineSprites.length > t.lines.length; ) {
      const e = this.lineSprites.pop();
      this.lineContainer.removeChild(e), e.destroy({ children: !0 });
    }
  }
  redrawCursor() {
    if (this.cursorSprite.clear(), !this.inFocus || this.getSelectedRangeIndexes()) {
      this.cursorIsVisible = !1, this.cursorSprite.visible = !1;
      return;
    }
    const t = C(this.layout, this.cursorIndex), { xPadding: e, yPadding: i } = this.styleOptions, n = this.styleOptions.cursorColor, s = e + t.x + 1, o = i + t.y - this._scrollY;
    this.cursorSprite.lineStyle(this.styleOptions.cursorWidth, n.value, n.alpha), this.cursorSprite.moveTo(s, o + 1).lineTo(s, o + this.layout.lineHeight - 1), this.cursorIsVisible = !0, this.cursorSprite.visible = !0;
  }
  // ---- pointer interaction ----
  getEventLocalPoint(t) {
    const e = t.data;
    if (e && typeof e.getLocalPosition == "function")
      return e.getLocalPosition(this);
    const i = t;
    return typeof i.getLocalPosition == "function" ? i.getLocalPosition(this) : { x: 0, y: 0 };
  }
  /**
   * Map a point in this container's local space (e.g. from a pointer event)
   * to a caret index, accounting for padding and scroll.
   */
  caretIndexFromPoint(t, e) {
    return se(
      this.layout,
      t - this.styleOptions.xPadding,
      e - this.styleOptions.yPadding + this._scrollY
    );
  }
  handleMouseDown(t) {
    const e = t;
    this.clickedTimestamp = e.nativeEvent?.timeStamp ?? e.data?.originalEvent?.timeStamp ?? 0, this.inFocus || this.focus();
    const i = this.getEventLocalPoint(t);
    this.cursorIndex = this.caretIndexFromPoint(i.x, i.y), this.desiredX = null, this.inDrag = !0, this.dragIndexStart = this.cursorIndex, this.dragIndexEnd = this.cursorIndex, this.redraw();
  }
  handleMouseMove(t) {
    if (this.inDrag) {
      const e = this.getEventLocalPoint(t), i = this.caretIndexFromPoint(e.x, e.y);
      i !== this.dragIndexEnd && (this.dragIndexEnd = i, this.redraw());
    }
  }
  handleMouseUp(t) {
    if (this.inDrag) {
      const e = this.getEventLocalPoint(t);
      this.cursorIndex = this.caretIndexFromPoint(e.x, e.y), this.inDrag = !1;
    }
  }
  // ---- selection / caret (IKeyboardBase) ----
  clearRange() {
    this.dragIndexStart = this.cursorIndex, this.dragIndexEnd = this.cursorIndex;
  }
  getSelectedRangeIndexes() {
    const t = Math.min(this.dragIndexStart, this.dragIndexEnd), e = Math.max(this.dragIndexStart, this.dragIndexEnd);
    return t === e ? null : { start: t, end: e };
  }
  getSelectedRange() {
    const t = this.getSelectedRangeIndexes();
    return t ? {
      indexes: t,
      x: {
        start: C(this.layout, t.start).x,
        end: C(this.layout, t.end).x
      }
    } : null;
  }
  getSelectedChars() {
    const t = this.getSelectedRangeIndexes();
    return t ? this.text.substring(t.start, t.end) : "";
  }
  setSelectedRange(t, e) {
    this.dragIndexStart = t, this.dragIndexEnd = e, this.cursorIndex = e, this.redraw();
  }
  selectAll() {
    this.setSelectedRange(0, this.text.length);
  }
  setCursor(t) {
    t > -1 && t <= this.text.length && (this.cursorIndex = t, this.desiredX = null, this.clearRange(), this.ensureCaretVisible(), this.redraw());
  }
  moveCursor(t) {
    const e = this.cursorIndex + t;
    e > -1 && e <= this.text.length && (this.cursorIndex = e, this.desiredX = null, this.clearRange(), this.ensureCaretVisible(), this.redraw());
  }
  /**
   * Move the caret up or down one visual line, preserving the horizontal
   * position across consecutive moves (sticky column, like a DOM textarea).
   */
  moveCaretLine(t) {
    this.desiredX === null && (this.desiredX = C(this.layout, this.cursorIndex).x), this.cursorIndex = ne(this.layout, this.cursorIndex, t, this.desiredX), this.clearRange(), this.ensureCaretVisible(), this.redraw();
  }
  /** Move the caret to the start or end of its current visual line (Home/End). */
  moveCaretToLineEdge(t) {
    const e = le(this.layout, this.cursorIndex);
    this.cursorIndex = t === "start" ? e.start : e.end, this.desiredX = null, this.clearRange(), this.ensureCaretVisible(), this.redraw();
  }
  /** Move the caret up or down by one viewport of lines (PageUp/PageDown). */
  moveCaretPage(t) {
    const e = Math.max(1, Math.floor(this.innerHeight / this.layout.lineHeight));
    this.desiredX === null && (this.desiredX = C(this.layout, this.cursorIndex).x), this.cursorIndex = oe(this.layout, this.cursorIndex, t * e, this.desiredX), this.clearRange(), this.ensureCaretVisible(), this.redraw();
  }
  // ---- text mutation (IKeyboardBase) ----
  replaceSelectedWith(t) {
    const e = this.getSelectedRangeIndexes(), i = e ? e.start : this.cursorIndex, n = e ? e.end : this.cursorIndex, s = this.text.slice(0, i) + t + this.text.slice(n);
    return this._change(s) && (this.cursorIndex = i + t.length, this.desiredX = null, this.clearRange(), this.ensureCaretVisible(), this.redraw()), this.text;
  }
  removeLeftOfCursor() {
    if (this.cursorIndex > 0) {
      const t = this.text.slice(0, this.cursorIndex - 1) + this.text.slice(this.cursorIndex);
      this._change(t) && (this.cursorIndex--, this.desiredX = null, this.ensureCaretVisible()), this.redraw();
    }
  }
  removeRightOfCursor() {
    if (this.cursorIndex < this.text.length) {
      const t = this.text.slice(0, this.cursorIndex) + this.text.slice(this.cursorIndex + 1);
      this._change(t), this.desiredX = null, this.redraw();
    }
  }
  clear() {
    this.text = "", this.cursorIndex = 0, this.clearRange(), this.redraw();
  }
  set maxCharacterLength(t) {
    !isNaN(t) && t >= 0 ? this._maxCharacterLength = t : this._maxCharacterLength = null;
  }
  _change(t) {
    return t === this._text ? !1 : this._maxCharacterLength !== null && t.length > this._maxCharacterLength ? (this.onCharLimitHandler(t), !1) : (this._text = t, this.invalidateLayout(), this.emit("change", t), this.onChangeHandler(t), !0);
  }
  change(t) {
    const e = this._change(t);
    return e && (this.cursorIndex > t.length && (this.cursorIndex = t.length), this.clearRange(), this.ensureCaretVisible(), this.redraw()), e;
  }
  get text() {
    return this._text;
  }
  set text(t) {
    this.change(t);
  }
  // ---- focus / events ----
  submit() {
    this.onSubmitHandler(this.text);
  }
  focus() {
    this.inFocus || (document.addEventListener("mousedown", this.checkForOutsideClick), this.inFocus = !0, this.startCursorAnimation(), this.redraw(), this.emit("focus"), this.onFocusHandler());
  }
  blur() {
    this.inFocus && (document.removeEventListener("mousedown", this.checkForOutsideClick), this.inFocus = !1, this.stopCursorAnimation(), this.clearRange(), this.redraw(), this.emit("blur"), this.onBlurHandler());
  }
  checkForOutsideClick(t) {
    t.timeStamp !== this.clickedTimestamp && this.blur();
  }
  startCursorAnimation() {
    this.cursorAnimationFrame && this.stopCursorAnimation(), this.blinkCursor();
  }
  stopCursorAnimation() {
    this.cursorSprite.visible = !1, this.cursorAnimationFrame && (clearTimeout(this.cursorAnimationFrame), this.cursorAnimationFrame = null);
  }
  blinkCursor() {
    this.cursorIsVisible && (this.cursorSprite.visible = !this.cursorSprite.visible), this.cursorAnimationFrame = setTimeout(this.blinkCursor.bind(this), this.toggleCursorTime);
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
  show() {
    this.visible = !0;
  }
  hide() {
    this.visible = !1, this.stopCursorAnimation();
  }
  destroy(t) {
    this.blur(), this.stopCursorAnimation(), this._registeredScrollEvent && (document.removeEventListener("wheel", this.handleWheelScroll), this._registeredScrollEvent = !1), super.destroy(t);
  }
}
class be extends xt(we) {
  onArrowUp() {
    this.moveCaretLine(-1);
  }
  onArrowDown() {
    this.moveCaretLine(1);
  }
  onHome() {
    this.moveCaretToLineEdge("start");
  }
  onEnd() {
    this.moveCaretToLineEdge("end");
  }
  onPageUp() {
    this.moveCaretPage(-1);
  }
  onPageDown() {
    this.moveCaretPage(1);
  }
}
const Se = be, O = (r) => r.global ? r.global.y : r.data?.global ? r.data.global.y : 0;
class S extends PIXI.Container {
  /**
   * Creates a new PixiElement instance.
   * Automatically sets up pointer over/out tracking.
   */
  constructor() {
    super(), this.isMouseOver = !1, this.elements = [], this.inDrag = !1, this.pointerIsDown = !1, this.userHandlers = {}, this.internalHandlers = {}, this._swipeupHandler = null, this._swipedownHandler = null, this._swipeHandler = null, this.doubleClickTimeout = null, this.completedTriggerTimeout = !1, this.holdDragTriggerTime = 30, this.holdDragTriggerTimeout = null, this.helddownCountHandlers = {}, this.helddownTimeouts = [], this.ifDragEndEmitSwipeDistance = 0, this.swipeStartY = 0, this.swipeStartTs = 0, this.swipeEndY = 0, this.startDragY = 0, this.lastDragCheckTs = 0, this.curDragSwiperCheckIterationDuration = 0, this.curDragSwipePowerIterationQueue = [], this.lastDragDistance = 0, this.lastDragY = 0, this.dragDistanceY = 0, this.maxSwipeTimeout = 300, this.minSwipeDistance = 200, this.hasSwipeHandler = !1, this.missedDiffs = 0, this.dragWindowMoveHandler = null, this.dragWindowUpHandler = null, this.internalHandlers.pointerdown = (t) => this.__pointerdown(t), this.internalHandlers.pointermove = (t) => this.__pointermove(t), this.internalHandlers.pointerup = (t) => this.__pointerup(t), this.internalHandlers.pointerupoutside = (t) => this.__pointerupoutside(t), this.internalHandlers.pointerover = (t) => this.__pointerover(t), this.internalHandlers.pointerout = (t) => this.__pointerout(t), this.internalHandlers.pointertap = (t) => this.__pointertap(t), this.internalHandlers.doubleclick = (t) => this.__doubleclick(t), this.internalHandlers.dragstart = (t) => this.__dragstart(t), this.internalHandlers.dragend = (t) => this.__dragend(t), this.internalHandlers.dragmove = (t) => this.__dragmove(t), this.on("pointerover", () => {
      this.isMouseOver = !0;
    }), this.on("pointerout", () => {
      this.isMouseOver = !1;
    });
  }
  static {
    this.recomputeDragScalePerMove = !0;
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
    if (!!!this.userHandlers[t]) {
      const n = this.internalHandlers[t];
      n && this.on(t, n);
    }
    this.userHandlers[t] = e, this.buttonMode || (this.buttonMode = !0, this.interactive = !0);
  }
  /**
   * Centers this element horizontally within its parent container.
   */
  centerX() {
    this.parent && (this.x = this.parent.width / 2 - this.width / 2);
  }
  /**
   * Centers this element vertically within its parent container.
   */
  centerY() {
    this.parent && (this.y = this.parent.height / 2 - this.height / 2);
  }
  /**
   * Centers this element both horizontally and vertically within its parent container.
   */
  center() {
    this.centerX(), this.centerY();
  }
  /**
   * Adds an element to the internal elements array.
   * @param element - The element to add
   * @throws Error if the element is not an instance of Element
   */
  addElement(t) {
    if (!(t instanceof S))
      throw new Error("addElement called with a non element object");
    this.elements.push(t);
  }
  /**
   * Removes an element from the internal elements array.
   * @param element - The element to remove
   */
  removeElement(t) {
    this.elements = this.elements.filter((e) => e !== t);
  }
  /** Registers a handler for pointer down (mouse down / touch start) events. */
  onMouseDown(t) {
    this.pointerdownHandler = t;
  }
  /** Registers a handler for pointer up (mouse up / touch end) events. */
  onMouseUp(t) {
    this.pointerupHandler = t;
  }
  /** Registers a handler for pointer up outside events. */
  onMouseUpOutside(t) {
    this.pointerupoutsideHandler = t;
  }
  /** Registers a handler for pointer over (mouse enter) events. */
  onMouseOver(t) {
    this.pointeroverHandler = t;
  }
  /** Registers a handler for pointer out (mouse leave) events. */
  onMouseOut(t) {
    this.pointeroutHandler = t;
  }
  /** Registers a handler for pointer move events. */
  onMouseMove(t) {
    this.pointermoveHandler = t;
  }
  /** Registers a handler for click/tap events. */
  onClick(t) {
    this.pointertapHandler = t;
  }
  /**
   * Registers a handler that fires after the element has been held down for a specified duration.
   */
  onHeldDown(t, e) {
    this.userHandlers.pointerdown || this.onMouseDown(() => {
    }), this._setHeldDownHandler(t, e);
  }
  /**
   * Registers a handler for drag start events.
   * @param hold - Optional time in milliseconds the pointer must be held before triggering drag
   */
  onDragStart(t, e) {
    typeof e == "number" && !isNaN(e) && (this.holdDragTriggerTime = e), this.registerDefaultIfNeeded("pointerdown"), this.registerDefaultIfNeeded("pointerup"), this.registerDefaultIfNeeded("pointerupoutside"), this.registerDefaultIfNeeded("pointerout"), this.dragstartHandler = t;
  }
  /** Registers a handler for drag end events. */
  onDragEnd(t) {
    this.registerDefaultIfNeeded("pointerup"), this.registerDefaultIfNeeded("pointerupoutside"), this.dragendHandler = t;
  }
  /** Registers a handler for drag move events. */
  onDragMove(t) {
    this.userHandlers.dragstart || this.onDragStart(() => {
    }, this.holdDragTriggerTime), this.userHandlers.dragend || this.onDragEnd(() => {
    }), this.registerDefaultIfNeeded("pointermove"), this.dragmoveHandler = t;
  }
  /** Registers a handler for double-click events. */
  onDoubleClick(t) {
    this.registerDefaultIfNeeded("pointerdown"), this.doubleclickHandler = t;
  }
  /**
   * Registers a handler for swipe gestures in any direction.
   * @param handler - Callback function to execute on swipe, receives swipe power as parameter
   */
  onSwipe(t) {
    this.hasSwipeHandler = !0, this.registerDefaultIfNeeded("pointerdown"), this.registerDefaultIfNeeded("pointerup"), this.registerDefaultIfNeeded("pointerupoutside"), this.userHandlers.dragmove || this.onDragMove(() => {
    }), this._swipeHandler = t;
  }
  /** Registers a handler for upward swipe gestures. */
  onSwipeUp(t) {
    this.hasSwipeHandler = !0, this.registerDefaultIfNeeded("pointerdown"), this.registerDefaultIfNeeded("pointerup"), this.registerDefaultIfNeeded("pointerupoutside"), this._swipeupHandler = t;
  }
  /** Registers a handler for downward swipe gestures. */
  onSwipeDown(t) {
    this.hasSwipeHandler = !0, this.registerDefaultIfNeeded("pointerdown"), this.registerDefaultIfNeeded("pointerup"), this.registerDefaultIfNeeded("pointerupoutside"), this._swipedownHandler = t;
  }
  __doubleclick(t) {
    this.doubleClickTimeout !== null && clearTimeout(this.doubleClickTimeout), this.doubleClickTimeout = null, this.userHandlers.doubleclick?.(t);
  }
  clearHelddownTimeouts() {
    this.helddownTimeouts.forEach((t) => clearTimeout(t)), this.helddownTimeouts.length = 0;
  }
  registerDefaultIfNeeded(t) {
    this.userHandlers[t] || this._setEventNameHandler(t, () => {
    });
  }
  __pointerdown(t) {
    Object.keys(this.helddownCountHandlers).forEach((e) => {
      this.helddownTimeouts.push(
        setTimeout(() => {
          this.helddownCountHandlers[Number(e)]?.(t);
        }, parseInt(e, 10))
      );
    }), this.pointerIsDown = !0, this.userHandlers.pointerdown?.(t), this.swipeStartTs = Date.now(), this.swipeStartY = O(t), this.userHandlers.dragstart && !this.inDrag && (this.holdDragTriggerTimeout = setTimeout(() => {
      this.completedTriggerTimeout = !0, this.holdDragTriggerTimeout = null;
    }, this.holdDragTriggerTime)), this.doubleClickTimeout ? this.emit("doubleclick", t) : this.doubleClickTimeout = setTimeout(() => {
      this.doubleClickTimeout = null;
    }, 300);
  }
  __pointertap(t) {
    this.userHandlers.pointertap?.(t);
  }
  __dragstart(t) {
    this.inDrag = !0;
    const e = O(t);
    this.startDragY = e, this.lastDragY = e, this.lastDragCheckTs = Date.now(), this.userHandlers.dragstart?.(t), this.attachDragWindowListeners(t);
  }
  /**
   * Track pointer movement at the window level so dragmove keeps firing when the cursor
   * leaves this element's bounding box. PIXI's element-level pointermove only fires while
   * the cursor is over the hit area, which causes drags to stall on fast movements.
   */
  attachDragWindowListeners(t) {
    const e = t.global ?? t.data?.global ?? { x: 0, y: 0 }, i = t.nativeEvent ?? t.data?.originalEvent;
    if (!i || typeof i.clientX != "number") return;
    const n = i.clientX, s = i.clientY, o = e.x, a = e.y, l = Gt(i), h = Xt(l), d = h ? St(h) : { x: 1, y: 1 };
    this.dragWindowMoveHandler = (u) => {
      if (!this.inDrag) return;
      let c, f;
      if (S.recomputeDragScalePerMove && h) {
        const g = At(u.clientX, u.clientY, h);
        c = g.x, f = g.y;
      } else
        c = o + (u.clientX - n) * d.x, f = a + (u.clientY - s) * d.y;
      const p = {
        data: { global: { x: c, y: f }, originalEvent: u },
        global: { x: c, y: f },
        client: { x: u.clientX, y: u.clientY },
        clientX: u.clientX,
        clientY: u.clientY,
        nativeEvent: u,
        stopPropagation() {
        },
        preventDefault() {
        }
      };
      this.emit("dragmove", p);
    }, this.dragWindowUpHandler = () => this.cleanupDragWindowListeners(), window.addEventListener("pointermove", this.dragWindowMoveHandler), window.addEventListener("pointerup", this.dragWindowUpHandler), window.addEventListener("pointercancel", this.dragWindowUpHandler);
  }
  cleanupDragWindowListeners() {
    this.dragWindowMoveHandler && (window.removeEventListener("pointermove", this.dragWindowMoveHandler), this.dragWindowMoveHandler = null), this.dragWindowUpHandler && (window.removeEventListener("pointerup", this.dragWindowUpHandler), window.removeEventListener("pointercancel", this.dragWindowUpHandler), this.dragWindowUpHandler = null);
  }
  __dragmove(t) {
    if (this.userHandlers.dragmove?.(t), this.hasSwipeHandler) {
      const e = Date.now(), i = e - this.lastDragCheckTs;
      this.lastDragCheckTs = e, this.curDragSwiperCheckIterationDuration += i;
      const n = O(t), s = this.lastDragY - n;
      this.lastDragY = n, Math.abs(s) < 7 ? this.missedDiffs++ : this.missedDiffs = 0, this.missedDiffs < 2 ? (Math.sign(this.ifDragEndEmitSwipeDistance) !== Math.sign(s) && (this.swipeStartY = n, this.resetDragSwipeVars()), this.curDragSwiperCheckIterationDuration >= this.maxSwipeTimeout ? (this.curDragSwipePowerIterationQueue.length && (this.ifDragEndEmitSwipeDistance -= this.curDragSwipePowerIterationQueue.shift() ?? 0), this.curDragSwipePowerIterationQueue.push(s), this.ifDragEndEmitSwipeDistance += s) : (this.ifDragEndEmitSwipeDistance += s, this.curDragSwipePowerIterationQueue.push(s))) : this.resetDragSwipeVars();
    }
  }
  resetDragSwipeVars() {
    this.curDragSwipePowerIterationQueue.length = 0, this.ifDragEndEmitSwipeDistance = 0, this.curDragSwiperCheckIterationDuration = 0;
  }
  __dragend(t) {
    if (this.cleanupDragWindowListeners(), this.inDrag = !1, this.userHandlers.dragend?.(t), this.hasSwipeHandler) {
      const e = Math.sign(this.ifDragEndEmitSwipeDistance);
      if (e) {
        const i = Math.max(10, this.curDragSwiperCheckIterationDuration), n = Math.min(this.maxSwipeTimeout, i), s = this.ifDragEndEmitSwipeDistance / (n + 100 / 15) * 10;
        e > 0 && this._swipedownHandler ? this._swipedownHandler(this.ifDragEndEmitSwipeDistance) : this._swipeupHandler && this._swipeupHandler(this.ifDragEndEmitSwipeDistance), this._swipeHandler?.(s);
      }
      this.resetDragSwipeVars();
    }
    this.ifDragEndEmitSwipeDistance = 0;
  }
  __pointermove(t) {
    this.pointerIsDown && !this.inDrag && this.completedTriggerTimeout ? this.emit("dragstart", t) : this.inDrag && this.userHandlers.dragmove && !this.dragWindowMoveHandler && this.emit("dragmove", t), this.userHandlers.pointermove?.(t);
  }
  __pointerover(t) {
    this.userHandlers.pointerover?.(t);
  }
  __pointerout(t) {
    this.pointerIsDown || (this.clearHelddownTimeouts(), this.clearDragTimeouts()), this.userHandlers.pointerout?.(t);
  }
  handleSwipeFinish(t) {
    if (this.hasSwipeHandler) {
      const e = this.swipeStartY - t, i = Math.max(Date.now() - this.swipeStartTs, 1);
      if (i < this.maxSwipeTimeout && Math.abs(e) > this.minSwipeDistance) {
        const n = e / (i + 6.666666666666667) * 10;
        Math.abs(n) > 10 && ((e > 0 ? this._swipeupHandler : this._swipedownHandler)?.(n), this._swipeHandler?.(n));
      }
    }
  }
  __pointerupoutside(t) {
    this.clearHelddownTimeouts(), this.clearDragTimeouts(), this.handleSwipeFinish(O(t)), this.pointerIsDown = !1, this.userHandlers.pointerupoutside?.(t), this.inDrag && this.emit("dragend", t);
  }
  __pointerup(t) {
    this.clearHelddownTimeouts(), this.clearDragTimeouts(), this.handleSwipeFinish(O(t)), this.pointerIsDown = !1, this.userHandlers.pointerup?.(t), this.inDrag && this.emit("dragend", t);
  }
  clearDragTimeouts() {
    this.completedTriggerTimeout = !1, this.holdDragTriggerTimeout !== null && (clearTimeout(this.holdDragTriggerTimeout), this.holdDragTriggerTimeout = null);
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
  destroy(t) {
    this.cleanupDragWindowListeners(), super.destroy(t);
  }
}
function Ce(r) {
  return r && r.__esModule && Object.prototype.hasOwnProperty.call(r, "default") ? r.default : r;
}
var Y, dt;
function ve() {
  if (dt) return Y;
  dt = 1;
  var r = {
    linear: function(t, e, i, n) {
      var s = i - e;
      return s * t / n + e;
    },
    easeInQuad: function(t, e, i, n) {
      var s = i - e;
      return s * (t /= n) * t + e;
    },
    easeOutQuad: function(t, e, i, n) {
      var s = i - e;
      return -s * (t /= n) * (t - 2) + e;
    },
    easeInOutQuad: function(t, e, i, n) {
      var s = i - e;
      return (t /= n / 2) < 1 ? s / 2 * t * t + e : -s / 2 * (--t * (t - 2) - 1) + e;
    },
    easeInCubic: function(t, e, i, n) {
      var s = i - e;
      return s * (t /= n) * t * t + e;
    },
    easeOutCubic: function(t, e, i, n) {
      var s = i - e;
      return s * ((t = t / n - 1) * t * t + 1) + e;
    },
    easeInOutCubic: function(t, e, i, n) {
      var s = i - e;
      return (t /= n / 2) < 1 ? s / 2 * t * t * t + e : s / 2 * ((t -= 2) * t * t + 2) + e;
    },
    easeInQuart: function(t, e, i, n) {
      var s = i - e;
      return s * (t /= n) * t * t * t + e;
    },
    easeOutQuart: function(t, e, i, n) {
      var s = i - e;
      return -s * ((t = t / n - 1) * t * t * t - 1) + e;
    },
    easeInOutQuart: function(t, e, i, n) {
      var s = i - e;
      return (t /= n / 2) < 1 ? s / 2 * t * t * t * t + e : -s / 2 * ((t -= 2) * t * t * t - 2) + e;
    },
    easeInQuint: function(t, e, i, n) {
      var s = i - e;
      return s * (t /= n) * t * t * t * t + e;
    },
    easeOutQuint: function(t, e, i, n) {
      var s = i - e;
      return s * ((t = t / n - 1) * t * t * t * t + 1) + e;
    },
    easeInOutQuint: function(t, e, i, n) {
      var s = i - e;
      return (t /= n / 2) < 1 ? s / 2 * t * t * t * t * t + e : s / 2 * ((t -= 2) * t * t * t * t + 2) + e;
    },
    easeInSine: function(t, e, i, n) {
      var s = i - e;
      return -s * Math.cos(t / n * (Math.PI / 2)) + s + e;
    },
    easeOutSine: function(t, e, i, n) {
      var s = i - e;
      return s * Math.sin(t / n * (Math.PI / 2)) + e;
    },
    easeInOutSine: function(t, e, i, n) {
      var s = i - e;
      return -s / 2 * (Math.cos(Math.PI * t / n) - 1) + e;
    },
    easeInExpo: function(t, e, i, n) {
      var s = i - e;
      return t == 0 ? e : s * Math.pow(2, 10 * (t / n - 1)) + e;
    },
    easeOutExpo: function(t, e, i, n) {
      var s = i - e;
      return t == n ? e + s : s * (-Math.pow(2, -10 * t / n) + 1) + e;
    },
    easeInOutExpo: function(t, e, i, n) {
      var s = i - e;
      return t === 0 ? e : t === n ? e + s : (t /= n / 2) < 1 ? s / 2 * Math.pow(2, 10 * (t - 1)) + e : s / 2 * (-Math.pow(2, -10 * --t) + 2) + e;
    },
    easeInCirc: function(t, e, i, n) {
      var s = i - e;
      return -s * (Math.sqrt(1 - (t /= n) * t) - 1) + e;
    },
    easeOutCirc: function(t, e, i, n) {
      var s = i - e;
      return s * Math.sqrt(1 - (t = t / n - 1) * t) + e;
    },
    easeInOutCirc: function(t, e, i, n) {
      var s = i - e;
      return (t /= n / 2) < 1 ? -s / 2 * (Math.sqrt(1 - t * t) - 1) + e : s / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + e;
    },
    easeInElastic: function(t, e, i, n) {
      var s = i - e, o, a, l;
      return l = 1.70158, a = 0, o = s, t === 0 ? e : (t /= n) === 1 ? e + s : (a || (a = n * 0.3), o < Math.abs(s) ? (o = s, l = a / 4) : l = a / (2 * Math.PI) * Math.asin(s / o), -(o * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * n - l) * (2 * Math.PI) / a)) + e);
    },
    easeOutElastic: function(t, e, i, n) {
      var s = i - e, o, a, l;
      return l = 1.70158, a = 0, o = s, t === 0 ? e : (t /= n) === 1 ? e + s : (a || (a = n * 0.3), o < Math.abs(s) ? (o = s, l = a / 4) : l = a / (2 * Math.PI) * Math.asin(s / o), o * Math.pow(2, -10 * t) * Math.sin((t * n - l) * (2 * Math.PI) / a) + s + e);
    },
    easeInOutElastic: function(t, e, i, n) {
      var s = i - e, o, a, l;
      return l = 1.70158, a = 0, o = s, t === 0 ? e : (t /= n / 2) === 2 ? e + s : (a || (a = n * (0.3 * 1.5)), o < Math.abs(s) ? (o = s, l = a / 4) : l = a / (2 * Math.PI) * Math.asin(s / o), t < 1 ? -0.5 * (o * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * n - l) * (2 * Math.PI) / a)) + e : o * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * n - l) * (2 * Math.PI) / a) * 0.5 + s + e);
    },
    easeInBack: function(t, e, i, n, s) {
      var o = i - e;
      return s === void 0 && (s = 1.70158), o * (t /= n) * t * ((s + 1) * t - s) + e;
    },
    easeOutBack: function(t, e, i, n, s) {
      var o = i - e;
      return s === void 0 && (s = 1.70158), o * ((t = t / n - 1) * t * ((s + 1) * t + s) + 1) + e;
    },
    easeInOutBack: function(t, e, i, n, s) {
      var o = i - e;
      return s === void 0 && (s = 1.70158), (t /= n / 2) < 1 ? o / 2 * (t * t * (((s *= 1.525) + 1) * t - s)) + e : o / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + e;
    },
    easeInBounce: function(t, e, i, n) {
      var s = i - e, o;
      return o = r.easeOutBounce(n - t, 0, s, n), s - o + e;
    },
    easeOutBounce: function(t, e, i, n) {
      var s = i - e;
      return (t /= n) < 1 / 2.75 ? s * (7.5625 * t * t) + e : t < 2 / 2.75 ? s * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + e : t < 2.5 / 2.75 ? s * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + e : s * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + e;
    },
    easeInOutBounce: function(t, e, i, n) {
      var s = i - e, o;
      return t < n / 2 ? (o = r.easeInBounce(t * 2, 0, s, n), o * 0.5 + e) : (o = r.easeOutBounce(t * 2 - n, 0, s, n), o * 0.5 + s * 0.5 + e);
    }
  };
  return Y = r, Y;
}
var Ie = ve();
const ut = /* @__PURE__ */ Ce(Ie);
class Dt extends S {
  constructor(t, e) {
    super(), this.scrolling = !1, this.scrollList = t, this.options = e || {}, this.resolvedBackgroundColor = y(this.options.backgroundColor ?? 16250871), this.bg = new PIXI.Graphics(), this.addChild(this.bg), this.scroller = new _e(this, e.scrollerOptions), this.addChild(this.scroller), this.scroller.y = 0, this.redraw(), this.registerScrollerEvents();
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
    this.bg.clear(), this.bg.beginFill(this.resolvedBackgroundColor.value, this.resolvedBackgroundColor.alpha), this.bg.drawRect(0, 0, this.options.width, this.visibleLength), this.scroller.redraw();
  }
  setScrollPercent(t) {
    const i = (this.visibleLength - this.scroller.height) * t;
    this.scroller.y = i;
  }
  registerScrollerEvents() {
    this.onHeldDown((i) => {
      const n = i.data.global.y - this.getGlobalPosition().y;
      let s = -1;
      n < this.scroller.y ? s = n : n > this.scroller.y + this.scroller.height && (s = n - this.scroller.height), s >= 0 && !this.scrolling && (this.scroller.y = K(s, 0, this.visibleLength - this.scroller.height), this.emitScroll());
    }, 50);
    let t = 0, e = 0;
    this.scroller.onDragStart((i) => {
      this.scrolling = !0, t = i.global?.y ?? i.data?.global?.y ?? 0, e = this.scroller.y;
    }, 0), this.scroller.onDragMove((i) => {
      i.stopPropagation();
      const n = i.global?.y ?? i.data?.global?.y ?? 0, s = K(e + (n - t), 0, this.visibleLength - this.scroller.height);
      s !== this.scroller.y && (this.scroller.y = s, this.emitScroll());
    }), this.scroller.onDragEnd(() => {
      this.scrolling = !1;
    });
  }
  emitScroll() {
    const t = this.visibleLength - this.scroller.height, e = this.scroller.y / t;
    this.emit("scrolled", e);
  }
}
class _e extends S {
  constructor(t, e) {
    super(), this.scrollBar = t, this.styleObj = e || {}, this.resolvedColor = "color" in this.styleObj && this.styleObj.color !== void 0 ? y(this.styleObj.color) : y(0), this.rect = new PIXI.Graphics(), this.addChild(this.rect);
  }
  setStyle(t) {
    this.redraw();
  }
  redraw() {
    if (this.rect.clear(), this.scrollBar.visibleLength >= this.scrollBar.maxLength) return;
    const t = Math.ceil(this.scrollBar.visibleLength / (this.scrollBar.maxLength / this.scrollBar.visibleLength));
    this.rect.beginFill(this.resolvedColor.value, this.resolvedColor.alpha), this.rect.drawRect(0, 0, this.scrollBar.width, t), this.rect.endFill();
  }
}
const ft = (r, t = 0) => {
  const e = tt(r);
  return e.valid ? e.value : t;
}, Te = {
  backgroundColor: 1710618,
  dividerColor: 3355443,
  dividerPixelHeight: 1,
  dividerPercentWidth: 100,
  dividerTopPadding: 0,
  dividerBottomPadding: 0,
  borderOpacity: 1,
  xPadding: 0,
  yPadding: 0
}, pt = {
  disableTouchScroll: !1,
  disableScrollWheelScroll: !1,
  visibilityBuffer: 200,
  adjustVisibilityTime: 130
};
class De extends PIXI.Container {
  constructor(t, e, i) {
    super(), this.po = new S(), this.scrollRect = new S(), this.scrollDuration = 0, this._currentScroll = 0, this.lastScroll = 0, this.__width = 0, this.__height = 0, this.pointerdownStart = 0, this.startingVisibleChildIndex = 0, this.endingVisibleChildIndex = 0, this.scrollCurrentDur = 0, this.currentAdjustVisibilityDelta = 0, this.animationFrame = null, this.nextItemY = 0, this.scrollToDest = 0, this.listContainer = new S(), this.backgroundRect = new PIXI.Graphics(), this.scrollLength = 0, this.adjustedIndex = 0, this.maxHeight = 0, this.freezeScroll = !1, this.options = [], this._needsUpdateScoller = !0, this._registeredScrollEvent = !1, this.handleScrollWheelScroll = this.handleScrollWheelScroll.bind(this);
    const n = { ...Te, ...t };
    this.interactive = !0, this.interactiveChildren = !0, this.__width = ft(n.width), this.__height = ft(n.height), this.performanceOptions = i ? { ...pt, ...i } : { ...pt }, this.scrollStyleOptions = n, this.resolvedBackgroundColor = y(n.backgroundColor ?? 1048575), this.scrollLength = 0, this.scrollMask = new PIXI.Graphics(), this.scrollMask.beginFill(16777215), this.scrollMask.drawRect(0, 0, this.__width, this.__height), this.scrollMask.endFill(), this.backgroundRect.beginFill(this.resolvedBackgroundColor.value, this.resolvedBackgroundColor.alpha), this.backgroundRect.drawRect(0, 0, this.__width, this.__height), this.backgroundRect.endFill(), this.addChild(this.backgroundRect), this.addChild(this.scrollMask), this.addChild(this.po), this.po.interactive = !0, this.po.mask = this.scrollMask, this.addChild(this.scrollRect);
    let s = 0;
    this.performanceOptions.disableScrollWheelScroll || this.registerScrollEvents(), this.performanceOptions.disableTouchScroll || (this.scrollRect.onSwipe(this.applySwipe.bind(this)), this.on("pointerdown", (o) => {
      this.scrollBar && this.scrollBar.scrolling || this.performanceOptions.disableTouchScroll || this.animationFrame !== null && (cancelAnimationFrame(this.animationFrame), this.po.inDrag || this.po.emit("dragstart", o), this.animationFrame = null);
    }), this.on("pointerup", () => {
      this.scrollBar && this.scrollBar.scrolling || this.performanceOptions.disableTouchScroll;
    }), this.po.onSwipe(this.applySwipe.bind(this)), this.po.onDragStart((o) => {
      this.scrollBar && this.scrollBar.scrolling || this.freezeScroll || (this.tweenFunc = ut.easeOutElastic, this.scrollLength = 0, this.scrollCurrentDur = 0, this.scrollDuration = 0, this.currentAdjustVisibilityDelta = 0, s = o.data?.global?.y ?? o.global?.y ?? 0);
    }), this.po.onDragMove((o) => {
      if (this.scrollBar && this.scrollBar.scrolling || this.freezeScroll) return;
      const a = o.data?.global?.y ?? o.global?.y ?? s, l = a - s;
      s = a, l !== 0 && this.applyDrag(l);
    }), this.po.onDragEnd(() => {
      this.scrollBar && this.scrollBar.scrolling || this.adjustVisibility(0, !0);
    })), t.scrollBarOptions && (this.scrollBar = new Dt(this, t.scrollBarOptions), this.addChild(this.scrollBar), this.scrollBar.on("scrolled", (o) => {
      this._needsUpdateScoller = !1, this.setScrollPercent(o), this._needsUpdateScoller = !0;
    })), e && e.length && this.addScrollItems(
      e.map((o) => (o.onClick && (o.container.interactive = !0, o.container.buttonMode = !0, o.container.on("pointertap", o.onClick)), o.container))
    ), this.redraw();
  }
  handleScrollWheelScroll(t) {
    t.cancelable && t.preventDefault(), this.currentScroll += t.deltaY, this.adjustVisibility(null, !0);
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
      this._registeredScrollEvent = !0, document.addEventListener("wheel", this.handleScrollWheelScroll, { passive: !1 }), this.once("pointerout", () => {
        document.removeEventListener("wheel", this.handleScrollWheelScroll), this._registeredScrollEvent = !1, this.registerScrollEvents();
      });
    });
  }
  setScrollPercent(t) {
    t = K(t, 0, 1);
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
    const i = this.toLocal(e), n = 0, s = this.__width, o = t.y - this.currentScroll, a = o + t.height;
    return n <= i.x && i.x <= s && o <= i.y && i.y <= a;
  }
  resize(t, e) {
    this.__width = t, this.__height = e, this.scrollMask.clear(), this.scrollMask.beginFill(16777215).drawRect(0, 0, this.__width, this.__height).endFill(), this.backgroundRect.clear(), this.backgroundRect.beginFill(this.resolvedBackgroundColor.value, this.resolvedBackgroundColor.alpha).drawRect(0, 0, this.__width, this.__height).endFill(), this.adjustVisibility(null, !0), this.scrollBar && this.scrollBar.redraw();
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
    if (t === null && (t = 0), e)
      this.currentAdjustVisibilityDelta = 0;
    else {
      if (this.currentAdjustVisibilityDelta += t, this.currentAdjustVisibilityDelta < this.performanceOptions.adjustVisibilityTime)
        return;
      this.currentAdjustVisibilityDelta = 0;
    }
    let i = !1;
    for (let n = 0; n < this.options.length; n++) {
      const s = this.options[n], o = s.y + s.height + this.performanceOptions.visibilityBuffer >= this.currentScroll, a = this.__height + this.currentScroll >= s.y - this.performanceOptions.visibilityBuffer, l = s.visible;
      if (s.visible = a && o, s.visible && !i && (this.startingVisibleChildIndex = n, i = !0), !s.visible && i && (this.endingVisibleChildIndex = Math.min(n + 1, this.options.length - 1)), l !== s.visible ? (l ? s.emit("hide") : s.emit("show"), s.just_added && delete s.just_added) : s.just_added && (s.visible ? s.emit("show") : s.emit("hide"), delete s.just_added), !s.visible && !l && i)
        return;
    }
    this.endingVisibleChildIndex = this.options.length - 1;
  }
  adjustOptions() {
    this.po && this.po.parent === this && (this.po.y = -this.currentScroll, this.adjustedIndex++);
  }
  animateScroll(t) {
    const e = Date.now(), i = e - t;
    return this.currentAdjustVisibilityDelta += i, this.scrollCurrentDur += i, this.scrollCurrentDur >= this.scrollDuration ? (this.animationFrame = null, this.currentScroll = this.scrollToDest, this.currentAdjustVisibilityDelta = 0, this.adjustVisibility(null, !0), null) : (this.tweenFunc && (this.currentScroll = this.tweenFunc(this.scrollCurrentDur, this.lastScroll, this.scrollToDest, this.scrollDuration)), this.adjustVisibility(i), requestAnimationFrame(() => {
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
    const e = Math.abs(this._currentScroll - this.scrollToDest), i = e > 1e3 ? 4e3 : e > 700 ? 3e3 : e > 500 ? 2e3 : e > 200 ? 1e3 : 400;
    this.scrollDuration = Math.min(this.scrollDuration, i), this.animationFrame = this.animateScroll(Date.now());
  }
  applySwipe(t) {
    if (Math.abs(t) < 1) return;
    this.animationFrame && (cancelAnimationFrame(this.animationFrame), this.animationFrame = null), this.tweenFunc = ut.easeOutCubic, this.lastScroll = this._currentScroll, this.scrollCurrentDur = 0;
    const e = Math.abs(t), i = e < 10 ? 25 : e < 25 ? 30 : e < 30 ? 35 : e < 35 ? 55 : e < 40 ? 60 : e < 60 ? 65 : 80, n = t * i;
    if (this.maxHeight <= this.__height)
      return;
    this.scrollToDest = t >= 0 ? Math.min(this.maxHeight - this.__height, this._currentScroll + n) : Math.max(0, this._currentScroll + n);
    const s = Math.abs(this._currentScroll - this.scrollToDest);
    let o;
    this.scrollToDest === 0 || this.scrollToDest === this.maxHeight - this.__height + 0 ? o = s > 1e3 ? 1e3 : s > 500 ? 500 : 200 : o = s > 2700 ? 4e3 : s > 2300 ? 3500 : s > 1500 ? 3e3 : s > 1e3 ? 2700 : s > 700 ? 2300 : s > 500 ? 2e3 : s > 300 ? 1500 : s > 100 ? 1e3 : 700, this.scrollDuration = Math.min(o), this.animationFrame = this.animateScroll(Date.now());
  }
  set currentScroll(t) {
    const e = Math.max(0, this.maxHeight - this.__height);
    t < 0 ? t = 0 : t > e && (t = e), this._currentScroll = t, this.scrollBar && this._needsUpdateScoller && this.scrollBar.setScrollPercent(this.scrollPercent), this.adjustOptions();
  }
  get currentScroll() {
    return this._currentScroll;
  }
  addScrollItems(t) {
    t.forEach((e) => {
      const i = e;
      i.just_added = !0, i.visible = !0, this.po.addChild(i), i.interactive && (i.hitArea = new PIXI.Rectangle(0, 0, i.width, i.height)), this.options.push(i);
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
  spliceScrollItems(t, e, i = !0) {
    const n = typeof e == "number" && e >= 0 ? e : this.options.length, s = [];
    for (let o = t; o < n; o++)
      s.push(o);
    this.removeScrollItems(s, i);
  }
  removeScrollItems(t, e = !0) {
    const i = Array.isArray(t) ? t : [t], n = [];
    return i.forEach((s) => {
      const o = typeof s == "number" ? this.options[s] : s, a = this.options.find((l) => l === o);
      a && (n.push(this.options.indexOf(a)), a.parent === this.po && this.po.removeChild(a), e && a.destroy({ children: !0 }));
    }), n.length ? (this.options = this.options.filter((s, o) => !n.includes(o)), this.recalculateHeight(), this._currentScroll > this.maxHeight - this.__height && (this.currentScroll = Math.max(0, this.maxHeight - this.__height)), this.repositionOptions(), this.adjustVisibility(null, !0), this.redraw(), !0) : !1;
  }
  recurseChildren(t, e, i) {
    if ((t.interactive || t.interactiveChildren) && this._containsPoint(t, e)) {
      t.interactive && i.push(t);
      const n = t;
      t.interactiveChildren && n.children && n.children.forEach((s) => {
        this.recurseChildren(s, e, i);
      });
    }
    return i;
  }
}
const gt = {
  linear: (r) => r
};
function mt(r) {
  const t = r.replace("#", ""), e = parseInt(t, 16), i = e >> 16 & 255, n = e >> 8 & 255, s = e & 255;
  return [i, n, s];
}
function $(r) {
  const t = (e) => {
    const n = Math.min(255, Math.max(0, Math.round(e))).toString(16);
    return n.length === 1 ? "0" + n : n;
  };
  return `#${t(r[0])}${t(r[1])}${t(r[2])}`;
}
class Fe {
  constructor(t, e) {
    this.updater = () => {
    }, this.ender = () => {
    }, this.length = 1e3, this.easingName = "linear", this.startColors = t.map(mt), this.endColors = e.map(mt);
  }
  onUpdate(t) {
    return this.updater = t, this;
  }
  onEnd(t) {
    return this.ender = t, this;
  }
  duration(t) {
    return this.length = t, this;
  }
  easing(t) {
    return this.easingName = t, this;
  }
  start(t) {
    return this.startTime = performance.now(), typeof t == "function" && setTimeout(t, 0), this;
  }
  update() {
    if (this.startTime == null) return null;
    const i = (performance.now() - this.startTime) / this.length;
    if (i >= 1) {
      const a = this.endColors.map((l) => {
        const h = $(l);
        return { hex: () => h };
      });
      return this.updater(a, 1), this.stop(), a;
    }
    const s = (gt[this.easingName] || gt.linear)(Math.max(0, Math.min(1, i))), o = this.endColors.map((a, l) => {
      const h = this.startColors[l], d = [
        h[0] + (a[0] - h[0]) * s,
        h[1] + (a[1] - h[1]) * s,
        h[2] + (a[2] - h[2]) * s
      ], u = $(d);
      return { hex: () => u };
    });
    return this.updater(o, i), o;
  }
  stop() {
    this.startTime = void 0;
    const t = this.endColors.map((e) => {
      const i = $(e);
      return { hex: () => i };
    });
    return this.ender(t, 1), this;
  }
}
const $e = "__pixi-dom-dynamic-texture-atlas";
var Ee = /* @__PURE__ */ ((r) => (r.flexStart = "flex-start", r.flexEnd = "flex-end", r.center = "center", r.spaceBetween = "spaceBetween", r.spaceAround = "spaceAround", r.spaceEvenly = "spaceEvenly", r))(Ee || {}), Oe = /* @__PURE__ */ ((r) => (r.row = "row", r.row_reverse = "row-reverse", r.column = "column", r.column_reverse = "column-reverse", r))(Oe || {}), Pe = /* @__PURE__ */ ((r) => (r.nowrap = "nowrap", r.wrap = "wrap", r.wrap_reverse = "wrap-reverse", r))(Pe || {}), He = /* @__PURE__ */ ((r) => (r.LINEAR = "linear", r.QUADRATIC = "quadtratic", r.CUBIC = "cubic", r.QUARTIC = "quartic", r.QUINTIC = "quintic", r.SINUSOIDAL = "sinusoidal", r.EXPONENTIAL = "exponential", r.CIRCULAR = "circular", r.ELASTIC = "elastic", r.BACK = "back", r))(He || {}), P = /* @__PURE__ */ ((r) => (r.background = "background", r.circle_color = "circle_color", r.circle_position = "circle_position", r.label = "label", r))(P || {});
const _ = 2;
class ke extends PIXI.Container {
  /**
   * Creates a new Toggle instance.
   * @param options - Configuration options for the toggle appearance and behavior
   * @param isToggled - Initial toggle state (default: false). Prefer using options.startingValue instead.
   */
  constructor(t, e) {
    super(), this._toggled = !0, this.circleRadius = 0, this.circleDiameter = 0, this.computedBorderRadius = 0, this.onText = null, this.offText = null, this.usingLabels = !1, this.tween = null, this.backgroundColorsArrayIndex = null, this.circleColorsArrayIndex = null, this.toggleCircleTravelDistance = 0, this.options = t, this.resolvedColors = {
      onBackground: y(t.onBackgroundColor),
      offBackground: y(t.offBackgroundColor),
      onCircle: y(t.onCircleColor ?? t.onToggleColor),
      offCircle: y(t.offCircleColor ?? t.offToggleColor),
      outline: t.backgroundOutline ? y(t.backgroundOutline.color) : null
    };
    const i = t.startingValue ?? e ?? !1;
    this.backgroundGraphic = new PIXI.Graphics();
    const n = t.borderRadius ? t.borderRadius : 50;
    if (t.borderRadius = n, this.computedBorderRadius = t.borderRadius / 100 * t.height, this.backgroundGraphic.drawRoundedRect(0, 0, t.width, t.height, this.computedBorderRadius), this.addChild(this.backgroundGraphic), t.labelOptions) {
      const { fontName: s, onLabel: o, offLabel: a, onColor: l, offColor: h } = t.labelOptions;
      this.onText = H(o, { font: s, align: "left" }), this.offText = H(a, { font: s, align: "left" }), this.addChild(this.onText), this.addChild(this.offText), this.onText.visible = !1, this.offText.visible = !1;
      const d = t.width / 2 - this.offText.width;
      if (d < 0)
        throw new Error("Label for off text was too long");
      this.offText.x = t.width / 2 + d / 2 - _, E(this.offText, X(h));
      const u = t.height - this.offText.height;
      if (u < 0)
        throw new Error("Label font is too large to fit within height of toggle, either increase height or use smaller font");
      this.offText.y = u / 2;
      const c = t.width / 2 - this.onText.width;
      if (c < 0)
        throw new Error("Label for on text was too long");
      this.onText.x = _ + c / 2, E(this.onText, X(l));
      const f = t.height - this.onText.height;
      if (f < 0)
        throw new Error("Label font is too large to fit within height of toggle, either increase height or use smaller font");
      this.onText.y = f / 2, this.usingLabels = !0;
    }
    this.circleRadius = this.options.height / 2 - _, this.circleDiameter = this.circleRadius * 2, this.circleGraphic = new PIXI.Graphics(), this.circleGraphic.y = _, this.addChild(this.circleGraphic), this.toggleCircleTravelDistance = Math.abs(this.getCircleCenter(!1) - this.getCircleCenter(!0)), this.interactive = !0, this.buttonMode = !0, this.on("pointerdown", () => {
      this.toggled = !this.toggled;
    }), this.updateToggle = this.staticToggleUpdate.bind(this), this._toggled = i, this.updateToggle(), this.updateToggle = t.animationOptions ? this.animatedToggleUpdate.bind(this) : this.staticToggleUpdate.bind(this);
  }
  get activeBackgroundColor() {
    return this.toggled ? this.resolvedColors.onBackground.value : this.resolvedColors.offBackground.value;
  }
  get inactiveBackgroundColor() {
    return this.toggled ? this.resolvedColors.offBackground.value : this.resolvedColors.onBackground.value;
  }
  get activeCircleColor() {
    return this.toggled ? this.resolvedColors.onCircle.value : this.resolvedColors.offCircle.value;
  }
  get inactiveCircleColor() {
    return this.toggled ? this.resolvedColors.offCircle.value : this.resolvedColors.onCircle.value;
  }
  get activeTextLabel() {
    return this.toggled ? this.onText : this.offText;
  }
  get inactiveTextLabel() {
    return this.toggled ? this.offText : this.onText;
  }
  get travelToX() {
    return this.toggled ? this.getCircleCenter(!1) : this.getCircleCenter(!0);
  }
  set toggled(t) {
    this.emit("toggle-change", t), this._toggled = t, this.updateToggle();
  }
  /** Gets the current toggle state */
  get toggled() {
    return this._toggled;
  }
  /**
   * Registers a callback to be invoked when the toggle state changes.
   * @param callback - Function to call with the new toggle state (boolean)
   */
  onToggle(t) {
    this.on("toggle-change", t);
  }
  animateToggle() {
    this.tween && this.tween.update() && requestAnimationFrame(() => this.animateToggle());
  }
  midAnimationToggleUpdate(t, e) {
    const i = this.options.animationOptions;
    if (!i) return;
    const n = i.exclude, s = this.toggleCircleTravelDistance * e;
    if (this.usingLabels && this.activeTextLabel && this.inactiveTextLabel && (!n || !n.includes(P.label)) && (this.activeTextLabel.visible = !0, this.inactiveTextLabel.visible = !0, this.inactiveTextLabel.alpha = 1 - e, this.activeTextLabel.alpha = e), this.backgroundColorsArrayIndex !== null) {
      this.backgroundGraphic.clear();
      const o = this.options.backgroundOutline, a = this.resolvedColors.outline;
      o && a && this.backgroundGraphic.lineStyle(o.width, a.value, a.alpha);
      const l = t[this.backgroundColorsArrayIndex];
      l && (this.backgroundGraphic.beginFill(A(l.hex())), this.backgroundGraphic.drawRoundedRect(0, 0, this.options.width, this.options.height, this.computedBorderRadius), this.backgroundGraphic.endFill());
    }
    if ((!n || !n.includes(P.circle_position)) && (this.toggled ? this.circleGraphic.x = this.travelToX + s : this.circleGraphic.x = this.travelToX - s), this.circleColorsArrayIndex !== null) {
      const o = t[this.circleColorsArrayIndex];
      o && this.setCircleColor(A(o.hex()));
    }
  }
  animatedToggleUpdate() {
    const t = this.options.animationOptions;
    if (!t) {
      this.staticToggleUpdate();
      return;
    }
    const e = t.exclude, i = [], n = [];
    (!e || !e.includes(P.background)) && (i.push(k(this.activeBackgroundColor)), n.push(k(this.inactiveBackgroundColor)), this.backgroundColorsArrayIndex = 0), (!e || !e.includes(P.circle_color)) && (i.push(k(this.activeCircleColor)), n.push(k(this.inactiveCircleColor)), this.circleColorsArrayIndex = i.length - 1), this.tween = new Fe(n, i).duration(t.duration).easing(t.type).onUpdate(this.midAnimationToggleUpdate.bind(this)).onEnd(this.staticToggleUpdate.bind(this)).start(() => this.animateToggle());
  }
  staticToggleUpdate() {
    this.backgroundGraphic.clear();
    const t = this.options.backgroundOutline, e = this.resolvedColors.outline;
    t && e && this.backgroundGraphic.lineStyle(t.width, e.value, e.alpha);
    let i, n, s;
    this._toggled ? (s = this.resolvedColors.onBackground, i = this.options.width - this.circleDiameter - _, n = this.resolvedColors.onCircle, this._showOnText()) : (s = this.resolvedColors.offBackground, i = _, n = this.resolvedColors.offCircle, this._showOffText()), this.backgroundGraphic.beginFill(s.value, s.alpha), this.backgroundGraphic.drawRoundedRect(0, 0, this.options.width, this.options.height, this.computedBorderRadius), this.backgroundGraphic.endFill(), this.setCircleColor(n.value, n.alpha), this.circleGraphic.x = i;
  }
  setCircleColor(t, e = 1) {
    this.circleGraphic.clear(), this.circleGraphic.beginFill(t, e), this.circleGraphic.drawCircle(this.circleRadius, this.circleRadius, this.circleRadius), this.circleGraphic.endFill();
  }
  getCircleCenter(t) {
    return t ? this.options.width - _ - this.circleDiameter : _;
  }
  _showOnText() {
    this.usingLabels && this.onText && this.offText && (this.onText.visible = !0, this.offText.visible = !1);
  }
  _showOffText() {
    this.usingLabels && this.onText && this.offText && (this.onText.visible = !1, this.offText.visible = !0);
  }
}
class Le extends S {
  /**
   * Creates a new Button instance.
   * @param text - The label text to display on the button
   * @param styleOptions - Configuration options for button appearance
   */
  constructor(t, e) {
    super(), this.bitmapTxtSprite = null, this.txtSprite = null, this.bgGraphic = null, this.bgSprite = null, this.styleOptions = { defaultStyle: {}, font: "", useBitmapText: !0 }, this._btnState = 0, this._text = t, this.interactive = !0, this.buttonMode = !0, this.on(
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
  /**
   * Sets the button label text.
   * @param value - New text to display
   */
  set text(t) {
    this._text = t, this.redrawText();
  }
  /**
   * Updates the button's style options and triggers a redraw.
   * @param styleOptions - New style configuration to apply
   */
  updateStyle(t) {
    const e = this.styleOptions.useBitmapText !== t.useBitmapText;
    this.styleOptions = { ...this.styleOptions, ...t }, this.styleOptions.useBitmapText = this.styleOptions.useBitmapText ?? !1, e && this.clear(), this.redraw();
  }
  /**
   * Forces a complete redraw of the button including background and text.
   */
  redraw() {
    this.redrawBg(), this.redrawText();
  }
  /**
   * Redraws just the text portion of the button.
   */
  redrawText() {
    const t = this.currentStyleState;
    let e;
    if (this.styleOptions.useBitmapText ? (this.bitmapTxtSprite || (this.bitmapTxtSprite = H("", { font: this.styleOptions.font, align: "center" })), this.txtSprite && (this.txtSprite.destroy(), this.txtSprite = null), this.bitmapTxtSprite.maxWidth = this.width, e = this.bitmapTxtSprite) : (this.txtSprite || (this.txtSprite = new PIXI.Text("", { fontFamily: this.styleOptions.font, align: "center" })), this.styleOptions.fontSize && (this.txtSprite.style.fontSize = this.styleOptions.fontSize), this.bitmapTxtSprite && (this.bitmapTxtSprite.destroy({ children: !0 }), this.bitmapTxtSprite = null), e = this.txtSprite), t.textColor !== void 0 && t.textColor !== null) {
      const i = y(t.textColor);
      this.bitmapTxtSprite && this.styleOptions.useBitmapText ? E(this.bitmapTxtSprite, i.value) : this.txtSprite && (this.txtSprite.style.fill = i.value);
    }
    e.parent || this.addChild(e), e.text = this._text, this.styleOptions.useBitmapText ? (e.x = t.width / 2 - e.width / 2, e.y = t.height / 2 - e.height / 2) : this.txtSprite && (this.txtSprite.anchor.set(0.5), e.x = t.width / 2, e.y = t.height / 2);
  }
  get textSpriteUtilized() {
    return this.styleOptions.useBitmapText ? this.bitmapTxtSprite : this.txtSprite;
  }
  redrawBg() {
    const t = this.currentStyleState, { backgroundColor: e, borderRadius: i, borderColor: n, borderWidth: s, width: o, height: a, backgroundTexture: l } = t, h = typeof t.backgroundOpacity == "number" ? t.backgroundOpacity : 1, d = typeof t.borderOpacity == "number" ? t.borderOpacity : 1;
    if (e != null) {
      this.bgGraphic ? this.bgGraphic.clear() : this.bgGraphic = new PIXI.Graphics(), this.bgGraphic.parent || this.addChild(this.bgGraphic);
      const u = y(e);
      if (this.bgGraphic.beginFill(u.value, u.alpha * h), s) {
        const c = n != null ? y(n) : null;
        this.bgGraphic.lineStyle(s, c?.value ?? 0, (c?.alpha ?? 1) * d);
      }
      if (i) {
        const c = i / 100 * a;
        this.bgGraphic.drawRoundedRect(0, 0, o, a, c);
      } else
        this.bgGraphic.drawRect(0, 0, o, a);
      this.bgGraphic.endFill();
    }
    l && (this.bgSprite || (this.bgSprite = new PIXI.Sprite()), this.bgSprite.parent || this.addChild(this.bgSprite), this.bgSprite.texture = l, this.bgSprite.x = o / 2 - this.bgSprite.width / 2, this.bgSprite.y = a / 2 - this.bgSprite.height / 2), this.hitArea = new PIXI.Rectangle(0, 0, o, a);
  }
  clear() {
    const t = this.textSpriteUtilized;
    t && (this.removeChild(t), t.destroy({ children: !0 }), this.bitmapTxtSprite = null, this.txtSprite = null), this.bgGraphic && (this.removeChild(this.bgGraphic), this.bgGraphic.destroy(), this.bgGraphic = null), this.bgSprite && (this.removeChild(this.bgSprite), this.bgSprite.destroy(), this.bgSprite = null);
  }
  get currentStyleState() {
    const t = this.styleOptions.defaultStyle;
    let e;
    switch (this._btnState) {
      case 1:
        e = this.styleOptions.hoverStyle ? { ...t, ...this.styleOptions.hoverStyle } : t;
        break;
      case 2:
        e = this.styleOptions.pressedStyle ? { ...t, ...this.styleOptions.pressedStyle } : this.styleOptions.hoverStyle ? { ...t, ...this.styleOptions.hoverStyle } : t;
        break;
      case 0:
      default:
        e = t;
        break;
    }
    return {
      ...e,
      width: e.width ?? 0,
      height: e.height ?? 0
    };
  }
}
function Be(r) {
  const t = { ...r };
  return t.handleRadius !== void 0 && t.circleRadius === void 0 && (t.circleRadius = t.handleRadius), t.trackColor !== void 0 && t.inactiveColor === void 0 && (t.inactiveColor = t.trackColor), t.handleColor !== void 0 && t.circleColor === void 0 && (t.circleColor = t.handleColor), t.value !== void 0 && t.startingValue === void 0 && (t.startingValue = t.value), t.min !== void 0 && t.minValue === void 0 && (t.minValue = t.min), t.max !== void 0 && t.maxValue === void 0 && (t.maxValue = t.max), t.startingValue = t.startingValue ?? 0, t.minValue = t.minValue ?? 0, t.maxValue = t.maxValue ?? 100, t.circleRadius = t.circleRadius ?? 10, t.activeColor = t.activeColor ?? 4886745, t.inactiveColor = t.inactiveColor ?? 6710886, t.circleColor = t.circleColor ?? 16777215, t.down && (t.down.handleRadius !== void 0 && t.down.circleRadius === void 0 && (t.down.circleRadius = t.down.handleRadius), t.down.handleColor !== void 0 && t.down.circleColor === void 0 && (t.down.circleColor = t.down.handleColor)), t.hover && (t.hover.handleRadius !== void 0 && t.hover.circleRadius === void 0 && (t.hover.circleRadius = t.hover.handleRadius), t.hover.handleColor !== void 0 && t.hover.circleColor === void 0 && (t.hover.circleColor = t.hover.handleColor)), t;
}
class Me extends PIXI.Container {
  /**
   * Creates a new Slider instance.
   * @param options - Configuration options for the slider appearance and behavior
   */
  constructor(t) {
    super(), this.isDragging = !1, this.isHovered = !1, this.curOutlineWidth = 0, this.lastX = 0, this.resolvedScale = null, this.options = Be(t), this.currentValue = this.options.startingValue, this.backgroundGraphic = new PIXI.Graphics(), super.addChild(this.backgroundGraphic), this.circleRadius = this.options.circleRadius, this.circleHandle = new S(), this.circleGraphic = new PIXI.Graphics(), this.circleGraphic.drawCircle(0, this.circleRadius, this.circleRadius), this.circleHandle.addChild(this.circleGraphic), super.addChild(this.circleHandle);
    const e = (this.currentValue - this.options.minValue) / (this.options.maxValue - this.options.minValue);
    this.circleHandle.x = e * this.options.width, this.redrawCircle(), this.redrawBar(), this.circleHandle.onMouseOver(() => {
      this.isHovered = !0, this.redrawCircle();
    }), this.circleHandle.onMouseOut(() => {
      this.isHovered && (this.isHovered = !1, this.isDragging || this.redrawCircle());
    });
    let i = 0, n = 0;
    this.circleHandle.onDragStart((s) => {
      this.resolvedScale = null, this.resolveScale(), this.isDragging = !0, i = s.global?.x ?? s.data?.global?.x ?? 0, n = this.circleHandle.x, this.redrawCircle();
    }, 0), this.circleHandle.onDragMove((s) => {
      if (!this.isDragging) return;
      const o = s.global?.x ?? s.data?.global?.x ?? 0, a = this.options.preventScaleAdjustment ? 1 : this.resolveScale().x, l = n + (o - i) * a, h = Math.max(0, Math.min(l, this.options.width));
      h !== this.circleHandle.x && (this.circleHandle.x = h, this.currentValue = this.calculateValue(), this.redrawBar(), super.emit("slider-change", this.currentValue));
    }), this.circleHandle.onDragEnd(() => {
      this.isDragging && (this.resolvedScale = null, this.isDragging = !1, this.redrawCircle());
    });
  }
  resolveScale() {
    if (this.resolvedScale) return this.resolvedScale;
    let t = 1 / this.scale.x, e = 1 / this.scale.y, i = this.parent;
    for (; i; )
      t /= i.scale.x, e /= i.scale.y, i = i.parent;
    return this.resolvedScale = { x: t, y: e };
  }
  calculateValue() {
    const { maxValue: t, minValue: e, width: i } = this.options, n = this.circleHandle.x / i;
    return Re(e, t, n);
  }
  redrawCircle() {
    this.circleGraphic.clear();
    let t = this.options.circleOpacity || 1;
    this.isDragging && this.options.down?.circleOpacity ? t = this.options.down.circleOpacity : this.isHovered && this.options.hover?.circleOpacity && (t = this.options.hover.circleOpacity);
    let e = this.options.circleRadius;
    this.isDragging && this.options.down?.circleRadius ? e = this.options.down.circleRadius : this.isHovered && this.options.hover?.circleRadius && (e = this.options.hover.circleRadius);
    let i = this.options.circleColor;
    this.isDragging && this.options.down?.circleColor ? i = this.options.down.circleColor : this.isHovered && this.options.hover?.circleColor && (i = this.options.hover.circleColor);
    let n = 0;
    this.isDragging && this.options.down?.circleOutlineWidth ? n = this.options.down.circleOutlineWidth : this.isHovered && this.options.hover?.circleOutlineWidth ? n = this.options.hover.circleOutlineWidth : this.options.circleOutlineWidth && (n = this.options.circleOutlineWidth);
    let s = this.options.circleOutlineColor ?? 0;
    this.isDragging && this.options.down?.circleOutlineColor ? s = this.options.down.circleOutlineColor : this.isHovered && this.options.hover?.circleOutlineColor && (s = this.options.hover.circleOutlineColor);
    let o = this.options.circleOutlineOpacity || 1;
    this.isDragging && this.options.down?.circleOutlineOpacity ? o = this.options.down.circleOutlineOpacity : this.isHovered && this.options.hover?.circleOutlineOpacity && (o = this.options.hover.circleOutlineOpacity);
    const a = y(i), l = y(s);
    this.circleGraphic.lineStyle(n, l.value, l.alpha * o), this.circleGraphic.beginFill(a.value, a.alpha * t), this.circleGraphic.drawCircle(0, e, e), this.circleGraphic.endFill(), et(this.circleGraphic, { axis: "y", parent: { height: this.options.height } });
  }
  redrawBar() {
    const t = this.circleHandle.x, e = this.options.width - t;
    this.backgroundGraphic.clear();
    const i = this.options.opacity || 1, n = y(this.options.activeColor), s = y(this.options.inactiveColor);
    this.backgroundGraphic.beginFill(n.value, n.alpha * i), this.backgroundGraphic.drawRect(0, 0, t, this.options.height), this.backgroundGraphic.endFill(), this.backgroundGraphic.beginFill(s.value, s.alpha * i), this.backgroundGraphic.drawRect(t, 0, e, this.options.height), this.backgroundGraphic.endFill();
  }
  /**
   * Removes a previously registered change listener.
   * @param callback - The callback function to remove
   */
  offChange(t) {
    super.off("slider-change", t);
  }
  /**
   * Registers a callback to be invoked when the slider value changes.
   * @param callback - Function to call with the new slider value
   */
  onChange(t) {
    super.on("slider-change", t);
  }
}
function Re(r, t, e) {
  return (1 - e) * r + e * t;
}
const Ae = /^(?:[a-z]+:|\/\/)/i, Xe = (r) => {
  if (!r || typeof r != "string" || Ae.test(r) || r.startsWith("data:") || r.startsWith("blob:") || typeof window > "u" || typeof window.location > "u")
    return r;
  try {
    return new URL(r, window.location.href).toString();
  } catch {
    return r;
  }
};
class Ge {
  constructor(t) {
    this.fontLookup = {}, this.assetQueue = [];
    const e = PIXI;
    w();
    const i = typeof e.Assets < "u";
    this.useAssets = i, this.loader = t ?? null, this.useAssets || (this.loader = this.loader ?? wt() ?? q());
  }
  registerLoadedFont(t, e) {
    if (!t || !e)
      return;
    const i = PIXI;
    if (w() >= 8) {
      const c = i?.Cache;
      if (c && typeof c.set == "function") {
        const f = e?.fontFamily, p = [t, `${t}-bitmap`];
        f && f !== t && p.push(f, `${f}-bitmap`), p.forEach((g) => {
          try {
            c.has(g) || c.set(g, e);
          } catch {
          }
        });
      }
      return;
    }
    const s = i?.BitmapFont ?? i?.extras?.BitmapFont ?? i?.extras?.BitmapText?.BitmapFont ?? null;
    if (typeof s != "function")
      return;
    let o = null;
    if (e instanceof s)
      o = e;
    else if (e?.bitmapFont instanceof s)
      o = e.bitmapFont;
    else if (e?.data && e?.textures)
      try {
        o = new s(e);
      } catch {
        o = null;
      }
    if (!o)
      return;
    const a = o.fontFamily ?? o.font ?? o.name ?? t, l = /* @__PURE__ */ new Set(), h = (c) => {
      c && (l.add(c), c.endsWith("-bitmap") || l.add(`${c}-bitmap`));
    };
    h(t), h(a);
    const d = i?.Cache ?? i?.Assets?.cache;
    d && typeof d.set == "function" && l.forEach((c) => {
      try {
        d.set(c, o);
      } catch {
      }
    }), [
      i?.BitmapFont?.available,
      i?.BitmapFont?.fonts,
      i?.extras?.BitmapFont?.available,
      i?.extras?.BitmapText?.fonts
    ].forEach((c) => {
      if (c) {
        if (c instanceof Map) {
          const f = (p) => {
            p && !c.has(p) && c.set(p, o);
          };
          f(a), f(t), f(a ? `${a}-bitmap` : void 0), f(t ? `${t}-bitmap` : void 0);
          return;
        }
        if (c instanceof Set) {
          a && (c.add(a), c.add(`${a}-bitmap`)), c.add(t), c.add(`${t}-bitmap`);
          return;
        }
        typeof c == "object" && (a && !c[a] && (c[a] = o), c[t] || (c[t] = o), a && !c[`${a}-bitmap`] && (c[`${a}-bitmap`] = o), c[`${t}-bitmap`] || (c[`${t}-bitmap`] = o));
      }
    });
  }
  add(t, e) {
    if (!t || !e)
      throw new Error("FontLoader.add requires both alias and url.");
    if (this.fontLookup[t] || ee(t))
      return this;
    this.fontLookup[t] = !0;
    const i = Xe(e);
    return this.useAssets ? this.assetQueue.push({ alias: t, src: i }) : this.loader?.add(t, i), this;
  }
  async load(t) {
    if (this.useAssets) {
      const i = PIXI.Assets, n = [];
      if (this.assetQueue.forEach(({ alias: s, src: o }) => {
        i.add({ alias: s, src: o }), n.push(s);
      }), n.length) {
        const s = await i.load(n);
        n.length === 1 ? this.registerLoadedFont(n[0], s) : s && typeof s == "object" && !Array.isArray(s) && n.forEach((o) => {
          const a = s[o];
          a && this.registerLoadedFont(o, a);
        });
      }
      this.assetQueue = [], t?.();
      return;
    }
    const e = this.loader ?? (this.loader = q());
    await new Promise((i) => {
      e.load(() => {
        t?.(), i();
      });
    });
  }
}
const We = async (r, t = {}) => {
  const {
    width: e = 800,
    height: i = 600,
    backgroundColor: n = 0,
    antialias: s = !0,
    forceCanvas: o = !1,
    ...a
  } = t, l = X(n), h = Math.floor(w()), d = PIXI.Application;
  let u;
  return h >= 8 ? (u = new d(), await u.init({ width: e, height: i, backgroundColor: l, antialias: s, canvas: r, ...a })) : u = new d({ width: e, height: i, backgroundColor: l, antialias: s, view: r, forceCanvas: o, ...a }), u.ticker && (u.ticker.start(), h < 8 && u.ticker.add(() => u.renderer.render(u.stage))), h >= 7 && u.renderer.events ? u.renderer.events.setTargetElement(r) : h >= 5 && u.renderer.plugins && u.renderer.plugins.interaction && u.renderer.plugins.interaction.setTargetElement(r), h >= 7 && typeof u.stage.eventMode < "u" ? u.stage.eventMode = "static" : u.stage.interactive = !0, u.stage.interactiveChildren = !0, Ct(u.renderer), u;
}, Ne = {
  createApp: We,
  getPixiVersion: w,
  getLoader: wt,
  newLoader: q
}, Ke = {
  centerPixiObject: et,
  string2hex: A,
  normalizeColor: y,
  colorToInt: X,
  normalizeColorOr: Mt,
  safeColorInt: F
}, Ve = (r) => {
  r.Slider = r.Slider || Me, r.Toggle = r.Toggle || ke, r.TextField = r.TextField || ge, r.TextArea = r.TextArea || Se, r.Element = r.Element || S, r.ScrollBar = r.ScrollBar || Dt, r.ScrollList = r.ScrollList || De, r.Button = r.Button || Le, r.FontLoader = r.FontLoader || Ge, r.PixiAdapter = r.PixiAdapter || Ne;
  const t = r.utils || (r.utils = {});
  typeof t.string2hex != "function" && (t.string2hex = A), typeof t.hex2string != "function" && (t.hex2string = (e) => `#${`000000${F(e).toString(16)}`.slice(-6)}`), typeof t.centerObject != "function" && (t.centerObject = et);
}, yt = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : null;
yt?.PIXI && (jt(), Ve(yt.PIXI));
export {
  He as AnimationType,
  Le as Button,
  Oe as FlexDirection,
  Pe as FlexWrap,
  Ge as FontLoader,
  $e as GLOBAL_PIXI_DTA_PROPERTY_KEY,
  Ee as JustifyContent,
  Ne as PixiAdapter,
  S as PixiElement,
  Dt as ScrollBar,
  De as ScrollList,
  Me as Slider,
  Se as TextArea,
  ge as TextField,
  ke as Toggle,
  P as ToggleAnimationExclusions,
  z as caretColFromX,
  C as caretFromIndex,
  At as clientToStageCoords,
  k as colorToHexString,
  X as colorToInt,
  Nt as configureRendererView,
  H as createBitmapText,
  je as ensurePixiCanvasFallback,
  jt as ensurePixiGraphicsCompatibility,
  Gt as findCanvasFromEvent,
  Xt as findRendererForCanvas,
  wt as getPixiLoader,
  w as getPixiVersion,
  N as getRendererCanvas,
  St as getRendererPointerScale,
  bt as getRendererResolution,
  Rt as getRendererScreenSize,
  ct as glyphsToCaretPositions,
  se as indexFromPoint,
  ie as layoutText,
  le as lineBounds,
  oe as moveCaretByLines,
  ne as moveCaretVertically,
  q as newPixiLoader,
  y as normalizeColor,
  Mt as normalizeColorOr,
  Ct as registerPixiRenderer,
  Ye as renderContainer,
  Ue as resolvePixiRenderer,
  F as safeColorInt,
  ae as selectionRects,
  E as setBitmapTextTint,
  Ke as utils
};
//# sourceMappingURL=index.es.mjs.map

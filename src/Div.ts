import { parseLengthMeasurements } from "./utils";
import {InputStyleOptions, InputStyleOptionsParams} from "./types";
import {on} from "cluster";
import Timeout = NodeJS.Timeout;

type ValidMeasurement = {
    value: number,
    type: string, // percent or pixel
}

export type StyleOptions = {
    width?: ValidMeasurement,
    height?: ValidMeasurement,
}

export type StyleOptionsParams = {
    width?: number | string,
    height?: number | string,
}

const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}
const lengthFieldsToValidate = ["width", "height"];

const validEventNames = ['mousedown', 'mouseup', 'mouseover'];

class Element extends PIXI.Container {
    public elementChildren: Array<Element>;
    private inDrag: Boolean = false;
    private mouseIsDown: Boolean = false;
    private dragPosition = null;
    private _mousedownHandler: Function = null;
    private _mousemoveHandler: Function = null;
    private _mouseupHandler: Function = null;
    private _mouseoverHandler: Function = null;
    private _mouseleaveHandler: Function = null;

    private _doubleClickHandler: Function = null;

    private _dragendHandler: Function = null;
    private _dragstartHandler: Function = null;

    private doubleClickTimeout: Timeout = null;
    constructor() {
        super();
    }

    set mousedownHandler(handler) { this._setEventNameHandler("mousedown", handler); }
    set mouseupHandler(handler) { this._setEventNameHandler("mouseup", handler); }
    set mouseoverHandler(handler) { this._setEventNameHandler("mouseup", handler); }
    set mousemoveHandler(handler) { this._setEventNameHandler("mousemove", handler); }
    set mouseleaveHandler(handler) { this._setEventNameHandler("mouseleave", handler); }

    set doubleclickHandler(handler) { this._setEventNameHandler("doubleclick", handler); }

    set dragstartHandler(handler) { this._setEventNameHandler("dragstart", handler); }
    set dragendHandler(handler) { this._setEventNameHandler("dragend", handler); }

    private _setEventNameHandler(eventName, handler) {
        const currentHandler =  this[`_${eventName}Handler`];

        // register private handler if we never had a user defined one
        if(!currentHandler) {
            this.on(eventName, this[`__${eventName}`]);
        }

        // set user defined handler
        this[`_${eventName}Handler`] = handler;

        // if button mode wasnt enabled yet, we now do so.
        if(!this.buttonMode) {
            this.buttonMode = true;
            this.interactive = true;
        }
    }

    public onMouseDown(handler) { this.mousedownHandler = handler; }
    public onMouseUp(handler) { this.mouseupHandler = handler; }
    public onMouseOver(handler) { this.mouseoverHandler = handler; }
    public onMouseLeave(handler) { this.mouseleaveHandler = handler; }
    public onMouseMove(handler) { this.mousemoveHandler = handler }

    public onDragStart(handler) {
        if(!this._mousedownHandler) { this.mousedownHandler = () => {}; }
        this.dragstartHandler = handler;
    }
    public onDragEnd(handler) {
        if(!this._mouseupHandler) { this.mouseupHandler = () => {}; }
        this.dragendHandler = handler;
    }

    public onDoubleClick(handler) {
        // we need a mousedownhandler for double click to function correctly
        if(!this._mousedownHandler) { this.mousedownHandler = () => {}; }
        this.doubleclickHandler = handler;
    };

    private __doubleclick(event) {
        clearTimeout(this.doubleClickTimeout);
        this.doubleClickTimeout = null;
        this._doubleClickHandler && this._doubleClickHandler(event);
    }

    private __mousedown(event) {
        this.mouseIsDown = true;
        this._mousedownHandler(event);
        if(this.doubleClickTimeout) {
            this.emit("doubleclick", this.__doubleclick);
        } else {
            this.doubleClickTimeout = setTimeout(() => {
                this.doubleClickTimeout = null;
            }, 300);
        }
    }

    private __dragstart(event) {
        this.inDrag = true;
        this._dragstartHandler(event);
    }

    private __mousemove(event) {
        if(this.mouseIsDown && !this.inDrag) {
            this.emit("dragstart", event);
        }
        this._mousemoveHandler(event);
    }

    private __mouseover(event) { this._mouseoverHandler(event); }
    private __mouseleave(event) { this._mouseleaveHandler(event); }

    private __dragend(event) {
        this.inDrag = false;
        this._dragendHandler && this.dragendHandler(event)
    }

    private __mouseup(event) {
        this.mouseIsDown = false;
        this._mouseupHandler(event);
        if(this.inDrag) {
            this.emit("dragover", event)
        }
    }
}

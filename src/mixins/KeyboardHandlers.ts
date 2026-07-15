/**
 * Input type carried by cancelable `beforeinput` events, mirroring the DOM
 * `InputEvent.inputType` values for history operations.
 */
export type HistoryInputType = 'historyUndo' | 'historyRedo';

/**
 * Input type carried by cancelable `beforeinput` events, mirroring the DOM
 * `InputEvent.inputType` values.
 */
export type InputType =
    | 'insertText'
    | 'insertFromPaste'
    | 'deleteContentBackward'
    | 'deleteContentForward'
    | 'deleteByCut'
    | HistoryInputType;

type KeyboardLikeEvent = Pick<KeyboardEvent, 'keyCode' | 'which' | 'ctrlKey' | 'metaKey' | 'shiftKey' | 'preventDefault' | 'code'>;

/**
 * Cancelable event emitted as `'beforeinput'` right before text is mutated or
 * an undo/redo is applied — the same contract the DOM uses: call
 * `preventDefault()` inside a listener to block the operation.
 *
 * @example
 * ```typescript
 * textField.on('beforeinput', (event) => {
 *   if (event.inputType === 'insertText' && event.data === '!') {
 *     event.preventDefault(); // reject exclamation marks
 *   }
 *   if (event.inputType === 'historyUndo') {
 *     event.preventDefault(); // handle undo yourself
 *   }
 * });
 * ```
 */
export type BeforeInputEvent = {
    inputType: InputType;
    /** Text being inserted (`insertText`/`insertFromPaste`), null for deletions and history. */
    data: string | null;
    readonly cancelable: true;
    defaultPrevented: boolean;
    preventDefault(): void;
    /** The keyboard or clipboard event that triggered the operation. */
    nativeEvent: KeyboardLikeEvent | ClipboardEvent;
};

export type IKeyboardBase = {
    readonly text: string;
    ignoreKeys: Array<number | string>;
    submitKeyCodes: Array<number | string>;
    on: (event: string, handler: (event: any) => void) => void;
    off: (event: string, handler: (event: any) => void) => void;
    emit: (event: string, ...args: any[]) => void;
    change: (text: string) => void;
    replaceSelectedWith: (text: string) => string; 
    getSelectedChars: () => string;
    setCursor: (n: number) => void;
    moveCursor: (n: number) => void;
    removeLeftOfCursor: () => void;
    removeRightOfCursor: () => void;
    selectAll: () => void;
    submit: () => void;
    getSelectedRange: () =>  ({
        indexes:
            { start: number, end: number },
        x:
            { start: number, end: number }
    } | null)
}
type Constructor<T = IKeyboardBase> = new (...args: any[]) => T;

export default function <TBase extends Constructor>(Base: TBase){
    return class KeyboardHandledInput extends Base {

        public copiedText: string = '';
        public textStates: Array<string> = [];
        public currentStateIndex: number = -1;

        constructor(...args: any[]) {
            super(...args);
            this.registerHandlers = this.registerHandlers.bind(this);
            this.unregisterHandlers = this.unregisterHandlers.bind(this);
            this.onCopy = this.onCopy.bind(this);
            this.onPaste = this.onPaste.bind(this);
            this.onCut = this.onCut.bind(this);
            this.onKeyPress = this.onKeyPress.bind(this);
            this.onKeyDown = this.onKeyDown.bind(this);

            this.on('focus', this.registerHandlers);
            this.on('blur', this.unregisterHandlers);
        }

        /**
         * Emit a cancelable `beforeinput` event for an impending operation.
         * Returns true when the operation may proceed (nothing called
         * `preventDefault()`), matching the DOM `beforeinput` contract.
         */
        public dispatchBeforeInput(
            inputType: InputType,
            data: string | null,
            nativeEvent: BeforeInputEvent['nativeEvent'],
        ): boolean {
            const beforeInput: BeforeInputEvent = {
                inputType,
                data,
                cancelable: true,
                defaultPrevented: false,
                preventDefault() { this.defaultPrevented = true; },
                nativeEvent,
            };
            this.emit('beforeinput', beforeInput);
            return !beforeInput.defaultPrevented;
        }

        public changeStateIndex(change: number) {
            const newIndex = this.currentStateIndex + change;
            if(newIndex >= 0 && newIndex < this.textStates.length) {
                super.change(this.textStates[newIndex]);
                this.currentStateIndex = newIndex;
            }
        }

        public registerHandlers() {
            document.addEventListener("copy", this.onCopy, true);
            document.addEventListener("cut", this.onCut, true);
            document.addEventListener("paste", this.onPaste, true);
            document.addEventListener("keypress", this.onKeyPress, true);
            document.addEventListener("keydown", this.onKeyDown, true);
        }
        public unregisterHandlers() {
            document.removeEventListener("copy", this.onCopy, true);
            document.removeEventListener("cut", this.onCut, true);
            document.removeEventListener("paste", this.onPaste, true);
            document.removeEventListener("keypress", this.onKeyPress, true);
            document.removeEventListener("keydown", this.onKeyDown, true);
        }

        public onPaste(event: ClipboardEvent) {
            const pastedText = event.clipboardData ? event.clipboardData.getData('text/plain') : this.copiedText;
            if(this.dispatchBeforeInput('insertFromPaste', pastedText, event)) {
                this.addState(super.replaceSelectedWith(pastedText));
            }
        }

        public onCopy(event: ClipboardEvent) {
            event.preventDefault();
            const selected = super.getSelectedChars();
            if(event.clipboardData) {
                event.clipboardData.setData('text/plain', selected)
            }
            this.copiedText = selected;
        }

        public onCut(event: ClipboardEvent){
            event.preventDefault();
            const selected = super.getSelectedChars();
            if(event.clipboardData) {
                event.clipboardData.setData('text/plain', selected);
            }
            this.copiedText = selected;
            // The clipboard is populated regardless (as in the DOM); only the
            // deletion is cancelable.
            if(this.dispatchBeforeInput('deleteByCut', null, event)) {
                this.addState(super.replaceSelectedWith(""));
            }
        };

        public onBackspace(){};
        public onDelete(){};
        /** Overridable hook: ArrowUp keydown (multi-line inputs move the caret up a line). */
        public onArrowUp(_event?: unknown){};
        /** Overridable hook: ArrowDown keydown (multi-line inputs move the caret down a line). */
        public onArrowDown(_event?: unknown){};
        /**
         * Overridable hook: Home keydown. Default moves the caret to the start
         * of the text; multi-line inputs override to go to the line start.
         */
        public onHome(_event?: unknown){ super.setCursor(0); };
        /**
         * Overridable hook: End keydown. Default moves the caret to the end of
         * the text; multi-line inputs override to go to the line end.
         */
        public onEnd(_event?: unknown){ super.setCursor(this.text.length); };
        /**
         * Overridable hook: PageUp keydown. Default jumps to the start of the
         * text; multi-line inputs override to move up one viewport of lines.
         */
        public onPageUp(_event?: unknown){ super.setCursor(0); };
        /**
         * Overridable hook: PageDown keydown. Default jumps to the end of the
         * text; multi-line inputs override to move down one viewport of lines.
         */
        public onPageDown(_event?: unknown){ super.setCursor(this.text.length); };

        public onKeyDown(event: Pick<KeyboardEvent, 'keyCode' | 'which' | 'ctrlKey' | 'metaKey' | 'shiftKey' | 'preventDefault' | 'code'>) {
            const code = event.keyCode ?? event.which;
            const key = event.code;
            if(this.submitKeyCodes.includes(code) || this.submitKeyCodes.includes(key)) {
                super.submit();
            } else if (code == 37 || key === "ArrowLeft") { // left
                const indexes = super.getSelectedRange()?.indexes;

                if(!indexes) {
                    super.moveCursor(-1)
                } else {
                    super.setCursor(indexes.start);
                }
            } else if (code == 39 || key === "ArrowRight") { // right
                const indexes = super.getSelectedRange()?.indexes;
                if(!indexes) {
                    super.moveCursor(1)
                } else {
                    super.setCursor(indexes.end);
                }
            } else if (code == 38 || key === "ArrowUp") { // up
                this.onArrowUp(event);
            } else if (code == 40 || key === "ArrowDown") { // down
                this.onArrowDown(event);
            } else if (code == 36 || key === "Home") { // home
                this.onHome(event);
            } else if (code == 35 || key === "End") { // end
                this.onEnd(event);
            } else if (code == 33 || key === "PageUp") { // page up
                this.onPageUp(event);
            } else if (code == 34 || key === "PageDown") { // page down
                this.onPageDown(event);
            } else if(code == 8 || key === "Backspace") { // backspace
                if(this.dispatchBeforeInput('deleteContentBackward', null, event)) {
                    if(super.getSelectedRange()) {
                        super.replaceSelectedWith("");
                    } else {
                        super.removeLeftOfCursor();
                    }
                    this.addState(this.text);
                }
            } else if (code == 46 || key === "Delete") { //delete
                if(this.dispatchBeforeInput('deleteContentForward', null, event)) {
                    if(super.getSelectedRange()) {
                        super.replaceSelectedWith("");
                    } else {
                        super.removeRightOfCursor();
                    }
                    this.addState(this.text);
                }
            } else if(event.ctrlKey || event.metaKey) {
                if(code == 90 || key === "KeyZ") { // z
                    const indexChange = event.shiftKey ? 1 : -1; // if shift is pressed we want to do redo behavior
                    if(this.dispatchBeforeInput(indexChange === 1 ? 'historyRedo' : 'historyUndo', null, event)) {
                        this.changeStateIndex(indexChange);
                    }
                } else if(code == 65 || key === "KeyA") { // a
                    event.preventDefault();
                    super.selectAll();
                }
            }
        }

        
        public onKeyPress(event: Pick<KeyboardEvent, 'keyCode' | 'which' | 'key' | 'ctrlKey' | 'metaKey' | 'shiftKey' | 'preventDefault' | 'code'>) {
            const code = event.keyCode ?? event.which;
            const key = event.code;
            if(this.submitKeyCodes.includes(code) || this.submitKeyCodes.includes(key) || this.ignoreKeys.includes(code) || this.ignoreKeys.includes(key) || event.ctrlKey || event.metaKey) {
                return;
            }
            if(code !== null && code !== undefined) {
                // Enter arrives as '\r' from fromCharCode; text stores '\n'.
                const char = code === 13 ? '\n' : String.fromCharCode(code);
                if(char) {
                    event.preventDefault();
                    if(this.dispatchBeforeInput('insertText', char, event)) {
                        this.addState(super.replaceSelectedWith(char));
                    }
                }
            } else if (key) {
                const emptyStringKeys = [
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
                
                if(key === 'Enter' || event.key === 'Enter') {
                    event.preventDefault();
                    if(this.dispatchBeforeInput('insertText', '\n', event)) {
                        this.addState(super.replaceSelectedWith('\n'));
                    }
                } else if(emptyStringKeys.includes(key)) {
                    event.preventDefault();
                    if(this.dispatchBeforeInput('deleteContentBackward', null, event)) {
                        this.addState(super.replaceSelectedWith(''));
                    }
                } else if(event.key && event.key.length === 1) {
                    event.preventDefault();
                    if(this.dispatchBeforeInput('insertText', event.key, event)) {
                        this.addState(super.replaceSelectedWith(event.key));
                    }
                }
            }
        }

        public addState(newText: string) {
            // No-op edits (e.g. paste blocked by maxCharacterLength) shouldn't
            // create history entries, and editing after an undo discards the
            // now-stale redo branch.
            if(this.textStates[this.currentStateIndex] === newText) {
                return;
            }
            this.textStates.splice(this.currentStateIndex + 1);
            this.textStates.push(newText);
            this.currentStateIndex = this.textStates.length - 1;
        }
    }
}
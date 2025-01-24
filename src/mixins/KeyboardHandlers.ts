export type IKeyboardBase = {
    ignoreKeys: Array<number | string>;
    submitKeyCodes: Array<number | string>;
    on: (event: string, handler: (event: any) => void) => void;
    off: (event: string, handler: (event: any) => void) => void;
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

            super.on('focus', this.registerHandlers);
            super.on('blur', this.unregisterHandlers);
        }

        public changeStateIndex(change) {
            const newIndex = this.currentStateIndex = change;
            if(this.textStates[newIndex]) {
                super.change(this.textStates[newIndex]);
                this.currentStateIndex = change;
            }
        }

        public registerHandlers() {
            document.addEventListener("copy", this.onCopy);
            document.addEventListener("cut", this.onCut);
            document.addEventListener("paste", this.onPaste);
            document.addEventListener("keypress", this.onKeyPress);
            document.addEventListener("keydown", this.onKeyDown);
        }
        public unregisterHandlers() {
            document.removeEventListener("copy", this.onCopy);
            document.removeEventListener("cut", this.onCut);
            document.removeEventListener("paste", this.onPaste);
            document.removeEventListener("keypress", this.onKeyPress);
            document.removeEventListener("keydown", this.onKeyDown);
        }

        public onPaste(event) {
            const pastedText = event.clipboardData ? event.clipboardData.getData('text/plain') : this.copiedText;
            const newText = super.replaceSelectedWith(pastedText);
            if(newText !== null) {
                this.addState(newText);
            }
        }

        public onCopy(event) {
            event.preventDefault();
            const selected = super.getSelectedChars();
            if(event.clipboardData) {
                event.clipboardData.setData('text/plain', selected)
            }
            this.copiedText = selected;
        }

        public onCut(event){
            event.preventDefault();
            const selected = super.getSelectedChars();
            if(event.clipboardData) {
                event.clipboardData.setData('text/plain', selected);
            }
            this.copiedText = selected;
            const newText = super.replaceSelectedWith("");
            if(newText !== null) {
                this.addState(newText);
            }
        };

        public onBackspace(){};
        public onDelete(){};

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
            } else if(code == 8 || key === "Backspace") { // backspace
                if(super.getSelectedRange()) {
                    super.replaceSelectedWith("");
                } else {
                    super.removeLeftOfCursor();
                }
            } else if (code == 46 || key === "Delete") { //delete
                if(super.getSelectedRange()) {
                    super.replaceSelectedWith("");
                } else {
                    super.removeRightOfCursor();
                }
            } else if(event.ctrlKey || event.metaKey) {
                if(code == 90 || key === "KeyZ") { // z
                    const indexChange = event.shiftKey ? 1 : -1; // if shift is pressed we want to do redo behavior
                    this.changeStateIndex(indexChange);
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
                const char = String.fromCharCode(code);
                if(char) {
                    event.preventDefault();
                    super.replaceSelectedWith(char);
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
                
                if(emptyStringKeys.includes(key)) {
                    event.preventDefault();
                    super.replaceSelectedWith('');
                } else {
                    if(event.key && event.key.length === 1) {
                        event.preventDefault();
                        super.replaceSelectedWith(event.key);
                    }
                }
                    
                if (key === "Backspace") {
                } else if (key === "Delete") {
                    event.preventDefault();
                    super.replaceSelectedWith('');
                } else if (key && key.length === 1) {
                    // Handle printable characters from `key`
                    if (!event.ctrlKey && !event.metaKey) {
                        event.preventDefault();
                        super.replaceSelectedWith(key); // Insert the character
                    }
                }
            }
        }

        public addState(newText) {
            this.textStates.push(newText);
            this.currentStateIndex = this.textStates.length - 1;
        }
    }
}
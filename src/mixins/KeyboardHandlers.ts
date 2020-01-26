type Constructor<T = any> = new (...args: any[]) => T;

export default function <TBase extends Constructor>(Base: TBase){
    return class KeyboardHandledInput extends Base {

        public copiedText: string = '';
        public textStates: Array<string> = [];
        public currentStateIndex: number = -1;
        private stateInterval: any;

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

            this.stateInterval = null;
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

        public onKeyDown(event) {
            const code = event.keyCode ? event.keyCode : event.code;
            if(this.submitKeyCodes.includes(code)) {
                super.submit();
            } else if (code == 37) { // left
                super.moveCursor(-1)
            } else if (code == 39) { // right
                super.moveCursor(1)
            } else if(code == 8) { // backspace
                if(super.getSelectedRange()) {
                    super.replaceSelectedWith("");
                } else {
                    super.removeLeftOfCursor();
                }
            } else if (code == 46) {
                if(super.getSelectedRange()) {
                    super.replaceSelectedWith("");
                } else {
                    super.removeRightOfCursor();
                }
            } else if(event.ctrlKey) {
                if(code == 90) { // z
                    const indexChange = event.shiftKey ? 1 : -1; // if shift is pressed we want to do redo behavior
                    this.changeStateIndex(indexChange);
                } else if(code == 65) { // a
                    event.preventDefault();
                    super.selectAll();
                }
            }
        }

        public onKeyPress(event) {
            const code = event.keyCode ? event.keyCode : event.which;
            if(this.submitKeyCodes.includes(code) || this.ignoreKeys.includes(code)) {
                return;
            }
            const char = String.fromCharCode(code);
            if(char) {
                if(!event.ctrlKey) {
                    event.preventDefault();
                    super.replaceSelectedWith(char);
                }
            }
        }

        public addState(newText) {
            this.textStates.push(newText);
            this.currentStateIndex = this.textStates.length - 1;
        }
    }
}

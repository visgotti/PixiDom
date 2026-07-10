import { expect } from 'chai';
import KeyboardHandlerMixin, { IKeyboardBase } from '../src/mixins/KeyboardHandlers';

class FakeTextInput implements IKeyboardBase {
    public currentText = '';
    public ignoreKeys: Array<number | string> = [];
    public submitKeyCodes: Array<number | string> = [13, 'Enter'];

    private listeners: Record<string, Array<(...args: any[]) => void>> = {};

    get text() {
        return this.currentText;
    }
    on(event: string, handler: (event: any) => void) {
        (this.listeners[event] ??= []).push(handler);
    }
    off(event: string, handler: (event: any) => void) {
        this.listeners[event] = (this.listeners[event] ?? []).filter((h) => h !== handler);
    }
    emit(event: string, ...args: any[]) {
        (this.listeners[event] ?? []).slice().forEach((handler) => handler(...args));
    }
    change(text: string) {
        this.currentText = text;
    }
    replaceSelectedWith(text: string) {
        this.currentText += text;
        return this.currentText;
    }
    getSelectedChars() {
        return '';
    }
    setCursor() {}
    moveCursor() {}
    removeLeftOfCursor() {
        this.currentText = this.currentText.slice(0, -1);
    }
    removeRightOfCursor() {}
    selectAll() {}
    submit() {}
    getSelectedRange() {
        return null;
    }
}

const keyPress = (keyCode: number) => ({
    keyCode,
    which: keyCode,
    key: String.fromCharCode(keyCode),
    code: `Key${String.fromCharCode(keyCode).toUpperCase()}`,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    preventDefault() {},
});

const keyDown = (
    keyCode: number,
    code: string,
    modifiers: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean } = {},
) => ({
    keyCode,
    which: keyCode,
    code,
    ctrlKey: modifiers.ctrlKey ?? false,
    metaKey: modifiers.metaKey ?? false,
    shiftKey: modifiers.shiftKey ?? false,
    preventDefault() {},
});

const KeyboardInput = KeyboardHandlerMixin(FakeTextInput);

describe('KeyboardHandlers undo/redo state history', () => {
    it('undo (changeStateIndex(-1)) steps back to the previous state', () => {
        const input = new KeyboardInput();
        input.addState('a');
        input.addState('ab');
        input.addState('abc');
        input.currentText = 'abc';
        expect(input.currentStateIndex).to.equal(2);

        input.changeStateIndex(-1);

        expect(input.currentText).to.equal('ab');
        expect(input.currentStateIndex).to.equal(1);
    });

    it('redo (changeStateIndex(1)) steps forward after an undo', () => {
        const input = new KeyboardInput();
        input.addState('a');
        input.addState('ab');
        input.addState('abc');
        input.addState('abcd');
        input.currentText = 'abcd';

        input.changeStateIndex(-1);
        expect(input.currentText).to.equal('abc');

        input.changeStateIndex(1);

        expect(input.currentText).to.equal('abcd');
        expect(input.currentStateIndex).to.equal(3);
    });

    it('undo at the oldest state neither changes text nor corrupts the index', () => {
        const input = new KeyboardInput();
        input.addState('a');
        input.currentText = 'a';

        input.changeStateIndex(-1);

        expect(input.currentText).to.equal('a');
        expect(input.currentStateIndex).to.equal(0);
    });

    it('redo at the newest state neither changes text nor corrupts the index', () => {
        const input = new KeyboardInput();
        input.addState('a');
        input.addState('ab');
        input.currentText = 'ab';

        input.changeStateIndex(1);

        expect(input.currentText).to.equal('ab');
        expect(input.currentStateIndex).to.equal(1);
    });

    it('typing records undo states', () => {
        const input = new KeyboardInput();
        input.onKeyPress(keyPress(97)); // 'a'
        input.onKeyPress(keyPress(98)); // 'b'
        expect(input.currentText).to.equal('ab');

        input.changeStateIndex(-1);

        expect(input.currentText).to.equal('a');
    });

    it('backspace records an undo state', () => {
        const input = new KeyboardInput();
        input.onKeyPress(keyPress(97));
        input.onKeyPress(keyPress(98));

        input.onKeyDown(keyDown(8, 'Backspace'));
        expect(input.currentText).to.equal('a');

        input.changeStateIndex(-1);

        expect(input.currentText).to.equal('ab');
    });

    it('typing after an undo truncates the redo branch', () => {
        const input = new KeyboardInput();
        input.onKeyPress(keyPress(97)); // 'a'
        input.onKeyPress(keyPress(98)); // 'ab'
        input.changeStateIndex(-1); // back to 'a'
        input.onKeyPress(keyPress(99)); // 'ac'

        input.changeStateIndex(1); // redo must have nothing to restore

        expect(input.currentText).to.equal('ac');
    });

    it('addState ignores consecutive duplicate states', () => {
        const input = new KeyboardInput();
        input.addState('a');
        input.addState('a');

        expect(input.textStates).to.deep.equal(['a']);
        expect(input.currentStateIndex).to.equal(0);
    });

    it('ctrl+z emits a cancelable beforeinput (historyUndo); preventDefault blocks the undo', () => {
        const input = new KeyboardInput();
        input.onKeyPress(keyPress(97)); // 'a'
        input.onKeyPress(keyPress(98)); // 'ab'

        const seen: any[] = [];
        input.on('beforeinput', (event: any) => {
            seen.push(event);
            event.preventDefault();
        });

        input.onKeyDown(keyDown(90, 'KeyZ', { ctrlKey: true }));

        expect(seen).to.have.length(1);
        expect(seen[0].inputType).to.equal('historyUndo');
        expect(seen[0].cancelable).to.equal(true);
        expect(seen[0].defaultPrevented).to.equal(true);
        expect(input.currentText, 'undo must be blocked').to.equal('ab');
        expect(input.currentStateIndex).to.equal(1);
    });

    it('ctrl+shift+z emits a cancelable beforeinput (historyRedo); preventDefault blocks the redo', () => {
        const input = new KeyboardInput();
        input.onKeyPress(keyPress(97)); // 'a'
        input.onKeyPress(keyPress(98)); // 'ab'
        input.onKeyDown(keyDown(90, 'KeyZ', { ctrlKey: true })); // undo -> 'a'
        expect(input.currentText).to.equal('a');

        const seen: any[] = [];
        input.on('beforeinput', (event: any) => {
            seen.push(event);
            event.preventDefault();
        });

        input.onKeyDown(keyDown(90, 'KeyZ', { ctrlKey: true, shiftKey: true }));

        expect(seen).to.have.length(1);
        expect(seen[0].inputType).to.equal('historyRedo');
        expect(input.currentText, 'redo must be blocked').to.equal('a');
    });

    it('undo proceeds when beforeinput is not prevented (meta key, mac-style)', () => {
        const input = new KeyboardInput();
        input.onKeyPress(keyPress(97)); // 'a'
        input.onKeyPress(keyPress(98)); // 'ab'

        const seen: any[] = [];
        input.on('beforeinput', (event: any) => seen.push(event));

        input.onKeyDown(keyDown(90, 'KeyZ', { metaKey: true }));

        expect(seen).to.have.length(1);
        expect(seen[0].inputType).to.equal('historyUndo');
        expect(seen[0].defaultPrevented).to.equal(false);
        expect(input.currentText).to.equal('a');
    });

    it('typing emits a cancelable beforeinput (insertText) carrying the character', () => {
        const input = new KeyboardInput();
        input.onKeyPress(keyPress(97)); // 'a', no listener yet

        const seen: any[] = [];
        input.on('beforeinput', (event: any) => {
            seen.push(event);
            event.preventDefault();
        });

        input.onKeyPress(keyPress(98)); // 'b' must be blocked

        expect(seen).to.have.length(1);
        expect(seen[0].inputType).to.equal('insertText');
        expect(seen[0].data).to.equal('b');
        expect(input.currentText, 'insertion must be blocked').to.equal('a');
        expect(input.textStates, 'no state recorded for blocked input').to.deep.equal(['a']);
    });

    it('backspace emits a cancelable beforeinput (deleteContentBackward)', () => {
        const input = new KeyboardInput();
        input.onKeyPress(keyPress(97));
        input.onKeyPress(keyPress(98));

        const seen: any[] = [];
        input.on('beforeinput', (event: any) => {
            seen.push(event);
            event.preventDefault();
        });

        input.onKeyDown(keyDown(8, 'Backspace'));

        expect(seen).to.have.length(1);
        expect(seen[0].inputType).to.equal('deleteContentBackward');
        expect(input.currentText, 'deletion must be blocked').to.equal('ab');
    });

    it('delete emits a cancelable beforeinput (deleteContentForward)', () => {
        const input = new KeyboardInput();
        input.onKeyPress(keyPress(97));

        const seen: any[] = [];
        input.on('beforeinput', (event: any) => {
            seen.push(event);
            event.preventDefault();
        });

        input.onKeyDown(keyDown(46, 'Delete'));

        expect(seen).to.have.length(1);
        expect(seen[0].inputType).to.equal('deleteContentForward');
        expect(input.currentText).to.equal('a');
    });

    it('paste emits a cancelable beforeinput (insertFromPaste) carrying the pasted text', () => {
        const input = new KeyboardInput();

        const seen: any[] = [];
        input.on('beforeinput', (event: any) => {
            seen.push(event);
            event.preventDefault();
        });

        input.onPaste({
            clipboardData: { getData: () => 'pasted' },
            preventDefault() {},
        } as any);

        expect(seen).to.have.length(1);
        expect(seen[0].inputType).to.equal('insertFromPaste');
        expect(seen[0].data).to.equal('pasted');
        expect(input.currentText, 'paste must be blocked').to.equal('');
    });

    it('cut emits a cancelable beforeinput (deleteByCut) but still populates the clipboard', () => {
        // Fake with everything selected: cut copies the text and would clear it.
        class AllSelectedInput extends FakeTextInput {
            override getSelectedChars() {
                return this.currentText;
            }
            override replaceSelectedWith(text: string) {
                this.currentText = text;
                return this.currentText;
            }
        }
        const input = new (KeyboardHandlerMixin(AllSelectedInput))();
        input.onKeyPress(keyPress(97));

        const seen: any[] = [];
        input.on('beforeinput', (event: any) => {
            seen.push(event);
            event.preventDefault();
        });

        let clipboard = '';
        input.onCut({
            clipboardData: { setData: (_type: string, value: string) => (clipboard = value) },
            preventDefault() {},
        } as any);

        expect(seen).to.have.length(1);
        expect(seen[0].inputType).to.equal('deleteByCut');
        expect(clipboard, 'clipboard still set like the DOM').to.equal('a');
        expect(input.currentText, 'deletion must be blocked').to.equal('a');
    });

    it('inserts a character exactly once for key-only keypress events (no keyCode)', () => {
        const input = new KeyboardInput();
        input.onKeyPress({
            keyCode: undefined as any,
            which: undefined as any,
            key: 'x',
            code: 'KeyX',
            ctrlKey: false,
            metaKey: false,
            shiftKey: false,
            preventDefault() {},
        });

        expect(input.currentText).to.equal('x');
    });
});

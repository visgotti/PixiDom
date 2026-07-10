import { expect } from 'chai';
import KeyboardHandlerMixin, { IKeyboardBase } from '../src/mixins/KeyboardHandlers';

class FakeTextInput implements IKeyboardBase {
    public currentText = '';
    public ignoreKeys: Array<number | string> = [];
    public submitKeyCodes: Array<number | string> = [13, 'Enter'];

    get text() {
        return this.currentText;
    }
    on() {}
    off() {}
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

const keyDown = (keyCode: number, code: string) => ({
    keyCode,
    which: keyCode,
    code,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
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

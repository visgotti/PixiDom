import { expect } from 'chai';
import KeyboardHandlerMixin, { IKeyboardBase } from '../src/mixins/KeyboardHandlers';

class FakeTextInput implements IKeyboardBase {
    public currentText = '';
    public ignoreKeys: Array<number | string> = [];
    public submitKeyCodes: Array<number | string> = [13, 'Enter'];

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
    removeLeftOfCursor() {}
    removeRightOfCursor() {}
    selectAll() {}
    submit() {}
    getSelectedRange() {
        return null;
    }
}

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
});

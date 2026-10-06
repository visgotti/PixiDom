/**
 * Input type carried by cancelable `beforeinput` events, mirroring the DOM
 * `InputEvent.inputType` values for history operations.
 */
export type HistoryInputType = 'historyUndo' | 'historyRedo';
/**
 * Input type carried by cancelable `beforeinput` events, mirroring the DOM
 * `InputEvent.inputType` values.
 */
export type InputType = 'insertText' | 'insertFromPaste' | 'deleteContentBackward' | 'deleteContentForward' | 'deleteByCut' | HistoryInputType;
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
    getSelectedRange: () => ({
        indexes: {
            start: number;
            end: number;
        };
        x: {
            start: number;
            end: number;
        };
    } | null);
};
type Constructor<T = IKeyboardBase> = new (...args: any[]) => T;
export default function <TBase extends Constructor>(Base: TBase): {
    new (...args: any[]): {
        copiedText: string;
        textStates: Array<string>;
        currentStateIndex: number;
        /**
         * Emit a cancelable `beforeinput` event for an impending operation.
         * Returns true when the operation may proceed (nothing called
         * `preventDefault()`), matching the DOM `beforeinput` contract.
         */
        dispatchBeforeInput(inputType: InputType, data: string | null, nativeEvent: BeforeInputEvent["nativeEvent"]): boolean;
        changeStateIndex(change: number): void;
        registerHandlers(): void;
        unregisterHandlers(): void;
        onPaste(event: ClipboardEvent): void;
        onCopy(event: ClipboardEvent): void;
        onCut(event: ClipboardEvent): void;
        onBackspace(): void;
        onDelete(): void;
        /** Overridable hook: ArrowUp keydown (multi-line inputs move the caret up a line). */
        onArrowUp(_event?: unknown): void;
        /** Overridable hook: ArrowDown keydown (multi-line inputs move the caret down a line). */
        onArrowDown(_event?: unknown): void;
        /**
         * Overridable hook: Home keydown. Default moves the caret to the start
         * of the text; multi-line inputs override to go to the line start.
         */
        onHome(_event?: unknown): void;
        /**
         * Overridable hook: End keydown. Default moves the caret to the end of
         * the text; multi-line inputs override to go to the line end.
         */
        onEnd(_event?: unknown): void;
        /**
         * Overridable hook: PageUp keydown. Default jumps to the start of the
         * text; multi-line inputs override to move up one viewport of lines.
         */
        onPageUp(_event?: unknown): void;
        /**
         * Overridable hook: PageDown keydown. Default jumps to the end of the
         * text; multi-line inputs override to move down one viewport of lines.
         */
        onPageDown(_event?: unknown): void;
        onKeyDown(event: Pick<KeyboardEvent, "keyCode" | "which" | "ctrlKey" | "metaKey" | "shiftKey" | "preventDefault" | "code">): void;
        onKeyPress(event: Pick<KeyboardEvent, "keyCode" | "which" | "key" | "ctrlKey" | "metaKey" | "shiftKey" | "preventDefault" | "code">): void;
        addState(newText: string): void;
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
        getSelectedRange: () => ({
            indexes: {
                start: number;
                end: number;
            };
            x: {
                start: number;
                end: number;
            };
        } | null);
    };
} & TBase;
export {};
//# sourceMappingURL=KeyboardHandlers.d.ts.map
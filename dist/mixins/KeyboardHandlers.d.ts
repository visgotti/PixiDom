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
        changeStateIndex(change: any): void;
        registerHandlers(): void;
        unregisterHandlers(): void;
        onPaste(event: any): void;
        onCopy(event: any): void;
        onCut(event: any): void;
        onBackspace(): void;
        onDelete(): void;
        onKeyDown(event: Pick<KeyboardEvent, "keyCode" | "which" | "ctrlKey" | "metaKey" | "shiftKey" | "preventDefault" | "code">): void;
        onKeyPress(event: Pick<KeyboardEvent, "keyCode" | "which" | "key" | "ctrlKey" | "metaKey" | "shiftKey" | "preventDefault" | "code">): void;
        addState(newText: any): void;
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
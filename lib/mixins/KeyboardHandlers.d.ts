type Constructor<T = any> = new (...args: any[]) => T;
export default function <TBase extends Constructor>(Base: TBase): {
    new (...args: any[]): {
        [x: string]: any;
        copiedText: string;
        textStates: Array<string>;
        currentStateIndex: number;
        stateInterval: any;
        changeStateIndex(change: any): void;
        registerHandlers(): void;
        unregisterHandlers(): void;
        onPaste(event: any): void;
        onCopy(event: any): void;
        onCut(event: any): void;
        onBackspace(): void;
        onDelete(): void;
        onKeyDown(event: any): void;
        onKeyPress(event: any): void;
        addState(newText: any): void;
    };
} & TBase;
export {};

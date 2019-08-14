type Constructor<T = any> = new (...args: any[]) => T;

export default function <TBase extends Constructor>(Base: TBase) {
    return class KeyboardHandledInput extends Base {

        public copiedText: string = '';
        public textStates: Array<string> = [];
        public currentStateIndex: number = -1;

        constructor(...args: any[]) {
            super(...args);
        }

        public
    }
}
type Constructor<T = any> = new (...args: any[]) => T;

import {JustifyContent} from "../../types";

export default function <TBase extends Constructor>(Base: TBase) {
    return class KeyboardHandledInput extends Base {
        public flexJustifyContentHandlers;
        public flexJustifyContentHandler: Function;
        constructor(...args: any[]) {
            super(...args);
            this.flexJustifyContentHandlers = {
                [JustifyContent.flexEnd]: () => {},
                [JustifyContent.flexStart]: () => {},
                [JustifyContent.spaceAround]: () => {},
                [JustifyContent.spaceBetween]: () => {},
                [JustifyContent.spaceEvenly]: () => {},
            }
        }
        public initJustifyContentFlexbox() {
            this.flexJustifyContentHandler = this.flexJustifyContentHandlers[this.flexOptions.justifyContent];
            this.divChildren.forEach((div) => {
                this.flexJustifyContentHandler(div);
            });
        }

        public flexCenterJustifyContent() {
            const totalChildrenWidth = this.childrenWidth;
        }
    }
}
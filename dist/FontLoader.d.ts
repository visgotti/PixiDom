import { IPixiLoader } from './pixi-adapter-utils';
declare class FontLoader {
    private loader;
    private fontLookup;
    private readonly useAssets;
    private assetQueue;
    private registerLoadedFont;
    constructor(loader?: IPixiLoader);
    add(alias: string, url: string): this;
    load(onComplete?: () => void): Promise<void>;
}
export default FontLoader;
//# sourceMappingURL=FontLoader.d.ts.map
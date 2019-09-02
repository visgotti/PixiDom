/// <reference types="pixi.js" />
declare class FontLoader {
    private loader;
    private fontLookup;
    constructor(loader?: PIXI.loaders.Loader);
    add(alias: string, url: string): any;
}

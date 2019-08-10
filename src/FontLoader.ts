class FontLoader {
    private loader;
    private fontLookup = {};

    constructor(loader?: PIXI.loaders.Loader) {
        this.loader = loader ? loader : PIXI.loader;
    }
    add(alias: string, url: string) {
        return this.loader.add()
    }
}
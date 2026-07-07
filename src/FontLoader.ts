import { IPixiLoader, getPixiLoader, newPixiLoader, hasBitmapFont, getPixiVersion } from "./pixi-adapter-utils";

const ABSOLUTE_URL_PATTERN = /^(?:[a-z]+:|\/\/)/i;

const ensureAbsoluteUrl = (value: string) => {
    if (!value || typeof value !== "string") {
        return value;
    }

    if (ABSOLUTE_URL_PATTERN.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
        return value;
    }

    if (typeof window === "undefined" || typeof window.location === "undefined") {
        return value;
    }

    try {
        return new URL(value, window.location.href).toString();
    } catch (error) {
        return value;
    }
};

type FontQueueEntry = { alias: string; src: string };

class FontLoader {
    private loader: IPixiLoader | null;
    private fontLookup: Record<string, boolean> = {};
    private readonly useAssets: boolean;
    private assetQueue: FontQueueEntry[] = [];

    private registerLoadedFont(alias: string, asset: unknown) {
        if (!alias || !asset) {
            return;
        }

        const pixiAny = PIXI as any;
        const pixiVersion = getPixiVersion();
        
        // For v8+, assets are auto-registered in Cache, but we need to ensure
        // the alias and alias-bitmap keys are also set
        if (pixiVersion >= 8) {
            const cache = pixiAny?.Cache;
            if (cache && typeof cache.set === 'function') {
                // Get the font's internal fontFamily name
                const fontFamily = (asset as any)?.fontFamily;
                
                const keysToSet = [alias, `${alias}-bitmap`];
                // Also register under the font's internal family name if different from alias
                if (fontFamily && fontFamily !== alias) {
                    keysToSet.push(fontFamily, `${fontFamily}-bitmap`);
                }
                
                keysToSet.forEach((key) => {
                    try {
                        if (!cache.has(key)) {
                            cache.set(key, asset);
                        }
                    } catch (err) {
                        // ignore cache registration errors
                    }
                });
            }
            return;
        }
        
        // For v4-v7, use the BitmapFont constructor approach
        const BitmapFontCtor =
            pixiAny?.BitmapFont ??
            pixiAny?.extras?.BitmapFont ??
            pixiAny?.extras?.BitmapText?.BitmapFont ??
            null;

        if (typeof BitmapFontCtor !== "function") {
            return;
        }

        let fontInstance: any = null;

        if (asset instanceof BitmapFontCtor) {
            fontInstance = asset;
        } else if ((asset as any)?.bitmapFont instanceof BitmapFontCtor) {
            fontInstance = (asset as any).bitmapFont;
        } else if ((asset as any)?.data && (asset as any)?.textures) {
            try {
                fontInstance = new BitmapFontCtor(asset);
            } catch (err) {
                fontInstance = null;
            }
        }

        if (!fontInstance) {
            return;
        }

        const fontName: string =
            fontInstance.fontFamily ??
            fontInstance.font ??
            fontInstance.name ??
            alias;

        const cacheKeys = new Set<string>();
        const addCacheKey = (key?: string) => {
            if (!key) {
                return;
            }
            cacheKeys.add(key);
            if (!key.endsWith("-bitmap")) {
                cacheKeys.add(`${key}-bitmap`);
            }
        };
        addCacheKey(alias);
        addCacheKey(fontName);

        const CacheRef = pixiAny?.Cache ?? pixiAny?.Assets?.cache;
        if (CacheRef && typeof CacheRef.set === "function") {
            cacheKeys.forEach((key) => {
                try {
                    CacheRef.set(key, fontInstance);
                } catch (err) {
                    // ignore cache registration errors to avoid breaking font load
                }
            });
        }

        const candidateMaps = [
            pixiAny?.BitmapFont?.available,
            pixiAny?.BitmapFont?.fonts,
            pixiAny?.extras?.BitmapFont?.available,
            pixiAny?.extras?.BitmapText?.fonts,
        ];

        candidateMaps.forEach((map: any) => {
            if (!map) {
                return;
            }
            if (map instanceof Map) {
                const addEntry = (key?: string) => {
                    if (key && !map.has(key)) {
                        map.set(key, fontInstance);
                    }
                };
                addEntry(fontName);
                addEntry(alias);
                addEntry(fontName ? `${fontName}-bitmap` : undefined);
                addEntry(alias ? `${alias}-bitmap` : undefined);
                return;
            }
            if (map instanceof Set) {
                if (fontName) {
                    map.add(fontName);
                    map.add(`${fontName}-bitmap`);
                }
                map.add(alias);
                map.add(`${alias}-bitmap`);
                return;
            }
            if (typeof map === "object") {
                if (fontName && !map[fontName]) {
                    map[fontName] = fontInstance;
                }
                if (!map[alias]) {
                    map[alias] = fontInstance;
                }
                if (fontName && !map[`${fontName}-bitmap`]) {
                    map[`${fontName}-bitmap`] = fontInstance;
                }
                if (!map[`${alias}-bitmap`]) {
                    map[`${alias}-bitmap`] = fontInstance;
                }
            }
        });
    }

    constructor(loader?: IPixiLoader) {
        const pixiAny = PIXI as any;
        const pixiVersion = getPixiVersion();
        const hasAssetsApi = typeof pixiAny.Assets !== "undefined";
    // TODO: fallback behavior for PIXI v8 under investigation
    this.useAssets = hasAssetsApi;
        this.loader = loader ?? null;

        if (!this.useAssets) {
            this.loader = this.loader ?? getPixiLoader() ?? newPixiLoader();
        }
    }

    add(alias: string, url: string) {
        if (!alias || !url) {
            throw new Error("FontLoader.add requires both alias and url.");
        }

        if (this.fontLookup[alias] || hasBitmapFont(alias)) {
            return this;
        }

        this.fontLookup[alias] = true;
        const normalizedUrl = ensureAbsoluteUrl(url);

        if (this.useAssets) {
            this.assetQueue.push({ alias, src: normalizedUrl });
        } else {
            this.loader?.add(alias, normalizedUrl);
        }

        return this;
    }

    async load(onComplete?: () => void) {
        if (this.useAssets) {
            const assets = (PIXI as any).Assets;
            const aliases: string[] = [];
            this.assetQueue.forEach(({ alias, src }) => {
                assets.add({ alias, src });
                aliases.push(alias);
            });

            if (aliases.length) {
                const loaded = await assets.load(aliases);

                // Handle different return types from PIXI.Assets.load
                // Single alias: returns the asset directly
                // Multiple aliases: returns an object { alias1: asset1, alias2: asset2 }
                if (aliases.length === 1) {
                    // Single font loaded - asset is returned directly
                    this.registerLoadedFont(aliases[0], loaded);
                } else if (loaded && typeof loaded === "object" && !Array.isArray(loaded)) {
                    // Multiple fonts loaded - assets returned as object with alias keys
                    aliases.forEach((alias) => {
                        const value = (loaded as Record<string, unknown>)[alias];
                        if (value) {
                            this.registerLoadedFont(alias, value);
                        }
                    });
                }
            }
            this.assetQueue = [];
            onComplete?.();
            return;
        }

        const loader = this.loader ?? (this.loader = newPixiLoader());

        await new Promise<void>((resolve) => {
            loader.load(() => {
                onComplete?.();
                resolve();
            });
        });
    }
}

export default FontLoader;
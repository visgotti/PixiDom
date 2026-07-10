import { safeColorInt, normalizeColor as normalizeColorInput } from './color';

let _global_pixi = typeof window !== 'undefined' ? (window as any).PIXI : null;

export const setGlobalPixi = (pixi: any) => { 
  if(typeof window !== 'undefined') {
    (window as any).PIXI = pixi;
    _global_pixi = pixi;
  }
}


export interface IPixiLoader {
  baseUrl?: string;
  progress?: number;
  loading?: boolean;
  defaultQueryString?: string;
  resources?: any;

  add(...params: any[]): IPixiLoader;
  pre?(fn: (...params: any[]) => any): IPixiLoader;
  use?(fn: (...params: any[]) => any): IPixiLoader;
  reset?(): IPixiLoader;
  load(cb?: (...params: any[]) => any): IPixiLoader | void;
}

export const ensurePixiCanvasFallback = () => {
  const pixiAny = typeof PIXI !== 'undefined' ? (PIXI as any) : null;
  if (!pixiAny) {
    return;
  }

  const utils = pixiAny.utils;
  if (utils && typeof utils.isWebGLSupported === 'function' && !utils.isWebGLSupported()) {
    const settings = pixiAny.settings;
    const env = pixiAny.ENV;
    if (settings && env && env.CANVAS) {
      settings.PREFER_ENV = env.CANVAS;
    }
  }
};

export const newPixiLoader = (): IPixiLoader => {
  if(getPixiVersion() < 5) {
    return new PIXI.loaders.Loader();
  } else {
    return new PIXI.Loader();
  }
}

export const getPixiLoader = (): IPixiLoader => {
  if(typeof PIXI === 'undefined') {
    throw new Error('PIXI is not available in the current environment. Please ensure PIXI is loaded and available globally/ on the window object before calling getPixiLoader.');
  }
  const pixiAny = PIXI as any;
  const isLoaderLike = (candidate: any) => {
    return candidate && typeof candidate.add === 'function' && typeof candidate.load === 'function';
  };

  if (isLoaderLike(pixiAny.loader)) {
    return pixiAny.loader as IPixiLoader;
  }

  if (pixiAny.Loader) {
    let loaderInstance: any = null;
    if (isLoaderLike(pixiAny.Loader.shared)) {
      loaderInstance = pixiAny.Loader.shared;
    } else {
      try {
        loaderInstance = new pixiAny.Loader();
      } catch (error) {
        loaderInstance = null;
      }
    }

    if (isLoaderLike(loaderInstance)) {
      pixiAny.loader = loaderInstance;
      return loaderInstance as IPixiLoader;
    }
  }

  if (pixiAny.loaders?.Loader) {
    try {
      const legacyLoader = new pixiAny.loaders.Loader();
      if (isLoaderLike(legacyLoader)) {
        pixiAny.loader = legacyLoader;
        return legacyLoader as IPixiLoader;
      }
    } catch (error) {
      /* noop */
    }
  }

  if (pixiAny.Assets && typeof pixiAny.Assets.load === 'function') {
    const queue: { resource: any; data?: any }[] = [];
    const getBaseUrl = () => {
      try {
        return new URL('.', window.location.href).href;
      } catch (error) {
        return window.location.href;
      }
    };

    const baseUrl = getBaseUrl();

    const ensureAbsoluteUrl = (value: string) => {
      if (!value || typeof value !== 'string') {
        return value;
      }
      if (/^(?:[a-z]+:|\/\/)/i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
        return value;
      }
      try {
        return new URL(value, baseUrl).toString();
      } catch (error) {
        return value;
      }
    };

    const normalizeEntry = (resource: any, data?: any) => {
      if (!resource) {
        return null;
      }

      if (typeof resource === 'string') {
        const src = ensureAbsoluteUrl(resource);
        if (data && typeof data === 'object' && Object.keys(data).length) {
          const payload = { ...data, src };
          if (payload.name && !payload.alias) {
            payload.alias = payload.name;
          }
          delete payload.name;
          return payload;
        }
        return src;
      }

      if (typeof resource === 'object') {
        const payload = { ...resource };
        if (data && typeof data === 'object') {
          payload.data = data;
        }
        if (payload.resource) {
          payload.src = ensureAbsoluteUrl(payload.resource);
          delete payload.resource;
        }
        if (payload.url) {
          payload.src = ensureAbsoluteUrl(payload.url);
          delete payload.url;
        }
        if (payload.src) {
          payload.src = ensureAbsoluteUrl(payload.src);
        }
        if (!payload.src && payload.alias && typeof payload.alias === 'string') {
          payload.src = ensureAbsoluteUrl(payload.alias);
        }
        if (!payload.src && payload.name && typeof payload.name === 'string') {
          payload.src = ensureAbsoluteUrl(payload.name);
        }
        return payload;
      }

      return resource;
    };

    const loader: IPixiLoader = {
      add(resource: any, data?: any) {
        queue.push({ resource, data });
        return loader;
      },
      load(onComplete?: (...params: any[]) => any) {
        if (!queue.length) {
          if (typeof onComplete === 'function') {
            onComplete();
          }
          return loader;
        }

        const tasks = queue
          .map(({ resource, data }) => normalizeEntry(resource, data))
          .filter(Boolean)
          .map((entry) => pixiAny.Assets.load(entry));

        queue.length = 0;

        Promise.all(tasks)
          .catch((error) => {
            console.error('PIXI.Assets load failed', error);
          })
          .then(() => {
            if (typeof onComplete === 'function') {
              onComplete();
            }
          });

        return loader;
      },
    } as IPixiLoader;

    pixiAny.loader = loader;
    return loader;
  }

  throw new Error('Unable to resolve PIXI loader implementation.');
};

const isWebglRenderer = (renderer: any) => {
  if (!renderer || typeof PIXI === 'undefined') {
    return false;
  }
  const pixiAny = PIXI as any;

  if (renderer.type != null && pixiAny.RENDERER_TYPE) {
    const type = renderer.type;
    const RT = pixiAny.RENDERER_TYPE;
    if (type === RT.CANVAS) {
      return false;
    }
    if (type === RT.WEBGL || type === RT.WEBGL1 || type === RT.WEBGL2) {
      return true;
    }
  }

  if (pixiAny.Renderer && renderer instanceof pixiAny.Renderer) {
    if(typeof pixiAny.CanvasRenderer !== 'undefined' && renderer instanceof pixiAny.CanvasRenderer) {
      return false;
    }
    return true;
  }
  if (pixiAny.CanvasRenderer && renderer instanceof pixiAny.CanvasRenderer) {
    return false;
  }
  if (renderer.context?.gl || renderer.gl) {
    return true;
  }
  return false;
};

const isWebgpuRenderer = (renderer: any) => {
  if (!renderer || typeof PIXI === 'undefined') {
    return false;
  }
  const pixiAny = PIXI as any;

  if (renderer.type != null && pixiAny.RendererType) {
    return renderer.type === pixiAny.RendererType.WEBGPU;
  }
  if (pixiAny.WebGPURenderer && renderer instanceof pixiAny.WebGPURenderer) {
    return true;
  }
  return Boolean(renderer.gpu?.device);
};

const asHtmlCanvas = (value: any): HTMLCanvasElement | null => {
  if (typeof HTMLCanvasElement === 'undefined') {
    return null;
  }
  return value instanceof HTMLCanvasElement ? value : null;
};

const toFiniteNumber = (value: any) => {
  return typeof value === 'number' && isFinite(value) ? value : undefined;
};

/**
 * Resolves the underlying HTMLCanvasElement from a PIXI renderer across versions.
 * v8 exposes `renderer.canvas`; v4–v7 use `renderer.view`. Some adapters wrap the view
 * in an object with `.canvas`, which we also unwrap.
 */
export const getRendererCanvas = (renderer: any): HTMLCanvasElement | null => {
  if (!renderer) return null;
  return (
    asHtmlCanvas(renderer.canvas) ??
    asHtmlCanvas(renderer.view?.canvas) ??
    asHtmlCanvas(renderer.view) ??
    null
  );
};

export const getRendererResolution = (renderer: any): number => {
  const r = renderer?.resolution;
  return typeof r === 'number' && isFinite(r) && r > 0 ? r : 1;
};

/**
 * Returns the renderer's stage/screen size in PIXI coordinate units (drawing-buffer
 * pixels divided by resolution). Falls back to deriving from the canvas if `renderer.screen`
 * isn't populated (older PIXI builds, or detached renderers).
 */
export const getRendererScreenSize = (
  renderer: any,
  canvas?: HTMLCanvasElement | null,
): { width: number; height: number } => {
  const screen = renderer?.screen;
  const sw = toFiniteNumber(screen?.width);
  const sh = toFiniteNumber(screen?.height);
  if (sw && sh) {
    return { width: sw, height: sh };
  }
  const c = canvas ?? getRendererCanvas(renderer);
  const resolution = getRendererResolution(renderer);
  const cw = toFiniteNumber(c?.width);
  const ch = toFiniteNumber(c?.height);
  return {
    width: cw ? cw / resolution : 0,
    height: ch ? ch / resolution : 0,
  };
};

export type RendererPointerScale = {
  /** Multiplier from CSS-pixel delta to PIXI stage-pixel delta on the X axis. */
  x: number;
  /** Multiplier from CSS-pixel delta to PIXI stage-pixel delta on the Y axis. */
  y: number;
  resolution: number;
  screenWidth: number;
  screenHeight: number;
  cssWidth: number;
  cssHeight: number;
};

/**
 * Computes the conversion factor between CSS (client) pixels and PIXI stage pixels.
 *
 * PIXI's interaction systems (InteractionManager in v4–v7, EventSystem in v7+/v8)
 * map a native `clientX/Y` to a global/stage coordinate using
 * `(clientX - rect.left) * (canvas.width / rect.width) / resolution`,
 * which equals `(clientX - rect.left) * (renderer.screen.width / rect.width)`.
 *
 * When you receive native `PointerEvent`s outside PIXI's interaction system (e.g.
 * a window-level `pointermove`), you must apply this same factor to convert
 * client-pixel deltas into stage-pixel deltas. The factor is identical for WebGL,
 * Canvas, and WebGPU renderers — only the canvas accessor differs by PIXI version.
 */
export const getRendererPointerScale = (renderer: any): RendererPointerScale => {
  const resolution = getRendererResolution(renderer);
  const canvas = getRendererCanvas(renderer);
  const empty: RendererPointerScale = {
    x: 1,
    y: 1,
    resolution,
    screenWidth: 0,
    screenHeight: 0,
    cssWidth: 0,
    cssHeight: 0,
  };

  if (!canvas || typeof canvas.getBoundingClientRect !== 'function') {
    return empty;
  }
  const rect = canvas.getBoundingClientRect();
  const cssWidth = rect.width;
  const cssHeight = rect.height;
  if (!cssWidth || !cssHeight) {
    return empty;
  }
  const { width: screenWidth, height: screenHeight } = getRendererScreenSize(renderer, canvas);
  if (!screenWidth || !screenHeight) {
    return empty;
  }
  return {
    x: screenWidth / cssWidth,
    y: screenHeight / cssHeight,
    resolution,
    screenWidth,
    screenHeight,
    cssWidth,
    cssHeight,
  };
};

/**
 * Convert an absolute client (CSS-pixel) coordinate to PIXI stage coordinates,
 * mirroring what PIXI's interaction system does internally.
 */
export const clientToStageCoords = (
  clientX: number,
  clientY: number,
  renderer: any,
): { x: number; y: number } => {
  const canvas = getRendererCanvas(renderer);
  if (!canvas) return { x: clientX, y: clientY };
  const rect = canvas.getBoundingClientRect();
  const scale = getRendererPointerScale(renderer);
  return {
    x: (clientX - rect.left) * scale.x,
    y: (clientY - rect.top) * scale.y,
  };
};

const rendererRegistry: WeakMap<HTMLCanvasElement, any> =
  typeof WeakMap !== 'undefined' ? new WeakMap() : (null as any);

/**
 * Register a renderer so downstream code (e.g. window-level drag handlers) can
 * recover it from the canvas alone. {@link resolvePixiRenderer} calls this
 * automatically; user code that constructs a renderer directly may call it too.
 */
export const registerPixiRenderer = (renderer: any): void => {
  if (!rendererRegistry) return;
  const canvas = getRendererCanvas(renderer);
  if (canvas) rendererRegistry.set(canvas, renderer);
};

export const findRendererForCanvas = (canvas: HTMLCanvasElement | null | undefined): any => {
  if (!rendererRegistry || !canvas) return null;
  return rendererRegistry.get(canvas) ?? null;
};

/**
 * Recover the canvas from a native pointer event by walking up the composed path
 * to the first HTMLCanvasElement (handling Shadow DOM via `composedPath`).
 */
export const findCanvasFromEvent = (event: Event | null | undefined): HTMLCanvasElement | null => {
  if (!event) return null;
  const path = typeof (event as any).composedPath === 'function' ? (event as any).composedPath() : null;
  if (Array.isArray(path)) {
    for (const node of path) {
      const c = asHtmlCanvas(node);
      if (c) return c;
    }
  }
  return asHtmlCanvas((event as any).target);
};

export type ResolveRendererOptions = {
  width?: number;
  height?: number;
  forceWebgl?: boolean;
  forceWebgpu?: boolean;
  configureView?: boolean;
  canvas?: HTMLCanvasElement | null;
  view?: any;
  fallbackCanvas?: HTMLCanvasElement | null;
  size?: {
    width?: number;
    height?: number;
  };
  [key: string]: any;
};

export const resolvePixiRenderer = async (options: ResolveRendererOptions = {}) => {
  const rendererOptions = { ...options } as Record<string, any>;
  const pixiVersion = getPixiVersion();

  ensurePixiRendererSystemGuard();

  const viewPreference =
    rendererOptions.view ??
    rendererOptions.canvas ??
    rendererOptions.canvasRef ??
    null;

  if (viewPreference) {
    rendererOptions.view = viewPreference;
  }

  if (pixiVersion >= 8) {
    if (rendererOptions.view && !rendererOptions.canvas) {
      rendererOptions.canvas = rendererOptions.view;
    }
  } else if ('canvas' in rendererOptions) {
    delete (rendererOptions as any).canvas;
  }

  const fallbackCanvasCandidate = rendererOptions.fallbackCanvas ?? null;

  delete rendererOptions.fallbackCanvas;

  const fallbackCanvas =
    asHtmlCanvas(fallbackCanvasCandidate) ??
    asHtmlCanvas(rendererOptions.view);

  const forceWebgl = Boolean(rendererOptions.forceWebgl);
  delete rendererOptions.forceWebgl;

  const forceWebgpu = Boolean(rendererOptions.forceWebgpu);
  delete rendererOptions.forceWebgpu;

  if (forceWebgl && forceWebgpu) {
    throw new Error('forceWebgl and forceWebgpu are mutually exclusive.');
  }
  if (forceWebgpu && pixiVersion < 8) {
    throw new Error('forceWebgpu requires PIXI v8 or later.');
  }

  const configureViewPreference = rendererOptions.configureView;
  delete rendererOptions.configureView;

  const explicitSize = rendererOptions.size || {};
  delete rendererOptions.size;

  const desiredWidth =
    toFiniteNumber(explicitSize.width) ?? toFiniteNumber(rendererOptions.width);
  const desiredHeight =
    toFiniteNumber(explicitSize.height) ?? toFiniteNumber(rendererOptions.height);

  const shouldConfigureView =
    configureViewPreference === undefined
      ? desiredWidth !== undefined && desiredHeight !== undefined
      : Boolean(configureViewPreference);

  let candidate: any;
  try {
    if (forceWebgpu) {
      const WebGPURendererCtor = (PIXI as any).WebGPURenderer;
      if (!WebGPURendererCtor) {
        throw new Error('forceWebgpu was requested, but this PIXI build has no WebGPURenderer.');
      }
      const webgpuRenderer = new WebGPURendererCtor();
      candidate = webgpuRenderer.init(rendererOptions).then(() => webgpuRenderer);
    } else {
      candidate = PIXI.autoDetectRenderer(rendererOptions);
    }
  } catch (error) {
    console.error('Failed to create PIXI renderer synchronously', error);
    throw error;
  }

  try {
    const resolveCandidate = async (value: any) => {
      if (!value) {
        throw new Error('PIXI failed to return a valid renderer.');
      }
      if (forceWebgl && !isWebglRenderer(value)) {
        value?.destroy?.(true);
        throw new Error('forceWebgl was requested, but PIXI failed to create a WebGL renderer.');
      }
      if (forceWebgpu && !isWebgpuRenderer(value)) {
        value?.destroy?.(true);
        throw new Error('forceWebgpu was requested, but PIXI failed to create a WebGPU renderer.');
      }
      if (shouldConfigureView && desiredWidth !== undefined && desiredHeight !== undefined) {
        configureRendererView(value, desiredWidth, desiredHeight, fallbackCanvas);
      }
      ensureRendererViewCompatibility(value);
      if (forceWebgl && !isWebglRenderer(value)) {
        value?.destroy?.(true);
        throw new Error('forceWebgl was requested, but PIXI failed to maintain a WebGL renderer.');
      }
      if (forceWebgpu && !isWebgpuRenderer(value)) {
        value?.destroy?.(true);
        throw new Error('forceWebgpu was requested, but PIXI failed to maintain a WebGPU renderer.');
      }
      registerPixiRenderer(value);
      return value;
    };

    if (candidate && typeof candidate.then === 'function') {
      const resolved = await candidate;
      return resolveCandidate(resolved);
    }

    return resolveCandidate(candidate);
  } catch (error) {
    console.error('Failed to initialize PIXI renderer', error);
    throw error;
  }
};

let pixiRendererSystemGuardApplied = false;

const ensurePixiRendererSystemGuard = () => {
  if (pixiRendererSystemGuardApplied) {
    return;
  }

  if (typeof PIXI === 'undefined') {
    return;
  }
  const pixiAny = PIXI as any;
  const prototypes = [pixiAny?.Renderer, pixiAny?.WebGLRenderer, pixiAny?.WebGPURenderer]
    .map((ctor) => ctor?.prototype)
    .filter((proto): proto is any => !!proto && typeof proto._addSystem === 'function');

  if (!prototypes.length) {
    return;
  }

  pixiRendererSystemGuardApplied = true;

  const getValueDescriptor = (entry: any): PropertyDescriptor | undefined => {
    if (!entry || typeof entry !== 'object') {
      return undefined;
    }
    let current: any = entry;
    while (current) {
      const descriptor = Object.getOwnPropertyDescriptor(current, 'value');
      if (descriptor) {
        return descriptor;
      }
      current = Object.getPrototypeOf(current);
    }
    return undefined;
  };

  const hasUsableValueDescriptor = (descriptor?: PropertyDescriptor) => {
    if (!descriptor) {
      return false;
    }
    if (descriptor.get || descriptor.set) {
      return true;
    }
    return Boolean(descriptor.value);
  };

  const isValidSystemEntry = (entry: any) => {
    if (!entry) {
      return false;
    }
    if (typeof entry !== 'object') {
      return true;
    }
    return hasUsableValueDescriptor(getValueDescriptor(entry));
  };

  const summarizeSystemEntry = (entry: any, index?: number) => {
    if (!entry || typeof entry !== 'object') {
      return {
        index,
        name: entry?.name ?? 'unnamed',
        kind: typeof entry,
        hasValueProperty: false,
        valueKind: 'missing',
      };
    }
    const descriptor = getValueDescriptor(entry);
    const hasValueProperty = Boolean(descriptor);
    const usesAccessor = Boolean(descriptor?.get || descriptor?.set);
    const summary: Record<string, any> = {
      index,
      name: entry.name ?? 'unnamed',
      keys: Object.keys(entry),
      hasValueProperty,
      valueKind: usesAccessor ? 'accessor' : hasValueProperty ? 'literal' : 'missing',
    };
    if (hasValueProperty && !usesAccessor) {
      summary.valueType = typeof descriptor?.value;
    } else if (usesAccessor) {
      summary.valueType = 'accessor';
    }
    return summary;
  };

  const findFirstInvalidConfigEntry = (systems: any[] | undefined) => {
    if (!Array.isArray(systems)) {
      return undefined;
    }
    return systems.find((entry: any) => !isValidSystemEntry(entry));
  };

  const findConfigEntryByName = (systems: any[] | undefined, name?: string) => {
    if (!Array.isArray(systems) || !name) {
      return undefined;
    }
    return systems.find((entry: any) => entry?.name === name);
  };

  for (const proto of prototypes) {
    if (!proto.__pixiDomPatchedAddSystems && typeof proto._addSystems === 'function') {
      proto._addSystems = function patchedAddSystems(systems: any) {
        let sanitized: any = systems;

        if (typeof console !== 'undefined') {
          try {
            if (Array.isArray(systems)) {
              const summary = systems.map((entry: any, index: number) => summarizeSystemEntry(entry, index));
              console.log('[PixiDom] PIXI renderer systems input', JSON.stringify(summary));
            } else if (systems && typeof systems === 'object') {
              console.log('[PixiDom] PIXI renderer systems keys', Object.keys(systems));
            }
          } catch (err) {
            console.warn('[PixiDom] Unable to inspect PIXI renderer systems', err);
          }
        }

        if (Array.isArray(sanitized)) {
          const invalidBefore = sanitized.filter((entry: any) => !isValidSystemEntry(entry));
          if (invalidBefore.length && typeof console !== 'undefined') {
            console.warn('[PixiDom] Filtering invalid PIXI renderer systems', invalidBefore.map((entry: any, index: number) => summarizeSystemEntry(entry, index)));
          }
          sanitized = sanitized.filter((entry: any) => isValidSystemEntry(entry));
          const invalidAfter = sanitized.filter((entry: any) => !isValidSystemEntry(entry));
          if (invalidAfter.length && typeof console !== 'undefined') {
            console.warn('[PixiDom] Invalid PIXI renderer systems remain after filtering', invalidAfter.map((entry: any, index: number) => summarizeSystemEntry(entry, index)));
          }
        } else if (sanitized instanceof Map) {
          let mutated = false;
          const filtered = new Map();
          sanitized.forEach((entry, key) => {
            if (isValidSystemEntry(entry)) {
              filtered.set(key, entry);
            } else {
              mutated = true;
            }
          });
          if (mutated) {
            sanitized = filtered;
          }
        } else if (sanitized && typeof sanitized === 'object') {
          let mutated = false;
          const filtered = Object.create(Object.getPrototypeOf(sanitized) ?? Object.prototype);
          for (const key of Object.keys(sanitized)) {
            const entry = sanitized[key];
            if (isValidSystemEntry(entry)) {
              filtered[key] = entry;
            } else {
              mutated = true;
            }
          }
          if (mutated) {
            sanitized = filtered;
          }
        }

        const normalizedEntries: any[] = Array.isArray(sanitized)
          ? sanitized
          : sanitized instanceof Map
            ? Array.from(sanitized.values())
            : sanitized && typeof sanitized === 'object'
              ? Object.keys(sanitized).map((key) => sanitized[key])
              : sanitized
                ? [sanitized]
                : [];

        for (const entry of normalizedEntries) {
          if (!entry || typeof entry !== 'object') {
            continue;
          }
          if (!isValidSystemEntry(entry)) {
            continue;
          }
          const descriptor = getValueDescriptor(entry);
          let systemCtor: any;
          if (descriptor?.get || descriptor?.set) {
            try {
              systemCtor = entry.value;
            } catch (error) {
              if (typeof console !== 'undefined') {
                console.warn('[PixiDom] Unable to resolve PIXI renderer system via accessor', {
                  entry: summarizeSystemEntry(entry),
                  error,
                });
              }
              continue;
            }
          } else {
            systemCtor = descriptor?.value;
          }

          if (!systemCtor) {
            if (typeof console !== 'undefined') {
              console.warn('[PixiDom] Skipping PIXI renderer system without constructor', summarizeSystemEntry(entry));
            }
            continue;
          }

          const systemName = typeof entry.name === 'string' ? entry.name : '';
          this._addSystem(systemCtor, systemName);
        }

        return this;
      };

      Object.defineProperty(proto, '__pixiDomPatchedAddSystems', {
        value: true,
        enumerable: false,
        configurable: true,
      });
    }

    if (proto.__pixiDomPatchedAddSystem) {
      continue;
    }
    const originalAddSystem = proto._addSystem;
    proto._addSystem = function patchedAddSystem(systemCtor: any, name: string) {
      if (!systemCtor) {
        const rendererName = this?.config?.name ?? 'unknown';
        const registeredSystems = Array.isArray(this?.config?.systems)
          ? this.config.systems.map((entry: any) => entry?.name ?? 'unnamed')
          : undefined;
          const missingEntry = findFirstInvalidConfigEntry(this?.config?.systems);
        const systemList = Array.isArray(registeredSystems)
          ? registeredSystems.filter(Boolean).join(', ')
          : 'unknown';
          const systemEntryDetails = findConfigEntryByName(this?.config?.systems, name);
          const message = `PIXI renderer missing system "${name ?? 'unknown'}" (${rendererName}). Registered systems: ${systemList}`;
          console.error(message, {
            rendererName,
            registeredSystems,
            missingEntry: missingEntry ? summarizeSystemEntry(missingEntry) : undefined,
            systemEntryDetails: systemEntryDetails ? summarizeSystemEntry(systemEntryDetails) : undefined,
          });
        throw new Error(message);
      }
      return originalAddSystem.call(this, systemCtor, name);
    };
    Object.defineProperty(proto, '__pixiDomPatchedAddSystem', {
      value: true,
      enumerable: false,
      configurable: true,
    });
  }
};

export const configureRendererView = (
  renderer: any,
  width: number,
  height: number,
  fallbackCanvas?: HTMLCanvasElement | null
) => {
  if (!renderer) {
    return;
  }

  const version = getPixiVersion();
  if (typeof renderer.resize === 'function') {
    const tryAsNumbers = () => renderer.resize(width, height);
    const tryAsObject = () => renderer.resize({ width, height });

    try {
      tryAsNumbers();
    } catch (primaryError) {
      try {
        tryAsObject();
      } catch (secondaryError) {
        console.warn('PIXI renderer resize failed', secondaryError);
      }
    }
  }

  const view =
    renderer.canvas ||
    renderer.view?.canvas ||
    renderer.view ||
    fallbackCanvas;

  if (view) {
    view.width = width;
    view.height = height;
    if (view.style) {
      view.style.width = `${width}px`;
      view.style.height = `${height}px`;
    }
  }

  if (fallbackCanvas && fallbackCanvas !== view) {
    fallbackCanvas.width = width;
    fallbackCanvas.height = height;
    if (fallbackCanvas.style) {
      fallbackCanvas.style.width = `${width}px`;
      fallbackCanvas.style.height = `${height}px`;
    }

    if (view instanceof HTMLCanvasElement) {
      view.id = fallbackCanvas.id || view.id;
      const parent = fallbackCanvas.parentNode;
      if (parent && view.parentNode !== parent) {
        parent.replaceChild(view, fallbackCanvas);
      }
    }
  }
};

const PIXI_VIEW_COMPAT_FLAG = '__pixiDomViewCompatApplied';

const ensureRendererViewCompatibility = (renderer: any) => {
  if (!renderer) {
    return;
  }
  const currentView = renderer.view;
  const currentCanvas = asHtmlCanvas(currentView);
  if (currentCanvas) {
    return;
  }
  if (!currentView || typeof currentView !== 'object') {
    return;
  }
  if ((currentView as any)[PIXI_VIEW_COMPAT_FLAG]) {
    return;
  }
  const canvas = asHtmlCanvas((currentView as any).canvas);
  if (!canvas) {
    return;
  }

  const forwardMethod = (name: string) => {
    if (typeof (currentView as any)[name] === 'function') {
      return;
    }
    const source = (canvas as any)[name];
    if (typeof source !== 'function') {
      return;
    }
    Object.defineProperty(currentView, name, {
      value: (...args: any[]) => source.apply(canvas, args),
      configurable: true,
    });
  };
  ['addEventListener', 'removeEventListener', 'dispatchEvent', 'getBoundingClientRect', 'focus', 'blur'].forEach(forwardMethod);

  Object.defineProperty(currentView, PIXI_VIEW_COMPAT_FLAG, {
    value: true,
    enumerable: false,
    configurable: true,
  });
};

export const renderContainer = (
  renderer: any,
  container: PIXI.Container,
  options: { clear?: boolean } = {}
) => {
  if (!renderer || !container) {
    return;
  }

  const version = getPixiVersion();
  const clear = options.clear ?? true;
  const renderFn = renderer.render;

  if (typeof renderFn === 'function') {
    if (version >= 8) {
      renderFn.call(renderer, { container, clear });
    } else if (version >= 7 && renderFn.length > 1) {
      renderFn.call(renderer, container, { clear });
    } else {
      renderFn.call(renderer, container);
    }
    return;
  }

  if (renderFn && typeof renderFn.render === 'function') {
    if (version >= 8) {
      renderFn.render({ container, clear });
    } else if (version >= 7 && renderFn.render.length > 1) {
      renderFn.render(container, { clear });
    } else {
      renderFn.render(container);
    }
  }
};

type GraphicsCompatState = {
  fill?: { color: number; alpha: number } | null;
  stroke?: {
    color: number;
    alpha: number;
    width: number;
    alignment?: number;
    cap?: any;
    join?: any;
    miterLimit?: number;
  } | null;
  lastPoint?: { x: number; y: number } | null;
};

const clamp01 = (value: number) => {
  if (typeof value !== 'number' || !isFinite(value)) {
    return 1;
  }
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
};

const sanitizeNumber = (value: any, fallback = 0) => {
  const numeric = typeof value === 'number' && isFinite(value) ? value : fallback;
  return numeric;
};

const normalizeColor = (value: any, fallback = 0xffffff) => {
  if (typeof value !== 'number' || !isFinite(value)) {
    return safeColorInt(fallback);
  }
  return safeColorInt(value);
};

const ensureGraphicsCompatState = (target: any): GraphicsCompatState => {
  const stateKey = '__pixiDomGraphicsState';
  if (!target[stateKey]) {
    target[stateKey] = { fill: null, stroke: null, lastPoint: null } as GraphicsCompatState;
  }
  return target[stateKey];
};

const applyFillAndStroke = (graphics: any, shape: any, options: { skipFill?: boolean } = {}) => {
  if (!shape || typeof shape !== 'object') {
    return;
  }
  const state = ensureGraphicsCompatState(graphics);
  if (!options.skipFill && state.fill && typeof shape.fill === 'function') {
    shape.fill({ color: state.fill.color, alpha: state.fill.alpha });
  }
  if (state.stroke && state.stroke.width > 0 && typeof shape.stroke === 'function') {
    shape.stroke({
      color: state.stroke.color,
      alpha: state.stroke.alpha,
      width: state.stroke.width,
      alignment: state.stroke.alignment,
      cap: state.stroke.cap,
      join: state.stroke.join,
      miterLimit: state.stroke.miterLimit,
    });
  }
};

const patchGraphicsForPixi8 = () => {
  if (typeof PIXI === 'undefined') {
    return false;
  }
  const version = getPixiVersion();
  if (version < 8) {
    return false;
  }
  const pixiAny = PIXI as any;
  const Graphics = pixiAny.Graphics;
  if (!Graphics || !Graphics.prototype) {
    return false;
  }
  const proto = Graphics.prototype as any;
  if (proto.__pixiDomGraphicsCompatApplied) {
    return true;
  }
  proto.__pixiDomGraphicsCompatApplied = true;

  const originalClear = typeof proto.clear === 'function' ? proto.clear : null;

  proto.clear = function (...args: any[]) {
    const state = ensureGraphicsCompatState(this);
    state.fill = null;
    state.stroke = null;
    state.lastPoint = null;
    if (originalClear) {
      return originalClear.apply(this, args);
    }
    return this;
  };

  proto.beginFill = function (color?: any, alpha?: number) {
    const state = ensureGraphicsCompatState(this);
    if (typeof color === 'object' && color !== null) {
      const payload = color as { color?: number; alpha?: number };
      state.fill = {
        color: normalizeColor(payload.color),
        alpha: clamp01(payload.alpha ?? alpha ?? 1),
      };
    } else {
      state.fill = {
        color: normalizeColor(color),
        alpha: clamp01(typeof alpha === 'number' ? alpha : 1),
      };
    }
    return this;
  };

  proto.endFill = function () {
    const state = ensureGraphicsCompatState(this);
    state.fill = null;
    return this;
  };

  proto.lineStyle = function (width?: any, color?: any, alpha?: number, alignment?: number) {
    const state = ensureGraphicsCompatState(this);
    if (typeof width === 'object' && width !== null) {
      const payload = width as Record<string, any>;
      const resolvedWidth = sanitizeNumber(payload.width, 0);
      if (resolvedWidth <= 0) {
        state.stroke = null;
      } else {
        state.stroke = {
          width: resolvedWidth,
          color: normalizeColor(payload.color ?? color),
          alpha: clamp01(payload.alpha ?? alpha ?? 1),
          alignment: sanitizeNumber(payload.alignment ?? alignment, 0.5),
          cap: payload.cap,
          join: payload.join,
          miterLimit: typeof payload.miterLimit === 'number' && isFinite(payload.miterLimit)
            ? payload.miterLimit
            : undefined,
        };
      }
      return this;
    }

    const resolvedWidth = sanitizeNumber(width, 0);
    if (resolvedWidth <= 0) {
      state.stroke = null;
      return this;
    }

    state.stroke = {
      width: resolvedWidth,
      color: normalizeColor(color),
      alpha: clamp01(typeof alpha === 'number' ? alpha : 1),
      alignment: sanitizeNumber(alignment, 0.5),
    };

    return this;
  };

  proto.drawRect = function (x = 0, y = 0, width = 0, height = 0) {
    if (typeof this.rect === 'function') {
      const shape = this.rect(x, y, width, height);
      applyFillAndStroke(this, shape);
    }
    return this;
  };

  proto.drawRoundedRect = function (x = 0, y = 0, width = 0, height = 0, radius = 0) {
    if (typeof this.roundRect === 'function') {
      const shape = this.roundRect(x, y, width, height, radius);
      applyFillAndStroke(this, shape);
    }
    return this;
  };

  proto.drawCircle = function (x = 0, y = 0, radius = 0) {
    if (typeof this.circle === 'function') {
      const shape = this.circle(x, y, radius);
      applyFillAndStroke(this, shape);
    }
    return this;
  };

  proto.moveTo = function (x = 0, y = 0) {
    const state = ensureGraphicsCompatState(this);
    state.lastPoint = { x, y };
    return this;
  };

  proto.lineTo = function (x = 0, y = 0) {
    const state = ensureGraphicsCompatState(this);
    if (!state.lastPoint || typeof this.poly !== 'function') {
      state.lastPoint = { x, y };
      return this;
    }
    const prev = state.lastPoint;
    const shape = this.poly([prev.x, prev.y, x, y], { close: false });
    applyFillAndStroke(this, shape, { skipFill: true });
    state.lastPoint = { x, y };
    return this;
  };
  return true;
};

let graphicsPatched = false;

export const ensurePixiGraphicsCompatibility = () => {
  if (graphicsPatched) {
    return;
  }
  graphicsPatched = patchGraphicsForPixi8();
};

export const getPixiVersion = () => {
  return parseFloat(PIXI.VERSION);
}

/**
 * Draw a filled rectangle on a Graphics object using the appropriate API for the PIXI version.
 * This bypasses the compat shim and uses native APIs directly for maximum reliability.
 */
export const drawFilledRect = (
  graphics: PIXI.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number = 0xffffff,
  alpha: number = 1
): PIXI.Graphics => {
  const version = getPixiVersion();
  const g = graphics as any;
  
  if (version >= 8) {
    // PIXI v8 uses new fluent API: graphics.rect().fill()
    if (typeof g.rect === 'function') {
      g.rect(x, y, width, height).fill({ color, alpha });
    }
  } else {
    // PIXI v4-v7 use legacy API
    g.beginFill(color, alpha);
    g.drawRect(x, y, width, height);
    g.endFill();
  }
  
  return graphics;
};

export interface BitmapTextLike extends PIXI.Container {
  text: string;
  maxWidth?: number;
  tint?: number;
  letterSpacing?: number;
  style?: any;
  destroy(options?: any): void;
}

type BitmapTextCtor = new (text: string, style?: any) => BitmapTextLike;

const resolveTintColor = (value: any): number | null => {
  if (typeof value === 'number' && isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    // Resolve via our own color pipeline rather than PIXI.utils.string2hex,
    // which was removed in PIXI v8.
    try {
      return normalizeColorInput(value).value;
    } catch (error) {
      return null;
    }
  }
  return null;
};

const tintToHexString = (value: number) => {
  const hex = safeColorInt(value).toString(16);
  return `#${('000000' + hex).slice(-6)}`;
};

const resolveBitmapTextCtor = (): BitmapTextCtor | null => {
  const pixiAny = PIXI as any;
  const version = getPixiVersion();

  if (version < 6) {
    const legacyCtor = pixiAny.extras?.BitmapText ?? pixiAny?.extras?.['BitmapText'];
    if (legacyCtor) {
      return legacyCtor;
    }
  }

  return (
    pixiAny.BitmapText ??
    pixiAny.extras?.BitmapText ??
    pixiAny?.extras?.['BitmapText'] ??
    null
  );
};

const normalizeFontFamilyName = (value: any) => {
  if (typeof value === 'string') {
    const primary = value.split(',')[0].trim().replace(/^['"]+|['"]+$/g, '').trim();
    return primary || null;
  }
  if (typeof value === 'number' && isFinite(value)) {
    return String(value);
  }
  return null;
};

const ensureCanonicalFontFamily = (style: any, canonicalFamily?: string | null) => {
  if (!style || !canonicalFamily) {
    return;
  }
  (['fontFamily', 'fontName', 'font'] as const).forEach((key) => {
    const current = style[key];
    if (!current) {
      style[key] = canonicalFamily;
      return;
    }
    if (typeof current === 'string') {
      if (current === canonicalFamily) {
        return;
      }
      const normalized = normalizeFontFamilyName(current);
      if (!normalized || normalized === canonicalFamily) {
        style[key] = canonicalFamily;
      }
      return;
    }
    if (Array.isArray(current) && current.length) {
      const normalized = normalizeFontFamilyName(current[0]);
      if (!normalized || normalized === canonicalFamily) {
        style[key] = canonicalFamily;
      }
    }
  });
};

const getBitmapFontCacheEntry = (fontFamily?: string | null) => {
  if (!fontFamily || typeof PIXI === 'undefined') {
    return null;
  }
  const pixiAny = PIXI as any;
  const cache = pixiAny?.Cache;
  const cacheKey = `${fontFamily}-bitmap`;
  if (cache) {
    if (typeof cache.get === 'function' && cache.has?.(cacheKey)) {
      try {
        const fontInstance = cache.get(cacheKey);
        if (fontInstance) {
          return fontInstance;
        }
      } catch (error) {
        /* noop */
      }
    } else if (cacheKey in cache) {
      const fontInstance = (cache as Record<string, unknown>)[cacheKey];
      if (fontInstance) {
        return fontInstance;
      }
    }
  }
  const available = pixiAny?.BitmapFont?.available;
  if (available) {
    if (available instanceof Map) {
      if (available.has(fontFamily)) {
        return available.get(fontFamily);
      }
    } else if (typeof available === 'object' && fontFamily in available) {
      return available[fontFamily];
    }
  }
  return null;
};

const resolveBitmapFontBaseSize = (fontFamily?: string | null) => {
  if (!fontFamily) {
    return null;
  }
  const entry = getBitmapFontCacheEntry(fontFamily);
  if (!entry) {
    return null;
  }
  const candidates = [
    entry.baseRenderedFontSize,
    entry.baseFontSize,
    entry.fontSize,
    entry.size,
    entry.common?.lineHeight,
  ];
  for (const value of candidates) {
    if (typeof value === 'number' && isFinite(value) && value > 0) {
      return value;
    }
  }
  return null;
};

const resolveNumericFontSize = (value: any): number | null => {
  if (typeof value === 'number' && isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return null;
};

const resolveBitmapFontMeasurementSize = (fontInstance?: any): number | null => {
  if (!fontInstance) {
    return null;
  }
  const candidates = [
    fontInstance.baseMeasurementFontSize,
    fontInstance.fontMetrics?.fontSize,
    fontInstance.fontSize,
    fontInstance.size,
  ];
  for (const value of candidates) {
    if (typeof value === 'number' && isFinite(value) && value > 0) {
      return value;
    }
  }
  return null;
};

const resolveBitmapFontBaselineOffset = (fontFamily?: string | null, style?: any): number | null => {
  if (!fontFamily) {
    return null;
  }
  const entry = getBitmapFontCacheEntry(fontFamily);
  if (!entry) {
    return null;
  }
  const rawOffset = typeof entry.baseLineOffset === 'number' ? entry.baseLineOffset : null;
  if (!rawOffset || !isFinite(rawOffset) || rawOffset === 0) {
    return null;
  }
  const measurementSize = resolveBitmapFontMeasurementSize(entry);
  const targetSize = resolveNumericFontSize(style?.fontSize) ?? resolveBitmapFontBaseSize(fontFamily) ?? measurementSize;
  if (measurementSize && targetSize && measurementSize > 0) {
    return rawOffset * (targetSize / measurementSize);
  }
  return rawOffset;
};

const shouldUseTopAlignedBaseline = (value: any) => {
  if (value == null) {
    return true;
  }
  if (typeof value !== 'string') {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === 'top' || normalized === 'hanging';
};

const applyBitmapTextBaselineCompensation = (bitmapText: BitmapTextLike, style?: any) => {
  if (!bitmapText || !style) {
    return;
  }
  const baselineValue = style.textBaseline;
  if (!shouldUseTopAlignedBaseline(baselineValue)) {
    return;
  }
  const fontFamily = normalizeFontFamilyName(style.fontFamily ?? style.fontName ?? style.font);
  const offset = resolveBitmapFontBaselineOffset(fontFamily, style);
  if (!offset) {
    return;
  }
  const instanceAny = bitmapText as any;
  if (instanceAny.__pixiDomBaselined) {
    return;
  }
  const pivot = instanceAny.pivot;
  if (pivot && typeof pivot.y === 'number') {
    pivot.y += offset;
  } else if (pivot && typeof pivot.set === 'function') {
    const currentX = typeof pivot.x === 'number' ? pivot.x : 0;
    const currentY = typeof pivot.y === 'number' ? pivot.y : 0;
    pivot.set(currentX, currentY + offset);
  } else if (typeof instanceAny.pivotY === 'number') {
    instanceAny.pivotY += offset;
  }
  instanceAny.__pixiDomBaselined = true;
};

const ensureBitmapFontFillStyleCache = (style?: any) => {
  if (!style || typeof PIXI === 'undefined') {
    return;
  }
  const pixiAny = PIXI as any;
  const cache = pixiAny?.Cache;
  const hasCacheApi = cache && typeof cache.has === 'function' && typeof cache.get === 'function' && typeof cache.set === 'function';
  if (!hasCacheApi) {
    return;
  }

  const fontFamily = normalizeFontFamilyName(style.fontFamily ?? style.fontName ?? style.font);
  const fillColor = style._fill?.fill ?? null;
  if (!fontFamily || !fillColor) {
    return;
  }

  const fillUid = fillColor.uid ?? fillColor.id ?? fillColor.value ?? null;
  if (fillUid == null) {
    return;
  }

  const baseKey = `${fontFamily}-bitmap`;
  const aliasKey = `${baseKey}${fillUid}`;

  if (cache.has(aliasKey) || !cache.has(baseKey)) {
    return;
  }

  try {
    const fontInstance = cache.get(baseKey);
    if (fontInstance) {
      cache.set(aliasKey, fontInstance);
    }
  } catch (error) {
    /* noop */
  }
};

const ensureBitmapFontManagerCachePatch = () => {
  if (typeof PIXI === 'undefined') {
    return;
  }
  const pixiAny = PIXI as any;
  const manager = pixiAny?.BitmapFontManager as any;
  const cache = pixiAny?.Cache;
  const hasCacheApi = cache && typeof cache.has === 'function' && typeof cache.get === 'function' && typeof cache.set === 'function';
  if (!manager || typeof manager.getFont !== 'function' || manager.__pixiDomCachePatched || !hasCacheApi) {
    return;
  }

  const originalGetFont = manager.getFont.bind(manager);

  manager.getFont = function patchedGetFont(text: string, style: any) {
    if (style) {
      const fontFamily = normalizeFontFamilyName(style.fontFamily ?? style.fontName ?? style.font);
      const fillColor = style._fill?.fill ?? null;
      const fillUid = fillColor?.uid ?? fillColor?.id ?? fillColor?.value ?? null;
      if (fontFamily) {
        const baseKey = `${fontFamily}-bitmap`;
        if (cache.has(baseKey)) {
          ensureCanonicalFontFamily(style, fontFamily);
          const fontInstance = cache.get(baseKey);
          if (fontInstance) {
            if (fillUid != null) {
              const aliasKey = `${baseKey}${fillUid}`;
              if (!cache.has(aliasKey)) {
                try {
                  cache.set(aliasKey, fontInstance);
                } catch (error) {
                  /* noop */
                }
              }
            }
            return fontInstance;
          }
        }
      }
      if (fontFamily && fillUid != null) {
        const baseKey = `${fontFamily}-bitmap`;
        const aliasKey = `${baseKey}${fillUid}`;
        if (!cache.has(aliasKey) && cache.has(baseKey)) {
          try {
            const fontInstance = cache.get(baseKey);
            if (fontInstance) {
              ensureCanonicalFontFamily(style, fontFamily);
              cache.set(aliasKey, fontInstance);
            }
          } catch (error) {
            /* noop */
          }
        }
      }
    }
    return originalGetFont(text, style);
  };

  Object.defineProperty(manager, '__pixiDomCachePatched', {
    value: true,
    enumerable: false,
    configurable: false,
  });
};

export const isBitmapTextSupported = () => {
  return !!resolveBitmapTextCtor();
};

export const createBitmapText = (text: string, style?: any): BitmapTextLike => {
  ensureBitmapFontManagerCachePatch();
  const Ctor = resolveBitmapTextCtor();
  if (!Ctor) {
    throw new Error('PIXI.BitmapText is not available in this PIXI build.');
  }
  let normalizedStyle = style;
  if (style && typeof style === 'object') {
    normalizedStyle = { ...style };
    if (normalizedStyle.font && !normalizedStyle.fontName) {
      normalizedStyle.fontName = normalizedStyle.font;
    }
    if (normalizedStyle.fontName && !normalizedStyle.font) {
      normalizedStyle.font = normalizedStyle.fontName;
    }
    const resolvedFontName =
      normalizedStyle.fontName ||
      normalizedStyle.font ||
      normalizedStyle.fontFamily;
    if (resolvedFontName) {
      if (!normalizedStyle.fontName) {
        normalizedStyle.fontName = resolvedFontName;
      }
      if (!normalizedStyle.font) {
        normalizedStyle.font = resolvedFontName;
      }
      if (!normalizedStyle.fontFamily) {
        normalizedStyle.fontFamily = resolvedFontName;
      }
    }
  }
  const pixiVersion = getPixiVersion();
  const preparedStyle = normalizedStyle;
  let tintOverride: number | null = null;
  if (pixiVersion >= 8 && preparedStyle) {
    const styleConfig = preparedStyle as any;
    if (styleConfig.fill === undefined || styleConfig.fill === null) {
      styleConfig.fill = '#ffffff';
    }
    const tintCandidate = styleConfig.tint ?? styleConfig.fill;
    tintOverride = resolveTintColor(tintCandidate);
    if (styleConfig.tint == null && tintOverride != null) {
      styleConfig.tint = tintOverride;
    }
    if (styleConfig.textBaseline == null) {
      styleConfig.textBaseline = 'top';
    }
    if (styleConfig.fontSize == null || !isFinite(styleConfig.fontSize)) {
      const fontFamily = normalizeFontFamilyName(styleConfig.fontFamily ?? styleConfig.fontName ?? styleConfig.font);
      const baseSize = resolveBitmapFontBaseSize(fontFamily);
      if (baseSize != null) {
        styleConfig.fontSize = baseSize;
      }
    }
  }
  const instance = pixiVersion >= 8
    ? new (Ctor as any)({ text, style: preparedStyle ?? normalizedStyle })
    : new Ctor(text, normalizedStyle);
  if (pixiVersion >= 8) {
    const instanceAny = instance as any;
    if (tintOverride != null) {
      if (typeof instanceAny.tint !== 'undefined') {
        instanceAny.tint = tintOverride;
      }
      const style = instanceAny.style ?? instanceAny._style;
      if (style && typeof style === 'object') {
        try {
          style.fill = tintToHexString(tintOverride);
        } catch (error) {
          /* noop */
        }
      }
      getBitmapTextGlyphs(instance).forEach((glyph) => {
        const glyphAny = glyph as any;
        if (glyphAny && typeof glyphAny.tint !== 'undefined') {
          glyphAny.tint = tintOverride;
        }
      });
    }
    const targetStyle = (instance as any).style ?? (instance as any)._style ?? normalizedStyle;
    const needsFontSizeCorrection = targetStyle && (targetStyle.fontSize == null || !isFinite(targetStyle.fontSize));
    if (targetStyle && targetStyle.textBaseline == null) {
      targetStyle.textBaseline = 'top';
    }
    if (needsFontSizeCorrection) {
      const fallbackFamily = normalizeFontFamilyName(
        targetStyle.fontFamily ??
        targetStyle.fontName ??
        targetStyle.font ??
        preparedStyle?.fontFamily ??
        preparedStyle?.fontName ??
        preparedStyle?.font
      );
      const baseSize = resolveBitmapFontBaseSize(fallbackFamily);
      if (baseSize != null) {
        try {
          targetStyle.fontSize = baseSize;
        } catch (error) {
          (targetStyle as any)._fontSize = baseSize;
          if (typeof targetStyle.onUpdate === 'function') {
            targetStyle.onUpdate();
          }
        }
      }
    }
    ensureBitmapFontFillStyleCache(targetStyle);
    applyBitmapTextBaselineCompensation(instance, targetStyle ?? preparedStyle ?? normalizedStyle);
  }
  return instance;
};

/**
 * Represents a virtual glyph with position and size information.
 * Used for v7+ where BitmapText doesn't have child sprites for glyphs.
 */
interface VirtualGlyph {
  x: number;
  y: number;
  width: number;
  height: number;
  char: string;
  tint?: number;
}

/**
 * Computes virtual glyph data from BitmapFont metrics for v7+ compatibility.
 * In v7+, BitmapText uses GPU rendering and doesn't create child sprites.
 */
const computeVirtualGlyphs = (bitmapText: BitmapTextLike): VirtualGlyph[] => {
  const anyBitmap = bitmapText as any;
  const text = anyBitmap.text ?? '';
  
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  // Get the font family from the style - try multiple locations for v8 compatibility
  const style = anyBitmap.style ?? anyBitmap._style ?? {};
  
  // In v8, TextStyle stores fontFamily in _fontFamily (accessed via getter)
  // Also check the original style options passed during construction
  const fontFamily = normalizeFontFamilyName(
    style.fontFamily ?? 
    style._fontFamily ?? 
    style.fontName ?? 
    style.font ??
    anyBitmap._fontFamily ??
    anyBitmap.fontName ??
    anyBitmap.font
  );
  
  if (!fontFamily) {
    return [];
  }
  
  // Get the font entry from cache
  const fontEntry = getBitmapFontCacheEntry(fontFamily);
  
  if (!fontEntry || !fontEntry.chars) {
    return [];
  }
  
  // Calculate scale factor
  const baseFontSize = fontEntry.baseMeasurementFontSize ?? fontEntry.baseRenderedFontSize ?? fontEntry.fontSize ?? fontEntry.size ?? 16;
  const targetFontSize = style.fontSize ?? baseFontSize;
  const scale = targetFontSize / baseFontSize;
  
  const glyphs: VirtualGlyph[] = [];
  let currentX = 0;
  let previousChar: string | null = null;
  
  // Helper to get char data - handles both Map (v7) and Object (v8)
  const getCharData = (chars: any, char: string): any => {
    if (chars instanceof Map) {
      // v7 uses char codes as keys
      return chars.get(char.charCodeAt(0)) ?? chars.get(char);
    }
    // v8 uses strings as keys
    return chars[char] ?? chars[char.charCodeAt(0)];
  };
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charData = getCharData(fontEntry.chars, char);
    
    if (!charData) {
      // Use a default width for unknown characters
      const fallbackWidth = 8 * scale;
      glyphs.push({
        x: currentX,
        y: 0,
        width: fallbackWidth,
        height: baseFontSize * scale,
        char,
      });
      currentX += fallbackWidth;
      previousChar = char;
      continue;
    }
    
    // Apply kerning if available
    const kerning = (charData.kerning && previousChar && charData.kerning[previousChar]) || 0;
    currentX += kerning * scale;
    
    // Get character dimensions
    const charWidth = (charData.texture?.frame?.width ?? charData.width ?? charData.xAdvance ?? 8) * scale;
    const charHeight = (charData.texture?.frame?.height ?? charData.height ?? baseFontSize) * scale;
    const xOffset = (charData.xOffset ?? 0) * scale;
    const yOffset = (charData.yOffset ?? 0) * scale;
    const xAdvance = (charData.xAdvance ?? charWidth) * scale;
    
    glyphs.push({
      x: currentX + xOffset,
      y: yOffset,
      width: charWidth,
      height: charHeight,
      char,
    });
    
    currentX += xAdvance;
    previousChar = char;
  }
  
  return glyphs;
};

export const getBitmapTextGlyphs = (bitmapText: BitmapTextLike): PIXI.DisplayObject[] => {
  if (!bitmapText) {
    return [];
  }
  const anyBitmap = bitmapText as any;
  const pixiVersion = getPixiVersion();
  
  // For v4-v6, try to get actual child sprites
  if (pixiVersion < 7) {
    const candidates = anyBitmap.glyphs ?? anyBitmap._glyphs ?? anyBitmap.children ?? [];
    if (Array.isArray(candidates) && candidates.length > 0) {
      return candidates.filter(Boolean);
    }
    if (typeof candidates.values === 'function') {
      const values = Array.from(candidates.values()) as PIXI.DisplayObject[];
      if (values.length > 0) {
        return values.filter(Boolean);
      }
    }
    if (typeof candidates.forEach === 'function') {
      const result: PIXI.DisplayObject[] = [];
      candidates.forEach((value: any) => {
        if (value) {
          result.push(value as PIXI.DisplayObject);
        }
      });
      if (result.length > 0) {
        return result;
      }
    }
  }
  
  // For v7+, or if no children found, compute virtual glyphs from font metrics
  // This is necessary because v7+ BitmapText uses GPU rendering without child sprites
  const virtualGlyphs = computeVirtualGlyphs(bitmapText);
  
  // Return virtual glyphs cast as DisplayObjects for API compatibility
  // The calling code only needs x, width, and optionally tint properties
  return virtualGlyphs as unknown as PIXI.DisplayObject[];
};

export const setBitmapTextTint = (
  bitmapText: BitmapTextLike | null | undefined,
  tint: number | string | null | undefined
) => {
  ensureBitmapFontManagerCachePatch();
  if (!bitmapText) {
    return;
  }
  const resolvedTint = resolveTintColor(tint);
  if (resolvedTint == null) {
    return;
  }
  const bitmapAny = bitmapText as any;
  if (typeof bitmapAny.tint !== 'undefined') {
    bitmapAny.tint = resolvedTint;
  }
  const pixiVersion = getPixiVersion();
  if (pixiVersion >= 8) {
    const style = bitmapAny.style ?? bitmapAny._style;
    if (style && typeof style === 'object') {
      try {
        style.fill = tintToHexString(resolvedTint);
      } catch (error) {
        /* noop */
      }
    }
    ensureBitmapFontFillStyleCache(style);
    const glyphs = getBitmapTextGlyphs(bitmapText);
    if (glyphs.length) {
      glyphs.forEach((glyph) => {
        const glyphAny = glyph as any;
        if (glyphAny && typeof glyphAny.tint !== 'undefined') {
          glyphAny.tint = resolvedTint;
        } else if (glyphAny?.style && typeof glyphAny.style === 'object' && 'fill' in glyphAny.style) {
          glyphAny.style.fill = resolvedTint;
        }
      });
    }
  }
};

const resolveBitmapFontCache = () => {
  const pixiAny = PIXI as any;
  return (
    pixiAny.BitmapFont?.available ??
    pixiAny.BitmapFont?.fonts ??
    pixiAny.extras?.BitmapText?.fonts ??
    pixiAny.extras?.BitmapFont?.available ??
    null
  );
};

export const hasBitmapFont = (name: string): boolean => {
  const cache = resolveBitmapFontCache();
  if (cache) {
    if (cache instanceof Map) {
      if (cache.has(name)) {
        return true;
      }
    } else if (cache instanceof Set) {
      if (cache.has(name)) {
        return true;
      }
    } else if (typeof cache === 'object' && Object.prototype.hasOwnProperty.call(cache, name)) {
      if (cache[name]) {
        return true;
      }
    }
  }

  const pixiAny = PIXI as any;
  const cacheKey = `${name}-bitmap`;
  const pixiCache = pixiAny.Cache;
  if (pixiCache) {
    if (typeof pixiCache.has === 'function' && pixiCache.has(cacheKey)) {
      return true;
    }
    if (typeof pixiCache === 'object' && cacheKey in pixiCache) {
      const candidate = (pixiCache as Record<string, unknown>)[cacheKey];
      if (candidate) {
        return true;
      }
    }
  }

  return false;
};

if (typeof PIXI !== 'undefined') {
  try {
    ensureBitmapFontManagerCachePatch();
  } catch (error) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[PixiDom] Failed to eagerly patch BitmapFontManager cache', error);
    }
  }
}
interface EnsureBitmapFontOptions {
  fontFamily: string;
  fontSize: number;
  chars?: string | string[];
  resolution?: number;
  textureWidth?: number;
  textureHeight?: number;
}

export const ensureBitmapFont = (name: string, options: EnsureBitmapFontOptions) => {
  if (hasBitmapFont(name)) {
    return;
  }
  const pixiAny = PIXI as any;
  if (pixiAny.BitmapFont?.from) {
    const { fontFamily, fontSize, chars, resolution, textureWidth, textureHeight } = options;
    const styleConfig = {
      fontFamily,
      fontSize,
    };
    const generationOptions = {
      chars,
      resolution,
      textureWidth,
      textureHeight,
    };
    pixiAny.BitmapFont.from(name, styleConfig, generationOptions);
    return;
  }
  console.warn('BitmapFont.from is not available in this PIXI version; ensure font is preloaded.');
};

export function createTexture(texture: PIXI.Texture | PIXI.BaseTexture, rect: { x: number, y: number, width: number, height: number }) {
  if(getPixiVersion() >= 8) {
    return new PIXI.Texture({
      source: 'source' in texture ? texture.source : 'baseTexture' in texture ? texture.baseTexture : texture,
      frame: rect,
    });
  } else {
    return new PIXI.Texture(
      'baseTexture' in texture ? texture.baseTexture : texture,
       new PIXI.Rectangle(rect.x, rect.y, rect.width, rect.height)
    );
  }
}

export async function ensureTextureLoaded(texture: PIXI.Texture) : Promise<PIXI.Texture>{
  if(getPixiVersion() >= 8) {
    return texture;
  }
  if(getPixiVersion() >= 5 && !texture.baseTexture.valid) {
    return new Promise((resolve) => {
      texture.baseTexture.once('loaded',async () => {
        return resolve(texture);
      });
    })
  } else if (getPixiVersion() < 5 && !texture.baseTexture.hasLoaded) {
    return new Promise((resolve) => {
      texture.baseTexture.once('loaded',async () => {
        return resolve(texture);
      });
    })
  }
  return texture
}

type Renderer = {
  render: (...args: any[]) => void;
}
export function renderRenderTexture(
  renderer: Renderer,
  renderTexture: PIXI.RenderTexture, 
  sprite: PIXI.Graphics | PIXI.Sprite | PIXI.Container | PIXI.DisplayObject, 
  clear=true,
) {
  assertGlobalPixi('renderRenderTexture');
  if(getPixiVersion() >= 7) {
    if(getPixiVersion() >= 8) {
      renderer.render({
        container: sprite,
        target: renderTexture,
        clear
      })
    } else {
      renderer.render(sprite, {
        renderTexture,
        clear
      })
    }
   
  } else {
    renderer.render(sprite, renderTexture, clear);
  }
}

export function clearRenderTexture(
  renderer: Renderer,
  renderTexture: PIXI.RenderTexture,
  rect: { x?: number, y?: number, width?: number, height?: number } = {}
) {
  assertGlobalPixi('clearRenderTexture');
  if (!renderTexture) {
    return;
  }

  const version = getPixiVersion();
  const baseTexture = renderTexture.baseTexture as any;
  const width = rect.width ?? renderTexture.width ?? baseTexture?.realWidth ?? baseTexture?.width ?? 0;
  const height = rect.height ?? renderTexture.height ?? baseTexture?.realHeight ?? baseTexture?.height ?? 0;

  if (width <= 0 || height <= 0) {
    return;
  }

  const x = rect.x ?? 0;
  const y = rect.y ?? 0;

  const rendererAny = renderer as any;
  const gl: WebGLRenderingContext | WebGL2RenderingContext | undefined =
    rendererAny.gl ?? rendererAny._gl ?? rendererAny.context?.gl;

  if (gl) {
    const wasScissorEnabled = typeof gl.isEnabled === 'function' ? gl.isEnabled(gl.SCISSOR_TEST) : false;
    let prevScissorBox: Int32Array | null = null;
    if (typeof gl.getParameter === 'function') {
      try {
        prevScissorBox = gl.getParameter(gl.SCISSOR_BOX);
      } catch (err) {
        prevScissorBox = null;
      }
    }

    let prevClearColor: Float32Array | number[] | null = null;
    if (typeof gl.getParameter === 'function' && typeof gl.COLOR_CLEAR_VALUE !== 'undefined') {
      try {
        prevClearColor = gl.getParameter(gl.COLOR_CLEAR_VALUE);
      } catch (err) {
        prevClearColor = null;
      }
    }

    if (version < 6 && version >= 4 && typeof rendererAny.bindRenderTexture === 'function') {
      rendererAny.bindRenderTexture(renderTexture, null);
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(x, y, width, height);
      if (typeof gl.clearColor === 'function') {
        gl.clearColor(0, 0, 0, 0);
      }
      if (typeof gl.clear === 'function') {
        gl.clear(gl.COLOR_BUFFER_BIT);
      } else if (typeof rendererAny.clear === 'function') {
        rendererAny.clear();
      }
      rendererAny.bindRenderTexture(null, null);

      if (!wasScissorEnabled) {
        gl.disable(gl.SCISSOR_TEST);
      } else if (prevScissorBox) {
        gl.scissor(prevScissorBox[0], prevScissorBox[1], prevScissorBox[2], prevScissorBox[3]);
      }

      if (prevClearColor && typeof gl.clearColor === 'function') {
        gl.clearColor(prevClearColor[0], prevClearColor[1], prevClearColor[2], prevClearColor[3]);
      }
      return;
    }

    const rtSystem = rendererAny.renderTexture || rendererAny.texture || rendererAny._renderTexture;
    if (rtSystem?.bind) {
      rtSystem.bind(renderTexture);
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(x, y, width, height);
      if (typeof gl.clearColor === 'function') {
        gl.clearColor(0, 0, 0, 0);
      }
      if (typeof gl.clear === 'function') {
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      rtSystem.bind(null);

      if (!wasScissorEnabled) {
        gl.disable(gl.SCISSOR_TEST);
      } else if (prevScissorBox) {
        gl.scissor(prevScissorBox[0], prevScissorBox[1], prevScissorBox[2], prevScissorBox[3]);
      }

      if (prevClearColor && typeof gl.clearColor === 'function') {
        gl.clearColor(prevClearColor[0], prevClearColor[1], prevClearColor[2], prevClearColor[3]);
      }
      return;
    }
  }

  const canvasRenderTarget = baseTexture?._canvasRenderTarget;
  const canvasContext =
    canvasRenderTarget?.context ||
    baseTexture?.resource?.context ||
    rendererAny?.rootContext ||
    null;

  if (canvasContext?.clearRect) {
    rendererAny.renderTexture?.bind?.(renderTexture);
    canvasContext.clearRect(x, y, width, height);
    rendererAny.renderTexture?.bind?.(null);
    return;
  }

  const graphics = new PIXI.Graphics();
  graphics.beginFill(0, 0);
  graphics.drawRect(x, y, width, height);
  graphics.endFill();
  renderRenderTexture(rendererAny, renderTexture, graphics, false);
  graphics.destroy(true);
}

export function createRenderTexture(width: number, height: number, scaleMode?: number, resolution?: number) {
  assertGlobalPixi('createRenderTexture');
  if(getPixiVersion() >= 7) {
    const opts: PIXI.RenderTextureCreateOptions = { width, height };
    if(scaleMode !== undefined) {
      opts.scaleMode = scaleMode;
    }
    if(resolution !== undefined) {
      opts.resolution = resolution;
    }
    return PIXI.RenderTexture.create(opts)
  } else {
    return PIXI.RenderTexture.create(width, height, scaleMode, resolution)
  }
}

export function getTextureFromImage(img: HTMLImageElement) {
  assertGlobalPixi('getTextureFromImage');
  if(getPixiVersion() >= 8) {
    const source = new PIXI['CanvasSource']({
      resource: img,
    });
    // create a texture
    const texture = new PIXI.Texture({
      source
    } as any);
    return texture;
  } else {
    return new PIXI.Texture(new PIXI.BaseTexture(img));
  }
}

export const imageBitmapToCanvas = (imageBitmap: ImageBitmap) : HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  const ctx = canvas.getContext('2d'); 
  ctx?.drawImage(imageBitmap, 0, 0);
  return canvas;
}


export const imageBitmapToTexture = (
  imageBitmap: ImageBitmap,
  renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer,
  webGl: boolean
): PIXI.Texture => {
  assertGlobalPixi('imageBitmapToTexture');
  const pixiVersion = getPixiVersion();

  // PIXI v7 → native support
  if (pixiVersion >= 7) {
    return PIXI.Texture.from(imageBitmap as any);
  }
  
  if (pixiVersion >= 6) {
      return PIXI.Texture.from(imageBitmap as any);
  }

  if(!webGl || pixiVersion <= 3) {
    const canvas = imageBitmapToCanvas(imageBitmap as any);
    return PIXI.Texture.from(canvas);
  }

  if(pixiVersion >= 5) {
    const base = new PIXI.BaseTexture(imageBitmap as any);
     return new PIXI.Texture(base);
  }

  // PIXI v4 → WebGL: create a BaseTexture, mark it loaded, and upload it manually.
  if (pixiVersion >= 4) {
      const baseTexture = new PIXI.BaseTexture(null as any);

      // attach the ImageBitmap as the "source"
      (baseTexture as any).source = imageBitmap;    // v4 uses .source
      baseTexture.width = imageBitmap.width;
      baseTexture.height = imageBitmap.height;

      // mark it as loaded/valid so Pixi won't try to re-upload or treat it as empty
      baseTexture.hasLoaded = true;
      (baseTexture as any).valid = true;
      // if v4 exposes the internal helper, call it to run its update() logic
      if (typeof (baseTexture as any)._sourceLoaded === 'function') {
        try { (baseTexture as any)._sourceLoaded(); } catch (e) { /* ignore */ }
      } else if (typeof (baseTexture as any).emit === 'function') {
        // fallback: emit loaded/update so listeners (and some code paths) pick it up
        try {
          (baseTexture as any).emit('loaded', baseTexture);
          (baseTexture as any).emit('update', baseTexture);
        } catch (e) { /* ignore */ }
      }

      // force the renderer to upload the texture into GL (v4 renderer.textureManager exists)
      if (renderer && (renderer as any).textureManager && (renderer as any).textureManager.updateTexture) {
        try {
          (renderer as any).textureManager.updateTexture(baseTexture);
        } catch (e) {
          // if that fails, do a manual GL upload as a last resort (see previous discussion)
          console.warn('texture upload via textureManager failed, you may need manual GL upload', e);
        }
      }
      // v4 has no Texture.from; the texture we just prepared IS the result.
      return new PIXI.Texture(baseTexture);
  }
  // Fallback for any unknown version
  const canvas = imageBitmapToCanvas(imageBitmap);
  return PIXI.Texture.from(canvas);
}

export function bufferToBase64 (arrayBuffer: ArrayBuffer) {
  return btoa(
      new Uint8Array(arrayBuffer)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
}

export async function getTextureFromBlob(blob: Blob) : Promise<PIXI.Texture> {
  assertGlobalPixi('getTextureFromBlob');
  const URL = typeof window !== 'undefined' ? window.URL || window.webkitURL : undefined;
  let blobURL: string;
  let needRevoke = true;
  try {
      blobURL = URL?.createObjectURL(blob) ?? '';
  } catch(err) {
      needRevoke = false;
      const base64 = bufferToBase64(blob as unknown as ArrayBuffer);
      blobURL = 'data:image/png;base64,' + base64
      // return PIXI.Texture.from(base64);
  }
  const img = new Image();
  return new Promise((resolve, reject) => {
      img.src = blobURL;
      img.addEventListener("load", (event) => {
          if(needRevoke) {
              URL?.revokeObjectURL(blobURL);
          }
          return resolve(getTextureFromImage(img));
      });// onload revoke the blob URL (because the browser has loaded and parsed the image data)
  })
}



export function assertGlobalPixi(context?: string) {
  if (typeof PIXI === 'undefined') {
    if(context) {
      console.error(`PIXI is not available in the current environment.  Please ensure PIXI is loaded and available globally/ on the window object before using ${context}`);
    }
    throw new Error('PIXI is not available in the current environment. Please ensure PIXI is loaded and available globally/ on the window object before calling this function.');
  }
}
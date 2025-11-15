import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { PNG } from 'pngjs';
import fs from 'fs';
import path from 'path';

const PORT = process.env.PIXIDOM_EXAMPLE_PORT || process.env.PORT || 4173;
const EXAMPLE_PATH = `http://127.0.0.1:${PORT}/example/Toggle/example.html`;
const PIXI_SCRIPT = 'pixi8.js';

const startServer = async () => {
  return await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/serve-examples.js'], {
      env: {
        ...process.env,
        PORT: String(PORT),
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const onData = (chunk) => {
      const text = chunk.toString();
      if (text.includes('Serving PixiDom examples')) {
        cleanup();
        resolve(child);
      }
    };

    const onError = (error) => {
      cleanup();
      reject(error);
    };

    const onExit = (code, signal) => {
      cleanup();
      reject(new Error(`Example server exited prematurely (code=${code}, signal=${signal})`));
    };

    const cleanup = () => {
      child.stdout?.off('data', onData);
      child.stderr?.off('data', onData);
      child.off('error', onError);
      child.off('exit', onExit);
    };

    child.stdout?.on('data', onData);
    child.stderr?.on('data', onData);
    child.once('error', onError);
    child.once('exit', onExit);
  });
};

const stopServer = (child) => {
  if (!child) {
    return;
  }
  child.kill();
};

const run = async () => {
  const server = await startServer();
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    page.on('console', (msg) => {
      console.log('[page console]', msg.type(), msg.text());
    });
    page.on('pageerror', (error) => {
      console.error('[page error]', error);
    });

    await page.route('**/example/Toggle/example.html', async (route) => {
      const response = await route.fetch();
      const headers = {
        ...response.headers(),
        'content-type': 'text/html',
      };
      let body = await response.text();
      if (!body.includes(PIXI_SCRIPT)) {
        body = body.replace(/pixi\d+\.js/gi, PIXI_SCRIPT);
      }
      await route.fulfill({
        status: response.status(),
        headers,
        body,
      });
    });

    await page.goto(EXAMPLE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await page.waitForFunction(() => {
      return Boolean(window.__PIXIDOM__?.toggleDemo);
    }, { timeout: 5000 }).catch(() => {});

    const result = await page.evaluate(() => {
      const demo = window.__PIXIDOM__?.toggleDemo;
      const fontAvailable = PIXI?.BitmapFont?.available ?? null;
      const hasAvailableEntry = Boolean(fontAvailable && (fontAvailable['medium'] || fontAvailable.get?.('medium')));
      const cacheEntry = (PIXI?.Cache?.has && PIXI.Cache.has('medium-bitmap'))
        ? PIXI.Cache.get('medium-bitmap')
        : null;
      const cacheHasMedium = Boolean(cacheEntry);
      const cacheEntryInfo = cacheEntry ? cacheEntry.constructor?.name ?? null : null;
      let fontDebug = null;
  const sampleText = demo?.toggles?.[1]?.onText;
      if (sampleText && PIXI?.BitmapFontManager?.getFont) {
        const font = PIXI.BitmapFontManager.getFont(sampleText.text, sampleText._style);
        fontDebug = {
          fontClass: font?.constructor?.name ?? null,
          hasChars: Boolean(font?.chars && Object.keys(font.chars).length),
          baseSize: font?.baseRenderedFontSize ?? null,
          usesDistanceField: font?.distanceField?.type ?? null,
          lineHeight: font?.lineHeight ?? null,
          commonLineHeight: font?.common?.lineHeight ?? null,
          commonBase: font?.common?.base ?? null,
        };
      }
      const inspectText = (node) => {
        if (!node) {
          return null;
        }
        const style = node.style ?? node._style;
        let boundsY = null;
        try {
          boundsY = typeof node.getBounds === 'function' ? node.getBounds()?.y ?? null : null;
        } catch (error) {
          boundsY = null;
        }
        return {
          text: node.text,
          fontFamily: style?.fontFamily ?? null,
          fontSize: style?.fontSize ?? null,
          fill: style?._fill?.color ?? null,
          styleFill: style?.fill ?? null,
          tint: node.tint ?? null,
          y: typeof node.y === 'number' ? node.y : null,
          globalY: boundsY,
          height: typeof node.height === 'number' ? node.height : null,
        };
      };
  const stage = demo?.toggles?.[0]?.parent ?? null;
      const bitmapTexts = [];
      const visit = (container) => {
        if (!container || !container.children) {
          return;
        }
        container.children.forEach((child) => {
          if (child && child.text && child.style) {
            bitmapTexts.push(inspectText(child));
          }
          if (child.children?.length) {
            visit(child);
          }
        });
      };
      if (stage) {
        visit(stage);
      }
  const toggles = (demo?.toggles ?? []).map((toggle) => {
        const onStyle = toggle.onText?.style;
        const offStyle = toggle.offText?.style;
        return {
          onFill: onStyle?._fill?.color ?? null,
          offFill: offStyle?._fill?.color ?? null,
          fontFamily: onStyle?.fontFamily ?? offStyle?.fontFamily ?? null,
          onFontSize: onStyle?.fontSize ?? null,
          offFontSize: offStyle?.fontSize ?? null,
          onStyleFill: onStyle?.fill ?? null,
          offStyleFill: offStyle?.fill ?? null,
          onTint: toggle.onText?.tint ?? null,
          offTint: toggle.offText?.tint ?? null,
        };
      });
      return {
        cacheHasMedium,
  hasAvailableEntry,
        cacheEntryInfo,
        fontDebug,
        toggles,
        stageTexts: bitmapTexts,
      };
    });

    console.log(JSON.stringify(result, null, 2));

    const canvas = page.locator('#canvas');
    const screenshot = await canvas.screenshot();
    const snapshotPath = process.env.DEBUG_TOGGLE_SNAPSHOT_PATH;
    if (snapshotPath) {
      const dir = path.dirname(snapshotPath);
      await fs.promises.mkdir(dir, { recursive: true }).catch(() => {});
      await fs.promises.writeFile(snapshotPath, screenshot).catch((error) => {
        console.warn('Failed to save debug screenshot', error);
      });
      console.log('Saved screenshot to', snapshotPath);
    }
    const png = PNG.sync.read(screenshot);
    const sampleX = 100;
    const sampleY = 80;
    const idx = (png.width * sampleY + sampleX) << 2;
    const pixel = {
      r: png.data[idx],
      g: png.data[idx + 1],
      b: png.data[idx + 2],
      a: png.data[idx + 3],
    };
    console.log('samplePixel', { x: sampleX, y: sampleY, pixel });

    await browser.close();
  } finally {
    stopServer(server);
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

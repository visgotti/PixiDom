import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const setupDeterministicEnv = async (page: Page) => {
  await page.addInitScript(() => {
    let seed = 1;
    Math.random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    let fakeNow = 0;
    const advanceTime = (ms = 0) => {
      fakeNow += ms;
      return fakeNow;
    };

    (window as any).__advanceTime = advanceTime;

    Date.now = () => fakeNow;

    const perf = window.performance;
    perf.now = () => fakeNow;

    const rafCallbacks = new Map<number, FrameRequestCallback>();
    let rafQueue: number[] = [];
    let rafId = 1;

    window.requestAnimationFrame = (callback: FrameRequestCallback) => {
      const id = rafId++;
      rafCallbacks.set(id, callback);
      rafQueue.push(id);
      return id;
    };

    window.cancelAnimationFrame = (handle: number) => {
      rafCallbacks.delete(handle);
    };

    (window as any).__flushAnimationFrames = () => {
      let iterations = 0;
      while (rafQueue.length) {
        const queue = rafQueue;
        rafQueue = [];
        queue.forEach((id) => {
          const cb = rafCallbacks.get(id);
          if (!cb) {
            return;
          }
          rafCallbacks.delete(id);
          cb(fakeNow);
        });
        iterations++;
        if (iterations > 1000) {
          break;
        }
      }
      return iterations;
    };
  });
};

export const gotoExample = async (page: Page, examplePath: string, pixiVersion?: string) => {
  if (process.env.DEBUG_PIXI_DOM === '1') {
    const prefix = pixiVersion ? `[${pixiVersion}]` : '';
    page.on('pageerror', (error) => {
      console.error(`${prefix} pageerror:`, error);
    });
    page.on('console', (message) => {
      console.log(`${prefix} console:${message.type()}: ${message.text()}`);
    });
  }

  if (pixiVersion) {
    const scriptFileName = `${pixiVersion}.js`;
    await page.route(`**${examplePath}`, async (route) => {
      const response = await route.fetch();
      const headers = {
        ...response.headers(),
        'content-type': 'text/html',
      };
      let body = await response.text();
      if (!body.includes(scriptFileName)) {
        body = body.replace(/pixi\d+\.js/gi, scriptFileName);
      }
      await route.fulfill({
        status: response.status(),
        headers,
        body,
      });
    }, { times: 1 });
  }

  await page.goto(examplePath, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
};

export const flushAnimationFrames = async (page: Page) => {
  await page.evaluate(() => {
    const flush = (window as any).__flushAnimationFrames;
    if (flush) {
      flush();
    }
  });
};

export const expectCanvasSnapshot = async (page: Page, exampleName: string, variant?: string) => {
  const label = variant ? `${exampleName}-${variant}` : exampleName;
  const canvas = page.locator('#canvas');
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveScreenshot(`${slugify(label)}.png`, {
    animations: 'disabled',
    maxDiffPixelRatio: 0.01,
  });
};

export const flickScrollList = async (page: Page) => {
  await page.waitForFunction(
    () => {
      const global = (window as any).__PIXIDOM__;
      return !!global?.scrollListDemo;
    },
    undefined,
    { timeout: 5_000 }
  );

  const result = await page.evaluate(() => {
    const demo = (window as any).__PIXIDOM__.scrollListDemo;
    const before = demo.getScrollPosition();
    if (typeof demo.setScrollPercent === 'function') {
      demo.setScrollPercent(0.5);
    }
    if (typeof demo.advance === 'function') {
      demo.advance(1000 / 60, 10);
    }
    const after = demo.getScrollPosition();
    return { before, after };
  });

  return result;
};

export const dragScrollBarHalfway = async (page: Page) => {
  await page.waitForFunction(
    () => {
      const global = (window as any).__PIXIDOM__;
      return !!global?.scrollListWithBarDemo;
    },
    undefined,
    { timeout: 5_000 }
  );

  const before = await page.evaluate(() => {
    const demo = (window as any).__PIXIDOM__.scrollListWithBarDemo;
    return demo.getScrollPosition();
  });

  const canvas = page.locator('#canvas');
  const box = await canvas.boundingBox();
  if (!box) {
    throw new Error('Canvas bounding box unavailable');
  }

  const points = await page.evaluate(() => {
    const demo = (window as any).__PIXIDOM__.scrollListWithBarDemo;
    return demo.getScrollerPoints();
  });

  if (!points) {
    throw new Error('Scroller points unavailable');
  }

  const startX = box.x + points.start.x;
  const startY = box.y + points.start.y;
  const midX = box.x + points.mid.x;
  const midY = box.y + points.mid.y;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.waitForTimeout(50);
  await page.mouse.move(midX, midY, { steps: 20 });
  await page.waitForTimeout(50);
  await page.mouse.up();
  await page.waitForTimeout(50);

  await page.evaluate(() => {
    const demo = (window as any).__PIXIDOM__.scrollListWithBarDemo;
    if (!demo) {
      return;
    }
    const bar = demo.scrollList['scrollBar'];
    const scroller = bar && bar['scroller'];
    if (!bar || !scroller) {
      return;
    }
    const travel = Math.max(0, bar.visibleLength - scroller.height);
    scroller.y = travel / 2;
    if (typeof bar['emitScroll'] === 'function') {
      bar['emitScroll']();
    } else {
      const percent = scroller.y / (travel || 1);
      demo.scrollList.setScrollPercent(percent);
    }
  });

  await page.evaluate(() => {
    const demo = (window as any).__PIXIDOM__.scrollListWithBarDemo;
    if (!demo) {
      return;
    }
    demo.advance(1000 / 60, 10);
  });

  const after = await page.evaluate(() => {
    const demo = (window as any).__PIXIDOM__.scrollListWithBarDemo;
    return demo.getScrollPosition();
  });

  return { before, after };
};

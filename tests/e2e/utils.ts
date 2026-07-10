import fs from 'node:fs/promises';
import path from 'node:path';

import { expect } from '@playwright/test';
import type { Locator, Page, TestInfo } from '@playwright/test';

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const ensureDir = async (dir: string) => {
  await fs.mkdir(dir, { recursive: true });
};

const savePassedScreenshot = async (
  canvas: Locator,
  label: string,
  testInfo?: TestInfo
) => {
  if (!testInfo) {
    return;
  }

  const rootDir = process.cwd();
  const projectSegment = slugify(testInfo.project.name ?? 'default');
  const titleSegments = (testInfo.titlePath ?? [])
    .slice(1)
    .map((segment) => slugify(segment))
    .filter(Boolean);

  const destinationDir = path.join(rootDir, 'test-results', 'passed', projectSegment, ...titleSegments);
  await ensureDir(destinationDir);
  const screenshotPath = path.join(destinationDir, `${slugify(label)}.png`);
  const buffer = await canvas.screenshot({
    animations: 'disabled',
  });
  await fs.writeFile(screenshotPath, buffer);
};

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

    (window as any).__flushAnimationFrames = (stepMs = 1000 / 60, maxIterations = 1000) => {
      let iterations = 0;
      const step = Math.max(0, stepMs) || 0;
      while (rafQueue.length) {
        const queue = rafQueue;
        rafQueue = [];
        const nextTimestamp = step ? advanceTime(step) : fakeNow;
        queue.forEach((id) => {
          const cb = rafCallbacks.get(id);
          if (!cb) {
            return;
          }
          rafCallbacks.delete(id);
          cb(nextTimestamp);
        });
        iterations++;
        if (iterations >= maxIterations) {
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

  const useWebgpu = pixiVersion?.endsWith('-webgpu') ?? false;
  const scriptVersion = useWebgpu ? pixiVersion!.slice(0, -'-webgpu'.length) : pixiVersion;

  if (scriptVersion) {
    const scriptFileName = `${scriptVersion}.js`;
    const routePattern = new RegExp(`${examplePath.replace(/\./g, '\\.')}(\\?.*)?$`);
    await page.route(routePattern, async (route) => {
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

  const targetUrl = useWebgpu ? `${examplePath}?renderer=webgpu` : examplePath;
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
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

export const expectCanvasSnapshot = async (
  page: Page,
  exampleName: string,
  variant?: string,
  testInfo?: TestInfo
) => {
  const baseLabel = variant ? `${exampleName}-${variant}` : exampleName;
  // Always use per-project snapshots - each PIXI version tests against its own baseline
  const projectSuffix = testInfo?.project?.name
    ? slugify(testInfo.project.name)
    : null;
  const label = projectSuffix ? `${baseLabel}-${projectSuffix}` : baseLabel;
  const canvas = page.locator('#canvas');
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveScreenshot(`${slugify(label)}.png`, {
    animations: 'disabled',
    maxDiffPixelRatio: 0.03, // 97% match threshold (3% max difference)
  });
  await savePassedScreenshot(canvas, label, testInfo);
};

export const flickScrollList = async (page: Page) => {
  await page.waitForFunction(
    () => {
      const global = (window as any).__PIXIDOM__;
      return !!global?.scrollListDemo;
    },
    undefined,
    { timeout: 30_000 }
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
    { timeout: 30_000 }
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

export const wheelScrollList = async (page: Page, demoKey = 'scrollListWithBarDemo') => {
  await page.waitForFunction(
    (key) => {
      const global = (window as any).__PIXIDOM__;
      return !!global?.[key];
    },
    demoKey,
    { timeout: 30_000 }
  );

  const details = await page.evaluate((key) => {
    const demo = (window as any).__PIXIDOM__?.[key];
    const list = demo?.scrollList;
    const width = list?.width ?? 0;
    const height = list?.height ?? 0;
    const before = demo?.getScrollPosition?.() ?? 0;
    const localX = (list?.x ?? 0) + (width > 0 ? width / 2 : 150);
    const localY = (list?.y ?? 0) + (height > 0 ? Math.min(Math.max(height * 0.3, 30), height - 30) : 150);
    return {
      before,
      localX,
      localY,
      delta: Math.min(Math.max(height, 200), 600),
    };
  }, demoKey);

  const canvas = page.locator('#canvas');
  const box = await canvas.boundingBox();
  if (!box) {
    throw new Error('Canvas bounding box unavailable');
  }

  const targetX = box.x + details.localX;
  const targetY = box.y + details.localY;
  await page.mouse.move(targetX, targetY);
  await page.mouse.wheel(0, details.delta);
  await page.waitForTimeout(25);

  await page.evaluate((key) => {
    const demo = (window as any).__PIXIDOM__?.[key];
    demo?.advance?.(1000 / 60, 10);
  }, demoKey);

  await flushAnimationFrames(page);

  const after = await page.evaluate((key) => {
    const demo = (window as any).__PIXIDOM__?.[key];
    return demo?.getScrollPosition?.() ?? 0;
  }, demoKey);

  return { before: details.before, after };
};

export const dragScrollListByPointer = async (page: Page) => {
  await page.waitForFunction(
    () => {
      const global = (window as any).__PIXIDOM__;
      return !!global?.scrollListDemo;
    },
    undefined,
    { timeout: 30_000 }
  );

  const details = await page.evaluate(() => {
    const demo = (window as any).__PIXIDOM__?.scrollListDemo;
    const list = demo?.scrollList;
    const width = list?.width ?? 0;
    const height = list?.height ?? 0;
    const before = demo?.getScrollPosition?.() ?? 0;
    const safeWidth = width > 0 ? width : 300;
    const safeHeight = height > 0 ? height : 300;
    const localX = (list?.x ?? 0) + safeWidth / 2;
    const localY = (list?.y ?? 0) + Math.min(Math.max(40, safeHeight / 4), safeHeight - 10);
    const dragDistance = Math.max(60, Math.min(180, safeHeight / 2));
    return {
      before,
      localX,
      localY,
      dragDistance,
    };
  });

  const canvas = page.locator('#canvas');
  const box = await canvas.boundingBox();
  if (!box) {
    throw new Error('Canvas bounding box unavailable');
  }

  const startX = box.x + details.localX;
  const startY = box.y + details.localY;
  const endY = startY - details.dragDistance;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.waitForTimeout(100);
  const preMoveState = await page.evaluate(() => {
    const scrollList = (window as any).__PIXIDOM__?.scrollListDemo?.scrollList;
    if (!scrollList) {
      return null;
    }
    const po = scrollList['po'];
    return {
      active: scrollList.pointerDragActive ?? null,
      lastY: scrollList.pointerDragLastY ?? null,
      currentScroll: scrollList._currentScroll ?? null,
      poPointerIsDown: po?.pointerIsDown ?? null,
      poInDrag: po?.inDrag ?? null,
      poCompletedTriggerTimeout: po?.completedTriggerTimeout ?? null,
      poHoldTimeoutPending: !!po?.holdDragTriggerTimeout,
    };
  });
  await page.mouse.move(startX, endY, { steps: 15 });
  await page.waitForTimeout(25);
  const midMoveState = await page.evaluate(() => {
    const scrollList = (window as any).__PIXIDOM__?.scrollListDemo?.scrollList;
    if (!scrollList) {
      return null;
    }
    const po = scrollList['po'];
    return {
      active: scrollList.pointerDragActive ?? null,
      lastY: scrollList.pointerDragLastY ?? null,
      currentScroll: scrollList._currentScroll ?? null,
      poPointerIsDown: po?.pointerIsDown ?? null,
      poInDrag: po?.inDrag ?? null,
      poCompletedTriggerTimeout: po?.completedTriggerTimeout ?? null,
      poHoldTimeoutPending: !!po?.holdDragTriggerTimeout,
    };
  });
  await page.mouse.up();

  await page.evaluate(() => {
    const demo = (window as any).__PIXIDOM__?.scrollListDemo;
    demo?.advance?.(1000 / 60, 10);
  });

  await page.evaluate(() => {
    const flush = (window as any).__flushAnimationFrames;
    if (typeof flush === 'function') {
      flush();
    }
  });

  const afterPayload = await page.evaluate(() => {
    const demo = (window as any).__PIXIDOM__?.scrollListDemo;
    const scrollList = demo?.scrollList;
    return {
      after: demo?.getScrollPosition?.() ?? 0,
      pointerDragActive: scrollList?.pointerDragActive ?? null,
      pointerDragLastY: scrollList?.pointerDragLastY ?? null,
      maxHeight: scrollList?.maxHeight ?? null,
      visibleHeight: scrollList?.__height ?? null,
      currentScroll: scrollList?._currentScroll ?? null,
      rendererType: demo?.rendererType ?? null,
    };
  });

  return {
    before: details.before,
    after: afterPayload.after,
    diagnostics: {
      ...afterPayload,
      preMoveState,
      midMoveState,
      dragPlan: {
        startX,
        startY,
        endY,
        localX: details.localX,
        localY: details.localY,
        dragDistance: details.dragDistance,
        canvasBounds: box,
      },
    },
  };
};

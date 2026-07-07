import { test } from '@playwright/test';
import { setupDeterministicEnv, gotoExample, flushAnimationFrames, expectCanvasSnapshot } from './utils';

const EXAMPLE_NAME = 'Toggle';
const EXAMPLE_PATH = '/example/Toggle/example.html';

test.beforeEach(async ({ page }) => {
  await setupDeterministicEnv(page);
});

test(`${EXAMPLE_NAME} example captures before and after toggling`, async ({ page }, testInfo) => {
  const pixiVersion = testInfo.project.name;
  await gotoExample(page, EXAMPLE_PATH, pixiVersion);
  await flushAnimationFrames(page);
  await expectCanvasSnapshot(page, EXAMPLE_NAME, 'before', testInfo);

  await page.waitForFunction(
    () => {
      const global = (window as any).__PIXIDOM__;
      return !!global?.toggleDemo;
    },
    undefined,
    { timeout: 5_000 }
  );

  const canvas = page.locator('#canvas');
  const box = await canvas.boundingBox();
  if (!box) {
    throw new Error('Canvas bounding box unavailable');
  }

  const centers = await page.evaluate(() => {
    const demo = (window as any).__PIXIDOM__?.toggleDemo;
    return demo ? demo.getToggleCenters() : [];
  });

  if (!centers.length) {
    throw new Error('Toggle centers unavailable');
  }

  for (const { x, y } of centers) {
    await page.mouse.click(box.x + x, box.y + y);
    await page.waitForTimeout(50);
    await page.evaluate(() => {
      const demo = (window as any).__PIXIDOM__?.toggleDemo;
      if (demo) {
        demo.advance(16.6667, 20);
      }
    });
  }

  // Ensure the final two toggles have time to complete their animations
  await page.waitForTimeout(100);
  await flushAnimationFrames(page);
  await expectCanvasSnapshot(page, EXAMPLE_NAME, 'after', testInfo);
});

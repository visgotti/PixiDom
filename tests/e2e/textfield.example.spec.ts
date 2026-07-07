import { test, type Page } from '@playwright/test';
import { setupDeterministicEnv, gotoExample, flushAnimationFrames, expectCanvasSnapshot } from './utils';

const EXAMPLE_NAME = 'TextField';
const EXAMPLE_PATH = '/example/TextField/example.html';
const SAMPLE_TEXT = 'The quick brown fox jumped over the lazy dog.';
const SELECT_ALL = process.platform === 'darwin' ? 'Meta+A' : 'Control+A';

const freezeTextFieldCursors = async (page: Page) => {
  return page.evaluate(() => {
    const global = (window as any).__PIXIDOM__;
    if (!global) {
      return 'missing-global';
    }
    const demo = global.textFieldDemo;
    if (demo && typeof demo.freezeCursor === 'function') {
      demo.freezeCursor();
      return 'demo';
    }
    if (typeof global.freezeCursor === 'function') {
      global.freezeCursor();
      return 'root';
    }
    return 'none';
  });
};

test.beforeEach(async ({ page }) => {
  await setupDeterministicEnv(page);
});

test(`${EXAMPLE_NAME} example captures before and after typing`, async ({ page }, testInfo) => {
  await gotoExample(page, EXAMPLE_PATH, testInfo.project.name);
  await flushAnimationFrames(page);
  await page.waitForFunction(
    () => {
      const global = (window as any).__PIXIDOM__;
      return !!global?.textFieldDemo;
    },
    undefined,
    { timeout: 5_000 }
  );
  await freezeTextFieldCursors(page);
  await flushAnimationFrames(page);
  await expectCanvasSnapshot(page, EXAMPLE_NAME, 'before', testInfo);

  const canvas = page.locator('#canvas');
  const box = await canvas.boundingBox();
  if (!box) {
    throw new Error('Canvas bounding box unavailable');
  }

  const centers = await page.evaluate(() => {
    const demo = (window as any).__PIXIDOM__?.textFieldDemo;
    return demo ? demo.getFieldCenters() : [];
  });

  if (!centers.length) {
    throw new Error('Text field centers unavailable');
  }

  for (const { x, y } of centers) {
    await page.mouse.click(box.x + x, box.y + y);
    await page.waitForTimeout(50);
    await page.keyboard.press(SELECT_ALL);
    await page.keyboard.type(SAMPLE_TEXT);
    await page.evaluate(() => {
      const demo = (window as any).__PIXIDOM__?.textFieldDemo;
      if (demo) {
        demo.advance(16.6667, 15);
      }
    });
    await flushAnimationFrames(page);
  }
  await freezeTextFieldCursors(page);
  await flushAnimationFrames(page);
  await expectCanvasSnapshot(page, EXAMPLE_NAME, 'after', testInfo);
});

test(`${EXAMPLE_NAME} example highlights selection and clears text`, async ({ page }, testInfo) => {
  await gotoExample(page, EXAMPLE_PATH, testInfo.project.name);
  await flushAnimationFrames(page);
  await page.waitForFunction(
    () => {
      const global = (window as any).__PIXIDOM__;
      return !!global?.textFieldDemo;
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
    const demo = (window as any).__PIXIDOM__?.textFieldDemo;
    return demo ? demo.getFieldCenters() : [];
  });

  if (!centers.length) {
    throw new Error('Text field centers unavailable');
  }

  const last = centers[centers.length - 1];

  await page.mouse.click(box.x + last.x, box.y + last.y);
  await page.waitForTimeout(50);
  await page.keyboard.press(SELECT_ALL);
  await page.evaluate(() => {
    const demo = (window as any).__PIXIDOM__?.textFieldDemo;
    if (demo) {
      demo.advance(16.6667, 10);
    }
  });
  await flushAnimationFrames(page);
  await freezeTextFieldCursors(page);
  await flushAnimationFrames(page);
  await expectCanvasSnapshot(page, EXAMPLE_NAME, 'select-all', testInfo);

  await page.keyboard.press('Backspace');
  await page.evaluate(() => {
    const demo = (window as any).__PIXIDOM__?.textFieldDemo;
    if (demo) {
      demo.advance(16.6667, 10);
    }
  });
  await flushAnimationFrames(page);
  await freezeTextFieldCursors(page);
  await flushAnimationFrames(page);
  await expectCanvasSnapshot(page, EXAMPLE_NAME, 'after-backspace', testInfo);
});

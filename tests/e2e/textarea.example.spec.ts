import { expect, test, type Page } from '@playwright/test';
import { setupDeterministicEnv, gotoExample, flushAnimationFrames, expectCanvasSnapshot } from './utils';

const EXAMPLE_NAME = 'TextArea';
const EXAMPLE_PATH = '/example/TextArea/example.html';
const SELECT_ALL = process.platform === 'darwin' ? 'Meta+A' : 'Control+A';

const waitForDemo = async (page: Page) => {
  await page.waitForFunction(
    () => {
      const global = (window as any).__PIXIDOM__;
      return !!global?.textAreaDemo;
    },
    undefined,
    { timeout: 30_000 }
  );
};

const freezeCursors = async (page: Page) => {
  await page.evaluate(() => {
    const demo = (window as any).__PIXIDOM__?.textAreaDemo;
    demo?.freezeCursor?.();
  });
};

const advance = async (page: Page, iterations = 10) => {
  await page.evaluate((n) => {
    const demo = (window as any).__PIXIDOM__?.textAreaDemo;
    demo?.advance?.(16.6667, n);
  }, iterations);
};

const getSnapshots = (page: Page) =>
  page.evaluate(() => {
    const demo = (window as any).__PIXIDOM__?.textAreaDemo;
    return demo ? demo.getSnapshots() : [];
  });

const getCenters = async (page: Page) => {
  const centers = await page.evaluate(() => {
    const demo = (window as any).__PIXIDOM__?.textAreaDemo;
    return demo ? demo.getAreaCenters() : [];
  });
  if (!centers.length) {
    throw new Error('Text area centers unavailable');
  }
  return centers as Array<{ x: number; y: number }>;
};

test.beforeEach(async ({ page }) => {
  await setupDeterministicEnv(page);
});

test(`${EXAMPLE_NAME} example wraps, types multi-line text, and matches snapshots`, async ({ page }, testInfo) => {
  await gotoExample(page, EXAMPLE_PATH, testInfo.project.name);
  await flushAnimationFrames(page);
  await waitForDemo(page);
  await freezeCursors(page);
  await flushAnimationFrames(page);
  await expectCanvasSnapshot(page, EXAMPLE_NAME, 'before', testInfo);

  const canvas = page.locator('#canvas');
  const box = await canvas.boundingBox();
  if (!box) {
    throw new Error('Canvas bounding box unavailable');
  }

  const [first] = await getCenters(page);
  await page.mouse.click(box.x + first.x, box.y + first.y);
  await page.waitForTimeout(50);
  await page.keyboard.press(SELECT_ALL);
  await page.keyboard.type('First line of the text area.');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Second line after pressing enter.');
  await advance(page, 15);
  await flushAnimationFrames(page);

  const [snapshot] = await getSnapshots(page);
  expect(snapshot.text).toBe('First line of the text area.\nSecond line after pressing enter.');
  expect(snapshot.lineCount).toBeGreaterThanOrEqual(2);

  await freezeCursors(page);
  await flushAnimationFrames(page);
  await expectCanvasSnapshot(page, EXAMPLE_NAME, 'after-typing', testInfo);
});

test(`${EXAMPLE_NAME} example highlights multi-line selection and scrolls with the caret`, async ({ page }, testInfo) => {
  await gotoExample(page, EXAMPLE_PATH, testInfo.project.name);
  await flushAnimationFrames(page);
  await waitForDemo(page);

  const canvas = page.locator('#canvas');
  const box = await canvas.boundingBox();
  if (!box) {
    throw new Error('Canvas bounding box unavailable');
  }

  const [first, second] = await getCenters(page);

  await page.mouse.click(box.x + first.x, box.y + first.y);
  await page.waitForTimeout(50);
  await page.keyboard.press(SELECT_ALL);
  await advance(page, 10);
  await flushAnimationFrames(page);

  const [selected] = await getSnapshots(page);
  expect(selected.range).not.toBeNull();
  expect(selected.range.start).toBe(0);
  expect(selected.range.end).toBe(selected.text.length);

  await freezeCursors(page);
  await flushAnimationFrames(page);
  await expectCanvasSnapshot(page, EXAMPLE_NAME, 'select-all', testInfo);

  // Typing into the small overflowing area must scroll to keep the caret visible.
  await page.mouse.click(box.x + second.x, box.y + second.y);
  await page.waitForTimeout(50);
  await page.keyboard.press(SELECT_ALL);
  await page.keyboard.type('one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen');
  await advance(page, 15);
  await flushAnimationFrames(page);

  const snapshots = await getSnapshots(page);
  expect(snapshots[1].scrollY).toBeGreaterThan(0);

  await freezeCursors(page);
  await flushAnimationFrames(page);
  await expectCanvasSnapshot(page, EXAMPLE_NAME, 'scrolled', testInfo);
});

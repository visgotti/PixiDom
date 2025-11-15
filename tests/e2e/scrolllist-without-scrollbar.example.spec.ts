import { test, expect } from '@playwright/test';
import {
  setupDeterministicEnv,
  gotoExample,
  flushAnimationFrames,
  expectCanvasSnapshot,
  flickScrollList,
} from './utils';

const EXAMPLE_NAME = 'ScrollList Without ScrollBar';
const EXAMPLE_PATH = '/example/ScrollList/WithoutScrollBar/example.html';

test.beforeEach(async ({ page }) => {
  await setupDeterministicEnv(page);
});

test(`${EXAMPLE_NAME} example scrolls and matches snapshot`, async ({ page }) => {
  const pixiVersion = test.info().project.name;
  await gotoExample(page, EXAMPLE_PATH, pixiVersion);
  await flushAnimationFrames(page);
  await expectCanvasSnapshot(page, EXAMPLE_NAME, 'before-scroll');

  const { before, after } = await flickScrollList(page);
  await flushAnimationFrames(page);
  await expectCanvasSnapshot(page, EXAMPLE_NAME, 'after-scroll');
  expect(after).toBeGreaterThan(before);
});

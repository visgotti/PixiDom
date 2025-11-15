import { test, expect } from '@playwright/test';
import {
  setupDeterministicEnv,
  gotoExample,
  flushAnimationFrames,
  expectCanvasSnapshot,
  dragScrollBarHalfway,
} from './utils';

const EXAMPLE_NAME = 'ScrollList With ScrollBar';
const EXAMPLE_PATH = '/example/ScrollList/WithScrollBar/example.html';

test.beforeEach(async ({ page }) => {
  await setupDeterministicEnv(page);
});

test(`${EXAMPLE_NAME} example scrolls via scrollbar and matches snapshots`, async ({ page }) => {
  const pixiVersion = test.info().project.name;
  await gotoExample(page, EXAMPLE_PATH, pixiVersion);
  await flushAnimationFrames(page);
  await expectCanvasSnapshot(page, EXAMPLE_NAME, 'before-scroll');

  const { before, after } = await dragScrollBarHalfway(page);
  await flushAnimationFrames(page);
  await expectCanvasSnapshot(page, EXAMPLE_NAME, 'after-scroll');
  expect(after).toBeGreaterThan(before);
});

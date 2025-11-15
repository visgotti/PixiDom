import { test } from '@playwright/test';
import { setupDeterministicEnv, gotoExample, flushAnimationFrames, expectCanvasSnapshot } from './utils';

const EXAMPLE_NAME = 'Slider';
const EXAMPLE_PATH = '/example/Slider/example.html';

test.beforeEach(async ({ page }) => {
  await setupDeterministicEnv(page);
});

test(`${EXAMPLE_NAME} example renders and matches snapshot`, async ({ page }) => {
  const pixiVersion = test.info().project.name;
  await gotoExample(page, EXAMPLE_PATH, pixiVersion);
  await flushAnimationFrames(page);
  await expectCanvasSnapshot(page, EXAMPLE_NAME);
});

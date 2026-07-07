import { test, expect } from '@playwright/test';
import {
  setupDeterministicEnv,
  gotoExample,
  flushAnimationFrames,
  expectCanvasSnapshot,
  flickScrollList,
  dragScrollListByPointer,
} from './utils';

const EXAMPLE_NAME = 'ScrollList Without ScrollBar';
const EXAMPLE_PATH = '/example/ScrollList/WithoutScrollBar/example.html';

test.beforeEach(async ({ page }) => {
  await setupDeterministicEnv(page);
});

test(`${EXAMPLE_NAME} example scrolls and matches snapshot`, async ({ page }, testInfo) => {
  const pixiVersion = testInfo.project.name;
  await gotoExample(page, EXAMPLE_PATH, pixiVersion);
  await flushAnimationFrames(page);
  await expectCanvasSnapshot(page, EXAMPLE_NAME, 'before-scroll', testInfo);

  const { before, after } = await flickScrollList(page);
  await flushAnimationFrames(page);
  await expectCanvasSnapshot(page, EXAMPLE_NAME, 'after-scroll', testInfo);
  expect(after).toBeGreaterThan(before);
});

test(`${EXAMPLE_NAME} example scrolls when dragged with a pointer`, async ({ page }) => {
  const pixiVersion = test.info().project.name;
  await gotoExample(page, EXAMPLE_PATH, pixiVersion);
  await page.evaluate(() => {
    const demo = (window as any).__PIXIDOM__?.scrollListDemo;
    const scrollList = demo?.scrollList;
    if (!scrollList || !scrollList.po) {
      return;
    }
    const po = scrollList.po;
  const counts = {
    pointerdown: 0,
    pointermove: 0,
    pointerup: 0,
    pointerout: 0,
    pointerupoutside: 0,
    dragstart: 0,
    dragmove: 0,
    dragend: 0,
    listPointerdown: 0,
    listPointermove: 0,
    stagePointerdown: 0,
    mousedown: 0,
    mousemove: 0,
    mouseup: 0,
    domPointerdown: 0,
    domMousedown: 0,
    domMouseup: 0,
  };
    scrollList.__debugCounts = counts;
    po.on('pointerdown', () => counts.pointerdown++);
  po.on('pointermove', () => counts.pointermove++);
    po.on('pointerup', () => counts.pointerup++);
    po.on('pointerout', () => counts.pointerout++);
    po.on('pointerupoutside', () => counts.pointerupoutside++);
    po.on('dragstart', () => counts.dragstart++);
    po.on('dragmove', () => counts.dragmove++);
    po.on('dragend', () => counts.dragend++);
    scrollList.on('pointerdown', () => counts.listPointerdown++);
    scrollList.on('pointermove', () => counts.listPointermove++);
  scrollList.on('mousedown', () => counts.mousedown++);
  scrollList.on('mousemove', () => counts.mousemove++);
  scrollList.on('mouseup', () => counts.mouseup++);
    const stage = (window as any).stage;
    stage && stage.on && stage.on('pointerdown', () => counts.stagePointerdown++);
    const canvas = document.getElementById('canvas');
    if (canvas) {
      canvas.addEventListener('pointerdown', () => counts.domPointerdown = (counts.domPointerdown || 0) + 1);
      canvas.addEventListener('mousedown', () => counts.domMousedown = (counts.domMousedown || 0) + 1);
      canvas.addEventListener('mouseup', () => counts.domMouseup = (counts.domMouseup || 0) + 1);
    }
  });
  const { before, after, diagnostics } = await dragScrollListByPointer(page);
  const debugCounts = await page.evaluate(() => {
    const demo = (window as any).__PIXIDOM__?.scrollListDemo;
    return demo?.scrollList?.__debugCounts ?? null;
  });
  if (after <= before) {
    console.log(`[${pixiVersion}] drag diagnostics`, diagnostics, debugCounts);
  }
  expect(after).toBeGreaterThan(before);
});

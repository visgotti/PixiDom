const { chromium } = require('playwright');
const { spawn } = require('child_process');

const startServer = () => {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['scripts/serve-examples.js'], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const readyRegex = /Serving PixiDom examples at/;
    const onData = (data) => {
      if (readyRegex.test(data.toString())) {
        child.stdout.off('data', onData);
        resolve(child);
      }
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', (data) => {
      console.error(data.toString());
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code !== null && code !== 0) {
        reject(new Error(`Server exited with code ${code}`));
      }
    });
  });
};

(async () => {
  const server = await startServer();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4173/example/Element/example.html');
  await page.waitForTimeout(2000);
  const info = await page.evaluate(() => {
    const stage = window.stage;
    const renderer = window.renderer;
    const element = stage?.children?.[0] || null;
    const rect = element?.children?.[0] || null;
    return {
      stageChildren: stage?.children?.length,
      stageWidth: stage?.width,
      stageHeight: stage?.height,
      elementType: element?.constructor?.name,
      elementX: element?.x,
      elementY: element?.y,
      elementWidth: element?.width,
      elementHeight: element?.height,
      elementScaleX: element?.scale?.x,
      elementScaleY: element?.scale?.y,
      rectType: rect?.constructor?.name,
      rectWidth: rect?.width,
      rectHeight: rect?.height,
      rectWorldTransform: rect?.worldTransform?.toArray?.() || null,
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
  server.kill('SIGINT');
})();

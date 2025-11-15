const { chromium } = require('playwright');
const { spawn } = require('child_process');

const SELECT_ALL = process.platform === 'darwin' ? 'Meta+A' : 'Control+A';

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
  const pixiVersion = process.env.PIXI_VERSION;
  if (pixiVersion) {
    await page.route('**/example/TextField/example.html', async (route) => {
      const response = await route.fetch();
      const body = await response.text();
      const replaced = body.replace(/pixi\d+\.js/gi, `${pixiVersion}.js`);
      await route.fulfill({
        status: response.status(),
        headers: response.headers(),
        body: replaced,
      });
    }, { times: 1 });
  }
  await page.goto('http://127.0.0.1:4173/example/TextField/example.html');
  await page.waitForTimeout(2000);

  const canvas = page.locator('#canvas');
  const box = await canvas.boundingBox();
  if (!box) {
    throw new Error('Canvas bounding box unavailable');
  }

  const centers = await page.evaluate(() => {
    return (window.__PIXIDOM__?.textFieldDemo?.getFieldCenters?.() ?? []);
  });
  if (!centers.length) {
    throw new Error('Field centers unavailable');
  }
  console.log('centers', centers);
  const last = centers[centers.length - 1];
  await page.mouse.click(box.x + last.x, box.y + last.y);
  await page.waitForTimeout(50);
  await page.keyboard.press(SELECT_ALL);
  await page.waitForTimeout(50);
  await page.evaluate(() => {
    window.__PIXIDOM__?.textFieldDemo?.advance?.(16.6667, 10);
    window.__PIXIDOM__?.textFieldDemo?.freezeCursor?.();
  });
  const snapshot = await page.evaluate(() => {
    return window.__PIXIDOM__?.textFieldDemo?.getFieldSnapshots?.() ?? [];
  });
  console.log(JSON.stringify(snapshot, null, 2));
  await browser.close();
  server.kill('SIGINT');
})();

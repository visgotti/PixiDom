const { spawn } = require('child_process');
const { chromium } = require('playwright');

(async () => {
  const server = spawn('node', ['scripts/serve-examples.js'], { stdio: 'inherit' });
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const browser = await chromium.launch();
    const page = await browser.newPage();
    page.on('pageerror', (error) => console.error('pageerror:', error));
    page.on('console', (message) => console.log('console:', message.text()));

    const examplePath = 'http://127.0.0.1:4173/example/ScrollList/WithScrollBar/example.html';

    await page.route('**/example/ScrollList/WithScrollBar/example.html', async (route) => {
      const response = await route.fetch();
      let body = await response.text();
      body = body.replace(/pixi\d+\.js/gi, 'pixi4.js');
      await route.fulfill({ status: response.status(), headers: response.headers(), body });
    });

    await page.goto(examplePath, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const info = await page.evaluate(() => ({
      hasPixiDom: typeof window.PIXI_DOM !== 'undefined',
      pixiVersion: (window.PIXI && window.PIXI.VERSION) || null,
      globalKeys: Object.keys(window.__PIXIDOM__ || {}),
    }));
    console.log('info:', info);

    await browser.close();
  } finally {
    server.kill();
  }
})();

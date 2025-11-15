const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const examplePath = 'http://127.0.0.1:4173/example/Toggle/example.html';
  const scriptFileName = 'pixi5.js';

  page.on('console', (msg) => {
    console.log(`[console:${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', (err) => {
    console.log(`[pageerror] ${err.message}`);
    if (err.stack) {
      console.log(err.stack);
    }
  });

  await page.route('**/example/Toggle/example.html', async (route) => {
    const response = await route.fetch();
    let body = await response.text();
    if (!body.includes(scriptFileName)) {
      body = body.replace(/pixi\d+\.js/gi, scriptFileName);
    }
    await route.fulfill({
      status: response.status(),
      headers: {
        ...response.headers(),
        'content-type': 'text/html',
      },
      body,
    });
  });

  await page.goto(examplePath, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  await browser.close();
  process.exit(0);
})();

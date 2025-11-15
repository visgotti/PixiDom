const { chromium } = require('@playwright/test');

(async () => {
	const browser = await chromium.launch();
	const page = await browser.newPage();
	await page.route('**/example/Toggle/example.html', async (route) => {
		const response = await route.fetch();
		const headers = { ...response.headers(), 'content-type': 'text/html' };
		let body = await response.text();
		body = body.replace(/pixi\d+\.js/gi, 'pixi8.js');
		await route.fulfill({ status: response.status(), headers, body });
	}, { times: 1 });
	await page.goto('http://127.0.0.1:4173/example/Toggle/example.html', { waitUntil: 'domcontentloaded' });
	await page.waitForLoadState('networkidle');
		await page.waitForFunction(() => {
		const global = window.__PIXIDOM__;
		return !!global && !!global.toggleDemo;
		}, undefined, { timeout: 15000 });
		const data = await page.evaluate(() => {
		const demo = window.__PIXIDOM__?.toggleDemo;
		if (!demo) return null;
			const fonts = (PIXI && PIXI.BitmapFont && PIXI.BitmapFont.available) || {};
			return {
				fonts: Object.keys(fonts),
				toggles: demo.toggles.map((toggle, index) => ({
			index,
			usePixi8ShapeApi: toggle.usePixi8ShapeApi,
			circleX: toggle.circleGraphic?.x,
			circleBounds: toggle.circleGraphic && typeof toggle.circleGraphic.getBounds === 'function'
				? toggle.circleGraphic.getBounds()
				: null,
			circleSummary: (() => {
				const circle = toggle.circleGraphic;
				if (!circle) return null;
				const context = circle.context ?? circle.geometry ?? circle._geometry;
				const commandData = context && context.commands ? context.commands.length : undefined;
				return {
					hasGeometry: !!circle.geometry,
					hasContext: !!circle.context,
					commandLength: commandData,
					objectKeys: Object.keys(circle).filter((key) => key && key[0] !== '_').slice(0, 10),
				};
			})(),
				})),
			};
	});
	console.log(JSON.stringify(data, null, 2));
	await browser.close();
})();


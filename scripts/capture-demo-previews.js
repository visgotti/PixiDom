#!/usr/bin/env node

/**
 * Captures preview screenshots of each live demo's canvas and writes them
 * to `gh-pages/previews/<component>.png`. Run this AFTER `build-gh-pages.js`
 * has staged the site under `gh-pages/`.
 *
 * The previews are then referenced from the landing page's component grid so
 * each tile shows the same canvas rendering the user will see when they click in.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const ROOT = path.resolve(__dirname, '..');
const SITE = path.join(ROOT, 'gh-pages');
const PREVIEWS_DIR = path.join(SITE, 'previews');
const PORT = Number(process.env.PREVIEW_PORT || 4191);

const COMPONENTS = ['button', 'toggle', 'slider', 'textfield', 'scrolllist', 'element'];

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.fnt': 'application/xml; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.map': 'application/json; charset=utf-8',
};

function startServer() {
    const server = http.createServer((req, res) => {
        const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
        let target = path.join(SITE, urlPath);
        if (!target.startsWith(SITE)) {
            res.statusCode = 403; res.end('Forbidden'); return;
        }
        fs.stat(target, (err, stats) => {
            if (err) { res.statusCode = 404; res.end('Not found'); return; }
            if (stats.isDirectory()) target = path.join(target, 'index.html');
            fs.readFile(target, (readErr, data) => {
                if (readErr) { res.statusCode = 404; res.end('Not found'); return; }
                res.setHeader('Content-Type', MIME[path.extname(target).toLowerCase()] || 'application/octet-stream');
                res.end(data);
            });
        });
    });
    return new Promise((resolve) => {
        server.listen(PORT, () => resolve(server));
    });
}

async function captureComponent(page, name) {
    const url = `http://127.0.0.1:${PORT}/demos/${name}/index.html`;
    await page.goto(url, { waitUntil: 'load' });
    // Demos load PIXI + Monaco from CDN, then runUserCode() mounts components onto the stage.
    // Wait until at least one display object has been added so we capture a fully-drawn canvas.
    await page.waitForFunction(() => {
        const stage = window.stage;
        return !!stage && Array.isArray(stage.children) && stage.children.length > 0;
    }, { timeout: 30_000 });
    // Some components (ScrollList, BitmapText-backed) draw content asynchronously after mount.
    // Give the ticker plenty of time to flush before we screenshot.
    await page.waitForTimeout(1500);

    const canvas = page.locator('#canvas');
    const buffer = await canvas.screenshot();
    const out = path.join(PREVIEWS_DIR, `${name}.png`);
    fs.mkdirSync(PREVIEWS_DIR, { recursive: true });
    fs.writeFileSync(out, buffer);
    console.log(`  captured ${name} -> previews/${name}.png`);
}

(async () => {
    if (!fs.existsSync(SITE)) {
        console.error(`gh-pages/ does not exist. Run \`node scripts/build-gh-pages.js\` first.`);
        process.exit(1);
    }
    console.log(`Capturing live-demo previews from ${SITE} on port ${PORT}`);
    const server = await startServer();
    const browser = await chromium.launch();
    const context = await browser.newContext({
        viewport: { width: 800, height: 600 },
        deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    page.on('pageerror', (err) => console.warn(`  [pageerror] ${err.message}`));

    let exitCode = 0;
    try {
        for (const name of COMPONENTS) {
            try {
                await captureComponent(page, name);
            } catch (err) {
                console.error(`  ! failed to capture ${name}: ${err.message}`);
                exitCode = 1;
            }
        }
    } finally {
        await browser.close();
        server.close();
    }
    process.exit(exitCode);
})();

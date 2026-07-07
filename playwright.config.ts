import { defineConfig } from '@playwright/test';

const PORT = Number(process.env.PIXIDOM_EXAMPLE_PORT || process.env.PORT || 4173);

const PIXI_PROJECTS = ['pixi4', 'pixi5', 'pixi6', 'pixi7', 'pixi8'] as const;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  timeout: 60_000,
  snapshotPathTemplate: '{testDir}/{testFileName}-snapshots/{arg}-baseline-{platform}{ext}',
  expect: {
    timeout: 5_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.03,
    },
  },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    viewport: { width: 800, height: 600 },
    trace: 'on-first-retry',
    launchOptions: {
      args: [
        '--use-gl=swiftshader',
        '--use-angle=swiftshader',
        '--ignore-gpu-blocklist',
        '--enable-webgl',
        '--enable-unsafe-webgl',
        '--disable-web-security',
      ],
    },
  },
  projects: [
    ...PIXI_PROJECTS.map((pixiVersion) => ({
      name: pixiVersion,
      use: { browserName: 'chromium' as const },
    })),
    {
      // Headless Chromium ships as `chromium-headless-shell`, which has no WebGPU
      // adapter at all — Pixi's WebGPU init fails silently and "passes" against a
      // blank canvas. The full `chromium` channel run headed exposes a real
      // (software) WebGPU adapter, so this project opts out of headless. It also
      // drops the top-level `--use-gl=swiftshader --use-angle=swiftshader` args:
      // those pin the GPU process to a WebGL-only backend and block Dawn from
      // finding a WebGPU adapter at all.
      name: 'pixi8-webgpu',
      use: {
        browserName: 'chromium' as const,
        channel: 'chromium',
        headless: false,
        launchOptions: { args: [] },
      },
    },
  ],
  retries: process.env.CI ? 2 : 0,
  webServer: {
    command: 'npm run serve:examples',
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      PORT: String(PORT),
    },
  },
});

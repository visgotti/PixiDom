import { defineConfig } from 'vite';
import path from 'path';
import dts from 'vite-plugin-dts';

const outDir = path.resolve(__dirname, 'dist');
const tsconfigPath = path.resolve(__dirname, 'tsconfig.json');

export default defineConfig({
  plugins: [
    dts({
      tsconfigPath,
      entryRoot: path.resolve(__dirname, 'src'),
      outDir,
      insertTypesEntry: true,
    }),
  ],
  resolve: {
    extensions: ['.ts'],
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'PIXI_DOM',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => {
        // Use `.mjs` so Node treats the ESM file as ESM regardless of the
        // package.json `type` field (we stay CJS-default to preserve scripts).
        if (format === 'es') {
          return 'index.es.mjs';
        }
        if (format === 'cjs') {
          return 'index.cjs';
        }
        return 'pixidom.js';
      },
    },
    // ES2022 is the floor of "modern enough for Node 16.6+ and all evergreen browsers".
    // Pinning explicitly so consumers don't get surprises if Vite's default shifts.
    target: 'es2022',
    sourcemap: true,
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      external: ['pixi.js'],
      output: {
        exports: 'named',
        globals: {
          'pixi.js': 'PIXI',
        },
      },
    },
  },
});

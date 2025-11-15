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
        if (format === 'es') {
          return 'index.es.js';
        }
        if (format === 'cjs') {
          return 'index.cjs';
        }
        return 'pixidom.js';
      },
    },
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

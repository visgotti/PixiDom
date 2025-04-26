import { defineConfig } from 'vite';
import path from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'PIXI_DOM',
      fileName: (format) => (format === 'umd' ? 'pixidom.js' : `pixidom.${format}.js`), // Custom file names
      formats: ['umd', 'es'], // Generate both UMD and ES module builds
    },
    outDir: path.resolve(__dirname, 'dist'),
    rollupOptions: {
      external: ['pixi.js'], // Exclude pixi.js from the bundle
      output: {
        globals: {
          pixi: 'PIXI', // Assumes PIXI is available globally
        },
      },
    },
    sourcemap: true,
  },
  plugins: [
    dts({
      tsconfigPath: path.resolve(__dirname, 'tsconfig.json'),
      insertTypesEntry: true,
      outDir: path.resolve(__dirname, 'dist'),
    }),
  ],
  resolve: {
    extensions: ['.ts'],
  },
});

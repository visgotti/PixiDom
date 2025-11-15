import { readFileSync } from 'fs';
import { PNG } from 'pngjs';

const path = process.argv[2];
const x = Number(process.argv[3]);
const y = Number(process.argv[4]);

if (!path || Number.isNaN(x) || Number.isNaN(y)) {
  console.error('Usage: node scripts/sample-pixel.mjs <image> <x> <y>');
  process.exit(1);
}

const image = PNG.sync.read(readFileSync(path));
if (x < 0 || y < 0 || x >= image.width || y >= image.height) {
  throw new Error('Point outside image bounds');
}
const idx = (image.width * y + x) << 2;
const data = image.data;
console.log({
  x,
  y,
  r: data[idx],
  g: data[idx + 1],
  b: data[idx + 2],
  a: data[idx + 3],
});

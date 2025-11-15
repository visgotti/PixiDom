import { readFileSync } from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const baselinePath = process.argv[2];
const actualPath = process.argv[3];

if (!baselinePath || !actualPath) {
  console.error('Usage: node scripts/inspect-diff.mjs <baseline> <actual>');
  process.exit(1);
}

const baseline = PNG.sync.read(readFileSync(baselinePath));
const actual = PNG.sync.read(readFileSync(actualPath));

if (baseline.width !== actual.width || baseline.height !== actual.height) {
  throw new Error('Image dimensions do not match');
}

const { width, height } = baseline;
const diff = new PNG({ width, height });
const diffPixels = pixelmatch(actual.data, baseline.data, diff.data, width, height, {
  threshold: 0.1,
  alpha: 0.5,
});

let minX = width;
let minY = height;
let maxX = -1;
let maxY = -1;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (width * y + x) << 2;
    const alpha = diff.data[idx + 3];
    if (alpha > 0) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
}

if (maxX === -1) {
  console.log('No differences detected.');
} else {
  console.log(
    JSON.stringify(
      {
        width,
        height,
        diffPixels,
        bounds: { minX, minY, maxX, maxY, w: maxX - minX + 1, h: maxY - minY + 1 },
      },
      null,
      2,
    ),
  );
}

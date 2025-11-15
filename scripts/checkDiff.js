const { PNG } = require('pngjs');
const fs = require('fs');

const [actualPath, baselinePath, startYArg, maxPrintArg] = process.argv.slice(2);
if (!actualPath || !baselinePath) {
  console.error('Usage: node scripts/checkDiff.js <actual> <baseline> [startY=0] [maxPrint=20]');
  process.exit(1);
}
const startY = Number.isFinite(Number(startYArg)) ? Number(startYArg) : 0;
const maxPrint = Number.isFinite(Number(maxPrintArg)) ? Number(maxPrintArg) : 20;

const act = PNG.sync.read(fs.readFileSync(actualPath));
const base = PNG.sync.read(fs.readFileSync(baselinePath));
const { width, height } = act;
let printed = 0;
let minX = width;
let minY = height;
let maxX = 0;
let maxY = 0;
let diffCount = 0;

for (let y = startY; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (width * y + x) << 2;
    const r1 = act.data[idx];
    const g1 = act.data[idx + 1];
    const b1 = act.data[idx + 2];
    const r2 = base.data[idx];
    const g2 = base.data[idx + 1];
    const b2 = base.data[idx + 2];

    if (r1 !== r2 || g1 !== g2 || b1 !== b2) {
      diffCount++;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      if (printed < maxPrint) {
        console.log('diff pixel at', x, y, 'actual', [r1, g1, b1], 'baseline', [r2, g2, b2]);
        printed++;
      }
    }
  }
}

console.log('diffCount', diffCount, 'bounds', { minX, minY, maxX, maxY });
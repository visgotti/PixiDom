const { PNG } = require('pngjs');
const fs = require('fs');

function loadPng(path) {
  return PNG.sync.read(fs.readFileSync(path));
}

function formatColor(r, g, b, a) {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function inspectDiff(actualPath, baselinePath) {
  const actual = loadPng(actualPath);
  const baseline = loadPng(baselinePath);

  if (actual.width !== baseline.width || actual.height !== baseline.height) {
    console.error('Dimension mismatch');
    process.exit(1);
  }

  const diffs = [];
  for (let y = 0; y < actual.height; y++) {
    for (let x = 0; x < actual.width; x++) {
      const idx = (actual.width * y + x) << 2;
      const ar = actual.data[idx];
      const ag = actual.data[idx + 1];
      const ab = actual.data[idx + 2];
      const aa = actual.data[idx + 3];
      const br = baseline.data[idx];
      const bg = baseline.data[idx + 1];
      const bb = baseline.data[idx + 2];
      const ba = baseline.data[idx + 3];
      if (ar !== br || ag !== bg || ab !== bb || aa !== ba) {
        diffs.push({
          x,
          y,
          actual: formatColor(ar, ag, ab, aa),
          baseline: formatColor(br, bg, bb, ba),
        });
      }
    }
  }

  console.log(`Diff count: ${diffs.length}`);
  diffs.slice(0, 50).forEach((diff) => {
    console.log(`(${diff.x}, ${diff.y}) actual=${diff.actual} baseline=${diff.baseline}`);
  });
  if (diffs.length > 50) {
    console.log('...');
  }
}

const [actualPath, baselinePath] = process.argv.slice(2);
if (!actualPath || !baselinePath) {
  console.error('Usage: node scripts/inspect-diff.js <actual> <baseline>');
  process.exit(1);
}

inspectDiff(actualPath, baselinePath);

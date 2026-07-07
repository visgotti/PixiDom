#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PIXI_VERSIONS = ['pixi4', 'pixi5', 'pixi6', 'pixi7', 'pixi8'];
const SNAPSHOTS_ROOT = path.join(__dirname, '..', 'tests', 'e2e');
const TEST_RESULTS_DIR = path.join(__dirname, '..', 'test-results');
const OUTPUT_PATH = path.join(TEST_RESULTS_DIR, 'snapshot-report.html');
const MARKDOWN_OUTPUT_PATH = path.join(TEST_RESULTS_DIR, 'snapshot-report.md');

if (!fs.existsSync(TEST_RESULTS_DIR)) {
  fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
}

/** Scan snapshot directories and group images by component and state. */
function collectSnapshots() {
  const snapshotDirs = fs.readdirSync(SNAPSHOTS_ROOT).filter((d) =>
    d.endsWith('-snapshots') && fs.statSync(path.join(SNAPSHOTS_ROOT, d)).isDirectory()
  );

  // Map: componentLabel → { state → { pixiVersion → relativePath } }
  const components = new Map();

  for (const dir of snapshotDirs) {
    const specName = dir.replace('.spec.ts-snapshots', '').replace('.example', '');
    const componentLabel = specName
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const fullDir = path.join(SNAPSHOTS_ROOT, dir);
    const files = fs.readdirSync(fullDir).filter((f) => f.endsWith('.png'));

    for (const file of files) {
      // Match per-version baselines: {name}-pixi{N}-baseline-darwin.png
      const match = file.match(/^(.+)-(pixi\d)-baseline-darwin\.png$/);
      if (!match) continue;

      const [, state, pixiVersion] = match;
      if (!PIXI_VERSIONS.includes(pixiVersion)) continue;

      if (!components.has(componentLabel)) {
        components.set(componentLabel, new Map());
      }
      const stateMap = components.get(componentLabel);
      if (!stateMap.has(state)) {
        stateMap.set(state, {});
      }
      stateMap.get(state)[pixiVersion] = path.relative(
        path.dirname(OUTPUT_PATH),
        path.join(fullDir, file)
      );
    }
  }

  return components;
}

function generateHTML(components) {
  const timestamp = new Date().toLocaleString();

  const tables = [];
  for (const [component, stateMap] of components) {
    const states = [...stateMap.keys()].sort();

    let rows = '';
    for (const state of states) {
      const images = stateMap.get(state);
      const stateLabel = state
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      const cells = PIXI_VERSIONS.map((pv) => {
        if (images[pv]) {
          return `<td><img src="${images[pv]}" alt="${state} ${pv}" loading="lazy" onclick="openModal(this.src, '${component} — ${stateLabel} — ${pv}')" /></td>`;
        }
        return '<td class="missing">—</td>';
      }).join('\n            ');

      rows += `
          <tr>
            <td class="state-label">${stateLabel}</td>
            ${cells}
          </tr>`;
    }

    tables.push(`
      <section>
        <h2>${component}</h2>
        <table>
          <thead>
            <tr>
              <th>State</th>
              ${PIXI_VERSIONS.map((v) => `<th>${v}</th>`).join('\n              ')}
            </tr>
          </thead>
          <tbody>${rows}
          </tbody>
        </table>
      </section>`);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PixiDom Snapshot Report</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0; padding: 24px 32px;
      background: #0d1117; color: #c9d1d9;
    }
    h1 { margin: 0 0 4px; font-size: 1.8rem; color: #58a6ff; }
    .timestamp { color: #8b949e; font-size: 0.85rem; margin-bottom: 28px; }
    h2 {
      font-size: 1.25rem; margin: 0 0 12px;
      padding-bottom: 6px; border-bottom: 1px solid #30363d;
      color: #e6edf3;
    }
    section { margin-bottom: 36px; }
    table {
      border-collapse: collapse; width: 100%;
      background: #161b22; border-radius: 8px; overflow: hidden;
    }
    th, td {
      padding: 10px 14px; text-align: center;
      border: 1px solid #30363d;
    }
    th {
      background: #21262d; color: #58a6ff;
      font-weight: 600; font-size: 0.9rem;
      position: sticky; top: 0; z-index: 2;
    }
    .state-label {
      text-align: left; font-weight: 500;
      white-space: nowrap; color: #c9d1d9;
      background: #161b22; min-width: 160px;
    }
    td img {
      max-width: 200px; height: auto;
      border-radius: 4px; cursor: pointer;
      transition: transform 0.15s ease;
      image-rendering: pixelated;
    }
    td img:hover { transform: scale(1.05); }
    .missing { color: #484f58; font-style: italic; }

    /* Modal */
    .modal-overlay {
      display: none; position: fixed; inset: 0;
      background: rgba(0,0,0,0.85); z-index: 100;
      justify-content: center; align-items: center;
      flex-direction: column; cursor: pointer;
    }
    .modal-overlay.open { display: flex; }
    .modal-overlay img {
      max-width: 90vw; max-height: 80vh;
      border-radius: 6px; image-rendering: pixelated;
    }
    .modal-label {
      color: #c9d1d9; margin-top: 12px;
      font-size: 0.95rem;
    }
  </style>
</head>
<body>
  <h1>PixiDom Snapshot Report</h1>
  <p class="timestamp">Generated: ${timestamp}</p>
${tables.join('\n')}

  <div class="modal-overlay" id="modal" onclick="closeModal()">
    <img id="modal-img" src="" alt="" />
    <div class="modal-label" id="modal-label"></div>
  </div>

  <script>
    function openModal(src, label) {
      document.getElementById('modal-img').src = src;
      document.getElementById('modal-label').textContent = label;
      document.getElementById('modal').classList.add('open');
    }
    function closeModal() {
      document.getElementById('modal').classList.remove('open');
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  </script>
</body>
</html>`;
}

const COMPONENT_RENAMES = new Map([
  ['Scrolllist With Scrollbar', 'ScrollList (with scrollbar)'],
  ['Scrolllist Without Scrollbar', 'ScrollList (without scrollbar)'],
  ['Textfield', 'TextField'],
]);

function prettifyState(component, state) {
  const componentSlug = component.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  let trimmed = state;
  if (trimmed === componentSlug) {
    return 'Default';
  }
  const prefix = `${componentSlug}-`;
  if (trimmed.startsWith(prefix)) {
    trimmed = trimmed.slice(prefix.length);
  }
  return trimmed
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function generateMarkdown(components) {
  const sections = [];
  for (const [component, stateMap] of components) {
    const states = [...stateMap.keys()].sort();
    const heading = COMPONENT_RENAMES.get(component) || component;
    const headerCells = ['State', ...PIXI_VERSIONS].join(' | ');
    const dividerCells = ['---', ...PIXI_VERSIONS.map(() => ':---:')].join(' | ');

    const rows = states.map((state) => {
      const images = stateMap.get(state);
      const stateLabel = prettifyState(component, state);
      const cells = PIXI_VERSIONS.map((pv) => {
        const rel = images[pv];
        if (!rel) return '—';
        const normalised = rel.split(path.sep).join('/');
        return `<img src="${normalised}" alt="${heading} ${stateLabel} ${pv}" width="160" />`;
      });
      return `| ${stateLabel} | ${cells.join(' | ')} |`;
    });

    sections.push(
      `### ${heading}\n\n| ${headerCells} |\n| ${dividerCells} |\n${rows.join('\n')}`
    );
  }
  const banner = '<!-- This block is auto-generated by `npm run snapshot-report:readme`. Do not edit by hand. -->';
  return `${banner}\n\n${sections.join('\n\n')}`;
}

// Main
const components = collectSnapshots();
const html = generateHTML(components);
fs.writeFileSync(OUTPUT_PATH, html, 'utf-8');
console.log(`Snapshot report written to ${OUTPUT_PATH}`);

const markdown = generateMarkdown(components);
fs.writeFileSync(MARKDOWN_OUTPUT_PATH, markdown, 'utf-8');
console.log(`Snapshot markdown written to ${MARKDOWN_OUTPUT_PATH}`);

console.log(`Components: ${[...components.keys()].join(', ')}`);

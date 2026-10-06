# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-15

First stable release.

### Components

- **PixiElement** — base display object with DOM-like event handling.
- **TextField** — text input with cursor, selection, keyboard handling, and
  cancelable `beforeinput` events for undo/redo.
- **TextArea** — multi-line text input with wrapping and wheel scrolling, built
  on a pure text-layout module.
- **Button** — customizable buttons with hover/pressed states.
- **Toggle** — animated toggle switches with optional labels.
- **Slider** — draggable value slider with customizable appearance.
- **ScrollList** / **ScrollBar** — virtualized scrollable lists with an optional
  draggable scrollbar and mouse-wheel support.
- **FontLoader** and first-class BitmapText support.

### Compatibility

- Works across PixiJS v4, v5, v6, v7, and v8 through a version-adaptive
  `PixiAdapter`, including a forced WebGPU renderer path on v8.
- Ships CommonJS, ESM, and UMD builds with correct `exports` conditions and
  per-format TypeScript declarations (`.d.mts` / `.d.cts`).
- No runtime dependencies beyond the `pixi.js` peer dependency.

### Tooling

- Cross-version end-to-end visual regression suite (Playwright) and a
  consumer-compatibility smoke test spanning Node 16–24.
- Interactive component demo published to
  [visgotti.github.io/PixiDom](https://visgotti.github.io/PixiDom).

[1.0.0]: https://github.com/visgotti/PixiDom/releases/tag/v1.0.0

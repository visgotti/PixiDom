(function (root) {
    let app = null;
    let editor = null;
    let currentPixiVersion = '8';
    let config = null;
    let propRegistry = [];
    let lastError = null;
    let viewMode = 'code';
    // Map<label, Map<keyPath, value>>
    let overrides = new Map();

    function formatValue(value, depth) {
        depth = depth || 0;
        if (depth > 4) return '…';
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        const t = typeof value;
        if (t === 'string') return JSON.stringify(value);
        if (t === 'number') {
            if (Number.isInteger(value) && value > 0xff) {
                return '0x' + value.toString(16).toUpperCase().padStart(6, '0');
            }
            return String(value);
        }
        if (t === 'boolean') return String(value);
        if (t === 'function') return 'fn()';
        if (Array.isArray(value)) {
            return '[' + value.map((v) => formatValue(v, depth + 1)).join(', ') + ']';
        }
        return String(value);
    }

    function describeType(value) {
        if (value === null) return 'null';
        if (Array.isArray(value)) return 'array';
        return typeof value;
    }

    function isPlainObject(value) {
        if (!value || typeof value !== 'object') return false;
        if (Array.isArray(value)) return false;
        const proto = Object.getPrototypeOf(value);
        return proto === Object.prototype || proto === null;
    }

    function deepClone(value) {
        if (value === null || typeof value !== 'object') return value;
        if (Array.isArray(value)) return value.map(deepClone);
        if (!isPlainObject(value)) return value;
        const out = {};
        for (const k of Object.keys(value)) out[k] = deepClone(value[k]);
        return out;
    }

    function setByPath(obj, path, value) {
        const parts = path.split('.');
        let cur = obj;
        for (let i = 0; i < parts.length - 1; i++) {
            const k = parts[i];
            if (!isPlainObject(cur[k])) cur[k] = {};
            cur = cur[k];
        }
        cur[parts[parts.length - 1]] = value;
    }

    function applyOverrides(label, opts) {
        const result = deepClone(opts);
        const labelOverrides = overrides.get(label);
        if (!labelOverrides) return result;
        for (const [path, value] of labelOverrides) {
            setByPath(result, path, value);
        }
        return result;
    }

    function setOverride(label, path, value) {
        let labelOverrides = overrides.get(label);
        if (!labelOverrides) {
            labelOverrides = new Map();
            overrides.set(label, labelOverrides);
        }
        labelOverrides.set(path, value);
    }

    function formatInputValue(value) {
        if (value === null) return 'null';
        if (value === undefined) return '';
        if (typeof value === 'number') {
            if (Number.isInteger(value) && value > 0xff) {
                return '0x' + value.toString(16).toUpperCase().padStart(6, '0');
            }
            return String(value);
        }
        if (typeof value === 'boolean') return String(value);
        if (typeof value === 'string') return value;
        return String(value);
    }

    function parseInputValue(raw, originalType) {
        const trimmed = raw.trim();
        if (originalType === 'string') {
            if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
                (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
                return trimmed.slice(1, -1);
            }
            return trimmed;
        }
        if (originalType === 'boolean') {
            if (trimmed === 'true') return true;
            if (trimmed === 'false') return false;
            return Boolean(trimmed);
        }
        if (originalType === 'number') {
            if (/^0x[0-9a-fA-F]+$/.test(trimmed)) return parseInt(trimmed, 16);
            const n = Number(trimmed);
            return Number.isFinite(n) ? n : trimmed;
        }
        if (/^0x[0-9a-fA-F]+$/.test(trimmed)) return parseInt(trimmed, 16);
        if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
        if (trimmed === 'true') return true;
        if (trimmed === 'false') return false;
        if (trimmed === 'null') return null;
        return trimmed;
    }

    function makeValueInput(label, path, value, type) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'prop-table__input';
        input.value = formatInputValue(value);
        input.dataset.type = type;
        input.spellcheck = false;
        input.autocomplete = 'off';

        const commit = () => {
            const next = parseInputValue(input.value, type);
            setOverride(label, path, next);
            runUserCode();
            setView('props');
        };

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                input.blur();
            } else if (e.key === 'Escape') {
                input.value = formatInputValue(value);
                input.blur();
            }
        });
        input.addEventListener('blur', () => {
            const next = parseInputValue(input.value, type);
            const same = next === value;
            if (!same) commit();
        });

        return input;
    }

    function buildPropTable(props, label, pathPrefix) {
        const table = document.createElement('table');
        table.className = 'prop-table';
        const thead = document.createElement('thead');
        thead.innerHTML = '<tr><th>Prop</th><th>Value</th><th>Type</th></tr>';
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        const entries = props && typeof props === 'object' ? Object.entries(props) : [];
        if (!entries.length) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 3;
            td.className = 'prop-table__empty';
            td.textContent = 'No props recorded for this item.';
            tr.appendChild(td);
            tbody.appendChild(tr);
        } else {
            entries.forEach(([key, value]) => {
                const tr = document.createElement('tr');
                const nameCell = document.createElement('td');
                nameCell.className = 'is-name';
                nameCell.textContent = key;
                tr.appendChild(nameCell);
                const valueCell = document.createElement('td');
                valueCell.className = 'is-value';
                const path = pathPrefix ? pathPrefix + '.' + key : key;
                if (isPlainObject(value)) {
                    valueCell.appendChild(buildPropTable(value, label, path));
                } else if (Array.isArray(value) || typeof value === 'function') {
                    valueCell.textContent = formatValue(value);
                } else {
                    valueCell.appendChild(makeValueInput(label, path, value, describeType(value)));
                }
                tr.appendChild(valueCell);
                const typeCell = document.createElement('td');
                typeCell.className = 'is-type';
                typeCell.textContent = describeType(value);
                tr.appendChild(typeCell);
                tbody.appendChild(tr);
            });
        }
        table.appendChild(tbody);
        return table;
    }

    function renderPropTables() {
        const root = document.getElementById('props-container');
        if (!root) return;
        root.innerHTML = '';

        if (lastError) {
            const err = document.createElement('div');
            err.className = 'prop-error';
            err.textContent = 'Error in code: ' + lastError;
            root.appendChild(err);
            return;
        }

        if (!propRegistry.length) {
            const empty = document.createElement('div');
            empty.className = 'prop-empty';
            empty.textContent = 'No items registered. Call prop(label, options) inside your code to populate this view.';
            root.appendChild(empty);
            return;
        }

        propRegistry.forEach((entry, idx) => {
            const card = document.createElement('section');
            card.className = 'prop-card';
            const header = document.createElement('header');
            header.className = 'prop-card__header';
            const title = document.createElement('h3');
            title.className = 'prop-card__title';
            title.textContent = entry.label || ('Item ' + (idx + 1));
            header.appendChild(title);
            card.appendChild(header);
            card.appendChild(buildPropTable(entry.props, entry.label, ''));
            root.appendChild(card);
        });
    }

    function setView(mode) {
        viewMode = mode;
        const editorWrap = document.getElementById('editor-wrapper');
        const propsWrap = document.getElementById('props-wrapper');
        const tabs = document.querySelectorAll('.demo-view-tab');
        tabs.forEach((t) => t.setAttribute('aria-selected', t.dataset.view === mode ? 'true' : 'false'));
        if (editorWrap) editorWrap.hidden = mode !== 'code';
        if (propsWrap) propsWrap.hidden = mode !== 'props';
        if (mode === 'props') renderPropTables();
    }

    async function initializePixiApp() {
        const canvas = document.getElementById(config.canvasId || 'canvas');
        app = await PIXI_DOM.PixiAdapter.createApp(canvas, {
            width: config.canvasWidth || 600,
            height: config.canvasHeight || 400,
            backgroundColor: config.backgroundColor != null ? config.backgroundColor : 0x1a1a1a,
        });
        root.renderer = app.renderer;
        root.stage = app.stage;
        root.PixiDom = root.PIXI_DOM || {};
    }

    function makePropHelper() {
        return function prop(label, options) {
            const resolvedLabel = label || ('Item ' + (propRegistry.length + 1));
            const merged = applyOverrides(resolvedLabel, options || {});
            propRegistry.push({ label: resolvedLabel, props: merged });
            return merged;
        };
    }

    function runUserCode() {
        propRegistry = [];
        lastError = null;
        try {
            const code = editor ? editor.getValue() : config.defaultCode;
            root.stage.removeChildren();
            const propFn = makePropHelper();
            const func = new Function('stage', 'renderer', 'PIXI', 'PIXI_DOM', 'prop', code);
            func(root.stage, root.renderer, root.PIXI, root.PIXI_DOM, propFn);
        } catch (error) {
            console.error('Error executing code:', error);
            lastError = error && (error.message || String(error));
            alert('Error: ' + lastError);
        }
        if (viewMode === 'props') renderPropTables();
    }

    function renderShell() {
        const host = document.getElementById('demo-runner-host');
        if (!host) return;
        host.innerHTML = ''
            + '<div class="demo-view-tabs" role="tablist">'
            +   '<button type="button" class="demo-view-tab" role="tab" data-view="code" aria-selected="true">Inline Code</button>'
            +   '<button type="button" class="demo-view-tab" role="tab" data-view="props" aria-selected="false">Prop Table</button>'
            + '</div>'
            + '<div class="editor-controls">'
            +   '<button id="run-btn" class="run-code-btn">Run Code</button>'
            +   '<button id="reset-btn" class="run-code-btn run-code-btn--secondary">Reset</button>'
            +   '<select id="version-selector" class="version-selector">'
            +     '<option value="8">PixiJS v8</option>'
            +     '<option value="7">PixiJS v7</option>'
            +     '<option value="6">PixiJS v6</option>'
            +     '<option value="5">PixiJS v5</option>'
            +     '<option value="4">PixiJS v4</option>'
            +   '</select>'
            + '</div>'
            + '<div id="editor-wrapper">'
            +   '<div id="editor-container"></div>'
            + '</div>'
            + '<div id="props-wrapper" hidden>'
            +   '<div id="props-container"></div>'
            + '</div>';

        const tabs = host.querySelectorAll('.demo-view-tab');
        tabs.forEach((tab) => {
            tab.addEventListener('click', () => setView(tab.dataset.view));
        });
    }

    async function init(userConfig) {
        config = Object.assign({
            canvasId: 'canvas',
            canvasWidth: 600,
            canvasHeight: 400,
            backgroundColor: 0x1a1a1a,
            defaultCode: '',
        }, userConfig || {});

        renderShell();

        await DemoLoader.loadVersion(currentPixiVersion);
        await initializePixiApp();

        require.config({
            paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' },
        });

        require(['vs/editor/editor.main'], function () {
            editor = monaco.editor.create(document.getElementById('editor-container'), {
                value: config.defaultCode,
                language: 'javascript',
                theme: 'vs-dark',
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
            });

            document.getElementById('run-btn').addEventListener('click', runUserCode);
            document.getElementById('reset-btn').addEventListener('click', () => {
                overrides = new Map();
                if (editor) editor.setValue(config.defaultCode);
                runUserCode();
            });
            document.getElementById('version-selector').addEventListener('change', async (e) => {
                try {
                    if (app) app.destroy(true, { children: true, texture: true, baseTexture: true });
                    DemoLoader.recreateCanvas(
                        document.querySelector('.demo-canvas-wrapper'),
                        config.canvasId || 'canvas',
                        config.canvasWidth || 600,
                        config.canvasHeight || 400,
                    );
                    await DemoLoader.loadVersion(e.target.value);
                    currentPixiVersion = e.target.value;
                    await initializePixiApp();
                    runUserCode();
                } catch (error) {
                    console.error('Error switching PixiJS version:', error);
                    alert('Failed to switch PixiJS version: ' + error.message);
                }
            });

            runUserCode();
        });
    }

    root.DemoRunner = { init };
})(window);

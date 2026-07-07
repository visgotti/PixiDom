(function (root) {
    const VERSION_URLS = {
        '4': '../../lib/pixi4.js',
        '5': '../../lib/pixi5.js',
        '6': '../../lib/pixi6.js',
        '7': '../../lib/pixi7.js',
        '8': '../../lib/pixi8.js',
    };
    const PIXIDOM_SCRIPT = '../../../dist/pixidom.js';

    function loadScript(src, attrs) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            if (attrs) Object.entries(attrs).forEach(([k, v]) => script.setAttribute(k, v));
            script.onload = () => resolve(script);
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(script);
        });
    }

    function removeTagged(selector) {
        document.querySelectorAll(selector).forEach((el) => el.remove());
    }

    async function loadVersion(version) {
        removeTagged('script[data-pixi-version]');
        removeTagged('script[data-pixidom]');

        // UMD scripts attach to window only when AMD `define` is hidden.
        const savedDefine = root.define;
        root.define = undefined;
        try {
            await loadScript(VERSION_URLS[version], { 'data-pixi-version': version });
            await loadScript(PIXIDOM_SCRIPT, { 'data-pixidom': 'true' });
        } finally {
            if (savedDefine) root.define = savedDefine;
        }

        // Mirror PIXI_DOM exports onto PIXI global if missing — keeps demo code that
        // reaches for `PIXI.Element` / `PIXI.Button` working regardless of bundler quirk.
        root.PIXI_DOM = root.PIXI_DOM || {};
        if (typeof PIXI !== 'undefined') {
            ['Button', 'Toggle', 'Slider', 'TextField', 'ScrollList', 'PixiAdapter'].forEach((name) => {
                if (!root.PIXI_DOM[name] && PIXI[name]) root.PIXI_DOM[name] = PIXI[name];
            });
            if (!root.PIXI_DOM.PixiElement && PIXI.Element) root.PIXI_DOM.PixiElement = PIXI.Element;
        }
    }

    function recreateCanvas(wrapper, oldId, width, height) {
        const old = document.getElementById(oldId);
        if (old && old.parentNode) old.parentNode.removeChild(old);
        const canvas = document.createElement('canvas');
        canvas.id = oldId;
        canvas.width = width;
        canvas.height = height;
        wrapper.appendChild(canvas);
        return canvas;
    }

    root.DemoLoader = { loadVersion, recreateCanvas };
})(window);

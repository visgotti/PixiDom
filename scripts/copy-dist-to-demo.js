/**
 * Script to copy built library to demo folder for local development
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const demoDir = path.join(rootDir, 'demo');

function copyFile(src, dest) {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
}

console.log('Copying pixidom.js to demo folder...');

const pixidomJs = path.join(distDir, 'pixidom.js');
const pixidomJsMap = path.join(distDir, 'pixidom.js.map');

if (fs.existsSync(pixidomJs)) {
    copyFile(pixidomJs, path.join(demoDir, 'pixidom.js'));
    console.log('✓ Copied pixidom.js');
    
    if (fs.existsSync(pixidomJsMap)) {
        copyFile(pixidomJsMap, path.join(demoDir, 'pixidom.js.map'));
        console.log('✓ Copied pixidom.js.map');
    }
} else {
    console.error('Error: pixidom.js not found. Run npm run build first.');
    process.exit(1);
}

// Copy fonts
const fontsSrc = path.join(rootDir, 'example', 'fonts');
const fontsDest = path.join(demoDir, 'fonts');

if (fs.existsSync(fontsSrc)) {
    if (!fs.existsSync(fontsDest)) {
        fs.mkdirSync(fontsDest, { recursive: true });
    }
    const fonts = fs.readdirSync(fontsSrc);
    fonts.forEach(font => {
        copyFile(path.join(fontsSrc, font), path.join(fontsDest, font));
    });
    console.log('✓ Copied fonts');
}

console.log('Done!');

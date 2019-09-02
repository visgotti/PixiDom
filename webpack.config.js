const webpack = require('webpack');
const path = require('path');
module.exports = function() {
    return {
        entry: path.join(__dirname, "src/index.ts"),
        output: {
            path: path.join(__dirname, "lib"),
            filename: "pixi-bitmap-text-input.js",
            libraryTarget: "var",
            library: "PixiText"
        },
        module: {
            rules: [
                { test: /\.ts$/, loader: "ts-loader" },
            ],
        },
        resolve: {
            extensions: ['.ts']
        }
    }
};
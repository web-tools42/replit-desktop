let path = require('path');
let merge = require('webpack-merge');

let common = require('./webpack.common');

module.exports = merge.smart(common, {
    mode: 'production',
    devtool: 'source-map',
    output: {
        publicPath: './',
        path: path.join(__dirname, 'dist'),
        filename: '[name].bundle.js'
    }
});

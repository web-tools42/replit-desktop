let path = require('path');
let merge = require('webpack-merge');

let common = require('./webpack.common');

module.exports = merge.smart(common, {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    watch: true,
    output: {
        publicPath: './',
        path: path.join(__dirname, 'dist', 'dev'),
        // Naming it 'index.js' so we can `electron 'dist/dev'` (main js file gets discovered)
        // TODO: Fix
        filename: 'index.js'
    },
    optimization: {
        minimize: false
    },
    module: {
        rules: [
            {
                test: /\.(js|ts)$/,
                exclude: [
                    /node_modules/,
                    /electron-basic-updater/,
                    /electron-preferences/
                ],
                use: [
                    'babel-loader',
                    {
                        loader: 'eslint-loader',
                        options: {
                            fix: false, // Automatically fixes source files
                            cache: true,
                            quiet: false
                        }
                    }
                ]
            }
        ]
    }
});

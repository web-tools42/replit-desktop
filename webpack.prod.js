let path = require('path');
let CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    mode: 'production',
    target: 'electron-main',
    devtool: 'source-map',
    context: path.resolve(__dirname),
    entry: ['@babel/polyfill', './src/main/main.ts'],
    output: {
        publicPath: './',
        path: path.join(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    plugins: [new CleanWebpackPlugin()],
    module: {
        rules: [
            {
                test: /\.(js|ts)$/,
                exclude: [
                    /node_modules/,
                    /electron-basic-updater/,
                    /electron-preferences/
                ],
                use: ['babel-loader']
            }
        ]
    }
};

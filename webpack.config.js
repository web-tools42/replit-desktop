let path = require('path');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    target: 'electron-main',
    context: path.resolve(__dirname),
    watch: true,
    entry: ['@babel/polyfill', './src/main.js'],
    output: {
        publicPath: './',
        path: path.resolve(__dirname, 'dist', 'dev'),
        filename: '[name].bundle.js'
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        alias: {
            '@': './src'
        }
    },
    plugins: [new CleanWebpackPlugin(), new ForkTsCheckerWebpackPlugin()],
    optimization: {
        minimize: false
    },
    module: {
        rules: [
            {
                test: /\.(js|ts)$/,
                use: ['babel-loader'],
                exclude: /node_modules/
            }
        ]
    }
};

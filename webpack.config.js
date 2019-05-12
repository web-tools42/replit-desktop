let path = require('path');
let CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    target: 'electron-main',
    context: path.resolve(__dirname),
    watch: true,

    entry: ['@babel/polyfill', './src/main/main.ts'],
    output: {
        publicPath: './',
        path: path.join(__dirname, 'dist', 'dev'),
        filename: '[name].bundle.js'
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
            DDD: path.resolve(__dirname, 'src')
        }
    },
    plugins: [new CleanWebpackPlugin()],
    optimization: {
        minimize: false
    },
    module: {
        rules: [
            {
                test: /\.(js|ts)$/,
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
                ],
                exclude: /(node_modules|electron-basic-updater|electron-preferences)/
            },
            {
                test: /\.json$/,
                use: [
                    {
                        loader: 'eslint-loader',
                        options: {
                            fix: false, // Automatically fixes source files
                            cache: true,
                            quiet: false
                        }
                    }
                ],
                exclude: [
                    /node_modules/,
                    /electron-basic-updater/,
                    /electron-preferences/
                ]
            }
        ]
    }
};

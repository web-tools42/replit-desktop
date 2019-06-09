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
            '@': path.resolve(__dirname, 'src')
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
                            debug: true,
                            fix: false, // Automatically fixes source files
                            cache: false,
                            quiet: false
                        }
                    }
                ]
            }
        ]
    }
};

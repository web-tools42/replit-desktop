let path = require('path');
let CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    target: 'electron-main',
    context: path.resolve(__dirname),
    entry: ['@babel/polyfill', './src/main/main.ts'],
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
};
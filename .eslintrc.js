module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
        commonjs: true
    },
    extends: ['prettier', 'plugin:prettier/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['eslint-plugin-import', '@typescript-eslint'],
    parserOptions: {
        ecmaVersion: 2018
    },
    ecmaFeatures: {
        modules: true
    },
    rules: {
        'prettier/prettier': 'error'
    }
};

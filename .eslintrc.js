module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
        commonjs: true
    },
    extends: ['prettier', 'plugin:prettier/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'json-format'],
    parserOptions: {
        sourceType: 'module'
    },
    rules: {
        'prettier/prettier': 'error'
    },
    settings: {
        'json/sort-package-json': 'standard'
    }
};

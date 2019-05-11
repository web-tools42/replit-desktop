module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
        commonjs: true,
    },
    extends: ['prettier', 'plugin:prettier/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    rules: {
        'prettier/prettier': 'error',
    },
}

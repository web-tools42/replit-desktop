module.exports = {
    env: {
        "browser": true,
        "es6": true,
        "node": true,
        "commonjs": true
    },
    extends: ['prettier', 'plugin:prettier/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['eslint-plugin-import', '@typescript-eslint'],
    parserOptions: {
        "sourceType": "module"
    },
    rules: {
        'prettier/prettier': 'error'
    }
};

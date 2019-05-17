# repl-it-electron

[![Build Status](https://travis-ci.org/repl-it-discord/repl.it-electron.svg?branch=master)](https://travis-ci.org/repl-it-discord/repl-it-electron)

## Summary
[repl.it](https://repl.it) is an online coding platform that provides an IDE all in your browser. `repl-it-electron` is an unofficial native desktop application that interfaces wth repl.it. It intends to improve developer experience through simplicity. As an electron app you can use it on Mac OS, Windows 7,8 and 10.

## Features
* Discord Rich Presence (using DiscordRPC)
* Work with two windows simultaneously
* Change themes (other than *Light* and *Dark*)

## Contributing

```bash
git clone --recurse-submodules https://github.com/repl-it-discord/repl-it-electron
cd repl-it-electron
npm install -g --production windows-build-tools # windows
npm install
npm start
```

See [CONTRIBUTING.md](./.github/CONTRIBUTING.md) before contributing

See feature implementation details on the [roadmap](https://github.com/repl-it-discord/repl-it-electron/projects)

## Scripts

### `npm run dev:main`

Runs `npm run dev:main:electron` and `npm run dev:main:webpack` concurrently.

### `npm run dev:main:electron`

Starts electron main process. Watches files in `dist/dev` with `nodemon` and restarts Electron when changes are found.

### `npm run dev:main:webpack`

Starts Webpack ts compilation and js transpilation that outputs to `dist/dev`. Restarts webpack bundling when changes in `src` are found.

### `npm run lint:fix`

Automatically fixes all linting issues with eslint. Lints TypeScript as well as JavaScript. Also formats code according to Prettier style guides.

### `npm run package`

Package the app before release.

## Acknowledgements

[@mat1](https://repl.it/@mat1) for Discord Rich Presence Integration

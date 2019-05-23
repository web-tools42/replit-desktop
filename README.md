# repl-it-electron

[![Build Status](https://travis-ci.org/repl-it-discord/repl-it-electron.svg?branch=dev)](https://travis-ci.org/repl-it-discord/repl-it-electron)

## Summary

[Repl.it](https://repl.it) is an online coding platform that provides a browser-based IDE. `repl-it-electron` is an unofficial native desktop application that interfaces with repl.it. It intends to improve developer experience and efficiency.

## Features

* Discord Rich Presence (using DiscordRPC)
* Work with two windows simultaneously
* Change themes (besides *light* and *dark*)

## Requirements

* From macOS 10.10 (Yosemite)
* From Windows 7
* From Ubuntu 12.04, Fedora 21, or Debian 8

Supported operating systems taken from the Electron [docs](https://electronjs.org/docs/tutorial/support)

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

Starts webpack process to perform TypeScript compilation and JavaScript transpilation etc. that outputs to `dist/dev`. Restarts webpack bundling when changes in `src` are found.

### `npm run lint:fix`

Automatically fixes all linting issues with eslint. Lints TypeScript as well as JavaScript. Also formats code according to Prettier style guides.

### `npm run package`

Package the app before release.

## Acknowledgements

[@mat1](https://repl.it/@mat1) for Discord Rich Presence Integration and custom dark theme

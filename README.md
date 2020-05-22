# repl-it-electron

[![Travis (.org) branch](https://img.shields.io/travis/repl-it-discord/repl-it-electron/dev.svg?logo=travis)](https://travis-ci.org/repl-it-discord/repl-it-electron)
[![Discord](https://img.shields.io/discord/437048931827056642.svg?logo=discord)](https://discord.gg/5gcPC6B)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/3bce49c376cf4c2bb1d2813d6b12dd6a)](https://www.codacy.com/manual/leon332157/repl-it-electron?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=repl-it-discord/repl-it-electron&amp;utm_campaign=Badge_Grade)

## Summary

[Repl.it](https://repl.it) is an online coding platform that provides a browser-based IDE. `repl-it-electron` is an unofficial native desktop application that interfaces with repl.it. It intends to improve developer experience and efficiency.

## Features

* Discord Rich Presence (using DiscordRPC)
* Work with two windows simultaneously
* Change themes (besides *light* and *dark*)

## Requirements

* macOS 10.10 (Yosemite)
* Windows 10
* Ubuntu 12.04, Fedora 21, or Debian 8

Supported operating systems taken from the Electron [docs](https://electronjs.org/docs/tutorial/support)

## Contributing

```bash
git clone --recurse-submodules https://github.com/repl-it-discord/repl-it-electron
cd repl-it-electron
npx pnpm add -g pnpm
pnpm install
pnpm start
```

Although node.js version 14 can be used, version 12 LTS is recommended as Electron still uses it.

See [CONTRIBUTING.md](./.github/CONTRIBUTING.md) before contributing

See feature implementation details on the [roadmap](https://github.com/repl-it-discord/repl-it-electron/projects)

## Scripts

### `start`

Runs `npm run build` and `npm run build:run`, used for running electron with compiled ts files.

### `lint`

Identifies all linting issues with eslint. Lints TypeScript as well as JavaScript. Also formats code according to Prettier style guides. Use `npm run lint --fix` to correct all correctable errors.

### `build`

Uses gulp to create a JavaScript build of the app.

### `build:run`

Runs the production build of the website.

### `build:dist`
Builds a production JS version of the app.

### `dist`
Builds the app for release. 

## Acknowledgements

[@mat1](https://matdoes.dev/) for Discord Rich Presence Integration and custom dark theme

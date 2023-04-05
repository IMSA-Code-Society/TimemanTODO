# Contributing

## Directory
TODO

## Tech stack
- Svelte: client side, reactive component-based library. Chose over SvelteKit because I don't need the extra hydration. When I tried to disable ssr, it could not find my modules :/
- Sqlite: database. Simple to set up, doesn't require an extra server. Might change this as app scales
- pnpm: node package manager. Chose over npm because of its monorepo workspace features and storage efficiency
- Vite: javascript/css bundler. Chose over Rollup because I have traumatic experiences with Rollup (mistaking start with dev), plus it's slow

## Setup & Contributing
1. Install a [code editor](https://code.visualstudio.com/), [GitHub Desktop](https://desktop.github.com/), and [Node.js](https://nodejs.org/en)
2. Install `pnpm` (a package manager)
    - Mac: `sudo npm i -g pnpm`
    - Windows: `npm i -g pnpm`
3. Install packages (rerun this any time `package.json` changes too): open a terminal in the root project directory, then run `pnpm i`
4. Make your changes on a new branch, and when that feature is done, open a pull request

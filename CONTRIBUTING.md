# Contributing

## Directory
```
timemanTODO/
├ api/
│ └ [Ignore, will probably get removed]
├ client/
│ ├ src/
│ │ ├ lib/
│ │ │ └ [resources shared across routes]
│ │ └ rotes/
│ │   └ [different "screens" of the page]
│ └ public/
│   └ [your static assets]
├ transactionalDB/
│ └ [syncable database service. Stores task info]
├ Truth/
│ └ [database for general student info (class schedule, althorizing scopes to other apps]
└ package.json
```

## Tech stack
- **Svelte:** client side, reactive component-based library. Chose over SvelteKit because
  1. I don't need the extra complexity of ssr & hydration, nor want to run an extra server.
  2. SSG loses page transitions
  3. It would be great if I were fetching db info, but I am not.
  4. Code splitting and pwa caching should mitigate large bundle issues & I don't need to support old browsers
- **pnpm:** node package manager. Chose over npm because of its monorepo workspace features and storage efficiency
- **Vite:** javascript/css bundler. Chose over Rollup because I have traumatic experiences with Rollup (mistaking start with dev), plus it's slow
- **Node.js:** backend JavaScript runtime.
- **CouchDb & PouchDb:** Database. Provides the most features out-of-the-box: replication, delta docs, clarity, and extensibility. Alternatives considered:
  - Dexie: Although nice API, [have to implement replication from scratch](https://dexie.org/docs/Syncable/Dexie.Syncable.ISyncProtocol). No community packages, [only one 5 yr old](https://www.npmjs.com/package/sync-server). Or, get locked into their service & pay
  - Custom implementation: works well, but still rough edges & unfinished API. No live updates. Not worth polishing when easy solutions exist
  - RXDB: bad conflict resolution, [cannot use delta doc pattern](https://rxdb.info/transactions-conflicts-revisions.html#custom-conflict-handler)

## Setup & Contributing
1. Install a [code editor](https://code.visualstudio.com/), [GitHub Desktop](https://desktop.github.com/), and [Node.js](https://nodejs.org/en)
2. Install `pnpm` (a package manager)
    - Mac: `sudo npm i -g pnpm`
    - Windows: `npm i -g pnpm`
3. Install packages (rerun this any time `package.json` changes too): open a terminal in the root project directory, then run `pnpm i`
4. Make your changes on a new branch, and when that feature is done, open a pull request

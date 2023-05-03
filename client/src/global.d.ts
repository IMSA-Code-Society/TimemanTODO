/// <reference types="svelte" />
/// <reference types="pouchdb-browser" />
/// <reference types="pouchdb-find" />
/// <reference types="pouchdb-live-find" />

// Must be in global.d.ts b/c complaints about isolatedModules & preserveValueImports
declare type RequestDef<T> = PouchDB.LiveFind.RequestDef<T>;

declare type Invalidator<T> = (value?: T) => void;

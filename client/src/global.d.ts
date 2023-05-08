/// <reference types="svelte" />
/// <reference types="svelte/types/runtime/store" />
/// <reference types="pouchdb-browser" />
/// <reference types="pouchdb-find" />
/// <reference types="pouchdb-live-find" />

type comparator = (left, right) => number;

// Must be in global.d.ts b/c complaints about isolatedModules & preserveValueImports
declare type RequestDef<T> = PouchDB.LiveFind.RequestDef<T> & {sortFn?: comparator};

declare type Invalidator<T> = (value?: T) => void;

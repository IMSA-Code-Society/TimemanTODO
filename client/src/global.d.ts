/// <reference types="svelte" />
/// <reference types="pouchdb-browser" />
/// <reference types="pouchdb-find" />
/// <reference types="pouchdb-live-find" />

import type {Readable} from "svelte/types/runtime/store";

type comparator = (left, right) => number;

// Must be in global.d.ts b/c complaints about isolatedModules & preserveValueImports
declare type RequestDef<T> = PouchDB.LiveFind.RequestDef<T> & {sortFn?: comparator};

declare type Invalidator<T> = (value?: T) => void;

// Extend prototype with generics according to https://stackoverflow.com/a/52514102
declare interface PouchDB<T> {
  asSvelteStore(): Readable<T>;
}

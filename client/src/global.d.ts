/// <reference types="svelte" />
/// <reference types="pouchdb" />
/// <reference types="pouchdb-find" />
/// <reference types="pouchdb-live-find" />

declare type Invalidator<T> = (value?: T) => void;

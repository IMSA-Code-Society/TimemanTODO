// Extend prototype with generics according to https://stackoverflow.com/a/52514102
// interface PouchDB<T> {
//   asSvelteStore(): Readable<T>;
// }

import type {Readable, Subscriber, Unsubscriber} from "svelte/types/runtime/store";
import type PouchDBType from "pouchdb-browser";
import {writable} from "svelte/store";
import type {RequestDef} from "../global";

function asSvelteStore(PouchDB: typeof PouchDBType) {
  PouchDB.prototype.asSvelteStore = function<T>(requestDef?: RequestDef<T>) {
    const db = this;
    // Is a mapping of id to doc TODO: confirm extra props like _id $id _rev $modifiedAt
    let state: Record<string, T>;
    // Check !set b/c no parameters passed when ending, but passed when starting
    const store = writable([] as T[], set => {if (!set) db.close()});
    const notify = () => { console.log(state); store.set(Object.values(state)); };
    db.deltaInit();
    db.delta
      .on('create', create => { state[create.$id] = create; notify(); })
      .on('update', changes => { state[changes.$id] = {...state[changes.$id], ...changes}; notify(); })
      .on('delete', id => { delete state[id]; notify(); });

    async function updateSearch(newRequestDef?: RequestDef<T>) {
      if (newRequestDef) {
        state = {};
        const {docs, warning} = await db.find(newRequestDef);
        if (warning)
          console.warn(warning);
        docs.forEach(el => state[el.$id] = el);
      } else {
        state = await db.all();
      }
      notify();
    }
    updateSearch(requestDef);

    // Plot twist: readable is just a wrapped writable. Therefore, don't try to implement your own "store"
    return {
      subscribe: store.subscribe,
      updateSearch,
    } as Readable<T[]> & {updateSearch: typeof updateSearch};  // Cast to more readable format
  };
}

export default asSvelteStore;

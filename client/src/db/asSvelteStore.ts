// Extend prototype with generics according to https://stackoverflow.com/a/52514102
// interface PouchDB<T> {
//   asSvelteStore(): Readable<T>;
// }

import type {Readable} from "svelte/types/runtime/store";
import type PouchDBType from "pouchdb-browser";
import {writable} from "svelte/store";
import {memoryFilter} from "pouchdb-live-find/lib/helpers"
import * as selectorCore from "pouchdb-selector-core";
const {massageSelector, massageSort} = selectorCore;  // Don't question the names

/** Access a database reactively
 *
 * Example usage:
 * ```javascript
 * const liveFeed = db.asSvelteStore({
 *   selector: {series: 'Mario'},
 *   sort: [{series: 'desc'}, {name: 'desc'}]
 * });
 * liveFeed.updateSearch({...differentOptions})
 * ```
 * @param PouchDB class to attach to the prototype (not an instance!)
 * @see https://pouchdb.com/api.html#query_index
 */
function asSvelteStore(PouchDB: typeof PouchDBType) {
  PouchDB.prototype.asSvelteStore = function<T>(requestDef?: RequestDef<T>) {
    const db = this;
    // Is a mapping of id to doc TODO: confirm extra props like _id $id _rev $modifiedAt
    let state: Record<string, T>;
    // Check !set b/c no parameters passed when ending, but passed when starting
    const store = writable([] as T[], set => {if (!set) db.close()});
    db.deltaInit();
    db.delta
      .on('create', create => { if (filterDoc(create)) { state[create.$id] = create; filterNotify(); }})
      .on('update', changes => {
        const doc = {...state[changes.$id], ...changes};
        if (filterDoc(doc))
          state[changes.$id] = doc;
        else
          delete state[changes.$id];
        filterNotify();
      })
      .on('delete', id => { delete state[id]; filterNotify(); });

    // Adapted from https://github.com/colinskow/pouchdb-live-find/blob/ab67d17acd0c927ec235780b3fe47cedb29ae0b0/lib/index.js#LL132C3-L138C4
    function filterDoc(doc) {
      if (requestDef == null)
        return true;
      const result = memoryFilter([doc], requestDef);
      return result.length > 0;
    }

    function filterNotify() {
      console.log(state);
      const newState = Object.values(state);
      if (requestDef) {
        // TODO: sort `newState`
      }
      store.set(newState);
    }

    async function updateSearch(newRequestDef?: RequestDef<T>) {
      if (newRequestDef) {
        requestDef = newRequestDef;
        // Adapted from https://github.com/colinskow/pouchdb-live-find/blob/ab67d17acd0c927ec235780b3fe47cedb29ae0b0/lib/index.js#LL40C2-L47C4
        if(requestDef.selector) {
          requestDef.selector = massageSelector(requestDef.selector);
        }
        if(requestDef.sort) {
          requestDef.sort = massageSort(requestDef.sort);
          //sortFn = helpers.createFieldSorter(sort); TODO
        }

        state = {};
        const {docs, warning} = await db.find(requestDef);
        // Don't use liveFind.on(update) b/c fields are only ever added, will not fire for UPDATE or DELETE
        if (warning)
          console.warn(warning);
        docs.forEach(el => state[el.$id] = el);
      } else {
        state = await db.all();
      }
      filterNotify();
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

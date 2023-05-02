// Extend prototype with generics according to https://stackoverflow.com/a/52514102
// interface PouchDB<T> {
//   asSvelteStore(): Readable<T>;
// }

import type {Readable, Subscriber, Unsubscriber} from "svelte/types/runtime/store";
import type PouchDBType from "pouchdb-browser";

function asSvelteStore(PouchDB: typeof PouchDBType) {
  PouchDB.prototype.asSvelteStore = function<T>(): Readable<T[]> {
    const db = this;
    // Is a mapping of id to doc
    let state = {};
    const self = this;
    this.deltaInit();

    return {
      subscribe(run: Subscriber<T[]>, invalidate: Invalidator<T[]> | undefined): Unsubscriber {
        run([]);
        db.all().then(docs => {
          state = docs;
          notify();
        });
        const notify = () => { console.log(state); run(Object.values(state)); };
        self.delta
          .on('create', create => { state[create.$id] = create; notify(); })
          .on('update', changes => { state[changes.$id] = {...state[changes.$id], ...changes}; notify(); })
          .on('delete', id => { delete state[id]; notify(); });
        return () => {};  // TODO: actually clean up
      }
    }
  };
}

export default asSvelteStore;

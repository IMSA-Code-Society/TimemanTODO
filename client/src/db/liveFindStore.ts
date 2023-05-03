import type {Readable, Subscriber, Unsubscriber} from "svelte/types/runtime/store";
import type PouchDBType from 'pouchdb-browser';

/** DON'T USE! I foolishly didn't consider that updates can't easily be recomputed from deltas
 *
 * Example usage:
 * const liveFeed = db.liveFindStore({
 *   selector: {series: 'Mario'},
 *   sort: [{series: 'desc'}, {name: 'desc'}]
 * });
 * @param PouchDB class to attach to the prototype (not an instance!)
 */
function liveFindStore(PouchDB: typeof PouchDBType) {
  const upstreamLiveFind = PouchDB.prototype.liveFind;
  PouchDB.prototype.liveFindStore = function<T>(requestDef: RequestDef<T>): Readable<T[]> {
    const liveFeed = upstreamLiveFind.call(this, requestDef);

    return {
      subscribe(run: Subscriber<T[]>, invalidate: Invalidator<T[]> | undefined): Unsubscriber {
        run([]);
        liveFeed.on('update', (update, aggregate) => run(aggregate ?? []));
        return liveFeed.cancel;
      }
    }
  };
}

export default liveFindStore;

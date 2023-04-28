<script lang="ts">
  import PouchDB from 'pouchdb-browser';
  import DeltaPouch from 'delta-pouch';
  import PouchFind from "pouchdb-find";
  import PouchFindLive from "pouchdb-live-find";
  import type {Readable, Subscriber, Unsubscriber} from "svelte/store";
  import type {SavedTask} from "../lib/api";
  import {writable} from "svelte/store";
    import type PouchDb from 'pouchdb-browser';

  PouchDB.plugin(DeltaPouch);
  // PouchDB.plugin(PouchFind);
  // PouchDB.plugin(PouchFindLive);
  // const upstreamLiveFind = PouchDB.prototype.liveFind;
  // PouchDB.plugin(PouchDB => {
  //   PouchDB.prototype.liveFindStore = function(requestDef: Parameters<typeof upstreamLiveFind>[0]): Readable<{}> {
  //     console.log(this);
  //     const liveFeed = upstreamLiveFind.call(this, requestDef);
  //
  //     return {
  //       subscribe(run: Subscriber<{}>, invalidate: Invalidator<{}> | undefined): Unsubscriber {
  //         run([]);
  //         liveFeed.on('update', (update, aggregate) => run(aggregate));
  //         return liveFeed.cancel;
  //       }
  //     }
  //   };
  // });

  // jk this was a bad idea to get type info
  // class ReactivePouchDb<Schema> extends PouchDB<Schema> {
  //   constructor(name?: string, options?: PouchDB.Configuration.DatabaseConfiguration) {
  //     super(name, options);
  //   }
  // }

  // Extend prototype with generics according to https://stackoverflow.com/a/52514102
  interface PouchDB<T> {
    asSvelteStore(): Readable<T>;
  }

  PouchDB.plugin(PouchDB => {
    // type Schema = typeof PouchDB extends PouchDB.Database<infer Item> ? Item : typeof PouchDB;
    PouchDB.prototype.asSvelteStore = function<T>(): Readable<T[]> {
      console.log(this);
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
  });

  const db = new PouchDB<{}>("test");

  // const liveFeed = db.liveFindStore({
  //   selector: {},  // {series: 'Mario'}
  //   sort: [],  // [{series: 'desc'}, {name: 'desc'}]
  //   aggregate: true
  // });

  const liveFeed = db.asSvelteStore();

  let newTodo: string;

  function submit(id=undefined, title=undefined) {
      db.save({ $id: id, title: title ?? newTodo }).then(function (doc) {
        console.log(doc);
        // doc.$id is the id of the created doc
      });
  }
</script>

<div>
    <input bind:value={newTodo} /><button on:click={() => submit()}>Submit</button>
    {#each $liveFeed as todo}
        <div>{JSON.stringify(todo)}</div>
        {todo.$id}
        <input value={todo.title} on:change={ev => submit(todo.$id, ev.target.value)} />
        <button on:click={() => db.delete(todo.$id).then(console.log)}>❎</button>
    {/each}
</div>

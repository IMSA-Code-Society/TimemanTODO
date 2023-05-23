<script lang="ts">
  import * as TransactionalDb from "transactionaldb"
  import {writable} from "svelte/store";
  import {createFieldSorter, memoryFilter} from "pouchdb-live-find/lib/helpers";
  import type {DbStore} from "../db/asSvelteStore";
  import type {TypedDatabase} from "transactionalDB/indexedDB";

  // Use this for testing new (my custom) db connector. Currently won't work, mostly copied from DbTest2
  class Database<Content> {
    public readonly delta: EventTarget;
    private readonly db: Promise<TypedDatabase<{ _content: Content }>>;

    constructor(public readonly name: string, indexes?: any) {
      this.delta = new EventTarget();
      this.db = TransactionalDb.openDb(name, 1);
    }

    save(content: Content) {
      return TransactionalDb.makeCommit({
        database: this.name,
        timestamp: new Date().getTime(),
        payloadValue: JSON.stringify(content),
        operation: "create",
        //payloadId: ,
      });
    }

    asSvelteStore(requestDef?: any) {
      let state: Record<string, Content>;
      // Check !set b/c no parameters passed when ending, but passed when starting
      const store = writable([] as Content[], set => {if (!set) db.close()});
      db.deltaInit();
      db.delta
        .on('create', create => { if (filterDoc(create)) { state[create.$id] = create; notify(); }})
        .on('update', changes => {
          const doc = {...state[changes.$id], ...changes};
          if (filterDoc(doc))
            state[changes.$id] = doc;
          else
            delete state[changes.$id];
          notify();
        })
        .on('delete', id => { delete state[id]; notify(); });

      // Adapted from https://github.com/colinskow/pouchdb-live-find/blob/ab67d17acd0c927ec235780b3fe47cedb29ae0b0/lib/index.js#LL132C3-L138C4
      function filterDoc(doc) {
        if (requestDef == null)
          return true;
        const result = memoryFilter([doc], requestDef);
        return result.length > 0;
      }

      function notify() {
        console.log(db.name, state);
        const newState = Object.values(state);
        if (requestDef?.sortFn)
          newState.sort(requestDef.sortFn);
        store.set(newState);
      }

      async function updateSearch(newRequestDef?: RequestDef<Content>) {
        if (newRequestDef) {
          // Merge old & new requestDef (eg. keep sort, but change filter)
          requestDef = newRequestDef ? {...(requestDef ?? {}), ...newRequestDef} : requestDef;

          // Adapted from https://github.com/colinskow/pouchdb-live-find/blob/ab67d17acd0c927ec235780b3fe47cedb29ae0b0/lib/index.js#LL40C2-L47C4
          if(requestDef.selector) {
            requestDef.selector = massageSelector(requestDef.selector);
          }
          if(requestDef.sort) {
            // TODO: why doesn't massageSort exist
            //requestDef.sort = massageSort(requestDef.sort);
            // createFieldSorter exists in both pouchdb-live-search & pouchdb-selector-core, which are slightly different
            requestDef.sortFn = createFieldSorter(requestDef.sort);
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
        notify();
      }
      updateSearch(requestDef);

      // Plot twist: readable is just a wrapped writable. Therefore, don't try to implement your own "store"
      return {
        subscribe: store.subscribe,
        updateSearch,
      } as DbStore<Content>;  // Cast to more readable format
    }
  }

  const db = new Database<{}>("test");

  // Sort requires an index and selector to work.
  // TODO: figure out why "remove" is undefined when sorting
  // {selector: {title: "three"}, sort: [{title: 'desc'}]}
  let liveFeed = [];

  let filter: string;
  let newTodo: string;

  function submit(id=undefined, title=undefined) {
    db.save({ id, title: title ?? newTodo }).then(() => console.log("saved!"));
  }
</script>

<div>
    <input bind:value={newTodo} /><button on:click={() => submit()}>Submit</button>
    <label>
        Filter
        <input bind:value={filter} />
    </label>
    {#each $liveFeed as todo (todo.$id)}
        <div>{JSON.stringify(todo)}</div>
        {todo.$id}
        <input value={todo.title} on:change={ev => submit(todo.$id, ev.target.value)} />
        <button on:click={() => db.delete(todo.$id).then(console.log)}>❎</button>
    {/each}
</div>

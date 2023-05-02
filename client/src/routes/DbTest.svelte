<script lang="ts">
  import PouchDB from 'pouchdb-browser';
  import DeltaPouch from 'delta-pouch';
  import PouchFind from "pouchdb-find";
  import PouchFindLive from "pouchdb-live-find";
  import type {Readable, Subscriber, Unsubscriber} from "svelte/store";

  PouchDB.plugin(DeltaPouch);
  PouchDB.plugin(PouchFind);
  PouchDB.plugin(PouchFindLive);
  const upstreamLiveFind = PouchDB.prototype.liveFind;
  PouchDB.plugin(PouchDB => {
    PouchDB.prototype.liveFindStore = function(requestDef: Parameters<typeof upstreamLiveFind>[0]): Readable<{}> {
      console.log(this);
      const liveFeed = upstreamLiveFind.call(this, requestDef);

      return {
        subscribe(run: Subscriber<{}>, invalidate: Invalidator<{}> | undefined): Unsubscriber {
          run([]);
          liveFeed.on('update', (update, aggregate) => run(aggregate));
          return liveFeed.cancel;
        }
      }
    };
  });

  const db = new PouchDB<{}>("test");
  db.deltaInit();

  const liveFeed = db.liveFindStore({
    selector: {},  // {series: 'Mario'}
    sort: [],  // [{series: 'desc'}, {name: 'desc'}]
    aggregate: true
  });

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
        <button on:click={() => db.delete(todo._id).then(console.log)}>❎</button>
    {/each}
</div>

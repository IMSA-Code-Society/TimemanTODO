<script lang="ts">
  import PouchDB from 'pouchdb-browser';
  import DeltaPouch from 'delta-pouch';
  import PouchFind from "pouchdb-find";
  import PouchFindLive from "pouchdb-live-find";
  import LiveFindStore from "../db/liveFindStore";
  import AsSvelteStore from "../db/asSvelteStore";

  PouchDB.plugin(DeltaPouch);
  PouchDB.plugin(PouchFind);
  PouchDB.plugin(PouchFindLive);
  //PouchDB.plugin(LiveFindStore);
  PouchDB.plugin(AsSvelteStore);

  const db = new PouchDB<{}>("test");
  db.deltaInit();

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
        <button on:click={() => db.delete(todo._id).then(console.log)}>❎</button>
    {/each}
</div>

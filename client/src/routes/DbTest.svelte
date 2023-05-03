<script lang="ts">
  import PouchDB from 'pouchdb-browser';
  import DeltaPouch from 'delta-pouch';
  import PouchFind from "pouchdb-find";
  import PouchFindLive from "pouchdb-live-find";
  import AsSvelteStore from "../db/asSvelteStore";

  PouchDB.plugin(DeltaPouch);
  PouchDB.plugin(PouchFind);
  PouchDB.plugin(PouchFindLive);
  PouchDB.plugin(AsSvelteStore);

  const db = new PouchDB<{}>("test");
  db.createIndex({
    index: {
      fields: ['title'],
    },
  });

  // Sort requires an index and selector to work.
  // TODO: figure out why "remove" is undefined when sorting
  // {selector: {title: "three"}, sort: [{title: 'desc'}]}
  const liveFeed = db.asSvelteStore();

  let newTodo: string;
  let filter: string;
  $: liveFeed.updateSearch({selector: {title: filter}});

  function submit(id=undefined, title=undefined) {
      db.save({ $id: id, title: title ?? newTodo }).then(function (doc) {
        console.log(doc);
        // doc.$id is the id of the created doc
      });
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

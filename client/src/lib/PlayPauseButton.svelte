<script lang="ts">
  import {createEventDispatcher} from "svelte";

  export let isPaused = true;

  const dispatch = createEventDispatcher()

  function handleClick(ev) {
    isPaused = !isPaused;
    // Forward click events to any parents
    dispatch("click", ev);
  }
</script>

<button on:click={handleClick} class="reset">{isPaused ? "▶️" : "⏸️"}</button>

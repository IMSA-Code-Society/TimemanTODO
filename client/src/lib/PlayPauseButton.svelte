<script lang="ts">
  import {createEventDispatcher} from "svelte";

  export let isPaused = true;

  const dispatch = createEventDispatcher()

  function handleClick(ev: MouseEvent) {
    ev.stopPropagation();
    ev.preventDefault();
    isPaused = !isPaused;
    // Forward click events to any parents
    dispatch("click", ev);
  }
</script>

<button on:click={handleClick} class="reset">{isPaused ? "▶️" : "⏸️"}</button>

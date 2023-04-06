<script lang="ts">
  export let value: number = 0;

  const select = num => () => value = num;
</script>

<div>
    <button on:click={select(1)}>1</button>
    <button on:click={select(2)}>2</button>
    <button on:click={select(3)}>3</button>
    <button on:click={select(4)}>4</button>
    <button on:click={select(5)}>5</button>
</div>

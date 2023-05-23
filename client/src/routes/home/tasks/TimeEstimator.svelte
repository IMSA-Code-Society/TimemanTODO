<script lang="ts">
  export let value: number;

  let minutes;
  let hours;

  $: value = (hours || 0) * 60 + (Number.parseInt(minutes) || 0);
  setHrMin(value);

  function setHrMin(newMinutes) {
    if (newMinutes === 0) return;
    hours = Math.floor(newMinutes / 60);
    minutes = (newMinutes % 60).toString().padStart(2, '0');
  }

  function increment() {
    // TODO: would someone actually take time to input a 5-min task?
    const stops = [0, 5, 15, 30];
    const stopsIndex = stops.indexOf(value);
    if (stopsIndex !== -1 && stopsIndex !== stops.length - 1)
      minutes = stops[stopsIndex + 1];
    else if (value >= 30)
      setHrMin(value + 30);
    console.log(value);
  }
</script>

<label style="display: flex">
    <button on:click={increment}>⏱️</button>
    <input type="number" placeholder="hr" class="numinput" min="0" bind:value={hours} />:
    <input type="number" placeholder="m" class="numinput" min="0" bind:value={minutes} />
</label>

<style>
    .numinput {
        width: 1.5em;
    }
</style>

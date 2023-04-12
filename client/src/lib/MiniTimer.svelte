<script lang="ts">
    import { onDestroy } from "svelte";
    import PlayPauseButton from "./PlayPauseButton.svelte";

    // This doesn't work b/c indeterminate is boolean, not singular value
    //type ToggleType<Toggle extends boolean, Truthy, Falsy=unknown> = Toggle extends true ? Falsy : Truthy;
    
    //export let props: {indeterminate?: false, progress: number, totalTime: number, isPaused: boolean} | {indeterminate: true};
    // How much time has elapsed on the clock
    export let progress = 55;
    export let totalTime = 100;
    export let isPaused = true;
    // If true, ignore previous values
    export let indeterminate = false;

    // Reference to the interval that increments/decrements the clock
    let intervalRef: number;

    function stopTimer() {
      progress = 0;
      indeterminate = false;
      // TODO: update db
    }

    onDestroy(() => clearInterval(intervalRef));
</script>

<div id="minitimer">
    <div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={totalTime} style="--value: {progress}; --totalTime: {totalTime}"></div>
    <PlayPauseButton bind:isPaused />
    {#if isPaused && progress > 0}
        <button on:click={stopTimer} class="reset">⏹️</button>
    {/if}
</div>

<style>
    #minitimer {
        position: fixed;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #82c5d1;
        border-radius: 10px;
        padding: 10px;
        display: flex;
        align-items: center;
        font-size: 22pt;
    }

    /* Adapted from https://codepen.io/alvaromontoro/pen/LYjZqzP */
    @keyframes growProgressBar {
        0%, 33% { --pgPercentage: 0; }
        100% { --pgPercentage: var(--value); }
    }

    @property --pgPercentage {
        syntax: '<number>';
        inherits: false;
        initial-value: 0;
    }

    div[role="progressbar"] {
        --size: 3rem;
        --fg: #369;
        --bg: white;
        --pgPercentage: calc(var(--value) / var(--totalTime));
        animation: growProgressBar 3s 1 forwards;
        width: var(--size);
        height: var(--size);
        border-radius: 50%;
        display: grid;
        place-items: center;
        background:
                radial-gradient(closest-side, #82c5d1 80%, transparent 83%),
                /* Add an extra 0.1% to smooth the line */
                conic-gradient(var(--fg) calc(var(--pgPercentage) * 1%), var(--bg) calc(var(--pgPercentage) * 1% + 0.5%), var(--bg) 0)
    ;
        font-family: Helvetica, Arial, sans-serif;
        font-size: calc(var(--size) / 2);
        font-weight: bold;
        color: var(--fg);
    }

    div[role="progressbar"]::before {
        counter-reset: percentage var(--value);
        content: counter(percentage);
    }
    /* end section */
</style>

<script lang="ts">
    import { onDestroy } from "svelte";
    import {link} from 'svelte-spa-router';
    import PlayPauseButton from "./PlayPauseButton.svelte";

    // This doesn't work b/c indeterminate is boolean, not singular value
    //type ToggleType<Toggle extends boolean, Truthy, Falsy=unknown> = Toggle extends true ? Falsy : Truthy;
    
    //export let props: {indeterminate?: false, progress: number, totalTime: number, isPaused: boolean} | {indeterminate: true};
    // How much time has elapsed on the clock
    export let progress = 0;
    export let totalTime = 100;
    export let isPaused = true;
    // If true, ignore previous values
    export let indeterminate = false;

    // Reference to the interval that increments/decrements the clock
    let intervalRef: number;

    function stopTimer(ev: MouseEvent) {
      ev.stopPropagation();
      ev.preventDefault();
      progress = 0;
      indeterminate = false;
      // TODO: update db
    }

    onDestroy(() => clearInterval(intervalRef));
</script>

<a href="/timer" use:link>
    <div id="minitimer">
        <!-- Accessability docs: https://www.w3.org/TR/wai-aria-1.1/#aria-valuenow TODO -->
        <div role="progressbar" class:indeterminate aria-valuenow={progress} aria-valuemin={0} aria-valuemax={totalTime} style="--value: {progress}; --totalTime: {totalTime}"></div>
        <PlayPauseButton bind:isPaused />
        {#if isPaused && progress > 0}
            <button on:click={stopTimer} class="reset">⏹️</button>
        {/if}
    </div>
</a>

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

    @keyframes spinProgressBar {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* This is needed if animating CSS variables
    @property --pgPercentage {
        syntax: '<number>';
        inherits: false;
        initial-value: 0;
    }
    */

    div[role="progressbar"].indeterminate {
        animation: spinProgressBar 2s infinite forwards linear;
        --pgPercentage: 75;
    }

    div[role="progressbar"].indeterminate::before {
        /* Rotate the inner text opposite to outer. Feels hacky, but hey, it works */
        animation: spinProgressBar 2s infinite reverse linear;
    }

    /* Adapted from https://codepen.io/alvaromontoro/pen/LYjZqzP */
    div[role="progressbar"] {
        --size: 3rem;
        --fg: #369;
        --bg: white;
        --pgPercentage: calc(var(--value) / var(--totalTime) * 100); /* Despite the name, this is not a percent unit */
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
        transform: rotate(0deg);
    }

    div[role="progressbar"]::before {
        counter-reset: percentage var(--value);
        content: counter(percentage);
        transform: rotate(0deg);
    }
    /* end section */
</style>

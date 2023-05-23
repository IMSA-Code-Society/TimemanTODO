<script lang="ts">
  import {changeTimerState, getRunningTime, getTask, TimerAction} from "../../lib/api";
  import {sharedElementTransition} from "../../lib/transitions";
  import Modal from "./Modal.svelte";
  import CourseProjectSelect from "../../lib/CourseProjectSelect.svelte";

  export let params: {task?: string};

    const [send, receive] = sharedElementTransition;
    const openTarget = new EventTarget();
    const task = getTask(params.task);
    let allocTime: number | null;
    let goal: string;
    let isRunning = false;
    $: {
      console.log(params.task, $task);
      allocTime = $task.predictedTime || null;
      goal = $task.title;
    }
    getRunningTime().then(time => console.log("Running time: ", time));

    function start() {
      isRunning = !isRunning;
      changeTimerState({action: isRunning ? TimerAction.START : TimerAction.PAUSE, time: new Date().getTime(), taskId: params.task})
    }

    function stop() {
      if (!isRunning) {
        alert("No timer is running!");
        return;
      }
      openTarget.dispatchEvent(new Event("open"));
      changeTimerState({action: TimerAction.STOP, time: new Date().getTime(), taskId: params.task})
    }
</script>

<div class="perfectCenter">
    <div id="timer" in:receive={{key: "timer"}} out:send={{key: "timer"}}>
        <div>
            <form autocomplete="off" autocorrect="off" spellcheck="false">
                <CourseProjectSelect />
                <br />
                <input placeholder="Goal" id="goal" type="text" bind:value={goal} /><br />
                <!-- Cannot be type=number b/c when any letter entered, the value becomes "", clearing the input -->
                <div style="display: flex; align-items: center;">
                    <input placeholder="Allocated Time" id="alloc" inputmode="decimal" min="0" step="any" bind:value={allocTime} on:input={allocTime = allocTime.replace(/[^1234567890]+/, '')} />
                    <button style="flex-shrink: 99; margin-right: 0; align-self: stretch;" on:click|preventDefault={() => allocTime = 25}>25</button>
                </div>
                <span id="elapsed"></span>
            </form>
            <div style="display: flex;">
                <button on:click={start} style="background: limegreen;" id="start">{isRunning ? "Pause" : "Start"}</button>
                <button on:click={stop} style="background: indianred;" id="stop">Stop</button>
            </div>
        </div>
    </div>
</div>
<Modal {openTarget} />

<style>
    #timer {
        background: conic-gradient(grey 100%, darkgrey 100%);
        border-radius: 10px;
        padding: 5px;
        margin: 10px;
        max-width: 506px;
        width: 100%;
        /* Fix junk pixels on iOS, watch for preformance: */
        /* https://stackoverflow.com/questions/9092125/how-to-debug-dynamically-loaded-javascript-with-jquery-in-the-browsers-debugg */
        transform: translateZ(0);
    }

    #timer > div {
        padding: 20px;
        background: white;
        border-radius: 10px;
    }

    :global(#timer *) {
        font-size: 18pt;
        width: 100%;
    }

    /* GLOBAL */

    :root {
        --viewheight: calc(100%  + env(safe-area-inset-bottom));
    }

    .perfectCenter {
        display: flex;
        justify-content: center;
        align-items: center;

        height: var(--viewheight);
        width: 100vw;
        position: absolute;
        left: 0;
        top: 0;
        pointer-events: none;
    }

    .perfectCenter * {
        pointer-events: all;
    }

    input, :global(select), button {
        box-sizing: border-box;
        -webkit-appearance: none;
        border: 1px solid rgb(169, 169, 169);
        border-radius: 5px;
        margin: 2px;
        background-color: white;
    }
</style>

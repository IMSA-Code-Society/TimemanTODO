<script lang="ts">
    import * as chrono from 'chrono-node';
    import {count, findMostSimilar, hwTypeVocab} from "./categorize";
    import {createTask, type Task} from "../../../lib/api";
    import TimeEstimator from "./TimeEstimator.svelte";
    import { link } from 'svelte-spa-router';
    import CorseProjectSelect from "../../../lib/CourseProjectSelect.svelte";
    import type {DbUpsert} from "../../../lib/api.js";

    export let isNew: boolean = false;

    let hasFocus = isNew;

    export let taskData: DbUpsert<Task> = {description: "", predictedTime: 0, title: "", category: "homework"};

    function autosuggest(ev) {
        const assignment = ev.target.value;
        taskData.title = assignment;
        let [hwCat, confidence] = findMostSimilar(assignment, hwTypeVocab);
        // 'homework' synonyms
        if (hwCat === 'worksheet') hwCat = 'homework';
        if (hwCat === 'research') hwCat = 'read';
        if (confidence > 0.7) {
            console.log(hwCat);
            taskData.category = hwCat;
            console.log("priority:", Math.min(count(assignment, /!/g), 3));
        }

        // Date input can't handle Date objects ironically, so I'm using this SO workaround: https://stackoverflow.com/a/29774197
        let parsedDate =  chrono.parseDate(assignment, new Date());
        if (parsedDate) {
            const offset = parsedDate.getTimezoneOffset();
            parsedDate = new Date(parsedDate.getTime() - (offset * 60 * 1000));
            taskData.due = parsedDate.toISOString().split('T')[0];
        }
    }

    // Called when user clicks outside this Task, which means it should stop editing & save changes
    function checkUnfocus(ev: FocusEvent) {
        hasFocus = hasFocus && (ev.currentTarget as HTMLElement).contains(ev.relatedTarget as HTMLElement);
        if (!hasFocus)
          submitOrUpdate();
    }

    // Called when user clicks within this Task, which means it should enable editing
    function checkFocus(ev: FocusEvent) {
        hasFocus = hasFocus || ev.target instanceof HTMLSelectElement ||
            (ev.target instanceof HTMLInputElement && ev.target.getAttribute('type') === 'text');
    }

    // Called whenever a Task is created or updated. Saves & syncs changes. Creates new Task entry if it doesn't already exist
    function submitOrUpdate() {
      createTask(taskData);
    }
</script>

<div id="task" class="reset" hasfocus={hasFocus || isNew} on:focusin={checkFocus} on:focusout={checkUnfocus}>
    <div class="flex">
        {#if isNew}
            <div>+</div>
        {:else}
            <input type="checkbox" class="checkbox" />
            <a href="/timer/{taskData.$id}" use:link><button>▶️</button></a>
        {/if}
        <input style="flex-grow: 99" type="text" on:input={autosuggest} value={taskData.title} placeholder={isNew ? "New task" : "Task title"} />
        <TimeEstimator bind:value={taskData.predictedTime} />
    </div>
    <div class="flex" style="gap: 0.25em">
        <select bind:value={taskData.category}>
            {#each hwTypeVocab as hwType}
                <option>{hwType}</option>
            {/each}
        </select>
        <CorseProjectSelect bind:value={taskData.projectId} />
        <input type="date" style="height: 1em" bind:value={taskData.due} />
    </div>
</div>

<style>
    #task {
        border: 1px solid rgb(96, 118, 181);
        border-radius: 8px;
        margin: 10px;
        background-color: #caedf3;
        padding: 5px;
    }

    .flex {
        display: flex;
        align-items: baseline;
    }

    select {
        line-height: 1.2;
        color: rgb(0, 0, 0);
        padding-left: 10px;
        border-radius: 50px;
        /*transition: 200ms;  Embrace the problem instead of trying to eliminate it */
    }

    select:focus {
        outline: none;
        background-color: rgb(64, 128, 167);
    }
    option:not(:checked) { background: rgb(64, 128, 167); }

    #task[hasfocus=true] select {
        /*appearance: revert;*/
        border: 1px solid grey;
        color: black;
    }

    .checkbox {
        /* TODO: style better later */
        appearance: auto;
    }
</style>

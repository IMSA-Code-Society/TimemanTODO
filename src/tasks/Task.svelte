<script lang="ts">
    import {count, findMostSimilar, hwTypeVocab} from "./categorize";
    import {createTask, Task} from "../api";

    export let isNew: boolean = false;

    let hasFocus = isNew;

    // Bound variables that get submitted
    let taskData: Task = {
      category: "homework",
      description: "",
      due: undefined,
      predictedTime: 0,
      projectId: 0,
      title: "New task",
    }
    let categoryName = 'homework';

    function autosuggest(ev) {
        const assignment = ev.target.value;
        let [hwCat, confidence] = findMostSimilar(assignment, hwTypeVocab);
        // 'homework' synonyms
        if (hwCat === 'worksheet') hwCat = 'homework';
        if (hwCat === 'research') hwCat = 'read';
        if (confidence > 0.7) {
            console.log(hwCat);
            categoryName = hwCat;
            console.log("priority:", Math.min(count(assignment, /!/g), 3));
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
      if (isNew)
        createTask(taskData);
      else
        console.error("Not implemented yet!");
    }
</script>

<div id="task" class="reset" hasfocus={hasFocus || isNew} on:focusin={checkFocus} on:focusout={checkUnfocus}>
    <div class="flex">
        {#if isNew}
            <div>+</div>
        {:else}
            <input type="checkbox"/>
            <button>Go</button>
        {/if}
        <input style="flex-grow: 99" type="text" on:input={autosuggest} bind:value={taskData.title} />
        <button>1</button>
        <button>2</button>
        <button>3</button>
        <button>4</button>
        <button>5</button>
    </div>
    <div class="flex">
        <select bind:value={categoryName}>
            {#each hwTypeVocab as hwType}
                <option>{hwType}</option>
            {/each}
        </select>
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
</style>

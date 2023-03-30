<script lang="ts">
    import {count, findMostSimilar, hwTypeVocab} from "./categorize.js";

    export let isNew: boolean = false;

    let hasFocus = isNew;
    let taskContainer;
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
    function checkUnfocus(ev) {
        hasFocus = hasFocus && taskContainer.contains(ev.relatedTarget);
    }

    function checkFocus(ev) {
        hasFocus = hasFocus || ev.target instanceof HTMLSelectElement ||
            (ev.target instanceof HTMLInputElement && ev.target.getAttribute('type') === 'text');
    }
</script>

<div id="task" class="reset" hasfocus={hasFocus || isNew} on:focusin={checkFocus} on:focusout={checkUnfocus} bind:this={taskContainer}>
    <div class="flex">
        {#if isNew}
            <div>+</div>
        {:else}
            <input type="checkbox"/>
            <button>Go</button>
        {/if}
        <input style="flex-grow: 99" type="text" on:input={autosuggest} />
        <button>1</button>
        <button>2</button>
        <button>3</button>
        <button>4</button>
        <button>5</button>
    </div>
    <div class="flex">
        <select bind:value = {categoryName}>
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

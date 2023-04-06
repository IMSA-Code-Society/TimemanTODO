<script lang="ts">
    import Task from "./Task.svelte";
    import TimePeriod from "../../../lib/TimePeriod";

    export let due: TimePeriod;
    export let tasks: Task[];
</script>

<div style="background-color: #82c5d1; padding: 5px; border-radius: 12px; margin: 5px">{TimePeriod[due]}</div>

{#each tasks as task}
    <Task taskData={task} />
{/each}

<style>

</style>

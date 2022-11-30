<script>
    import Task from "./Task.svelte";
    export let due; //* today, tomorrow, week, later
</script>

<div style="background-color: lightgrey; padding: 2px">{due}</div>
<Task/>
<script>
    import Task from "./Task.svelte";
    export let due; //* today, tomorrow, week, later
</script>

<div style="background-color: #82c5d1; padding: 5px; border-radius: 12px; margin: 5px">{due}</div>

<Task/>

<style>
    
</style>
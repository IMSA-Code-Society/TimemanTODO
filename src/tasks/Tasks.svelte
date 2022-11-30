<script>
    import TaskSection from "./TaskSection.svelte";
    import Task from "./Task.svelte";
</script>

<Task isNew={true} />
<TaskSection due="today" />
<TaskSection due="tomorrow" />
<TaskSection due="week" />
<TaskSection due="later" />
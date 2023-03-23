<script>
    import TaskSection from "./TaskSection.svelte";
    import Task from "./Task.svelte";
    import {getAllTasks} from "../api";

    let tasks = getAllTasks();
</script>

<Task isNew={true} />
<TaskSection due="today" />
<TaskSection due="tomorrow" />
<TaskSection due="week" />
<TaskSection due="later" />

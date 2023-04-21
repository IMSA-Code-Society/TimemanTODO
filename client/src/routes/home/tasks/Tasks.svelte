<script lang="ts">
    import TaskSection from "./TaskSection.svelte";
    import Task from "./Task.svelte";
    import {getAllTasks} from "../../../lib/api";
    import {DAY, MILLISECOND} from "../../../lib/Units";
    import TimePeriod from "../../../lib/TimePeriod";

    export let currentTab: number = -1;

    let tasks = getAllTasks();
    // Mapping of tasks split up by time. Maps "today", "tomorrow", etc. to their respective tasks
    const timeSections = tasks.then(tasks => {
      const timeSections = [...Array(Object.keys(TimePeriod).length / 2)].map(() => [] as typeof tasks);
      for (const task of tasks) {
        // Midnight today (in the past, not future)
        const today = new Date().setHours(0, 0, 0, 0) * MILLISECOND;
        const due = task.due * MILLISECOND;
        if (due < today)
          timeSections[TimePeriod.Overdue].push(task);
        else if (due < today + DAY)
          timeSections[TimePeriod.Today].push(task);
        else if (due < today + 2 * DAY)
          timeSections[TimePeriod.Tomorrow].push(task);
        else if (due < today + 7 * DAY)
          timeSections[TimePeriod.Tomorrow].push(task);
        else
          timeSections[TimePeriod.Later].push(task);
      }
      return timeSections;
    });
</script>

<div style="padding-bottom: 78px">
  <Task isNew={true} />
  {#await timeSections then timeSections}
      {#each timeSections as tasks, timePeriod}
          <TaskSection due={timePeriod} tasks={currentTab == -1 ?tasks : tasks.filter(task => task.projectId == currentTab)} />
      {/each}
  {/await}
</div>

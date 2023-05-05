<script lang="ts">
  import {db, Table} from "./api";

    const allProjects = db.asSvelteStore({selector: {table: Table.PROJECT}});

    export let value: number;
</script>

{#await $allProjects then allProjects}
    <select bind:value>
        {#each allProjects as project}
            <option value={project.id}>{project.name}</option>
        {/each}
    </select>
{/await}

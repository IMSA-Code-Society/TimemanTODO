<script lang="ts">
    import {getAllCoursesAndProjects} from "./api";

    export let value: number;
</script>

{#await getAllCoursesAndProjects() then allProjects}
    <select bind:value>
        {#each allProjects as project}
            <option name={project.id}>{project.name}</option>
        {/each}
    </select>
{/await}

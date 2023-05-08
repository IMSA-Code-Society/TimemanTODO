<script lang="ts">
    import {getAllCoursesAndProjects} from "./api";

    const allProjects = getAllCoursesAndProjects();

    export let value: number;
</script>

{#await $allProjects then allProjects}
    <select bind:value>
        {#each allProjects as project}
            <option value={project.id}>{project.name}</option>
        {/each}
    </select>
{/await}

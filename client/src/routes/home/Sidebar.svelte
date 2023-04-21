<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
<script lang="ts">
    import { createProject, getAllProjects, createCourse, getAllCourses} from "../../lib/api";
    import {link} from 'svelte-spa-router';

    // Which project or course to view
    let currentTab: number;

    function newProj() {
        createProject({id: null, name: prompt("Name your project"), owner: 1});
    }

    function newCourse(){
        createCourse({id: null, name: prompt("Name your class"), owner: 1});
    }
</script>
<div class="container">
    <div class="sidebar">
        <h1>Sidebar</h1>
        <br/>
        <button on:click={() => currentTab = -1}>All</button>
        <br><br>
        <h3>Classes</h3>
        <ul class = "courseProjectList">
            {#await getAllCourses() then allCourses}
                {#each allCourses as course}
                    <li><button class="courseProjectButton" on:click={() => currentTab = course.id}><i class="fa fa-book"></i> {course.name}</button></li>
                {/each}
            {/await}
            <li><button class="courseProjectButton" on:click={newCourse}> <i class="fa fa-plus"></i> New Class</button></li>
        </ul>
        <hr>
        <br>
        <h3>Projects</h3>
        <ul class = "courseProjectList">
            {#await getAllProjects() then allProjects}
                {#each allProjects as project}
                    <li><button class="courseProjectButton" on:click={() => currentTab = project.id}>{project.name}</button></li>
                {/each}
            {/await}
            <li><button class="courseProjectButton" on:click={newProj}>Add Project</button></li>
        </ul>
        <a href="/login" use:link><button class="courseProjectButton">Login</button></a>
    </div>
    <div class="other"><slot {currentTab}></slot></div>
</div>

<style>
    .container {
        margin: auto;
        display: flex;
    }
    .sidebar{
        display: flex;
        flex: 1;
        padding: 15px;
        flex-direction: column;
        align-self: flex-start;
        background-color: rgb(159, 159, 159); /* or yellow? #fff689 */
        min-height: 100vh;
    }
    .other{
        flex: 6;
        flex-direction: column;
        display: flex;
        overflow: auto;
        height: 100vh;
    }
    hr{
        height: 3px;
        width: 100%;
        border-width: 0;
        background-color: black;
    }
    .courseProjectButton{
        font-size:15px;
        border-radius: 5px;
        background-color:lightblue;
        border:none;
        margin:5px;
    }
    .courseProjectList{
        list-style:none;
        margin:auto;
    }
</style>

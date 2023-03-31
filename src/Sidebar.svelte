<style>

    .container {
        margin: auto;
        font-family: sans-serif;
        display:flex;
    }
    .sidebar{
        display: flex;
        flex:2;
        padding: 15px;
        flex-direction: column;
        align-self:flex-start;
        background-color:rgb(159, 159, 159);
        min-height: 100vh;
    }
    .other{
        flex:12;
        flex-direction: column;
        display: flex;
    }
    hr{
        height:3px;
        width:100%;
        border-width:0;
        background-color:black;
    }
</style>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
<script lang="ts">
    import { createProject, getAllProjects, createCourse, getAllCourses} from "./api";

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
        <br><br>
        <h3>Classes</h3>
        <ul>
            {#await getAllCourses() then allCourses}
                {#each allCourses as course}
                    <li><i class="fa fa-book"></i> {course.name}</li>
                {/each}
            {/await}
            <li><button on:click={newCourse}> <i class="fa fa-plus"></i> New Class</button></li>
        </ul>
        <hr>
        <br>
        <h3>Projects</h3>
        <ul>
            {#await getAllProjects() then allProjects}
                {#each allProjects as project}
                    <li>{project.name}</li>
                {/each}
            {/await}
            <li><button on:click={newProj}>Add Project</button></li>
        </ul>
    </div>
    <div class="other"><slot></slot></div>
</div>

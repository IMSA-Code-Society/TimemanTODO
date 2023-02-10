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
<div class="container">
    <div class="sidebar">
        <h1>Sidebar</h1>
        <br><br>
        <h3>Classes</h3>
        <ul>
            <li><i class="fa fa-folder"></i> Class 1</li>
            <li><i class="fa fa-folder"></i> Class 2</li>
            <li><i class="fa fa-folder"></i> Class 3</li>
            <li><i class="fa fa-plus"></i> New Class</li>
        </ul>
        <br>
        <hr>
        <br>
        <h3>Projects</h3>
        <ul>
            <li>Thing</li>
            <li>Thing</li>
            <li>Thing</li>
        </ul>
    </div>
    <div class="other"><slot></slot></div>
</div>

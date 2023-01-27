<style>
    
    .container {
        margin: auto;
        font-family: sans-serif;
        display:flex;
    }
    .sidebar{
        display: flex;
        flex:1;
        padding: 5px;
        flex-direction: column;
        align-self:flex-start;
    }
    .other{
        flex:3;
        flex-direction: column;
        display: flex;
    }
</style>
<div class="container">
    <div class="sidebar">
        <h1>Sidebar</h1>
        <br><br>
        <h3>Projects</h3>
        <!-- Add actual functionality for this later-->
        <ul>
            <li>Thing</li>
            <li>Thing</li>
            <li>Thing</li>
        </ul>
    </div>
    <div class="other"><slot></slot></div>
</div>

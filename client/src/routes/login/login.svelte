<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
<style>
    /*This sections needs more css/fonts*/
    .loginBox{
        background-color:lightblue;
        text-align:center;
        width:50%;
        border-radius:25px;
        padding:25px;
        margin:auto;
    }
    body{
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .back{
        position:absolute;
        top:0;
        left:0;
        padding:10px;
        margin:5px;
        font-size:25px;
        background-color:lightblue;
    }
</style>
<body>
    <!--- This back button is currently functionless, and this back icon dosen't really fit--->
    <button class="back"><i class="fa fa-arrow-left"></i></button>
    <div class="loginBox center">
        <h1>Login</h1>
        <form>
            <label for="uname">Username</label><br>
            <input type="text" id="uname"><br><br>
            <label for="pass">Password</label><br>
            <input type="password" id="pass"><br><br>
            <input type="submit" value="Login">
        </form>
        
    </div>
</body>


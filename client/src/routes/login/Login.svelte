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
        background-color: rgb(236, 236, 236);
    }
    .back{
        position:absolute;
        top:0;
        left:0;
        padding:10px 25px;
        margin:5px;
        font-size:25px;
        border-radius: 5px;
        background-color:lightblue;
        border:none;
    }
</style>
<body>
    <a class="loginButton" href="" use:link><button class="back"><i class="fa fa-arrow-left"></i></button> </a>
    <div class="loginBox center">
        <h1>Login</h1>
        <form action="">
            <label for="uname">Username</label><br>
            <input type="text" id="uname"><br><br>
            <label for="pass">Password</label><br>
            <input type="password" id="pass"><br><br>
            <input type="submit" value="Login">
        </form>
        
    </div>
</body>


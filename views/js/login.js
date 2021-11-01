window.onload = function(){

    document.getElementById("login_button").addEventListener("click", function(){
        document.getElementById("login_button").innerHTML = ` <i class="fa fa-spinner fa-spin"></i>`;
        if(document.getElementById("email").value == "" || document.getElementById("password").value == ""){
            document.getElementById("login_button").innerHTML = 'Login' ;
        }
        setTimeout(function() {
            document.getElementById("login_button").innerHTML = 'Login' ;
        },2500)
    })

    if(document.getElementById("message").innerHTML === "Incorrect Email or password"){
        document.getElementById("message").innerHTML = ` <i class="fas fa-exclamation-triangle"</i> Incorrect Email or password`;
    }
}
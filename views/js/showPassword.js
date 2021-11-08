window.onload = function(){          //show password after user's clicks the eye icon
    document.getElementById("eye").addEventListener("click", function(){
        let eye = document.getElementById("password");
        if(eye.type === "password"){
            eye.type = "text";
        }else{
            eye.type = "password";
        }
    });
}

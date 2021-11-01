window.onload = function(){
    document.getElementById("eye").addEventListener("click", function(){
        let eye = document.getElementById("password");
        if(eye.type === "password"){
            eye.type = "text";
        }else{
            eye.type = "password";
        }
    });
}

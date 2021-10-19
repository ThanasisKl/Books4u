window.onload =  function(){
    document.getElementById("logout").addEventListener("click", async function(){
        console.log("click");
        localStorage.clear();
    })
}
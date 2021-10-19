window.onload = function(){
    let book = localStorage.getItem("book"); // get author and title from local storage
    let id = localStorage.getItem("id");  //get book id from local storage
    // localStorage.clear();        //clear local storage

    let h2 = document.getElementById("book_id");
    h2.innerHTML = `<span>Processing:</span> ${book}`;

    changeTitleAuthor(id); 
}

function changeTitleAuthor(id){
    
    document.getElementById("submit").addEventListener("click", async function(){ //event listener to submit button
        let newTitleAuthor = document.getElementById("new").value;
        var responseJSON;
        if (newTitleAuthor.trim() === ""){ //if user dont put some change dont  change title and author to ""
            newTitleAuthor=null;
        }
        responseJSON = {
            method: 'PUT',
            mode: 'cors', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: parseInt(id),
                title_auth: newTitleAuthor,
                comments:document.getElementById("com").value
            })
        };
        
        console.log(responseJSON.body);
        let email = localStorage.getItem("Email");
        let response = await fetch('http://localhost:3000/home/booksList/bookProcess/proccess/'+ email,responseJSON); //update
        if(response.ok){
            let statusResponse = await response.json();
            console.log("UPDATED");
        }
        
    })
}

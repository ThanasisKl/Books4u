window.onload = function(){
    getAllBooks(false);   //finds all saved books
    document.getElementById("filter").addEventListener('keyup',function(){ //filter saved books
        setTimeout(function() {
            getAllBooks(true);
        }, 500);
    });    
}


async function getAllBooks(flag){ //
    let responseJSON = {
        method: 'GET',
        mode: 'cors', 
        headers: {
          'Content-Type': 'application/json'
        }
    };
    const email = localStorage.getItem('Email');
    let response = await fetch('http://localhost:3000/home/booksList/saved_books/'+ email,responseJSON);
    if(response.ok){
        let statusResponse = await response.json();
        var books = '{"fav_books" : []}';
        const JSONobj = JSON.parse(books);
        for(let i=0;i<statusResponse.length;i++){
            if (flag){ //prints the saved books that match filter
                if(statusResponse[i].title_auth.includes(document.getElementById("filter").value)){
                    JSONobj["fav_books"].push(statusResponse[i]);
                } 
            }else{  //prints all the saved books
                JSONobj["fav_books"].push(statusResponse[i]);
            }            
        }
        var source   = document.getElementById('text-template').innerHTML;
        var template = Handlebars.compile(source);       //handlebars
        var html = template(JSONobj);
        let li = document.getElementById('search_results') ;
        li.innerHTML = html;
        createListeners2DelButtons();
        createListeners2ProcButtons();
    }
}

function createListeners2DelButtons(){  //creates event listenrs to all the buttons
    let elements = document.getElementsByClassName("delete");
    for (var i = 0; i < elements.length; i++) {
        elements[i].addEventListener('click',function(){
            deleteBook(this.id);
        });
    }
}

async function deleteBook(bookid){ //deletes a book

    let responseJSON = {
        method: 'DELETE',
        mode: 'cors', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: parseInt(bookid)
        })
    };

    const email = localStorage.getItem('Email');
    let response = await fetch('http://localhost:3000/home/deleteBook/'+ email,responseJSON);
    if(response.ok){
        let statusResponse = await response.json();
        console.log("DELETED id:"+bookid);

        let div = document.getElementById(bookid+"div");
        setTimeout(function(){div.innerHTML = "";},500);
    }
}

function createListeners2ProcButtons(){ //creates event listeners to all the process button
    let elements = document.getElementsByClassName("process");
    for (var i = 0; i < elements.length; i++) {
        elements[i].addEventListener('click',function(){
            
            let linkid = this.id;
            var pos = linkid.search("a");        // linkid : 12345a
            let bookid = linkid.slice(0,pos);    // bookid : 12345
            localStorage.setItem("book",document.getElementById(bookid+'_').textContent) //local storage is used to communicate with the other page
            localStorage.setItem("id",bookid);
        });
    }
}

function findEmail(){
    return document.getElementById("email").innerHTML;
}

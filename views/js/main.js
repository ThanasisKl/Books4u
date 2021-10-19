window.onload = function(){

    if(document.getElementById("email").innerHTML !==""){
        localStorage.setItem('Email', document.getElementById("email").innerHTML);
        document.getElementById("email").innerHTML;
        document.getElementById("email").innerHTML = "";
    }
    

    document.getElementById("button").addEventListener("click", function(){
        let keyword = document.getElementById("search").value;
        if(keyword.trim()!==""){      //search for a book
            let url ="https://reststop.randomhouse.com/resources/works?search="+keyword
            console.log(`Searching ${url}`);
            getFetch(url)
            .then(data => data.json())
            .then(data => {
                try{
                    // console.log(data);
                    for(var i = 0; i < data.work.length; i++) {  //for every work
                        var source   = document.getElementById('text-template').innerHTML;
                        var template = Handlebars.compile(source);
                        var html = template(data);
                        let li = document.getElementById('search_results') ;
                        li.innerHTML = html;
                    }
                    createListeners2Buttons();            //creates event listeners to every save buttons
                }catch(err){                               //No results for the search   
                    document.getElementById("search_results").innerHTML = "<h2>No Results</h2>"
                }
            })
            .catch(err => {           //bad http code status
                console.log(err);
            })
        }else{    //search for author books
            keyword = document.getElementById("search2").value;
            if(keyword.trim()!==""){
                let url = "https://reststop.randomhouse.com/resources/authors?lastName="+keyword;
                console.log(`Searching ${url}`);
                getFetch(url)
                .then(data => data.json())
                .then(data => {
                    let work_ids;
                    try{
                        work_ids = findWorkIds(data);  //stores all workids from authors
                        var search = '{"results_list" : []}';
                        const obj = JSON.parse(search);
                        // console.log("->>>"+work_ids.length);
                        for(var x = 0; x < work_ids.length; x++) {
                            url = "https://reststop.randomhouse.com/resources/works/"+work_ids[x];
                            getFetch(url)
                            .then(data => data.json())
                            .then(data => {
                                // console.log(data.workid);
                                obj["results_list"].push({"search": data.titleAuth,"id":data.workid});//stores title,author,workids
                            })
                            .catch(err => {           //bad http code status
                                console.log(err);
                            })
                            
                        }   

                        setTimeout(function() {
                            var source   = document.getElementById('text-template2').innerHTML;
                            var template = Handlebars.compile(source);
                            var html = template(obj);
                            let li = document.getElementById('search_results') ;
                            li.innerHTML = html;
                            if(work_ids.length === 0){
                                document.getElementById("search_results").innerHTML = "<h2>No Results</h2>"
                            }
                            createListeners2Buttons();  //creates event listeners to every save buttons
                        }, 3000);
                        
                    }catch(err){ 
                        console.log(error);
                    }
                })
                .catch(err => {           //bad http code status
                    console.log(err);
                })
            }else{
                console.log("Empty Fields");  //searching without input
            }
        }
    });
}

async function getFetch(url){
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });
    return response;
}

function findWorkIds(data){ //stores all workids from authors
    work_ids = [];
    for(var i = 0; i < data.author.length; i++) {
        if(data.author[i].works!==null){
            if(Array.isArray(data.author[i].works.works)){
                for(var j = 0; j < data.author[i].works.works.length; j++){
                    work_ids.push(data.author[i].works.works[j]);
                }
            }else{
                work_ids.push(data.author[i].works.works);
            }
            
        }
    }
    return work_ids;
}

function createListeners2Buttons(){ //creates event listeners to every save buttons
    let elements = document.getElementsByClassName("save");
    for (var i = 0; i < elements.length; i++) {
        elements[i].addEventListener('click',function(){
            let x = document.getElementById(this.id+'_');
            saveBook(this.id,x.textContent);
        });
    }
}

async function saveBook(bookid,titleAuth){
let responseJSON = {
    method: 'POST',
    mode: 'cors', 
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: parseInt(bookid),
      title_auth :titleAuth
    })
  };
  let email = findEmail();
  let response = await fetch('http://localhost:3000/home/saveBook/'+email,responseJSON);
  if(response.ok){
      let statusResponse = await response.json();
      let div = document.getElementById(bookid+"d");
      div.innerHTML = `<button id=${bookid+"dbtn"} class="delete">Delete</button>`
      let btn = document.getElementById(bookid+"dbtn");
      console.log("Book: "+bookid+" saved");
      createListeners2DelButtons(bookid);
  }else{
      console.log("Already saved");
      let p = document.getElementById(bookid+"p");
      p.innerHTML = "Already Saved";
      setTimeout(function(){p.innerHTML = "";},1500);  //Already Saved message appears for 1.5 sec in the screen and then disappears
  }
}


function createListeners2DelButtons(bookid){ //creates event listeners to every delete buttons
    let delButtonID = bookid+"dbtn";
    let delButton = document.getElementById(delButtonID);
    delButton.addEventListener('click',function(){
            deleteBook(delButtonID);
    });
}

async function deleteBook(bookid){  //delete a book from saves 

    var pos = bookid.search("d"); // bookid : 12345dbtn
    id = bookid.slice(0,pos);    // id : 12345
  
    let responseJSON = {
        method: 'DELETE',
        mode: 'cors', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: parseInt(id)
        })
    };
 

    let response = await fetch('http://localhost:3000/home/deleteBook/'+ findEmail(),responseJSON);
    if(response.ok){
        let div = document.getElementById(id+"d"); ;
        div.innerHTML = " "; // delete button delete after deletion
        console.log("Book: "+id+" deleted");
    }
}

function findEmail(){
    return localStorage.getItem('Email');
}
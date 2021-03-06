const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const User = require('./models/user');
const mongoose = require('mongoose');
const path = require('path');
var nodemailer = require('nodemailer');

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.set("view engine","ejs");
const users = []

mongoose.connect('mongodb://127.0.0.1:27017/users4books', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log("MONGO CONNECTION OPEN")
})
.catch(err => {
    console.log("***MONGO CONNECTION ERROR***")
    console.log(err)
})

app.get("/", function (req, res) {
  res.render("ejs/login.ejs");
});

app.get('/home',function(req,res){
  res.render("ejs/home.ejs",{name:"", email:""}); 
 });

app.get('/register',function(req,res){
  res.render("ejs/register.ejs"); 
 });
 
app.get('/home/booksList',function(req,res){
  res.render("ejs/booksList.ejs"); 
});

app.get('/home/booksList/bookProcess',function(req,res){
  res.render("ejs/bookProcess.ejs"); 
});

app.get('/users', (req, res) => { //get all books from user
  console.log("GET request get all books");
  User.find({})
  .then(saved_books => {
      res.status(200).json(saved_books)
  })
  .catch( () =>{
    res.status(404).json({
      msg:"Error from database (find all books)"
    });
  })
})

app.post('/users', async (req, res) => {//add a user to database
  console.log("POST request add user")
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = {
      name:req.body.name,
      surname:req.body.surname,
      email:req.body.email,
      password:hashedPassword,
      books:req.body.books,
    };
    User.find({email: { $eq: newUser.email }})
    .then(user => {
        if (user==""){
            User.insertMany(newUser);
            sendEmail(newUser.email,newUser.name);
            res.render("ejs/login.ejs",{message:"Login to the account that you just created"});
        }else{
            res.status(400).json({
                msg: `User with email of ${newUser.email} already exists`
            });
        }
    })
    .catch(()=>{
        res.status(404).json({
            msg:"Error from database (add a user)"
        });
    })
  } catch(err) {
    console.log(err);
    res.status(500).send()
  }
})

app.post('/home', async (req, res)=> {  //login check
  User.findOne({email: { $eq: req.body.email }})
  .then(user => {
    if (user==null){
      return res.status(400).json({
        msg: "No such user exists"
        });
    }
    
    try {
    bcrypt.compare(req.body.password, user.toObject().password)
    .then(result=>{
      if(result){
        res.render("ejs/home.ejs",{name:user.toObject().name, email:user.toObject().email});
      }else{
        res.render("ejs/login.ejs",{message:"Incorrect Email or password"});
      }
    })
    }catch (err){
      res.status(500).send()
    }
})
.catch(()=>{
  res.status(404).json({
      msg:"Error from database (login)"
  });
})
})

app.post('/home/saveBook/:email',(req,res)=>{ //save a user's book to database
  console.log("Post request add book")
  const newBook = {
    title_auth: req.body.title_auth,
    id: req.body.id,
    comments : ""
  };

  User.updateOne({email: { $eq: req.params.email }}, { "$push": { "books": newBook } })
    .then(user => {
        if (user.modifiedCount!==1){
          res.status(404).json({
            msg:`Book Not Saved (user don't exists) (${newBook.id})`
          });;
        }else{
          res.status(200).json({
            msg:`Book Saved (${newBook.id})`
          });
        }
    })
    .catch(()=>{
        res.status(404).json({
            msg:"Error from database (add a user)"
        });
    })
});

app.delete('/home/deleteBook/:email',(req,res)=>{//delete a user's book from database
  console.log("Delete request delete book")
  User.updateOne({email: { $eq: req.params.email }}, { "$pull": { "books": {id:req.body.id}}} )
    .then(user => {
        if (user.modifiedCount!==1){
          res.status(400).json({
            msg:`Book Not Deleted (${req.body.id})`
          });;
        }else{
          res.status(200).json({
            msg:`Book Deleted (${req.body.id})`
          });
        }
    })
    .catch(()=>{
        res.status(404).json({
            msg:"Error from database (delete a book)"
        });
    })
});

app.get('/home/booksList/saved_books/:email',(req,res)=>{   //get all user's books
  User.findOne({email: { $eq: req.params.email }})
  .then(user =>{
      if(user ==""){
        res.status(404);
      }else{
        res.status(200).json(user.toObject().books)
      }
  });
})

app.put('/home/booksList/bookProcess/proccess/:email',(req,res)=>{ //proccess a user's book

  let title;
  let comment;

  User.findOne({email: { $eq: req.params.email }})
  .then(user =>{
    const books = user.toObject().books;
    const book = books.find(element => element.id == req.body.id);
    if(req.body.title_auth != null){
      title = req.body.title_auth;
    }else{
      title = book.title_auth;
    }
    
    if(req.body.comments == "Add some comments for the Book."){
      comment = book.comments;
    }else{
      comment = req.body.comments;
    }

   const newBook = {
      title_auth: title,
      id: req.body.id,
      comments : comment
    }

    User.updateOne({email: { $eq: req.params.email }}, { "$pull": { "books": {id:req.body.id}}} )
    .then(()=>{
      User.updateOne({email: { $eq: req.params.email }}, { "$push": { "books": newBook } })
      .then(()=>{
          res.status(200).json({
            msg:`Updated (${req.body.id})`
          });
      });
    })
  })
})

function sendEmail(email,name){       // sends an email to user after registration
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'books4ubot@gmail.com',
      pass: 'hjhbfgxdrqdyisuw'
    }
  });
  
  var mailOptions = {
    from: 'books4ubot@gmail.com',
    to: email,
    subject: 'Registration Complete',
    text: `Welcome to Books4u ${name}!`
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

}

app.use(express.static(path.join(__dirname,'views')));

app.listen(3000,() => console.log('listening at port 3000'));

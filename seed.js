const mongoose = require('mongoose');
const Book = require('./models/user');

mongoose.connect('mongodb://127.0.0.1:27017/users4books', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN")
    })
    .catch(err => {
        console.log("***MONGO CONNECTION ERROR***")
        console.log(err)
    })


const seedBooks = [
    {
        name:"thanasis",
        surname:"klettas",
        email:"thanasis@gmail.com",
        password:"1234567",
        books:[
            {
                title_auth: 'test',
                id: 1,
                comments: 'Nice Book'
            },
            {
                title_auth: 'test2',
                id: 2,
                comments: 'Nice Ending'
            },
            {
                title_auth: 'test3',
                id: 3,
                comments: 'lol'
            }
        ]
    },
    {
        name:"than",
        surname:"klet",
        email:"than@gmail.com",
        password:"1234567",
        books:[
            {
                title_auth: 'test',
                id: 1,
                comments: 'Nice Book'
            },
            {
                title_auth: 'test2',
                id: 2,
                comments: 'Nice Ending'
            },
            {
                title_auth: 'test3',
                id: 3,
                comments: 'lol'
            }
        ]
    }
]

Book.insertMany(seedBooks)
.then(res => {
    console.log(res)
})
.catch(e => {
    console.log(e)
})
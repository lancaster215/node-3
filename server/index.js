const express = require('express')
const massive = require('massive')
const jwt = require('jsonwebtoken');
const secret = require('../secret.js');
const users = require('./controllers/users.js')

massive({
    host: 'localhost',
    port: 5432,
    database: 'node3',
    user: 'postgres',
    password: 'node3db',
}).then(db => {
    const app = express()
    app.set('db', db);
    app.use(express.json());
    const port = 4001;
    
    app.post('/api/users', users.create)
    app.get('/api/users', users.list)
    app.get('/api/users/:id', users.getById)
    app.get('/api/users/:id/profile', users.getProfile)
    
    app.post('/api/login', users.login)
    app.get('/api/protected/data', 
        function(req, res){
            if(!req.headers.authorization){
                return res.status(401).end();
            }

            try{
                const token = req.headers.authorization.split(' ')[1];
                jwt.verify(token, secret);
                res.status(200).json({ data: 'here is the protected data.'});
            }catch(err){
                console.error(err)
                res.status(500).end()
            }
            
    })

    app.post('/api/posts', users.createPost) //user post
    app.get('/api/posts/:userId', users.getPostId) // get specific post
    app.get('/api/posts', users.getPost) //get all posts
    app.patch('/api/posts/update/:id', users.updatePost) //update post

    app.post('/api/comments', users.createComment)
    app.patch('/api/comments/update/:id', users.updateComment)
    app.listen(port, err =>{
        if(err){
            console.log(`Unable to d(-_-)b to Port ${port}`)
        }
        console.log(`Listening to Port ${port}`)
    })
}).catch(console.error);
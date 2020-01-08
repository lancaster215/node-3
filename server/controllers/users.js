const argon2 = require('argon2');
const secret = require('../../secret.js');
const jwt = require('jsonwebtoken');

module.exports = {
    create: (req, res) => {
        const db = req.app.get('db')
        const { email, password } = req.body;
        const { about, thumbnail } = req.body;

        argon2
            .hash(password)
            .then(hash => {
                return db.users.insert({
                    email,
                    password: hash,
                    user_profiles: [
                        {
                            userId: undefined,
                            about,
                            thumbnail,
                        },
                    ],
                },{
                    deepInsert: true,
                },{
                    fields: ['id', 'email', 'password', 'about', 'thumbnail']
                });
            })
            .then(user => {
                const token = jwt.sign({ userId: user.id }, secret)
                res.status(201).json({ ...user,token })
            })
            .catch(err =>{
                console.error(err)
                res.status(500).end()
            })
    },
    login: (req, res) => {
        const db = req.app.get('db');
        const { email, password } = req.body;

        db.users
            .findOne({
                email,
            },{
                fields: ['id', 'email', 'password'],
            })
            .then(user => {
                if(!user){
                    throw new Error('Invalid email')
                }
                return argon2.verify(user.password, password).then(valid =>{
                    if(!valid){
                        throw new Error('Incorrect password')
                    }

                    const token = jwt.sign({ userId: user.id }, secret)
                    // delete user.password;
                    res.status(200).json({ ...user, token })
                })
            })
            .catch(err =>{
                if(['Invalid username', 'Incorrect password'].includes(err.message)){
                    res.status(400).json({ error: err.message})
                }else{
                    console.log(err)
                    res.status(500).end()
                }
            })
    },
    list: (req, res) =>{
        const db = req.app.get('db');

        db.users
        .find()
        .then(users => res.status(200).json(users))
        .catch(err => {
            console.error(err);
            res.status(500).end();
        });
    },
    getById: (req, res) => {
        const db = req.app.get('db');

        db.users
        .findOne(req.params.id)
        .then(user => res.status(201).json(user))
        .catch(err =>{
            console.err(err)
            res.status(500).end()
        })
    },
    getProfile: (req, res) => {
        const db = req.app.get('db');
 
        db.user_profiles
        .findOne({userId: req.params.id})
        .then(u => res.status(200).json(u))
        .catch(err => {
            console.err(err)
            res.status(500).end()
        })
    },
    createPost: (req, res) =>{
        const db = req.app.get('db');
        
        const { userId, content } = req.body;

        db.posts
        .save({
            userId,
            content,
        })
        .then(u => res.status(200).json(u))
        .catch(err =>{
            console.err(err)
            res.status(500).end()
        })
    },
    getPostId: (req,res) => {
        const db = req.app.get('db');

        db.posts
        .find(req.params.userId)
        .then(post => {
            db.comments
            .find({postId: req.params.userId})
            .then(comment => res.status(200).json({post, comment}))
            .catch(err => {
                console.err(err)
                res.status(500).end()
            })
        })
        .catch(err=>{
            console.err(err)
            res.status(500).end()
        })
    },
    getPost: (req, res) =>{
        const db = req.app.get('db');

        db.posts
        .find()
        .then(u => res.status(200).json(u))
        .catch(err => {
            console.err(err)
            res.status(500).end()
        })
    },
    updatePost: (req, res) =>{
        const db = req.app.get('db');
        const { content } = req.body

        db.posts
        .update(req.params.id, { content: content })
        .then(u => res.status(200).json(u))
        .catch(err => {
            console.err(err)
            res.status(500).end()
        })
    },
    createComment:(req, res) =>{
        const db = req.app.get('db');
        const { userId, postId, comment } = req.body

        db.comments
        .save({
            userId,
            postId,
            comment
        })
        .then(u => res.status(200).json(u))
        .catch(err => {
            console.err(err)
            res.status(500).end()
        })
    },
    getComments: (req, res) => {
        const db = req.app.get('db')

        db.comments
        .find()
        .then(u => res.status(200).json(u))
        .catch(err => {
            console.err(err)
            res.status(500).end()
        })
    },
    getCommId: (req, res) => {
        const db = req.app.get('db')

        db.comments
        .find(req.params.postId)
        .then(u => res.status(200).json(u))
        .catch(err=>{
            console.err(err)
            res.status(500).end()
        })
    },
    updateComment: (req, res) =>{
        const db = req.app.get('db');
        const { comment } = req.body

        db.comments
        .update(req.params.id, { comment: comment })
        .then(u => res.status(200).json(u))
        .catch(err => {
            console.err(err)
            res.status(500).end()
        })
    },
};
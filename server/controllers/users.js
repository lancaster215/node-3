module.exports = {
    create: (req, res) => {
        const db = req.app.get('db')
        const { email, password } = req.body;

        db.users
        .insert({
            email,
            password,
            user_profiles: [
                {
                    userId: undefined,
                    about: null,
                    thumbnail: null,
                },
            ],
        },{
            deepInsert: true    
        })
        .then(user => res.status(201).json(user))
        .catch(err =>{
            console.error(err)
            res.status(500).end()
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
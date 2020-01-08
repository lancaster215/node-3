# Project Summary

In this project we will learn how to start up a Postgres database using Docker,
create tables for our database, seed data into our database, and then build a
basic API to access our database.

## Prerequisites

You should have already gone through the
[docker-1-mini](https://github.com/boomcamp/docker-1-mini) project before
starting this project.

# Part 1 - Database Setup

## Step 1 - Testing our database configuration

1.  Let's make sure we have `docker-compose` installed. Run the following
    command

        docker-compose --version

    If you do not see a version output you may not have Docker installed
    correctly on your machine.

2.  Let's get a bit familiar with `docker-compose`.

    - `docker-compose` is a complimentary tool related to Docker, it helps us
      run different containers based on a configuration file.
    - The configuration file specifying the Docker containers to be run is the
      `docker-compose.yml` file. You can inspect it at the root directory of
      this repository.
    - You'll notice in the `docker-compose.yml` file there is a `services`
      entry. This is were we declare various services we'd like to run in Docker
      containers for our project. Our Postgres database is declared under the
      `db` service. It's also the only service declaration.

3.  Now that you've taken a look at the `docker-compose.yml` lets try running a
    few `docker-compose` commands.

    - The first command we'll run is

          docker-compose up db

      This command is going to start our Postgres database in a docker
      container. You'll notice it took a lot fewer command options than a
      typical `docker run` command, this is because the options are specified in
      the `docker-compose.yml` file.

      It may take a minute for the container to start since you'll likely have
      to download the container image on the first run.

      Eventually you'll start seeing logs output to your console from the
      running Postgres instance

    - You can see a list of currently running containers with normal docker
      commands

          docker ps

    - Let's now stop the running container.

      You can either just use the `ctrl-c` key combination in the terminal
      window currently running the container, or in another terminal window you
      can run the following command.

          docker-compose down

      This command will also shutdown the container.

      If you had trouble with any of the above commands you may need to trouble
      shoot your installation of Docker.

    - We've added some `npm` commands you can utilize to perform these same
      actions. The start command is slightly different in that it starts the
      container as a daemon, so it doesn't take over the terminal you ran the
      command in.

          npm run db:start
          npm run db:stop

4.  We now can run the database, but we need to make sure we are able to connect
    to it from other programs on our computer. We are going to test our database
    connection with a program called [SQL Tabs](https://www.sqltabs.com/) (click
    link to download). This is a free program that allows us to connect to the
    database and run commands.

    - Obviously the database will need to be running to accept connections.

          npm run db:start

    - Now that the database is running lets connect to it. Open the SQL Tabs
      program. You'll see an address bar at the top of the window in that bar
      type in the following address.

      `postgres://postgres@localhost:5432/postgres`

      There are a few aspects of this URL we should discuss first.

      - `postgres://` - This is the protocol we're going to use, this is a
        postgres database so it uses the `postgres` protocol.
      - `postgres@` - This specifies the username we're connecting with.
      - `localhost:5432` - The address that the database is accepting
        connections from.
      - `/postgres` - This is the name of the database we're interested in
        connecting to. There can be more than one database for a postrgres
        instance.

    - You'll be prompted to enter a password to connect to the database. The
      password is...

           node3db

      Enter the password and hit Enter. You should now be connected to the
      database. If you encounter errors make sure your database is running and
      that you entered the password correctly.

5.  Now that we're connected to the database we need to create a database
    specifically for our application. We can do that by running a SQL command in
    the SQL Tabs program. Run the following...

          CREATE DATABASE node3;

6.  Our new database is now created, let's disconnect from the default
    `postgres` database and connect to the newly created `node3` database.

    - Close the tab that has the connection to the `postgres` database.
    - Change the connection string to point to the `node3` database.

          postgres://postgres@localhost:5432/node3

    - Connect using SQL Tabs (the password will be the same)
    - We now have a database specifically for our application.

## Step 2 - Adding Tables

Relational databases require defined tables before we can save data in a safe
manner. In this step we will define the tables that will make up our database.
We're going to use the same entities that we used in the previous project.

1.  We could write raw SQL queries to create the tables we'd like, but in many
    cases it's easier to use other tools to do alot of that work for us. We are
    going to use a tool called `node-pg-migrate` to assist us with creating the
    tables for our database.

    > `node-pg-migrate` is a tool that will allow us to declare `migrations` for
    > our database. You can think of migrations as code that will instruct the
    > database what to do, it's a way of specifying database configuration in
    > code, that can be rolled back, replayed or modified in the future. The
    > idea of migrations is not unique to node.js, it's a common concept when
    > interacting with databases.

2.  Let's install `node-pg-migrate`

        npm install --save node-pg-migrate pg

3.  Now we need to add some configuration for `node-pg-migrate` so that it knows
    how to connect to our database when running commands.

    - create a directory called `config`
    - add a file named `default.json` inside of the `config` directory
    - add the following configuration to the `default.json` file.

          {
            "db": {
              "user": "postgres",
              "password": "node3db",
              "host": "localhost",
              "port": 5432,
              "database": "node3"
            }
          }

4.  One last thing before we write our database migrations. We're going to make
    it a little easier to run th `node-pg-migrate` tool.

    - We installed `node-pg-migrate` with `npm install --save node-pg-migrate`
      this means to run the tool we'd have to type out
      `node_modules/.bin/node-pg-migrate` which is a bit long. To save our
      fingers from typing so much we're going to create an npm command for
      running it.
    - open `package.json`. In the `scripts` section add the following...

            "scripts": {
              "migrate": "node-pg-migrate"
            }

    - this will allow us to type `npm run migrate` to run the tool.

5.  Let's add some tables now. We'll use our new tool to create migrations for
    each table we want to create.

    - The first table we'll create will be for users in our application.

      - The schema for a user will look like the following

            User {
              id: primary key,
              email: text,
              password: text,
            }

      - Let's create a migration file where we can declare what the migration
        should do. Run...

            npm run migrate create add-users-table

      - After that command runs you'll now have a `migrations` directory and in
        that directory there will be a file where we can write our migration.
        The migration file will have a name somewhat like this (the x's
        indicating the time-stamp output the command adds)

        `migrations/xxxx_add-users-table.js`

      - Open the new migration file and add the following...

      <details>
      <summary>
        <code>migrations/xxxx_add-users-table.js</code>
        </summary>

      ```js
      exports.up = pgm => {
        pgm.createTable('users', {
          id: {
            type: 'serial',
            primaryKey: true,
          },
          email: {
            type: 'text',
            notNull: true,
          },
          password: {
            type: 'text',
            notNull: true,
          },
        });
      };
      ```

      </details>
      </br>

    - Now lets run our migration and actually create the `users` table in the
      database.

          npm run migrate up

    - You should get a message in you terminal that the migration ran
      successfully, we can verify that by querying the database using SQL Tabs.
      Connect to the `node3` database and run the following query.

          SELECT * FROM information_schema.tables WHERE table_name='users';

      - You should then see the `users` table in query results

6.  Let's create the `user_profiles` table. Refer to the last step if you need a
    step by step walk-through.

    - schema

      ```
      UserProfile {
        id: primary key,
        userId: foreign key,
        about: text,
        thumbnail: text,
      }
      ```

    - solution:

      <details>
        <summary>
        <code>
          migrations/xxxx_add-user-profiles-table.js
        </code>
        </summary>

      ```js
      exports.up = pgm => {
        pgm.createTable('user_profiles', {
          id: {
            type: 'serial',
            primaryKey: true,
          },
          userId: {
            type: 'integer',
            notNull: true,
            references: '"users"', // this is how we associate a profile with a specific user.
          },
          about: {
            type: 'text',
          },
          thumbnail: {
            type: 'text',
          },
        });
      };
      ```

      </details>
      </br>

7.  Let's create a `posts` table. Remember, you can refer to previous steps if
    you need a reminder of the commands.

- schema

  ```
  Post {
    id: primary key,
    userId: foreign key,
    content: text,
  }
  ```

- solution

  <details>
    <summary>
      <code>migrations/xxxx_add-posts-table.js</code>
    </summary>

  ```js
  exports.up = pgm => {
    pgm.createTable('posts', {
      id: {
        type: 'serial',
        primaryKey: true,
      },
      userId: {
        type: 'integer',
        notNull: true,
        references: '"users"',
      },
      content: {
        type: 'text',
      },
    });
  };
  ```

  </details>

8. Let's create a `comments` table.

- schema

  ```
  Comment {
    id: primary key,
    userId: foreign key,
    postId: foreign key,
    comment: text
  }
  ```

- solution

  <details>
    <summary>
      <code>migrations/xxxx_add-comments-table.js</code>
    </summary>

  ```js
  exports.up = pgm => {
    pgm.createTable('comments', {
      id: {
        type: 'serial',
        primaryKey: true,
      },
      userId: {
        type: 'integer',
        notNull: true,
        references: '"users"',
      },
      postId: {
        type: 'integer',
        notNull: true,
        references: '"posts"',
      },
      comment: {
        type: 'text',
        notNull: true,
      },
    });
  };
  ```

  </details>
  </br>

**Remember you have to run** `npm run migrate up` to actually run the migration
files and create the tables.

9. After you've run all the migrations you can check for the existence of those
   tables with the following SQL query.

```sql
SELECT * FROM information_schema.tables WHERE table_schema='public';
```

You should then see all of the tables you specified in you migrations.

10. Let's insert a `user` just to declare victory on our database setup.

```sql
INSERT INTO users (email, password) values ('first.user@example.com', 'fakepassword123');
```

Check the user was inserted.

```sql
SELECT * FROM users;
```

# Part 2 - Application Setup

Now we've configured our database, but it's not very easy to interact only
through SQL queries, so we are going to build an API around our database that
allows us to interact with the data through an application.

## Step 1 - Setup Massive

Much like how we're using a tool to assist us in setting up our database tables,
we're also going to use a tool to assist us when connecting to our database from
our application. But it's not only going to assist us connecting, it will also
assist us in making queries on our data.

1.  Install `massive`

        npm install --save massive

2.  Install `express`

    Since we're going to be building an REST API we're also going to need a way
    to build a server. Let's use `express` since we're familiar with it at this
    point.

        npm install --save express

3.  Setup `express` boilerplate

    You should be familiar enough with express to setup a basic server, do that
    now.

    - solution

      <details>
       <summary>
         <code>server/index.js</code>
       </summary>

      ```js
      const express = require('express');

      const app = express();

      const PORT = 3001;
      app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
      });
      ```

      </details>
      </br>

4.  Setup `massive`

    We need to instatiate `massive` with the details required to connect to the
    database we created.

    ```js
    // server/index.js

    const express = require('express');
    const massive = require('massive');

    massive({
      host: 'localhost',
      port: 5432,
      database: 'node3',
      user: 'postgres',
      password: 'node3db',
    }).then(db => {
      const app = express();

      app.set('db', db);

      app.use(express.json());

      const PORT = 3001;
      app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
      });
    });
    ```

    You'll notice that we had to move the instantiation of the express
    application in the the `.then` method from `massive`. This is because
    `massive` has to connect and inspect our database on startup, which is an
    asynchronous operation.

    Now we have access to the `massive` instance throughout our `express`
    application.

## Step 2 - Create our first endpoint

We're going to start out simple and create and endpoint that allows us to create
a new `user` in the database. The only thing different from previous projects is
that we now have to interact with a real database utilizing `massive`.

1. Create and endpoint that will receive a `post` request at the `/api/users`
   endpoint.
2. Create a handler that will receive the new user data.
3. In your handler use `massive` to save the new user data to the database.

   ```js
   // controllers/users.js

   function create(req, res) {
     const db = req.app.get('db');

     const { email, password } = req.body;

     db.users // heres the new stuff, using massive to actually query the database.
       .save({
         email,
         password,
       })
       .then(user => res.status(201).json(user)) // returns a promise so we need to use .then
       .catch(err => {
         console.error(err); // if something happens we handle the error as well.
         res.status(500).end();
       });
   }

   module.exports = {
     create,
   };

   // server/index.js - register the handler

   app.post('/api/users', users.create);
   ```

   This should feel very familiar, all we've done is add `massive` and a
   database instead of our hacky solution just using Arrays and Objects from
   previous projects.

   You should glance over the [massive](https://massivejs.org/) documentation
   before we move on, to get a bigger picture of what is possible with this
   tool.

4. Test this endpoint, create a new user.

## Step 3 - Finish user endpoints

1. First we need to finish our user creation endpoint, if you remember back to
   our previous project, you'll remember that when we create a `user`, we also
   need to create a `userProfile` at the same time. `massive` has a way to do
   exactly this.

   Modify the user creation handler with the following

   ```js
   db.users
     .insert(
       {
         email,
         password,
         user_profiles: [
           // this is what is specifying the object
           // to insert into the related 'user_profiles' table
           {
             userId: undefined,
             about: null,
             thumbnail: null,
           },
         ],
       },
       {
         deepInsert: true, // this option here tells massive to create the related object
       }
     )
     .then(user => res.status(201).json(user))
     .catch(err => {
       console.error(err);
     });
   ```

   Now when we create a user they also get a `userProfile` created.

2. Create an endpoint for querying all users

   - URL: `/api/users`
   - solution:

     <details>
      <summary>
        <code>controllers/users.js - get all users</code>
      </summary>

     ```js
     function list(req, res) {
       const db = req.app.get('db');

       db.users
         .find()
         .then(users => res.status(200).json(users))
         .catch(err => {
           console.error(err);
           res.status(500).end();
         });
     }
     ```

     </details>
     </br>
     <details>
      <summary>
        <code>server/index.js</code>
      </summary>

     ```js
     const express = require('express');
     const massive = require('massive');

     const users = require('./controllers/users.js');

     massive({
       host: 'localhost',
       port: 5432,
       database: 'node3',
       user: 'postgres',
       password: 'node3db',
     })
       .then(db => {
         const app = express();

         app.set('db', db);

         app.use(express.json());

         app.post('/api/users', users.create);
         app.get('/api/users', users.list);

         const PORT = 3001;
         app.listen(PORT, () => {
           console.log(`Server listening on port ${PORT}`);
         });
       })
       .catch(console.error);
     ```

     </details>
     </br>

3. Create an endpoint for querying a user by their `id`

   - URL: `/api/users/:id`
   - solution:

    <details>
     <summary>
       <code>controllers/users.js - get user by id</code>
     </summary>

   ```js
   function getById(req, res) {
     const db = req.app.get('db');

     db.users
       .findOne(req.params.id)
       .then(user => res.status(200).json(user))
       .catch(err => {
         console.error(err);
         res.status(500).end();
       });
   }
   ```

    </details>
    </br>
    <details>
     <summary>
       <code>server/index.js</code>
     </summary>

   ```js
   const express = require('express');
   const massive = require('massive');

   const users = require('./controllers/users.js');

   massive({
     host: 'localhost',
     port: 5432,
     database: 'node3',
     user: 'postgres',
     password: 'node3db',
   })
     .then(db => {
       const app = express();

       app.set('db', db);

       app.use(express.json());

       app.post('/api/users', users.create);
       app.get('/api/users', users.list);
       app.get('/api/users/:id', users.getById);

       const PORT = 3001;
       app.listen(PORT, () => {
         console.log(`Server listening on port ${PORT}`);
       });
     })
     .catch(console.error);
   ```

    </details>
    </br>

4) Create an endpoint for querying a user's profile

   - URL: `/api/users/:id/profile`
   - solution:

    <details>
     <summary>
       <code>controllers/users.js - get user profile</code>
     </summary>

   ```js
   function getProfile(req, res) {
     const db = req.app.get('db');

     db.user_profiles
       .findOne({
         userId: req.params.id,
       })
       .then(profile => res.status(200).json(profile))
       .catch(err => {
         console.error(err);
         res.status(500).end();
       });
   }
   ```

    </details>
    </br>
    <details>
     <summary>
       <code>server/index.js</code>
     </summary>

   ```js
   const express = require('express');
   const massive = require('massive');

   const users = require('./controllers/users.js');

   massive({
     host: 'localhost',
     port: 5432,
     database: 'node3',
     user: 'postgres',
     password: 'node3db',
   })
     .then(db => {
       const app = express();

       app.set('db', db);

       app.use(express.json());

       app.post('/api/users', users.create);
       app.get('/api/users', users.list);
       app.get('/api/users/:id', users.getById);
       app.get('/api/users/:id/profile', users.getProfile);

       const PORT = 3001;
       app.listen(PORT, () => {
         console.log(`Server listening on port ${PORT}`);
       });
     })
     .catch(console.error);
   ```

    </details>
    </br>

## Step 4 - Posts

Let's create the API endpoints for posts. You're going to be on your own for
these endpoints.

1. Create an endpoint to create `posts` in the database.
2. Create an endpoint to get single `post` from the database.
   - Also add a query parameter to this endpoint that would allow you to fetch
     the `post` along with all of the comments for that post.
3. Create an endpoint to get all `posts` for a specific user from the database.
4. Create an endpoint to update a `post`

## Step 5 - Comments

1. Create an endpoint that saves a `comment` for a specific `post`
2. Create an endpoint that allows a user to edit a `comment`

## Finished

We've covered a lot of ground in this project but our API and database still has
many flaws that would prevent it from being very useful in a production
application.

Think about the problems surrounding uniqueness of data, and consistency of
data. Postgres provides many features to help us as developers maintain the
integrity of the data we save, we'll cover some of this in a future project but
take some time to do some research about some of these capabilities on your own
as well.
[![Run on Repl.it](https://repl.it/badge/github/lancaster215/node-3)](https://repl.it/github/lancaster215/node-3)
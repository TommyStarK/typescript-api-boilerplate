# REST-API-Node-Boilerplate

A simple and customizable RESTful API boilerplate written in Node.js using Express and MongoDB 3.0.

## Requirements

- [MongoDB driver](http://mongodb.github.io/node-mongodb-native/3.0/)

## Usage

`REST-API-Node-Boilerplate` includes a router, an authentication middleware based on [JSON Web Tokens](https://jwt.io/) 
and a MongoDB connection. Therefore, you must have your mongo service running before starting the API.

- Assuming you already have Mongo running:

```bash
$ git clone https://github.com/TommyStarK/REST-API-Node-Boilerplate.git
$ cd REST-API-Node-Boilerplate
$ yarn install; yarn start
```

- Test your boilerplate

Run the following commands to test your API:

 ```bash
#
# Assuming your are using the default config
#

# Ping the service 
$ curl --request GET http://localhost:3000/api.boilerplate

# Register a new account
$ curl -H "Content-Type: application/json" --request POST -d '{"username":"test", "email":"test@test.com", "password":"test"}' http://localhost:3000/api.boilerplate/register

# Authorize your account and retrieve your authentication token
$ curl -H "Content-Type: application/json" --request POST -d '{"username":"test", "password":"test"}' http://localhost:3000/api.boilerplate/authorize

# Test an auth required request
$ curl -H "Authorization: INSERT_YOUR_TOKEN" --request GET http://localhost:3000/api.boilerplate/hello
 ```

## Customization

- [Config](https://github.com/TommyStarK/REST-API-Node-Boilerplate/blob/master/config.js)

    Check the `config.js` file to customize your API as you wish. 
    
    * By default:

    ```js
    app: {
        name: 'boilerplate-api',
        url: 'api.boilerplate',
        port: 3000,
        auth: {
            secret: '1S3cR€T!',
            expiresIn: '24h'
        }
    },
    mongo: {
        auth: false,
        username: '',
        password: '',
        port: '27017',
        uri: process.env.MONGO_URI || 'localhost',
        database: 'boilerplate-db'
    }
    ```

- [Database](https://github.com/TommyStarK/REST-API-Node-Boilerplate/blob/master/database.js)

   * By default, `REST-API-Node-Boilerplate` implements a MongoDB connection. The only collection
   created (if it doesn't exist) when the service starts is the `users` collection according to
   the following JSON schema (Check the comments in `database.js` to implement new collections).
   

   ```js
    $jsonSchema: {
    bsonType: 'object',
    required: ['username', 'email', 'password'],
    properties: {
        username: {
        bsonType: 'string',
        description: 'must be a string and is required'
        },
        email: {
        bsonType: 'string',
        description: 'must be a string with a valid email and is required'
        },
        password: {
        bsonType: 'string',
        description: 'must be a string and is required'
        }
      }
    }
   ```


   * To manipulate either the database or the bucket you simply have to require `database.js` and
   call a function:


   ```js
   // Assuming we are in the 'routes' folder     
   const database = require('../database.js')

   const db = database.get()
   const bucket = database.bucket()

   console.log(db.collection('users').find())
   ```



- [Routing](https://github.com/TommyStarK/REST-API-Node-Boilerplate/blob/master/routes/router.js)

    Edit the `router.js` file to implement your routing. The following routes are implemented by 
    default to manage accounts (CF Usage section):
     
   * *Register a new account by providing in the request's body a username, email and password.*
   
   > POST {Content-Type: "application/json"} http://localhost:PORT/API_URL/register 


   * *Authorize your account and retrieve an authentication token by providing in the request's body your username and password.*
   
   > POST {Content-Type: "application/json"} http://localhost:PORT/API_URL/authorize 

    
   * *Delete your account by providing in the request's body your username and password.*
   
   > POST {Content-Type: "application/json"} http://localhost:PORT/API_URL/delete 

  
   **Note**: Only hashes of email and password are stored in the database. Use the `hash` function in the 
   `utils` module if you need to compare hashes.
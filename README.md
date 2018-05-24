# REST-API-Node-Boilerplate

A simple RESTful API boilerplate written in Node.js using Express and MongoDB Node.js Driver 3.0.

### Requirements

- [MongoDB driver](http://mongodb.github.io/node-mongodb-native/3.0/)

### Usage

Inc


- Assuming you already have Mongo running:

```bash
$ git clone https://github.com/TommyStarK/REST-API-Node-Boilerplate.git
$ cd REST-API-Node-Boilerplate
$ yarn install; yarn start
```

- Test your boilerplate

 Inc

### Customization

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

    Inc

- [Routing](https://github.com/TommyStarK/REST-API-Node-Boilerplate/blob/master/routes/router.js)

    Inc
# API Boilerplate

A boilerplate of a REST API written in Node.js.

# Requirements

- [Nodejs>=10.13](https://nodejs.org/en/)
- [Yarn>=1.2.1](https://yarnpkg.com/fr/)

# Usage

## Prerequisites

  In order to use the API locally, you must have the following services running:
- mongod (localhost:27017)
- mysqld (localhost:3306)
- redis (localhost:6379)

## Dev mode

To start the API in dev mode:

```bash
$ yarn install
$ yarn start
```

## Test your boilerplate

Run the following commands to test your boilerplate:

 ```bash
#
# Assuming your are using the default config
#

# Ping the service 
$ curl --request GET http://localhost:3001/api.boilerplate

# Register a new account
$ curl -H "Content-Type: application/json" --request POST -d '{"username":"foo", "email":"foo@email.com", "password":"bar"}' http://localhost:3001/api.boilerplate/register

# Authorize your account and retrieve your authentication token
$ curl -H "Content-Type: application/json" --request POST -d '{"username":"foo", "password":"bar"}' http://localhost:3001/api.boilerplate/authorize

# Test an auth required request
$ curl -H "x-access-token: INSERT_YOUR_TOKEN" --request GET http://localhost:3001/api.boilerplate/hello
 ```

# Customization

## Config
Check the [config.js](https://github.com/TommyStarK/REST-API-Node-Boilerplate/blob/master/api/src/config.js) file to customize your boilerplate as you wish. 
    
  ```js
  {
    app: {
      name: 'Nodejs REST API boilerplate',
      url: 'api.boilerplate',
      http: { port: 3001 },
      https: {
        port: 8443,
        ssl: { certificate: 'server.crt', key: 'key.pem', path: 'ssl/' },
      },
      secret: '1S3cR€T!',
      expiresIn: '24h',
    },
    mongo: {
      port: '27017',
      uri: process.env.MONGO_URI || 'localhost',
      database: 'api_boilerplate_mongodb',
    },
    mysql: {
      host: process.env.MYSQL_URL || '127.0.0.1',
      user: 'root',
      password: 'root',
      database: 'api_boilerplate_mysql',
    },
    redis:
      {
        db: 0, host: process.env.REDIS_URL || '127.0.0.1', port: 6379, family: 4,
      },
  }
  ```

By default, the config looks like this.


## Cache

Your boilerplate is linked with a cache service: Redis. 

You will find the client connection [here](https://github.com/TommyStarK/REST-API-Node-Boilerplate/blob/master/api/src/cache/redis.js) and the docker-compose configuration file [here](https://github.com/TommyStarK/REST-API-Node-Boilerplate/blob/master/docker-compose.yml). 

Feel free to edit thoses files to fit to your needs.




## Databases

Your boilerplate is backed with a MySQL, you will find the client connection [here](https://github.com/TommyStarK/REST-API-Node-Boilerplate/tree/master/api/src/database/mysql.js).
The database contains only one table, `users`, unpopulated.


**Note**: Only hashes of email and password are stored in the database. Use the `hash` function in the 
`utils` module if you have to compare hashes.


In case you need to store large files, the boilerplate is also backed with a [MongoDB](https://github.com/TommyStarK/REST-API-Node-Boilerplate/tree/master/api/src/database/mongo.js).
In the same way, you can edit the docker-compose configuration file to customize your app as you wish.
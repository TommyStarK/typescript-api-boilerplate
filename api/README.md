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
$ curl -H "Content-Type: application/json" --request POST -d '{"username":"test", "email":"test@test.com", "password":"test"}' http://localhost:3001/api.boilerplate/register

# Authorize your account and retrieve your authentication token
$ curl -H "Content-Type: application/json" --request POST -d '{"username":"test", "password":"test"}' http://localhost:3001/api.boilerplate/authorize

# Test an auth required request
$ curl -H "Authorization: INSERT_YOUR_TOKEN" --request GET http://localhost:3001/api.boilerplate/hello
 ```

# Customization

## Config
Check the [config.js](https://github.com/TommyStarK/REST-API-Node-Boilerplate/blob/master/api/src/config.js) file to customize your boilerplate as you wish. 
    
  ```js
  {
    app: {
      name: "Nodejs REST API boilerplate",
      port: 3001,
      url: "api.boilerplate"
    },
    mongo: {
      port: '27017',
      uri: process.env.MONGO_URI || 'localhost',
      database: 'api_boilerplate_mongodb'
    },
    mysql: {
      host: process.env.MYSQL_URL || '127.0.0.1',
      user: 'root',
      password: 'root',
      database: 'api_boilerplate_mysql'
    },
    redis: {
      db: 0,
      host: process.env.REDIS_URL || '127.0.0.1',
      port: 6379,
      family: 4
    }
  }
  ```

By default, the config looks like this.


## Cache

Your boilerplate is linked with a cache service: Redis. 

You will find the client connection [here](https://github.com/TommyStarK/REST-API-Node-Boilerplate/blob/master/api/src/cache/redis.js) and the docker-compose configuration file [here](https://github.com/TommyStarK/REST-API-Node-Boilerplate/blob/master/docker-compose.yml). 

Feel free to edit thoses files to fit to your needs.




## Databases

For demo purposes, the boilerplate is backed with two databases: MongoDB & MySQL.

You will find the MySQL client connection and the MongoDB one [here](https://github.com/TommyStarK/REST-API-Node-Boilerplate/tree/master/api/src/database).

In the same way, you can edit the docker-compose configuration file to customize your app as you wish.

By default, actions related to user account management are reflected in both databases.

**Note**: Only hashes of email and password are stored in the database. Use the `hash` function in the 
`utils` module if you need to compare hashes.
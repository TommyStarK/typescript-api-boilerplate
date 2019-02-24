# REST-API-Node-Boilerplate

A simple and customizable RESTful API boilerplate written in [Node.js](https://nodejs.org/en/) using [Express](https://expressjs.com/). The boilerplate is backed with a [MySQL](https://www.mysql.com/), a [Mongodb](https://www.mongodb.com/) to store large files and a [Redis](https://redis.io/) as cache service.



# Features

- ES6 support using [Babel](https://babeljs.io/)
- Auto server restart thanks to [nodemon](https://github.com/remy/nodemon)
- Async/Await pattern implemented
- Authentication using [jsonwebtoken](https://jwt.io/)
- Body parsing
- Cors Enabled
- Consistent coding styles
- Docker + data persistence
- Express web framework
- Linting with [eslint](https://eslint.org/)
- MySQL table hydratation
- Support http/https
- Uses [Yarn](https://yarnpkg.com/en/) over npm
- Test using [AVA](https://github.com/avajs/ava)



# Requirements

- [Docker](https://www.docker.com)


For MacOS, add the following paths to your docker engine:

- `/var/lib/mysql`
- `/var/lib/mongodb/data/db`
- `/var/lib/redis/data`

This can be done through **Docker -> Preferences -> File sharing**



# Usage

To enable https, you must add your tls certificate and key to `tls/` before running your boilerplate:

To generate self-signed certificate, run the following commands:
```bash
$ openssl req -newkey rsa:2048 -new -nodes -keyout tls/key.pem -out tls/csr.pem
$ openssl x509 -req -days 365 -in tls/csr.pem -signkey tls/key.pem -out tls/server.crt
```

To start your boilerplate, just run the following commands in your terminal:

```bash
$ docker-compose up --build
```



# Contribution

Each Contribution is welcomed and encouraged. I do not claim to cover each use cases nor completely master the Node.js. If you encounter a non sense or any trouble, you can open an issue and I will be happy to discuss about it :)



# Test your boilerplate

Run the following commands to test your boilerplate:

 ```bash
$ ./run_tests.sh
 ```



# Use your boilerplate

Run the following commands to use your boilerplate:

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
Check the [config.js](https://github.com/TommyStarK/REST-API-Node-Boilerplate/blob/master/src/config.js) file to customize your boilerplate as you wish. 
    
  ```js
  {
    app: {
      name: 'Nodejs REST API boilerplate',
      url: 'api.boilerplate',
      http: { port: 3001 },
      https: {
        port: 8443,
        tls: { certificate: 'server.crt', key: 'key.pem', path: 'tls/' },
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
      password: 'root', // Do not forget to reflect any changes to the docker-compose.yml file
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

You will find the client connection [here](https://github.com/TommyStarK/REST-API-Node-Boilerplate/blob/master/src/cache/redis.js) and the docker-compose configuration file [here](https://github.com/TommyStarK/REST-API-Node-Boilerplate/blob/master/docker-compose.yml). 

Feel free to edit thoses files to fit to your needs.




## Databases

Your boilerplate is backed with a MySQL, you will find the client connection [here](https://github.com/TommyStarK/REST-API-Node-Boilerplate/tree/master/src/database/mysql.js).
The database contains only one table, `users`, unpopulated.


**Note**: Only hashes of password are stored in the database. Use the `hash` function in the 
`utils` module if you have to compare hashes.

Same for emails, there are encrypted using `SHA256` before being stored. Use the `decrypt`
function in the `utils` module if you need to decrypt stored email.


In case you need to store large files, the boilerplate is also backed with a [MongoDB](https://github.com/TommyStarK/REST-API-Node-Boilerplate/tree/master/src/database/mongo.js).
In the same way, you can edit the docker-compose configuration file to customize your app as you wish.
# typescript-api-boilerplate

[![Build Status](https://travis-ci.com/TommyStarK/typescript-api-boilerplate.svg?branch=master)](https://travis-ci.org/TommyStarK/typescript-api-boilerplate) [![codecov](https://codecov.io/gh/TommyStarK/typescript-api-boilerplate/branch/master/graph/badge.svg?token=Qz2QLJRvGX)](https://codecov.io/gh/TommyStarK/typescript-api-boilerplate) [![DeepScan grade](https://deepscan.io/api/teams/10558/projects/15256/branches/301878/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=10558&pid=15256&bid=301878)[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

A simple and modular RESTful API boilerplate written in [Typescript](https://www.typescriptlang.org/) using [Express](https://expressjs.com/). The boilerplate is backed with a [MySQL](https://www.mysql.com/) and a [Mongodb](https://www.mongodb.com/).

Some features have been integrated to the boilerplate in order to have reusable base "modules", or at least a clean and clear architecture to implement new ones. These "modules" manage the following "services":

- Account management (register/unregister an account)
- Authentication
- Per-User media management system (upload/download/list/delete pictures)

The goal is to define a healthy architecture of a REST API connected to one or more backend(s), in this case a MySQL to store user data and a MongoDB to store pictures of each user. The whole accompanied by a simple authentication system.

**Note**: Only hashes of password are stored in the database. Use the `hash` function in the
`utils` module if you have to compare hashes.

Same for emails, they are encrypted using `AES256` before being stored. Use the `decrypt`
function in the `utils` module if you need to decrypt stored email.

## Features

- ECMAScript 2020
- Auto server restart thanks to [Nodemon](https://github.com/remy/nodemon)
- Authentication using [JSON Web Tokens](https://jwt.io/)
- Cross-Origin Resource Sharing enabled
- Data input validation middleware(s) thanks to [class-validator](https://github.com/typestack/class-validator)
- Inversion of Control container with [Inversify](https://github.com/inversify/InversifyJS)
- Linting with [Eslint](https://eslint.org/)
- Logging using [Winston](https://github.com/winstonjs/winston)
- MongoDB automatic collections creation and validation
- MySQL tables hydratation
- Supports `HTTP/HTTPS`
- Uses [Yarn](https://yarnpkg.com/en/) over npm
- Testing with [Jest](https://github.com/facebook/jest)

## Requirements

- [Docker](https://www.docker.com)
- [Node.js 16](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/)

For MacOS, add the following paths to your docker engine:

- `/var/lib/mysql`
- `/var/lib/mongodb/data/db`

This can be done through **Docker -> Preferences -> File sharing**

## Contribution

Each Contribution is welcomed and encouraged. I do not claim to cover each use cases nor completely master the Node.js. If you encounter a non sense or any trouble, you can open an issue and I will be happy to discuss about it :smile:

## Tests

Run the following commands to run the unit/integration tests:

 ```bash
❯ yarn install
❯ yarn test
 ```

## Usage

Run the following commands to use your boilerplate:

 ```bash
# Start the stack
$ docker-compose up --build --detach

#
# Assuming your are using the default config
#

# Ping the service
$ curl --request GET http://localhost:3001/api.boilerplate

# Register a new account
$ curl -H "Content-Type: application/json" --request POST \
  -d '{"username":"foo", "email":"foo@email.com", "password":"bar"}' \
  http://localhost:3001/api.boilerplate/register

# Authorize your account and retrieve your authentication token
$ curl -H "Content-Type: application/json" --request POST \
  -d '{"username":"foo", "password":"bar"}' \
  http://localhost:3001/api.boilerplate/authorize

# Test an auth required request
$ curl -H "Authorization: INSERT_YOUR_TOKEN" --request GET \
  http://localhost:3001/api.boilerplate/hello

# Upload a picture (okay this is not a picture ... :p)
curl -H "Authorization: INSERT_YOUR_TOKEN" -F file=@README.md \
  -X POST http://localhost:3001/api.boilerplate/picture

# Get your pictures
curl -H "Authorization: INSERT_YOUR_TOKEN" --request GET \
  http://localhost:3001/api.boilerplate/pictures

# Get a specific picture
curl -H "Authorization: INSERT_YOUR_TOKEN" --request GET \
  http://localhost:3001/api.boilerplate/picture/PICTURE_ID

# Delete a specific picture
curl -H "Authorization: INSERT_YOUR_TOKEN" --request DELETE \
  http://localhost:3001/api.boilerplate/picture/PICTURE_ID

# Unregister your account
$ curl -H "Content-Type: application/json" --request DELETE \
  -d '{"username":"foo", "password":"bar"}' \
  http://localhost:3001/api.boilerplate/unregister
 ```

## Customization

### Config

Check the [config](https://github.com/TommyStarK/REST-API-Node-Boilerplate/blob/master/src/config.ts) file to customize your boilerplate as you wish.

  ```typescript
  {
    app: {
      name: 'Experimental REST API boilerplate',
      url: 'api.boilerplate',
      http: { port: 3001 },
      https: {
        port: 8443,
        tls: { certificate: 'server.crt', key: 'key.pem', path: 'tls/' },
      },
      secret: '1S3cR€T!',
      expiresIn: '24h',
      production: false,
    },
    mongo: {
      port: '27017',
      uri: process.env.MONGO_URI || 'localhost',
      database: 'experimental_rest_api_boilerplate_mongodb',
    },
    mysql: {
      host: process.env.MYSQL_URL || '127.0.0.1',
      user: 'root',
      password: 'root',
      database: 'experimental_rest_api_boilerplate_mysql',
    },
  }
  ```

By default, the config looks like this.

### HTTPS

To enable https, you must add your tls certificate and key to `tls/` before running your boilerplate:

To generate self-signed certificate, run the following commands:

```bash
❯ openssl req -newkey rsa:2048 -new -nodes \
  -keyout tls/key.pem -out tls/csr.pem

❯ openssl x509 -req -days 365 -in tls/csr.pem \
  -signkey tls/key.pem -out tls/server.crt
```

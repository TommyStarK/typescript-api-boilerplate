# typescript-api-boilerplate

[![Build Status](https://travis-ci.com/TommyStarK/typescript-api-boilerplate.svg?branch=master)](https://travis-ci.org/TommyStarK/typescript-api-boilerplate) [![codecov](https://codecov.io/gh/TommyStarK/typescript-api-boilerplate/branch/master/graph/badge.svg?token=Qz2QLJRvGX)](https://codecov.io/gh/TommyStarK/typescript-api-boilerplate) [![DeepScan grade](https://deepscan.io/api/teams/10558/projects/15256/branches/301878/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=10558&pid=15256&bid=301878)[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

A simple and modular RESTful API boilerplate written in [Typescript](https://www.typescriptlang.org/) using [Express](https://expressjs.com/). The boilerplate is backed with a  [Mongodb](https://www.mongodb.com/) and a [PostgreSQL](https://www.postgresql.org/).

Some features have been integrated into the boilerplate. The idea is to have some basic components and a clear architecture to easily implement new ones:

- Account management (register/unregister an account)
- Authentication
- Per-User media management system (upload/download/list/delete pictures)

The goal is to define a healthy architecture of a REST API connected to one or more backend(s), in this case a PostgreSQL to store user data and a MongoDB to store pictures of each user. The whole accompanied by a simple authentication system.

**Note**: Only hashes of password are stored in the database. Use the `hash` function in the
`utils/crypto` module if you have to compare hashes.

Same for emails, they are encrypted using `AES256` before being stored. Use the `decrypt`
function in the `utils/crypto` module if you need to decrypt stored email.

## Features

- Authentication using [JSON Web Tokens](https://jwt.io/)
- Configurable connections pools for backend storages
- Cross-Origin Resource Sharing enabled (including browser preflight request)
- Custom exception(s) filter
- Data input validation middlewares thanks to [class-validator](https://github.com/typestack/class-validator)
- ECMAScript 2021
- Inversion of Control container with [Inversify](https://github.com/inversify/InversifyJS)
- Logging interceptor using [Winston](https://github.com/winstonjs/winston)
- Native storage drivers
- MongoDB automatic collections validation
- PostgreSQL atomic queries execution on demand
- Supports `HTTP/HTTPS`
- Uses [Yarn](https://yarnpkg.com/en/) over npm
- Testing with [Jest](https://github.com/facebook/jest)

## Requirements

- [Docker](https://www.docker.com)
- [Node.js 16+](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/)

For MacOS, add the following paths to your docker engine:

- `/var/lib/mongo/data/db`
- `/var/lib/postgres`

This can be done through **Docker -> Preferences -> File sharing**

## Contribution

Each Contribution is welcomed and encouraged. I don't claim to cover each use cases nor completely master the Node.js. If you encounter a non sense or any trouble, you can open an issue and I will be happy to discuss about it :smile:

## Tests

Run the following commands to run the unit/integration tests:

 ```bash
❯ yarn install
❯ yarn test:ci
 ```

## Usage

Run the following commands to use your boilerplate:

 ```bash
# Start the stack
❯ docker-compose up --build --detach

#
# Assuming your are using the default config
#

# healthcheck
❯ curl --request GET http://localhost:3001/api.boilerplate/healthz

# Register a new account
❯ curl -H "Content-Type: application/json" --request POST \
  -d '{"username":"foo", "email":"foo@email.com", "password":"bar"}' \
  http://localhost:3001/api.boilerplate/register

# Authorize your account and retrieve your authentication token
❯ export TOKEN=$(curl --silent -H "Content-Type: application/json" --request POST \
  -d '{"username":"foo", "password":"bar"}' \
  http://localhost:3001/api.boilerplate/authorize | jq -r .token)

# Test an auth required endpoint
❯ curl -H "Authorization: $TOKEN" --request GET \
  http://localhost:3001/api.boilerplate/hello

# Upload a picture (okay this is not a picture ... :p)
❯ curl -H "Authorization: $TOKEN" -F file=@README.md \
  -X POST http://localhost:3001/api.boilerplate/picture

# Get your pictures
❯ curl -H "Authorization: $TOKEN" --request GET \
  http://localhost:3001/api.boilerplate/pictures

# Get a specific picture
❯ curl -H "Authorization: $TOKEN" --request GET \
  http://localhost:3001/api.boilerplate/picture/PICTURE_ID

# Delete a specific picture
❯ curl -H "Authorization: $TOKEN" --request DELETE \
  http://localhost:3001/api.boilerplate/picture/PICTURE_ID

# Unregister your account
❯ curl -H "Content-Type: application/json" --request DELETE \
  -d '{"username":"foo", "password":"bar"}' \
  http://localhost:3001/api.boilerplate/unregister
 ```

## Customization

### Config

Check the [config](https://github.com/TommyStarK/typescript-api-boilerplate/blob/master/src/config.ts) file to customize your boilerplate as you wish.

Here is an example:

  ```typescript
  {
    app: {
      url: 'api.boilerplate',
      port: 3001,
      production: false,
      secret: '1S3cR€T!',
      expiresIn: '24h',
      https: {
        port: 8443,
        tls: {
          certificate: 'tls/server.crt',
          key: 'tls/key.pem',
        },
      },
    },
    mongo: {
      database: 'dummy',
      host: process.env.MONGO_URI || 'localhost',
      port: '27017',
    },
    postgres: {
      database: 'dummy',
      host: process.env.POSTGRES_URL || '127.0.0.1',
      port: 5432,
      max: 10,
      user: 'root',
      password: 'root',
      ssl: {
        rejectUnauthorized: true,
        ca: `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIUVia1fkXIlMxFcihoygqh6b+z7JMwDQYJKoZIhvcNAQEL
BQAwHjEcMBoGA1UEAwwTSUJNIENsb3VkIERhdGFiYXNlczAeFw0xODEwMTExNDQ4
            .............................
MrPXxLy9NPj8isOutrLD29IY2A0V4RlcIxS0L7sVOy0zD6pmzMMQMD/5ifuIX6bq
lJeg5xjKvO+plIKMhOSQyu4T0MMy6fckwMZO+IbGrCdr
-----END CERTIFICATE-----`;
      }
    },
  }
  ```

### HTTPS

To enable https, you must add your tls certificate and key to `tls/` before running your boilerplate:

To generate self-signed certificate, run the following commands:

```bash
❯ openssl req -newkey rsa:2048 -new -nodes \
  -keyout tls/key.pem -out tls/csr.pem

❯ openssl x509 -req -days 365 -in tls/csr.pem \
  -signkey tls/key.pem -out tls/server.crt
```

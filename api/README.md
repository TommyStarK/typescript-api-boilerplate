# API Boilerplate

A boilerplate of a REST API.

## Requirements

- [Nodejs>=10.13](https://nodejs.org/en/)
- [Yarn>=1.2.1](https://yarnpkg.com/fr/)

## Usage

In order to use the API locally, you must have the following services running:
- mongod (localhost:27017)
- mysqld (localhost:3306)
- redis (localhost:6379)

To deploy the API, just run the following commands in your terminal:

```bash
$ yarn install
$ yarn build
$ yarn serve
```

To start the API in dev mode:

```bash
$ yarn install
$ yarn start
```

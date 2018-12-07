export const config = {
  app: {
    name: "Nodejs REST API boilerplate",
    url: "api.boilerplate",
    http: {
      port: 3001
    },
    https: {
      port: 8443,
      ssl: {
        certificate: 'server.crt',
        key: 'key.pem',
        path: 'ssl/'
      }
    },
    secret: '1S3cR€T!'
  },
  mongo: {
    port: '27017',
    uri: process.env.MONGO_URI || 'localhost',
    database: 'api_boilerplate_mongodb'
  },
  mysql: {
    host: process.env.MYSQL_URL || '127.0.0.1',
    user: 'root',
    password: 'root', // Do not forget to reflect any changes to the docker-compose.yml file
    database: 'api_boilerplate_mysql'
  },
  redis: {
    db: 0,
    host: process.env.REDIS_URL || '127.0.0.1',
    port: 6379,
    family: 4
  },
  router: undefined
};
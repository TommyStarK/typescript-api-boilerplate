export const config = {
  app: {
    name: "node-boilerplate-rest-api",
    port: 3001,
  },
  mongo: {
    port: '27017',
    uri: process.env.MONGO_URI || 'localhost',
    database: 'node-boilerplate-rest-api-mongodb'
  },
  mysql: {
    host: process.env.MYSQL_URL || '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'node_boilerplate_rest_api_mysql'
  },
  redis: {
    db: 0,
    host: process.env.REDIS_URL || '127.0.0.1',
    port: 6379,
    family: 4
  },
  router: undefined
};
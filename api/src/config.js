export const config = {
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
  },
  router: undefined
};
export default {
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
};

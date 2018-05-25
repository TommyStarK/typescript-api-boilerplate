var config = {
  app: {
    name: 'boilerplate-api',
    url: 'api.boilerplate',
    port: process.env.PORT || 3000,
    auth: {
      secret: '1S3cR€T!',
      expiresIn: '24h'
    }
  },
  mongo: {
    auth: false,
    username: '',
    password: '',
    port: '27017',
    uri: process.env.MONGO_URI || 'localhost',
    database: 'boilerplate-db'
  }
}

module.exports = config

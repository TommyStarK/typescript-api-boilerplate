const mongodb = require('mongodb')
const config = require('./config.js')
const MongoClient = mongodb.MongoClient

let _db
let _bucket

const database = {
  async connect () {
    let url = 'mongodb://'

    if (config.mongo.auth) {
      url += config.mongo.username +
        ':' + config.mongo.username +
        '@' + config.mongo.uri +
        ':' + config.mongo.port +
        '/' + config.mongo.database
    } else {
      url += config.mongo.uri +
      ':' + config.mongo.port +
      '/' + config.mongo.database
    }

    const client = await MongoClient.connect(url)
    _db = client.db(config.mongo.database)
    _bucket = new mongodb.GridFSBucket(_db)
  },

  init () {
    return new Promise((resolve, reject) => {
      let map = new Map()
      const db = database.get()
      const collectionsRequired = [
        {name: 'users', func: database.initUsers}
      ]

      db.listCollections().toArray((error, collections) => {
        if (error) {
          reject(error)
        } else {
          try {
            collections = collections.map((item) => {
              return item.name
            })

            collections.forEach(map.set.bind(map))

            collectionsRequired.forEach(target => {
              if (!map.has(target.name)) {
                target.func()
              }
            })

            resolve(collections)
          } catch (err) {
            reject(err)
          }
        }
      })
    })
  },

  initUsers () {
    const db = database.get()

    db.createCollection('users', {validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: {
            bsonType: 'string',
            description: 'must be a string and is required'
          },
          email: {
            bsonType: 'string',
            description: 'must be a string with a valid email and is required'
          },
          password: {
            bsonType: 'string',
            description: 'must be a string and is reqired'
          }
        }
      }
    },
      validationLevel: 'strict',
      validationAction: 'error'
    })
  },

  get () {
    return _db
  },

  bucket () {
    return _bucket
  }
}

module.exports = database

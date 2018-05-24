const mongodb = require('mongodb')
const config = require('./config.js')
const MongoClient = mongodb.MongoClient

let _db
let _bucket

// 
// By design, every time you start the API, the boilerplate will initialize the database 
// by creating the collections defined in the 'collectionsRequired' object in the 'init ()' 
// function. If the collection already exists, no function is executed.
// 
// if your application requires more collections, you simply have to edit the previously 
// mentioned object and implement the function responsible for creating this collection in 
// the database object.
// 
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

      // 
      // Edit this object to add/remove a collection creation
      // 
      const collectionsRequired = [
        {name: 'users', func: database.createUsersCollection
        // i.e:
        // name: 'test', func: database.createTestCollection
        }
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

  // i.e:
  // func createTestCollection() {
  // console.log("creating collection test")
  // },

  createUsersCollection () {
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
            description: 'must be a string and is required'
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

import mongodb from 'mongodb';

const MongoClient = mongodb.MongoClient;

let _db = undefined;
let _bucket = undefined;

const userValidator = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email', 'password'],
      properties: {
        userID: {
          bsonType: 'string',
          description: 'must be a string and is required'
        }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
};

function checkCollections() {
  return new Promise((resolve, reject) => {
    let map = new Map();
    const collectionsRequired = [{name: 'users', validator: userValidator}];


    try {
      _db.listCollections().toArray((err, collections) => {
        if (err) {
          reject(err);
          return;
        }

        collections = collections.map((item) => {
          return item.name;
        });

        collections.forEach(map.set.bind(map));

        collectionsRequired.forEach(target => {
          if (!map.has(target.name)) {
            _db.createCollection(target.name, target.validator);
          }
        });

        resolve(collections);
      });
    } catch (error) {
      reject(error);
    }
  });
}

export const database = {
  connect: async (config) => {
    try {
      if (_db !== undefined && _bucket !== undefined) {
        console.log('Mongo client already connected.');
        return;
      }

      let url =
          'mongodb://' + config.uri + ':' + config.port + '/' + config.database;
      const client = await MongoClient.connect(url, {useNewUrlParser: true});
      _db = client.db(config.database);
      _bucket = new mongodb.GridFSBucket(_db);
      await checkCollections();
    } catch (error) {
      throw (error);
    }
  },

  getBucket: () => {
    return _bucket;
  },

  getDatabase: () => {
    return _db;
  },

  quit: async () => {
    try {
      // await _db.logout();
      // await _db.close();
    } catch (error) {
      throw (error);
    }
  }
};

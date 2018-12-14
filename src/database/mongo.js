import { MongoClient, GridFSBucket } from 'mongodb';

let db;
let bucket;

const userValidator = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userID'],
      properties: {
        userID: {
          bsonType: 'string',
          description: 'must be a string and is required',
        },
      },
    },
  },
  validationLevel: 'strict',
  validationAction: 'error',
};

function checkCollections() {
  return new Promise((resolve, reject) => {
    const map = new Map();
    const collectionsRequired = [{ name: 'users', validator: userValidator }];


    try {
      db.listCollections().toArray((err, collections) => {
        if (err) {
          reject(err);
          return;
        }

        const cls = collections.map(item => item.name);

        cls.forEach(map.set.bind(map));

        collectionsRequired.forEach((target) => {
          if (!map.has(target.name)) {
            db.createCollection(target.name, target.validator);
          }
        });

        resolve(collections);
      });
    } catch (error) {
      reject(error);
    }
  });
}

export default {
  connect: async (cfg) => {
    try {
      if (db !== undefined && bucket !== undefined) {
        console.log('Mongo client already connected.');
        return;
      }

      const url = `mongodb://${cfg.uri}:${cfg.port}/${cfg.database}`;
      const client = await MongoClient.connect(url, { useNewUrlParser: true });
      db = client.db(cfg.database);
      bucket = new GridFSBucket(db);
      await checkCollections();
    } catch (error) {
      throw (error);
    }
  },

  getBucket: () => bucket,

  getDatabase: () => db,

  quit: async () => {
    try {
      // await db.logout();
      // await db.close();
    } catch (error) {
      throw (error);
    }
  },
};

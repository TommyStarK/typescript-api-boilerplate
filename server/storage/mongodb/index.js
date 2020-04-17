import { MongoClient, GridFSBucket } from 'mongodb';

let bucket;
let client;
let db;

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
        pictures: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            properties: {
              name: { bsonType: 'string', description: 'must be a string' },
              hashname: { bsonType: 'string', description: 'must be a string' },
              encoding: { bsonType: 'string', description: 'must be a string' },
              mimetype: { bsonType: 'string', description: 'must be a string' },
              size: { bsonType: 'int', description: 'must be an integer' },
              fileId: {
                bsonType: 'objectId',
                description: 'must be a MongoDB ObjectId',
              },
            },
          },
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

        const cls = collections.map((item) => item.name);

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
    if (db !== undefined && bucket !== undefined && client.isConnected()) {
      return;
    }

    const url = `mongodb://${cfg.uri}:${cfg.port}/${cfg.database}`;
    client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    db = client.db(cfg.database);
    bucket = new GridFSBucket(db);
    await checkCollections();
  },

  getBucket: () => bucket,

  getDatabase: () => db,

  quit: async () => {
    await client.logout();
    // await client.close(true);
    db = undefined;
    bucket = undefined;
  },
};

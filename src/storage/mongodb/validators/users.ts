export const userValidator = {
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

import { Container } from 'inversify';

import { MongoDBClient } from '@app/storage/mongodb/client';

const IoCMongoDB = {
  ClientIdentifier: Symbol.for('MongoDBClient'),
};

Object.seal(IoCMongoDB);

const MongoDBContainer = new Container();
MongoDBContainer.bind<MongoDBClient>(IoCMongoDB.ClientIdentifier).to(MongoDBClient);
Object.seal(MongoDBContainer);

export {
  IoCMongoDB,
  MongoDBContainer,
};

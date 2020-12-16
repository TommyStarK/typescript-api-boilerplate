import { Container } from 'inversify';
import { MongoDBClient } from '@app/storage/mongodb/client';

const identifier = Symbol.for('MongoDBClient');
Object.seal(identifier);

const container = new Container();
container.bind<MongoDBClient>(identifier).to(MongoDBClient);
Object.seal(container);

export {
  container as IoCMongoDBClientContainer,
  identifier as IoCMongoDBClientIdentifier,
};

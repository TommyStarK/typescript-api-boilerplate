import { Container } from 'inversify';

import IoCMongoDBClientIdentifier from '@app/storage/mongodb/symbol';
import { MongoDBClient } from '@app/storage/mongodb/client';

const IoCMongoDBClientContainer = new Container();
IoCMongoDBClientContainer.bind<MongoDBClient>(IoCMongoDBClientIdentifier).to(MongoDBClient);
Object.seal(IoCMongoDBClientContainer);

export default IoCMongoDBClientContainer;

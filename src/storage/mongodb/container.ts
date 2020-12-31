import { Container } from 'inversify';

import { MongoDBClient } from '@app/storage/mongodb/client';
import TYPES from '@app/IoC/types';

const MongoDBContainer = new Container();
MongoDBContainer.bind<MongoDBClient>(TYPES.MongoDBClient).to(MongoDBClient);
Object.seal(MongoDBContainer);

export default MongoDBContainer;

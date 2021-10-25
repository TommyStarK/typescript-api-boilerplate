import 'reflect-metadata';

import { Container } from 'inversify';

import { MediaController } from '@app/services/media/controller';
import { MediaService } from '@app/services/media/service';
import { UserController } from '@app/services/user/controller';
import { UserService } from '@app/services/user/service';
import { MongoDBClient } from '@app/storages/mongodb/client';
import { MySQLClient } from '@app/storages/mysql/client';
import TYPES from './types';

const container = new Container();
container.bind<MongoDBClient>(TYPES.MongoDBClient).to(MongoDBClient).inSingletonScope();
container.bind<MySQLClient>(TYPES.MySQLClient).to(MySQLClient).inSingletonScope();
container.bind<MediaController>(TYPES.MediaController).to(MediaController);
container.bind<MediaService>(TYPES.MediaService).to(MediaService);
container.bind<UserController>(TYPES.UserController).to(UserController);
container.bind<UserService>(TYPES.UserService).to(UserService);

Object.seal(container);

export default container;

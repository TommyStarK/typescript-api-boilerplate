import 'reflect-metadata';

import { Container } from 'inversify';

import { MediaController, MediaService } from '@app/api/media';
import { UserController, UserService } from '@app/api/user';
import { MongoDBClient } from '@app/backends/mongo';
import { PostgreSQLClient } from '@app/backends/postgres';

import TYPES from './types';

const container = new Container();
container.bind<MongoDBClient>(TYPES.MongoDBClient).to(MongoDBClient).inSingletonScope();
container.bind<PostgreSQLClient>(TYPES.PostgreSQLClient).to(PostgreSQLClient).inSingletonScope();
container.bind<MediaController>(TYPES.MediaController).to(MediaController);
container.bind<MediaService>(TYPES.MediaService).to(MediaService);
container.bind<UserController>(TYPES.UserController).to(UserController);
container.bind<UserService>(TYPES.UserService).to(UserService);

Object.seal(container);

export default container;

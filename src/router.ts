import express, { NextFunction, Request, Response } from 'express';
import multer from 'multer';

import config from '@app/config';
import logger from '@app/logger';

import IoCMySQLClientContainer from '@app/storage/mysql/container';
import IoCMySQLClientIdentifier from '@app/storage/mysql/symbol';
import { MySQLClient } from '@app/storage/mysql';
import IoCMongoDBClientContainer from '@app/storage/mongodb/container';
import IoCMongoDBClientIdentifier from '@app/storage/mongodb/symbol';
import { MongoDBClient } from '@app/storage/mongodb';
import { MediaController, MediaService } from '@app/components/media';
import { UserController, UserService } from '@app/components/user';
import { authMiddleware, errorMiddleware, notfoundMiddleware } from '@app/middlewares';

const upload = multer({ dest: '.uploads/' });

const asyncWrapper = (fn: any) => (request: Request, response: Response, next: NextFunction) => {
  Promise.resolve(fn(request, response, next)).catch(next);
};

export const router = async (): Promise<express.Router> => {
  const mongodb: MongoDBClient = IoCMongoDBClientContainer.get<MongoDBClient>(IoCMongoDBClientIdentifier);
  const mysql: MySQLClient = IoCMySQLClientContainer.get<MySQLClient>(IoCMySQLClientIdentifier);

  process.on('SIGINT', async () => {
    await mongodb.disconnect();
    await mysql.disconnect();
    process.exit(1);
  });

  try {
    await mongodb.connect();
    await mysql.connect();
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }

  const userService = new UserService(mongodb, mysql);
  const userController = new UserController(userService);
  const mediaService = new MediaService(mongodb);
  const mediaController = new MediaController(mediaService);
  const r = express.Router();

  // First path handled
  r.get(`/${config.app.url}`, (_: Request, response: Response) => response.status(200).json({
    status: 200,
    message: `Welcome to the ${config.app.name}`,
  }));

  // Account management
  r.post(`/${config.app.url}/authorize`, asyncWrapper(userController.authorize.bind(userController)));
  r.post(`/${config.app.url}/register`, asyncWrapper(userController.register.bind(userController)));
  r.delete(`/${config.app.url}/unregister`, asyncWrapper(userController.unregister.bind(userController)));

  // authentication middleware
  r.all(`/${config.app.url}/*`, [authMiddleware(mysql)]);

  r.get(`/${config.app.url}/hello`, (request: Request, response: Response) => {
    response.status(200).json({ status: 200, message: `Hello ${request.decoded.username}` });
  });

  // Media
  r.get(`/${config.app.url}/pictures`, asyncWrapper(mediaController.getPictures.bind(mediaController)));
  r.get(`/${config.app.url}/picture/:id`, asyncWrapper(mediaController.getPicture.bind(mediaController)));
  r.post(`/${config.app.url}/picture`, upload.single('file'), asyncWrapper(mediaController.uploadNewPicture.bind(mediaController)));
  r.delete(`/${config.app.url}/picture/:id`, asyncWrapper(mediaController.deletePicture.bind(mediaController)));

  r.use(notfoundMiddleware);
  r.use(errorMiddleware);
  return r;
};

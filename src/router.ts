import { Router, Request, Response } from 'express';
import multer from 'multer';

import container from '@app/IoC/container';
import { MongoDBClient } from '@app/storage/mongodb';
import { MySQLClient } from '@app/storage/mysql';
import { MediaController } from '@app/components/media/controller';
import { UserController } from '@app/components/user/controller';

import { AppConfig } from '@app/config';
import TYPES from '@app/IoC/types';
import logger from '@app/logger';
import {
  authMiddleware,
  errorMiddleware,
  notfoundMiddleware,
} from '@app/middlewares';

const upload = multer({ dest: '.uploads/' });

const asyncWrapper = (fn: any) => (...args: any[]) => fn(...args).catch(args[2]);

export const appRouter = async (): Promise<Router> => {
  const mongodb: MongoDBClient = container.get<MongoDBClient>(TYPES.MongoDBClient);
  const mysql: MySQLClient = container.get<MySQLClient>(TYPES.MySQLClient);

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

  const mediaController = container.get<MediaController>(TYPES.MediaController);
  const userController = container.get<UserController>(TYPES.UserController);
  const router = Router();

  // for sake of tests
  router.get('/500', (request: Request, response: Response) => {
    throw new Error('test internal server error');
  });

  // First path handled
  router.get(`/${AppConfig.app.url}`, (_: Request, response: Response) => response.status(200).json({
    status: 200,
    message: `Welcome to the ${AppConfig.app.name}`,
  }));

  // Account management
  router.post(`/${AppConfig.app.url}/authorize`, asyncWrapper(userController.authorize.bind(userController)));
  router.post(`/${AppConfig.app.url}/register`, asyncWrapper(userController.register.bind(userController)));
  router.delete(`/${AppConfig.app.url}/unregister`, asyncWrapper(userController.unregister.bind(userController)));

  // authentication middleware
  router.all(`/${AppConfig.app.url}/*`, [authMiddleware(mysql)]);

  router.get(`/${AppConfig.app.url}/hello`, (request: Request, response: Response) => {
    response.status(200).json({ status: 200, message: `Hello ${request.decoded.username}` });
  });

  // Media
  router.get(`/${AppConfig.app.url}/pictures`, asyncWrapper(mediaController.getPictures.bind(mediaController)));
  router.get(`/${AppConfig.app.url}/picture/:id`, asyncWrapper(mediaController.getPicture.bind(mediaController)));
  router.post(`/${AppConfig.app.url}/picture`, upload.single('file'), asyncWrapper(mediaController.uploadNewPicture.bind(mediaController)));
  router.delete(`/${AppConfig.app.url}/picture/:id`, asyncWrapper(mediaController.deletePicture.bind(mediaController)));

  router.use(notfoundMiddleware);
  router.use(errorMiddleware);
  return router;
};

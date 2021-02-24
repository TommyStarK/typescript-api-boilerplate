import express, { Request, Response } from 'express';
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

import {
  authPayloadValidator,
  registrationPayloadValidator,
} from '@app/middlewares/validators/user';

const upload = multer({ dest: '.uploads/' });

const asyncWrapper = (fn: any) => (...args: any[]) => fn(...args).catch(args[2]);

export const router = async (): Promise<express.Router> => {
  const mongodb = container.get<MongoDBClient>(TYPES.MongoDBClient);
  const mysql = container.get<MySQLClient>(TYPES.MySQLClient);

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
  const Router = express.Router();

  // for sake of tests
  Router.get('/500', (request: Request, response: Response) => {
    throw new Error('test internal server error');
  });

  // First path handled
  Router.get(`/${AppConfig.app.url}`, (_: Request, response: Response) => response.status(200).json({
    status: 200,
    message: `Welcome to the ${AppConfig.app.name}`,
  }));

  // Account management
  Router.post(`/${AppConfig.app.url}/authorize`, authPayloadValidator(), asyncWrapper(userController.authorize));
  Router.post(`/${AppConfig.app.url}/register`, registrationPayloadValidator(), asyncWrapper(userController.register));
  Router.delete(`/${AppConfig.app.url}/unregister`, authPayloadValidator(), asyncWrapper(userController.unregister));

  // authentication middleware
  Router.all(`/${AppConfig.app.url}/*`, [authMiddleware(mysql)]);

  Router.get(`/${AppConfig.app.url}/hello`, (request: Request, response: Response) => {
    response.status(200).json({ status: 200, message: `Hello ${request.decoded.username}` });
  });

  // Media
  Router.get(`/${AppConfig.app.url}/pictures`, asyncWrapper(mediaController.getPictures));
  Router.get(`/${AppConfig.app.url}/picture/:id`, asyncWrapper(mediaController.getPicture));
  Router.post(`/${AppConfig.app.url}/picture`, upload.single('file'), asyncWrapper(mediaController.uploadNewPicture));
  Router.delete(`/${AppConfig.app.url}/picture/:id`, asyncWrapper(mediaController.deletePicture));

  Router.use(notfoundMiddleware);
  Router.use(errorMiddleware);
  return Router;
};

import express, {
  Handler,
  Request,
  Response,
  NextFunction,
} from 'express';
import multer from 'multer';

import container from '@app/IoC/container';
import { MongoDBClient } from '@app/storage/mongodb';
import { MySQLClient } from '@app/storage/mysql';
import { MediaController } from '@app/services/media/controller';
import { UserController } from '@app/services/user/controller';

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
  mongoIDValidator,
  registrationPayloadValidator,
} from '@app/middlewares/validators';

const upload = multer({ dest: '.uploads/' });
const asyncWrapper = (handler: Handler) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise.resolve(handler(req, res, next)).catch(next);

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
  Router.get(`/${AppConfig.app.url}/picture/:id`, mongoIDValidator(), asyncWrapper(mediaController.getPicture));
  Router.post(`/${AppConfig.app.url}/picture`, upload.single('file'), asyncWrapper(mediaController.uploadNewPicture));
  Router.delete(`/${AppConfig.app.url}/picture/:id`, mongoIDValidator(), asyncWrapper(mediaController.deletePicture));

  Router.use(notfoundMiddleware);
  Router.use(errorMiddleware);
  return Router;
};

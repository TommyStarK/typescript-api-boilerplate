import express, { Request, Response } from 'express';
import multer from 'multer';

import { MediaController, MediaService } from '@app/components/media';
import { UserController, UserService } from '@app/components/user';
import { AppConfig } from '@app/config';
import logger from '@app/logger';
import { authMiddleware, errorMiddleware, notfoundMiddleware } from '@app/middlewares';
import { MongoDBContainer, MongoDBClient, IoCMongoDB } from '@app/storage/mongodb';
import { MySQLContainer, MySQLClient, IoCMySQL } from '@app/storage/mysql';

const upload = multer({ dest: '.uploads/' });

const asyncWrapper = (fn: any) => (...args: any[]) => fn(...args).catch(args[2]);

export const router = async (): Promise<express.Router> => {
  const mongodb: MongoDBClient = MongoDBContainer.get<MongoDBClient>(IoCMongoDB.ClientIdentifier);
  const mysql: MySQLClient = MySQLContainer.get<MySQLClient>(IoCMySQL.ClientIdentifier);

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
  Router.post(`/${AppConfig.app.url}/authorize`, asyncWrapper(userController.authorize.bind(userController)));
  Router.post(`/${AppConfig.app.url}/register`, asyncWrapper(userController.register.bind(userController)));
  Router.delete(`/${AppConfig.app.url}/unregister`, asyncWrapper(userController.unregister.bind(userController)));

  // authentication middleware
  Router.all(`/${AppConfig.app.url}/*`, [authMiddleware(mysql)]);

  Router.get(`/${AppConfig.app.url}/hello`, (request: Request, response: Response) => {
    response.status(200).json({ status: 200, message: `Hello ${request.decoded.username}` });
  });

  // Media
  Router.get(`/${AppConfig.app.url}/pictures`, asyncWrapper(mediaController.getPictures.bind(mediaController)));
  Router.get(`/${AppConfig.app.url}/picture/:id`, asyncWrapper(mediaController.getPicture.bind(mediaController)));
  Router.post(`/${AppConfig.app.url}/picture`, upload.single('file'), asyncWrapper(mediaController.uploadNewPicture.bind(mediaController)));
  Router.delete(`/${AppConfig.app.url}/picture/:id`, asyncWrapper(mediaController.deletePicture.bind(mediaController)));

  Router.use(notfoundMiddleware);
  Router.use(errorMiddleware);
  return Router;
};

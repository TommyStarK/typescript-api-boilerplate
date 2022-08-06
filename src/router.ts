import express, {
  Handler,
  Request,
  Response,
  NextFunction,
} from 'express';

import multer from 'multer';

import container from '@app/inversion-of-control/container';
import { MongoDBClient } from '@app/backends/mongo';
import { PostgreSQLClient } from '@app/backends/postgres';
import { MediaController } from '@app/api/media';
import { UserController } from '@app/api/user';

import { AppConfig } from '@app/config';
import TYPES from '@app/inversion-of-control/types';
// import logger from '@app/logger';

import { exceptionsFilter } from '@app/filters';
import { logInterceptor } from '@app/interceptors';
import { authMiddleware, notfoundMiddleware } from '@app/middlewares';

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
  const mongo = container.get<MongoDBClient>(TYPES.MongoDBClient);
  const postgres = container.get<PostgreSQLClient>(TYPES.PostgreSQLClient);

  //
  // gracefull shutdown
  //

  // process.on('SIGINT', async () => {
  //   await Promise.all([mongo.disconnect(), postgres.disconnect()]);
  //   process.exit(1);
  // });

  // try {
  //   await Promise.all([mongo.connect(), postgres.connect()]);
  // } catch (error) {
  //   logger.error(error);
  //   process.exit(1);
  // }

  await Promise.all([mongo.connect(), postgres.connect()]);

  const mediaController = container.get<MediaController>(TYPES.MediaController);
  const userController = container.get<UserController>(TYPES.UserController);
  const r = express.Router();

  // healthcheck
  r.get(`/${AppConfig.app.url}/healthz`, (_: Request, response: Response) => {
    response.status(200).json({ status: 200, message: 'ok' });
  });

  // Account management
  r.post(`/${AppConfig.app.url}/authorize`, authPayloadValidator(), asyncWrapper(userController.authorize));
  r.post(`/${AppConfig.app.url}/register`, registrationPayloadValidator(), asyncWrapper(userController.register));
  r.delete(`/${AppConfig.app.url}/unregister`, authPayloadValidator(), asyncWrapper(userController.unregister));

  // authentication middleware
  r.all(`/${AppConfig.app.url}/*`, [authMiddleware(postgres), logInterceptor]);

  r.get(`/${AppConfig.app.url}/hello`, (request: Request, response: Response) => {
    response.status(200).json({ status: 200, message: `Hello ${request.user.username}` });
  });

  // Media
  r.get(`/${AppConfig.app.url}/pictures`, asyncWrapper(mediaController.getPictures));
  r.get(`/${AppConfig.app.url}/picture/:id`, mongoIDValidator(), asyncWrapper(mediaController.getPicture));
  r.post(`/${AppConfig.app.url}/picture`, upload.single('file'), asyncWrapper(mediaController.uploadNewPicture));
  r.delete(`/${AppConfig.app.url}/picture/:id`, mongoIDValidator(), asyncWrapper(mediaController.deletePicture));

  r.use(notfoundMiddleware);
  r.use(exceptionsFilter);
  return r;
};

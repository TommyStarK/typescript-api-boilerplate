import 'reflect-metadata';
import bodyParser from 'body-parser';
import cors from 'cors';
import express, {
  Express, Request, Response, NextFunction,
} from 'express';
import fs from 'fs';
import http from 'http';
import https from 'https';

import config from '@app/config';
import logger from '@app/logger';
// import router from '@app/router';

import IoCMySQLClientContainer from '@app/storage/mysql/container';
import IoCMySQLClientIdentifier from '@app/storage/mysql/symbol';
import { MySQLClient } from '@app/storage/mysql';

import IoCMongoDBClientContainer from '@app/storage/mongodb/container';
import IoCMongoDBClientIdentifier from '@app/storage/mongodb/symbol';
import { MongoDBClient } from '@app/storage/mongodb';

import { UserService, UserController } from '@app/components/user';
import { authMiddleware, errorMiddleware, notfoundMiddleware } from '@app/middlewares';

let httpServer; let httpsServer;
const HTTP_PORT: string = process.env.HTTP_PORT || String(config.app.http.port);
const HTTPS_PORT: string = process.env.HTTPS_PORT || String(config.app.https.port);
const app: Express = express();

const asyncWrapper = (fn: any) => (request: Request, response: Response, next: NextFunction) => {
  Promise.resolve(fn(request, response, next)).catch(next);
};

function attemptToEnableHTTPS(expressApp: Express, name: string, cfg) {
  try {
    const certPath = cfg.tls.path + cfg.tls.certificate;
    const keyPath = cfg.tls.path + cfg.tls.key;

    httpsServer = https.createServer(
      {
        cert: fs.readFileSync(certPath, 'utf8'),
        key: fs.readFileSync(keyPath, 'utf8'),
      },
      expressApp,
    );

    httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
      logger.info(`${name} is now running on https://localhost:${HTTPS_PORT}`);
    });
  } catch (error) {
    logger.warn('Failed to enable HTTPS. Skipping...');
  }
}

async function main() {
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

  app.use('*', cors({ origin: '*' }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  // app.use('/', router);

  const userService = new UserService(mongodb, mysql);
  const userController = new UserController(userService);

  app.get(`/${config.app.url}`, (_: Request, response: Response) => response.status(200).json({
    status: 200,
    message: `Welcome to the ${config.app.name}`,
  }));

  // Account management
  app.post(`/${config.app.url}/authorize`, asyncWrapper(userController.authorize.bind(userController)));
  app.post(`/${config.app.url}/register`, asyncWrapper(userController.register.bind(userController)));
  app.delete(`/${config.app.url}/unregister`, asyncWrapper(userController.unregister.bind(userController)));

  // authentication middleware
  app.all(`/${config.app.url}/*`, [authMiddleware]);

  app.get(`/${config.app.url}/hello`, (request: Request, response: Response) => {
    response.status(200).json({ status: 200, message: `Hello ${request.decoded.username}` });
  });

  app.use(notfoundMiddleware);
  app.use(errorMiddleware);

  attemptToEnableHTTPS(app, config.app.name, config.app.https);
  httpServer = http.createServer(app);
  httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
    logger.info(`${config.app.name} is now running on http://localhost:${HTTP_PORT}`);
  });
}

main();

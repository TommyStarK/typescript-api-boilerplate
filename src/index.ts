import 'reflect-metadata';
import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Express } from 'express';
import fs from 'fs';
import http from 'http';
import https from 'https';

import config from '@app/config';
import logger from '@app/logger';
import router from '@app/router';

import IoCMySQLClientContainer from '@app/storage/mysql/container';
import IoCMySQLClientIdentifier from '@app/storage/mysql/symbol';
import { MySQLClient } from '@app/storage/mysql';

import IoCMongoDBClientContainer from '@app/storage/mongodb/container';
import IoCMongoDBClientIdentifier from '@app/storage/mongodb/symbol';
import { MongoDBClient } from '@app/storage/mongodb';

let httpServer; let httpsServer;
const HTTP_PORT: string = process.env.HTTP_PORT || String(config.app.http.port);
const HTTPS_PORT: string = process.env.HTTPS_PORT || String(config.app.https.port);
const app: Express = express();

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
  app.use('/', router);

  attemptToEnableHTTPS(app, config.app.name, config.app.https);
  httpServer = http.createServer(app);
  httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
    logger.info(`${config.app.name} is now running on http://localhost:${HTTP_PORT}`);
  });
}

main();

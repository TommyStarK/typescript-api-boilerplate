import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Express } from 'express';
import fs from 'fs';
import http from 'http';
import https from 'https';

import { AppConfig, IAppConfig } from '@app/config';
import logger from '@app/logger';
import { router } from '@app/router';

const HTTP_PORT: number = Number(process.env.HTTP_PORT) || AppConfig.app.http.port;
const HTTPS_PORT: number = Number(process.env.HTTPS_PORT) || AppConfig.app.https.port;
const app: Express = express();

function attemptToEnableHTTPS(expressApp: Express, config: IAppConfig) {
  try {
    const certPath = config.app.https.tls.path + config.app.https.tls.certificate;
    const keyPath = config.app.https.tls.path + config.app.https.tls.key;

    https.createServer(
      {
        cert: fs.readFileSync(certPath, 'utf8'),
        key: fs.readFileSync(keyPath, 'utf8'),
      },
      expressApp,
    ).listen(HTTPS_PORT, '0.0.0.0', () => {
      logger.info(`${config.app.name} is now running on https://localhost:${HTTPS_PORT}`);
    });
  } catch (error) {
    logger.warn('Failed to enable HTTPS. Skipping...');
  }
}

async function main() {
  app.use('*', cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use('/', await router());

  attemptToEnableHTTPS(app, AppConfig);
  http.createServer(app).listen(HTTP_PORT, '0.0.0.0', () => {
    logger.info(`${AppConfig.app.name} is now running on http://localhost:${HTTP_PORT}`);
  });
}

main();

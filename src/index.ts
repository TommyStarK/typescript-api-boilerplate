/* eslint-disable import/newline-after-import */
/* eslint-disable import/first */
import * as os from 'os';
process.env.UV_THREADPOOL_SIZE = `${os.cpus().length - 1 > 1 ? os.cpus().length - 1 : 1}`; // keeps one for event loop

import { json as bodyParserJSON, urlencoded as bodyParserURLEncoded } from 'body-parser';
import cors from 'cors';
import express, { Express } from 'express';
import fs from 'fs';
import http from 'http';
import https from 'https';

import { AppConfig, IAppConfig } from '@app/config';
import logger from '@app/logger';
import { router } from '@app/router';

const HTTP_PORT: number = Number(process.env.HTTP_PORT) || AppConfig.app.port;
const HTTPS_PORT: number = Number(process.env.HTTPS_PORT) || AppConfig.app.https.port;
const app: Express = express();

function attemptToEnableHTTPS(expressApp: Express, config: IAppConfig) {
  try {
    https.createServer(
      {
        cert: fs.readFileSync(config.app.https.tls.certificate, 'utf8'),
        key: fs.readFileSync(config.app.https.tls.key, 'utf8'),
      },
      expressApp,
    ).listen(HTTPS_PORT, '0.0.0.0', () => {
      logger.info(`HTTPS server is now running on https://localhost:${HTTPS_PORT}`);
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
  app.use(bodyParserURLEncoded({ extended: true }), bodyParserJSON());
  app.use('/', await router());

  attemptToEnableHTTPS(app, AppConfig);
  http.createServer(app).listen(HTTP_PORT, '0.0.0.0', () => {
    logger.info(`HTTP server is now running on http://localhost:${HTTP_PORT}`);
  });
}

main();

import 'reflect-metadata';
import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Express } from 'express';
import fs from 'fs';
import http from 'http';
import https from 'https';

import config from '@app/config';
import logger from '@app/logger';
import { router } from '@app/router';

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
  app.use('*', cors({ origin: '*' }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use('/', await router());

  attemptToEnableHTTPS(app, config.app.name, config.app.https);
  httpServer = http.createServer(app);
  httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
    logger.info(`${config.app.name} is now running on http://localhost:${HTTP_PORT}`);
  });
}

main();

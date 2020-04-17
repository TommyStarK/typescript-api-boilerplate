// eslint-disable-next-line import/no-extraneous-dependencies
import '@babel/polyfill';

import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import http from 'http';
import https from 'https';

import config from './config';
import logger from './logger';
import router from './router';
import { mysql, mongodb } from './storage';

let httpServer; let httpsServer;
const HTTP_PORT = process.env.HTTP_PORT || config.app.http.port;
const HTTPS_PORT = process.env.HTTPS_PORT || config.app.https.port;
const app = express();

function attemptToEnableHTTPS(expressApp, name, cfg) {
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
  process.on('SIGINT', async () => {
    await mongodb.quit();
    await mysql.quit();
    process.exit(1);
  });

  try {
    await mongodb.connect(config.mongo);
    await mysql.connect(config.mysql);
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

import '@babel/polyfill';

import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import http from 'http';
import https from 'https';

import redis from './cache/redis';
import config from './config';
import mongo from './database/mongo';
import mysql from './database/mysql';
import router from './router';

const HTTP_PORT = process.env.HTTP_PORT || config.app.http.port;
const HTTPS_PORT = process.env.HTTPS_PORT || config.app.https.port;
const app = express();

function attemptToEnableHTTPS(expressApp, name, cfg) {
  try {
    const certPath = cfg.ssl.path + cfg.ssl.certificate;
    const keyPath = cfg.ssl.path + cfg.ssl.key;

    const httpsServer = https.createServer(
      {
        cert: fs.readFileSync(certPath, 'utf8'),
        key: fs.readFileSync(keyPath, 'utf8'),
      },
      expressApp,
    );

    httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
      console.log(`${name} is now running on https://localhost:${HTTPS_PORT}`);
    });
  } catch (error) {
    console.log(`Failed to enable https.\n${error}.\nSkipping...`);
  }
}

async function main() {
  process.on('SIGINT', async () => {
    await mongo.quit();
    await mysql.quit();
    await redis.quit();
    // SIGINT return code 1+128
    process.exit(129);
  });

  try {
    await mongo.connect(config.mongo);
    await mysql.connect(config.mysql);
    await redis.connect(config.redis);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }

  app.use('*', cors({ origin: '*' }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use('/', router);

  attemptToEnableHTTPS(app, config.app.name, config.app.https);
  const httpServer = http.createServer(app);
  httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
    console.log(
      `${config.app.name} is now running on http://localhost:${HTTP_PORT}`,
    );
  });
}

main();

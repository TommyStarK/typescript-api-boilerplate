import "@babel/polyfill";
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

import {config} from './config';
import {createHttpServer, createHttpsServer} from './server';
import {database as mongo} from './database/mongo';
import {database as mysql} from './database/mysql';
import {redis} from './cache/redis';
import {router} from './router';

const HTTP_PORT = process.env.HTTP_PORT || config.app.http.port;
const HTTPS_PORT = process.env.HTTPS_PORT || config.app.https.port;
const app = express();
let returnCode = 0;


// Shutdown gracefully the app
async function quit() {
  await mongo.quit();
  await mysql.quit();
  await redis.quit();
}

async function main() {
  try {
    process.on('SIGINT', async () => {
      await quit();
      returnCode = 129;
      process.exit(returnCode);
    });

    await mongo.connect(config.mongo);
    await mysql.connect(config.mysql);
    await redis.connect(config.redis);

    app.use('*', cors({origin: '*'}));
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use('/', router);

    const httpServer = createHttpServer(app);
    httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
      console.log(`${config.app.name} is now running on http://localhost:${HTTP_PORT}`);
    });

    const httpsServer = createHttpsServer(app, config.app.https);
    httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
      console.log(`${config.app.name} is now running on https://localhost:${HTTPS_PORT}`);
    });

  } catch (error) {
    await quit();
    returnCode = 1;
    console.log(error);
    process.exit(returnCode);
  }
}

main();
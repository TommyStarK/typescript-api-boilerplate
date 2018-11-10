import "@babel/polyfill";
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

import {config} from './config';
import {database as mongo} from './database/mongo';
import {database as mysql} from './database/mysql';
import {redis} from './cache/redis';
import {router} from './router';

const PORT = process.env.PORT || config.app.port;
const server = express();
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

    server.use('*', cors({origin: '*'}));
    server.use(bodyParser.urlencoded({extended: true}));
    server.use(bodyParser.json());
    server.use('/', router);
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`${config.app.name} is now running on http://localhost:${PORT}`);
    });

  } catch (error) {
    await quit();
    returnCode = 1;
    console.log(error);
    process.exit(returnCode);
  }
}

main();